const { z } = require('zod');

const baseEventDTO = z.object({
  title: z.string().min(1).max(500),
  location: z.string().min(1),
  image: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
}).strict();

const createEventDTO = baseEventDTO;
const updateEventDTO = baseEventDTO.partial();

module.exports = { createEventDTO, updateEventDTO };