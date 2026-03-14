const PrayerRequest = require('../models/prayerRequest');
const { logger } = require('../config/logger');

class PrayerRequestService {

  async getAll(page = 1, limit = 10, searchTerm = '') {
    const start = Date.now();
    try {
      logger.info('Fetching prayer requests', { page, limit, searchTerm: searchTerm || '(none)' });

      const query = { deletedAt: null };

      if (searchTerm.trim()) {
        const regex = new RegExp(searchTerm.trim(), 'i');
        query.$or = [
          { name:    regex },
          { email:   regex },
          { request: regex },
        ];
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        PrayerRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(Math.min(limit, 100)).lean(),
        PrayerRequest.countDocuments(query)
      ]);

      logger.debug('Prayer requests fetched', {
        durationMs: Date.now() - start,
        resultsFound: data.length,
        totalRecords: total
      });

      return {
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (err) {
      logger.error('Database error in get all prayer requests', { error: err.message, searchTerm });
      throw err;
    }
  }

  async getById(id) {
    try {
      logger.debug('Fetching prayer request by id', { _id: id });
      const prayerRequest = await PrayerRequest.findOne({ _id: id, deletedAt: null }).lean();
      logger.debug('Prayer request fetched successfully', { _id: id });
      return prayerRequest;
    } catch (err) {
      logger.error('Database error in get prayer request by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  async create(data) {
    try {
      logger.debug('Inserting new prayer request', { name: data.name });
      const prayerRequest = await PrayerRequest.create(data);
      logger.debug('Prayer request inserted successfully', { _id: prayerRequest._id });
      return prayerRequest;
    } catch (err) {
      logger.error('Create failed in prayer request service', { name: data.name, error: err.message });
      throw err;
    }
  }

  async softDelete(id) {
    try {
      logger.debug('Soft deleting prayer request', { _id: id });
      const prayerRequest = await PrayerRequest.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );
      logger.debug('Prayer request soft deleted successfully', { _id: id });
      return prayerRequest;
    } catch (err) {
      logger.error('Prayer request delete failed', { _id: id, error: err.message });
      throw err;
    }
  }
}

module.exports = new PrayerRequestService();
