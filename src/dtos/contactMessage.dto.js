const { z } = require('zod');

const baseContactMessageDTO = z.object({
  name:    z.string().min(1).max(200),
  email:   z.string().email().max(300),
  message: z.string().min(1).max(3000),
}).strict();

const createContactMessageDTO = baseContactMessageDTO;
const updateContactMessageDTO = baseContactMessageDTO.partial();

module.exports = { createContactMessageDTO, updateContactMessageDTO };
