const { z } = require('zod');

const baseBlogDTO = z.object({
  title:       z.string().min(1).max(500),
  date:        z.string().max(100).optional(),
  excerpt:     z.string().max(500).optional(),
  image:       z.string().optional(),
  fullContent: z.string().optional(),
}).strict();

const createBlogDTO = baseBlogDTO;
const updateBlogDTO = baseBlogDTO.partial();

module.exports = { createBlogDTO, updateBlogDTO };
