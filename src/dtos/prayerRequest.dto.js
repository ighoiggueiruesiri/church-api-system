const { z } = require('zod');

const basePrayerRequestDTO = z.object({
  name:    z.string().min(1).max(200),
  email:   z.string().email().max(300),
  request: z.string().min(1).max(3000),
}).strict();

const createPrayerRequestDTO = basePrayerRequestDTO;
const updatePrayerRequestDTO = basePrayerRequestDTO.partial();

module.exports = { createPrayerRequestDTO, updatePrayerRequestDTO };
