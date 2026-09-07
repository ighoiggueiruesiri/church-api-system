const { z } = require('zod');

const ISSUE_TYPES = ['cleanliness', 'supplies', 'plumbing', 'odor', 'other'];

const baseRestroomFeedbackDTO = z.object({
  location: z.string().min(1).max(150),
  rating:   z.coerce.number().int().min(1).max(5),
  issues:   z.array(z.enum(ISSUE_TYPES)).optional().default([]),
  comments: z.string().max(1000).optional().default(''),
  name:     z.string().max(200).optional().default(''),
  email:    z.union([z.string().email().max(300), z.literal('')]).optional().default(''),
}).strict();

const createRestroomFeedbackDTO = baseRestroomFeedbackDTO;
const updateRestroomFeedbackDTO = baseRestroomFeedbackDTO.partial();

module.exports = { createRestroomFeedbackDTO, updateRestroomFeedbackDTO, ISSUE_TYPES };