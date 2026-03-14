const { z } = require('zod');

const actionSchema = z.object({
  label: z.string().min(1, "Label is required").max(500),
  link: z.string().optional(),
  info: z.string().max(500).optional(),
  type: z.enum(['primary', 'secondary', 'info'])
}).strict();

/**
 * Actions can arrive in two ways:
 *   1. application/json body   → already a parsed JS array
 *   2. multipart/form-data     → a JSON string (Swagger / any form client)
 *
 * This transformer handles both so callers never need to pre-process.
 */
const actionsField = z
  .union([
    z.array(actionSchema),          // already parsed (JSON body)
    z.string().transform((val, ctx) => {
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'actions must be a JSON array' });
          return z.NEVER;
        }
        // Validate each item against actionSchema
        const result = z.array(actionSchema).safeParse(parsed);
        if (!result.success) {
          result.error.issues.forEach((i) => ctx.addIssue(i));
          return z.NEVER;
        }
        return result.data;
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'actions must be a valid JSON string' });
        return z.NEVER;
      }
    }),
  ])
  .optional();

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
  actions: actionsField,
}).strict();

const createMinistryDTO = baseMinistryDTO;
const updateMinistryDTO = baseMinistryDTO.partial();

module.exports = { createMinistryDTO, updateMinistryDTO };