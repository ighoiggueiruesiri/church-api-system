const AuthService = require('../services/user.service');
const { registerDTO, loginDTO, updateUserDTO } = require('../dtos/user.dto');
const { success, error } = require('../utils/response');
const { logger } = require('../config/logger');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');

exports.register = async (req, res, next) => {
  try {
    logger.info('User registration attempt', { email: req.body.email });

    const validatedData = registerDTO.parse(stripEmptyStrings(req.body));
    const result = await AuthService.register(validatedData);

    logger.info('User registered successfully', { userId: result.user._id });
    
    success(res, result, 201);
  } catch (err) {
    if (err.message === 'Email already in use') {
      return error(res, err.message, 400);
    }
    logger.error('Registration controller error', { error: err.message });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    logger.info('User login attempt', { email: req.body.email });

    const validatedData = loginDTO.parse(stripEmptyStrings(req.body));
    const result = await AuthService.login(validatedData.email, validatedData.password);

    logger.info('User logged in successfully', { userId: result.user._id });
    
    success(res, result, 200);
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return error(res, err.message, 401);
    }
    logger.error('Login controller error', { error: err.message });
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getMe(req.user.id);
    success(res, user, 200);
  } catch (err) {
    if (err.message === 'User not found') return error(res, err.message, 404);
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    logger.info('Self profile update attempt', { userId: req.user.id });

    const validatedData = updateMeDTO.parse(stripEmptyStrings(req.body));
    const result = await AuthService.updateUser(req.user.id, validatedData);

    success(res, result, 200);
  } catch (err) {
    if (err.message === 'User not found') return error(res, err.message, 404);
    if (err.message === 'Email already in use') return error(res, err.message, 400);
    logger.error('Update me controller error', { error: err.message });
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('User update attempt', { targetUserId: id, adminId: req.user.id });

    const validatedData = updateUserDTO.parse(stripEmptyStrings(req.body));
    const result = await AuthService.updateUser(id, validatedData);

    success(res, result, 200);
  } catch (err) {
    if (err.message === 'User not found') return error(res, err.message, 404);
    if (err.message === 'Email already in use') return error(res, err.message, 400);
    
    logger.error('Update controller error', { error: err.message });
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await AuthService.getAllUsers();
    success(res, users, 200);
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await AuthService.getUserById(req.params.id);
    success(res, user, 200);
  } catch (err) {
    if (err.message === 'User not found') return error(res, err.message, 404);
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await AuthService.deleteUser(req.params.id);
    success(res, { message: 'User removed' }, 200);
  } catch (err) {
    if (err.message === 'User not found') return error(res, err.message, 404);
    next(err);
  }
};