const { z } = require('zod');

const baseSermonDTO = z.object({
  title: z.string().min(1).max(500),
  pastor: z.string().min(1).max(500),
  date: z.string().max(500).optional(),
  thumbnail: z.string().optional(),
  videoId: z.string().optional(),
}).strict();

const createSermonDTO = baseSermonDTO;
const updateSermonDTO = baseSermonDTO.partial();

module.exports = { createSermonDTO, updateSermonDTO };