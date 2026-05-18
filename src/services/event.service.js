const Event = require('../models/event');
const { logger } = require('../config/logger');
const cache = require('../utils/cache');

class EventService {

  //Get all ministries
  async getAll(page = 1, limit = 10, searchTerm = '') {
    const start = Date.now();
    const cacheKey = `events:list:page:${page}:limit:${limit}:search:${searchTerm.trim() || 'none'}`;

    try {

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
        Event.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Math.min(limit, 100))
          .lean(),
        Event.countDocuments(query)
      ]);

      const duration = Date.now() - start;

      //log
      logger.debug('Ministries search completed', { 
        durationMs: duration, 
        resultsFound: data.length,
        totalRecords: total 
      });

      const result = { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
      
      await cache.set(cacheKey, result, 300);
      return result;

    } catch (err) {

      //log
      logger.error('Database error in get all event with search', { 
        error: err.message, 
        searchTerm 
      });
      throw err;
    }
  }

  //get a minitry
  async getById(id) {

    const cacheKey = `events:id:${id}`;

    try {

      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      //log
      logger.debug('Starting get event by id query', { _id: id });

      const event = await Event.findOne({ _id: id, deletedAt: null }).lean();

      logger.debug('Get event by id query successfully', { _id: id });

      if (event) await cache.set(cacheKey, event, 600);
      return event;

    } catch (err) {

      //log
      logger.error('Database error in get event by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  //create a event
  async create(data) {
    try {
      //log
      logger.debug('Inserting new event document', { title: data.title });
      
      const event = await Event.create(data);

      logger.debug('Event document inserted successfully', { _id: event._id });

      await cache.delByPattern('events:list:*');
      return event;

    } catch (err) {
      //log
      logger.error('Create failed in event create service', { title: data.title, error: err.message });
      throw err;
    }
  }

  //update a event
  async update(id, data) {
    try {
      //log
      logger.debug('Updating event document', { _id: id });
      
      const event = await Event.findOneAndUpdate(
        { _id: id, deletedAt: null },
        data,
        { new: true, runValidators: true }
      ).lean();

      logger.debug('event document updating successfully', { _id: id });

      await cache.del(`events:id:${id}`); 
      await cache.delByPattern('events:list:*');

      return event;

    } catch (err) {

      //log
      logger.error('update failed in event update service', { _id: id, error: err.message });
      throw err;
    }
  }

  //delete a event
  async softDelete(id) {
    try {

      //log
      logger.debug('Soft deleting event document', { _id: id });

      const event = await Event.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );

      logger.debug('event document soft delete successfully', { _id: id });

      await cache.del(`events:id:${id}`); // Invalidate
      await cache.delByPattern('events:list:*');
      
      return event;

    } catch (err) {

      //log
      logger.error('delete failed in soft event delete service', { _id: id, error: err.message });
      throw err;
    }
  }
  
}

module.exports = new EventService();