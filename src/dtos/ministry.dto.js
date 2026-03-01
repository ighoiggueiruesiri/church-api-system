const { z } = require('zod');

const createMinistryDTO = z.object({
  title: z.string().min(1, "Title is required"),
  desc: z.string().min(1, "Description is required"),
  headName: z.string().optional(),
  headImage: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  bg: z.string().optional(),
  border: z.string().optional(),
  fullDesc: z.string().optional(),
  actions: z.array(z.object({
    label: z.string(),
    link: z.string().optional(),
    info: z.string().optional(),
    type: z.enum(['primary', 'secondary', 'info'])
  })).optional()
});

const updateMinistryDTO = createMinistryDTO.partial();

module.exports = { createMinistryDTO, updateMinistryDTO };