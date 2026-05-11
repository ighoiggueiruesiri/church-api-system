const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');

/**
 * FIX: Fail loudly at runtime if JWT_SECRET is missing rather than
 * silently using a hardcoded fallback that would make all tokens insecure.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
};

class AuthService {
  // Generate JWT
  generateToken(id, role) {
    return jwt.sign({ id, role }, getJwtSecret(), {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });
  }

  async register(data) {
    try {
      logger.debug('Registering new user', { email: data.email });

      // Check if user already exists
      const existingUser = await User.findOne({ email: data.email, deletedAt: null });
      if (existingUser) {
        throw new Error('Email already in use');
      }

      const user = await User.create(data);
      
      // Remove password from response
      const userObj = user.toObject();
      delete userObj.password;

      return {
        user: userObj,
        token: this.generateToken(user._id, user.role)
      };
    } catch (err) {
      logger.error('Registration failed in auth service', { error: err.message });
      throw err;
    }
  }

  async login(email, password) {
    try {
      logger.debug('Authenticating user', { email });

      // Find user and explicitly select the password field
      const user = await User.findOne({ email, deletedAt: null }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password match
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const userObj = user.toObject();
      delete userObj.password;

      return {
        user: userObj,
        token: this.generateToken(user._id, user.role)
      };
    } catch (err) {
      logger.error('Login failed in auth service', { error: err.message });
      throw err;
    }
  }

  async updateUser(userId, updateData) {
    try {
      logger.debug('Updating user profile', { userId });

      const user = await User.findOne({ _id: userId, deletedAt: null });
      if (!user) {
        throw new Error('User not found');
      }

      // Check email uniqueness if email is being changed
      if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({ email: updateData.email, deletedAt: null });
        if (emailExists) throw new Error('Email already in use');
      }

      // Update fields
      Object.keys(updateData).forEach((key) => {
        user[key] = updateData[key];
      });

      await user.save(); // This triggers the pre-save password hashing hook

      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    } catch (err) {
      logger.error('Update failed in auth service', { error: err.message });
      throw err;
    }
  }

  async getMe(userId) {
    try {
      const user = await User.findOne({ _id: userId, deletedAt: null }).select('-password');
      if (!user) throw new Error('User not found');
      return user;
    } catch (err) {
      logger.error('Fetch own profile service error', { error: err.message });
      throw err;
    }
  }

  async getAllUsers() {
    try {
      // Uses the static findActive helper from your User model
      return await User.findActive().select('-password'); 
    } catch (err) {
      logger.error('Fetch users service error', { error: err.message });
      throw err;
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findOne({ _id: id, deletedAt: null }).select('-password');
      if (!user) throw new Error('User not found');
      return user;
    } catch (err) {
      logger.error('Fetch user by ID service error', { error: err.message });
      throw err;
    }
  }

  async deleteUser(id) {
    try {
      const user = await User.findById(id);
      if (!user || user.deletedAt) throw new Error('User not found');

      // Soft delete by setting deletedAt
      user.deletedAt = new Date();
      await user.save();
      
      return { message: 'User deleted successfully' };
    } catch (err) {
      logger.error('Delete user service error', { error: err.message });
      throw err;
    }
  }
}

module.exports = new AuthService();