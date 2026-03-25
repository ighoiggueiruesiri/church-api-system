const Testimony = require('../models/testimony');
const { logger } = require('../config/logger');

class TestimonyService {

  async getAll(page = 1, limit = 10, searchTerm = '') {
    const start = Date.now();
    try {
      logger.info('Fetching testimonies', { page, limit, searchTerm: searchTerm || '(none)' });

      const query = { deletedAt: null };

      if (searchTerm.trim()) {
        const regex = new RegExp(searchTerm.trim(), 'i');
        query.$or = [
          { name: regex },
          { role: regex },
          { text: regex },
        ];
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Testimony.find(query).sort({ createdAt: -1 }).skip(skip).limit(Math.min(limit, 100)).lean(),
        Testimony.countDocuments(query)
      ]);

      logger.debug('Testimonies search completed', {
        durationMs: Date.now() - start,
        resultsFound: data.length,
        totalRecords: total
      });

      return {
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (err) {
      logger.error('Database error in get all testimonies', { error: err.message, searchTerm });
      throw err;
    }
  }

  async getById(id) {
    try {
      logger.debug('Starting get testimony by id query', { _id: id });
      const testimony = await Testimony.findOne({ _id: id, deletedAt: null }).lean();
      logger.debug('Get testimony by id query successfully', { _id: id });
      return testimony;
    } catch (err) {
      logger.error('Database error in get testimony by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  async create(data) {
    try {
      logger.debug('Inserting new testimony document', { name: data.name });
      const testimony = await Testimony.create(data);
      logger.debug('Testimony document inserted successfully', { _id: testimony._id });
      return testimony;
    } catch (err) {
      logger.error('Create failed in create testimony service', { name: data.name, error: err.message });
      throw err;
    }
  }

  async update(id, data) {
    try {
      logger.debug('Updating testimony document', { _id: id });
      const testimony = await Testimony.findOneAndUpdate(
        { _id: id, deletedAt: null },
        data,
        { new: true, runValidators: true }
      ).lean();
      logger.debug('Testimony document updated successfully', { _id: id });
      return testimony;
    } catch (err) {
      logger.error('Testimony update failed in update service', { _id: id, error: err.message });
      throw err;
    }
  }

  async softDelete(id) {
    try {
      logger.debug('Soft deleting testimony document', { _id: id });
      const testimony = await Testimony.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );
      logger.debug('Testimony document soft deleted successfully', { _id: id });
      return testimony;
    } catch (err) {
      logger.error('Testimony delete failed in soft delete service', { _id: id, error: err.message });
      throw err;
    }
  }
}

module.exports = new TestimonyService();
