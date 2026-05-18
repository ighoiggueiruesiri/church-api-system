const Ministry = require('../models/ministry');
const { logger } = require('../config/logger');
const { deleteUploadedFile } = require('../utils/fileHelper');
const cache = require('../utils/cache');

class MinistryService {

  //Get all ministries
  async getAll(page = 1, limit = 10, searchTerm = '') {
    const start = Date.now();
    // 1. Generate unique cache key based on query params
    const cacheKey = `ministries:list:page:${page}:limit:${limit}:search:${searchTerm.trim() || 'none'}`;

    try {

      // 2. Check Cache
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      //log
      logger.info('Fetching ministries', { page, limit, searchTerm: searchTerm || '(none)' });

      const query = { deletedAt: null };

      if (searchTerm.trim()) {
        const regex = new RegExp(searchTerm.trim(), 'i'); // case-insensitive
        query.$or = [
          { title: regex },
          { desc: regex },
          { headName: regex },
          { fullDesc: regex }
        ];
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Ministry.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Math.min(limit, 100))
          .lean(),
        Ministry.countDocuments(query)
      ]);

      const duration = Date.now() - start;

      //log
      logger.debug('Ministries search completed', { 
        durationMs: duration, 
        resultsFound: data.length,
        totalRecords: total 
      });

      const result = { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
      
      // 3. Save to Cache for 5 minutes (300s)
      await cache.set(cacheKey, result, 300);
      return result;

    } catch (err) {

      //log
      logger.error('Database error in get all ministry with search', { 
        error: err.message, 
        searchTerm 
      });
      throw err;
    }
  }

  //get a minitry
  async getById(id) {

    const cacheKey = `ministries:id:${id}`;

    try {

      // Check Cache
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      //log
      logger.debug('Starting get ministry by id query', { _id: id });

      const ministry = await Ministry.findOne({ _id: id, deletedAt: null }).lean();

      logger.debug('Get ministry by id query successfully', { _id: id });

      // Save to cache
      if (ministry) await cache.set(cacheKey, ministry, 600);
      return ministry;

    } catch (err) {

      //log
      logger.error('Database error in get ministry by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  //create a ministry
  async create(data) {
    try {
      //log
      logger.debug('Inserting new ministry document', { title: data.title });
      
      const ministry = await Ministry.create(data);

      logger.debug('Ministry document inserted successfully', { _id: ministry._id });

      // Invalidate list caches because a new item was added
      await cache.delByPattern('ministries:list:*');

      return ministry;

    } catch (err) {
      //log
      logger.error('Create failed in ministry create service', { title: data.title, error: err.message });
      throw err;
    }
  }

  //update a ministry
  async update(id, data) {
    try {
      //log
      logger.debug('Updating ministry document', { _id: id });
      
      // Fetch the existing document first so we can purge the old image if
      // the caller is replacing headImage with a new upload.
      const existing = await Ministry.findOne({ _id: id, deletedAt: null }).lean();

      if (existing && data.headImage && existing.headImage !== data.headImage) {
        deleteUploadedFile(existing.headImage);
      }

      const ministry = await Ministry.findOneAndUpdate(
        { _id: id, deletedAt: null },
        data,
        { new: true, runValidators: true }
      ).lean();

      logger.debug('ministry document updating successfully', { _id: id });

      // Invalidate specific item and all lists
      await cache.del(`ministries:id:${id}`);
      await cache.delByPattern('ministries:list:*');

      return ministry;

    } catch (err) {

      //log
      logger.error('update failed in ministry update service', { _id: id, error: err.message });
      throw err;
    }
  }

  //delete a ministry
  async softDelete(id) {
    try {

      //log
      logger.debug('Soft deleting ministry document', { _id: id });

      // Fetch first so we can purge the image after the soft-delete succeeds
      const existing = await Ministry.findOne({ _id: id, deletedAt: null }).lean();

      const ministry = await Ministry.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );

      if (ministry && existing?.headImage) {
        deleteUploadedFile(existing.headImage);
      }

      logger.debug('ministry document soft delete successfully', { _id: id });

      // Invalidate specific item and all lists
      await cache.del(`ministries:id:${id}`);
      await cache.delByPattern('ministries:list:*');
      
      return ministry;

    } catch (err) {

      //log
      logger.error('delete failed in soft ministry delete service', { _id: id, error: err.message });
      throw err;
    }
  }
  
}

module.exports = new MinistryService();