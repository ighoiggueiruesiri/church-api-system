const ContactMessage = require('../models/contactMessage');
const { logger } = require('../config/logger');

class ContactMessageService {

  async getAll(page = 1, limit = 10, searchTerm = '') {
    const start = Date.now();
    try {
      logger.info('Fetching contact messages', { page, limit, searchTerm: searchTerm || '(none)' });

      const query = { deletedAt: null };

      if (searchTerm.trim()) {
        const regex = new RegExp(searchTerm.trim(), 'i');
        query.$or = [
          { name:    regex },
          { email:   regex },
          { message: regex },
        ];
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        ContactMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(Math.min(limit, 100)).lean(),
        ContactMessage.countDocuments(query)
      ]);

      logger.debug('Contact messages fetched', {
        durationMs: Date.now() - start,
        resultsFound: data.length,
        totalRecords: total
      });

      return {
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (err) {
      logger.error('Database error in get all contact messages', { error: err.message, searchTerm });
      throw err;
    }
  }

  async getById(id) {
    try {
      logger.debug('Fetching contact message by id', { _id: id });
      const contactMessage = await ContactMessage.findOne({ _id: id, deletedAt: null }).lean();
      logger.debug('Contact message fetched successfully', { _id: id });
      return contactMessage;
    } catch (err) {
      logger.error('Database error in get contact message by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  async create(data) {
    try {
      logger.debug('Inserting new contact message', { name: data.name });
      const contactMessage = await ContactMessage.create(data);
      logger.debug('Contact message inserted successfully', { _id: contactMessage._id });
      return contactMessage;
    } catch (err) {
      logger.error('Create failed in contact message service', { name: data.name, error: err.message });
      throw err;
    }
  }

  async softDelete(id) {
    try {
      logger.debug('Soft deleting contact message', { _id: id });
      const contactMessage = await ContactMessage.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );
      logger.debug('Contact message soft deleted successfully', { _id: id });
      return contactMessage;
    } catch (err) {
      logger.error('Contact message delete failed', { _id: id, error: err.message });
      throw err;
    }
  }
}

module.exports = new ContactMessageService();
