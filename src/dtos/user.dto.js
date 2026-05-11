const { z } = require('zod');

/**
 * DTO for User Registration
 * Requirement: name, email, password are all required
 */
const registerDTO = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['user', 'editor', 'admin']).optional()
}).strict();

/**
 * DTO for User Login
 * Requirement: email and password
 */
const loginDTO = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
}).strict();

/**
 * DTO for Admin updating any user.
 * All fields optional for partial updates. Role change is permitted for admins.
 */
const updateUserDTO = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200).optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.enum(['user', 'editor', 'admin']).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
}).strict();

/**
 * DTO for a user updating their OWN profile (/me).
 * Role is intentionally excluded — users cannot promote themselves.
 */
const updateMeDTO = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(200).optional(),
  email:    z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
}).strict();

module.exports = { 
  registerDTO, 
  loginDTO, 
  updateUserDTO,
  updateMeDTO 
};