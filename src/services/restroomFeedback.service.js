const RestroomFeedback = require('../models/restroomFeedback');
const { logger } = require('../config/logger');

class RestroomFeedbackService {

  async getAll(page = 1, limit = 10, searchTerm = '', filters = {}) {
    const start = Date.now();
    try {
      logger.info('Fetching restroom feedback', { page, limit, searchTerm: searchTerm || '(none)', filters });

      const query = { deletedAt: null };

      if (searchTerm.trim()) {
        const regex = new RegExp(searchTerm.trim(), 'i');
        query.$or = [
          { location: regex },
          { comments: regex },
          { name:     regex },
        ];
      }

      if (filters.location) query.location = filters.location;
      if (filters.minRating) query.rating = { $gte: Number(filters.minRating) };
      if (filters.issue) query.issues = filters.issue;

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        RestroomFeedback.find(query).sort({ createdAt: -1 }).skip(skip).limit(Math.min(limit, 100)).lean(),
        RestroomFeedback.countDocuments(query)
      ]);

      logger.debug('Restroom feedback fetched', {
        durationMs: Date.now() - start,
        resultsFound: data.length,
        totalRecords: total
      });

      return {
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (err) {
      logger.error('Database error in get all restroom feedback', { error: err.message, searchTerm });
      throw err;
    }
  }

  async getById(id) {
    try {
      logger.debug('Fetching restroom feedback by id', { _id: id });
      const feedback = await RestroomFeedback.findOne({ _id: id, deletedAt: null }).lean();
      logger.debug('Restroom feedback fetched successfully', { _id: id });
      return feedback;
    } catch (err) {
      logger.error('Database error in get restroom feedback by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  async create(data) {
    try {
      logger.debug('Inserting new restroom feedback', { location: data.location, rating: data.rating });
      const feedback = await RestroomFeedback.create(data);
      logger.debug('Restroom feedback inserted successfully', { _id: feedback._id });
      return feedback;
    } catch (err) {
      logger.error('Create failed in restroom feedback service', { location: data.location, error: err.message });
      throw err;
    }
  }

  async softDelete(id) {
    try {
      logger.debug('Soft deleting restroom feedback', { _id: id });
      const feedback = await RestroomFeedback.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );
      logger.debug('Restroom feedback soft deleted successfully', { _id: id });
      return feedback;
    } catch (err) {
      logger.error('Restroom feedback delete failed', { _id: id, error: err.message });
      throw err;
    }
  }

  async getSummary() {
    try {
      const [summary] = await RestroomFeedback.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalCount: { $sum: 1 }
          }
        }
      ]);
      return summary || { avgRating: 0, totalCount: 0 };
    } catch (err) {
      logger.error('Database error in restroom feedback summary', { error: err.message });
      throw err;
    }
  }
}

module.exports = new RestroomFeedbackService();