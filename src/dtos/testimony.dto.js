const { z } = require('zod');

const baseTestimonyDTO = z.object({
  name:   z.string().min(1).max(200),
  role:   z.string().max(300).optional(),
  text:   z.string().min(1).max(2000),
  avatar: z.string().optional(),       // initials or image path injected by upload middleware
}).strict();

const createTestimonyDTO = baseTestimonyDTO;
const updateTestimonyDTO = baseTestimonyDTO.partial();

module.exports = { createTestimonyDTO, updateTestimonyDTO };
