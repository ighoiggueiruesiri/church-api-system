const { z } = require('zod');

const actionSchema = z.object({
  label: z.string().min(1, "Label is required").max(500),
  link: z.string().optional(),
  info: z.string().max(500).optional(),
  type: z.enum(['primary', 'secondary', 'info'])
}).strict();

const baseMinistryDTO = z.object({
  title: z.string().min(1).max(500),
  desc: z.string().min(1).max(500),
  headName: z.string().max(500).optional(),
  headImage: z.string().optional(),
  headTitle: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  bg: z.string().optional(),
  border: z.string().optional(),
  fullDesc: z.string().max(2000).optional(),
  actions: z.array(actionSchema).max(10).optional()
}).strict();

const createMinistryDTO = baseMinistryDTO;
const updateMinistryDTO = baseMinistryDTO.partial();

module.exports = { createMinistryDTO, updateMinistryDTO };