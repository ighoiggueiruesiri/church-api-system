const { z } = require('zod');

const baseProjectDTO = z.object({
  title: z.string().min(1).max(500),
  desc:  z.string().min(1).max(2000),
  image: z.string().optional(),
  link:  z.string().max(1000).optional(),
}).strict();

const createProjectDTO = baseProjectDTO;
const updateProjectDTO = baseProjectDTO.partial();

module.exports = { createProjectDTO, updateProjectDTO };
