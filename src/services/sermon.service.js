const Sermon = require('../models/sermon');
const { logger } = require('../config/logger');

class SermonService {

  //Get all sermons
  async getAll(page = 1, limit = 10, searchTerm = '') {
    const start = Date.now();
    try {

      //log
      logger.info('Fetching sermons', { page, limit, searchTerm: searchTerm || '(none)' });

      const query = { deletedAt: null };

      if (searchTerm.trim()) {
        const regex = new RegExp(searchTerm.trim(), 'i'); // case-insensitive
        query.$or = [
          { title: regex },
          { pastor: regex },
        ];
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Sermon.find(query)
          .skip(skip)
          .limit(Math.min(limit, 100))
          .lean(),
        Sermon.countDocuments(query)
      ]);

      const duration = Date.now() - start;

      //log
      logger.debug('Sermons search completed', { 
        durationMs: duration, 
        resultsFound: data.length,
        totalRecords: total 
      });

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (err) {

      //log
      logger.error('Database error in get all sermons with search', { 
        error: err.message, 
        searchTerm 
      });
      throw err;
    }
  }

  //get a sermon
  async getById(id) {
    try {
      //log
      logger.debug('Starting get sermon by id query', { _id: id });

      const sermon = await Sermon.findOne({ _id: id, deletedAt: null }).lean();

      logger.debug('Get sermon by id query successfully', { _id: id });

      return sermon;

    } catch (err) {

      //log
      logger.error('Database error in get sermon by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  //create a sermon
  async create(data) {
    try {
      //log
      logger.debug('Inserting new sermon document', { title: data.title });
      
      const sermon = await Sermon.create(data);

      logger.debug('Sermon Document inserted successfully', { _id: sermon._id });

      return sermon;

    } catch (err) {
      //log
      logger.error('Create failed in create sermon service', { title: data.title, error: err.message });
      throw err;
    }
  }

  //update a ministry
  async update(id, data) {
    try {
      //log
      logger.debug('Updating sermon document', { _id: id });
      
      const sermon = await Sermon.findOneAndUpdate(
        { _id: id, deletedAt: null },
        data,
        { new: true, runValidators: true }
      ).lean();

      logger.debug('Sermon document updating successfully', { _id: id });

      return sermon;

    } catch (err) {

      //log
      logger.error('sermon update failed in update service', { _id: id, error: err.message });
      throw err;
    }
  }

  //delete a sermon
  async softDelete(id) {
    try {

      //log
      logger.debug('Soft deleting sermon document', { _id: id });

      const sermon = await Sermon.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );

      logger.debug('Sermon document soft delete successfully', { _id: id });

      return sermon;

    } catch (err) {

      //log
      logger.error('sermon delete failed in soft delete service', { _id: id, error: err.message });
      throw err;
    }
  }
  
}

module.exports = new SermonService();