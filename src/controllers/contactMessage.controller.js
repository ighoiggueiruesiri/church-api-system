const ContactMessageService = require('../services/contactMessage.service');
const { createContactMessageDTO } = require('../dtos/contactMessage.dto');
const { success, error } = require('../utils/response');
const { logger } = require('../config/logger');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');

// Get all contact messages
exports.getContactMessages = async (req, res, next) => {
  const startTime = Date.now();
  try {
    logger.info('Fetching contact messages list', {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip
    });

    const page       = parseInt(req.query.page) || 1;
    const limit      = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.searchTerm?.trim() || '';

    const result = await ContactMessageService.getAll(page, limit, searchTerm);

    logger.info('Contact messages fetched successfully', {
      count: result.data.length,
      durationMs: Date.now() - startTime,
      page,
      totalPages: result.pagination.pages
    });

    success(res, result);
  } catch (err) {
    logger.error('Failed to fetch contact messages', { error: err.message, stack: err.stack });
    next(err);
  }
};

// Get a specific contact message
exports.getContactMessageById = async (req, res, next) => {
  try {
    logger.info('Fetching single contact message', { id: req.params.id });

    const contactMessage = await ContactMessageService.getById(req.params.id);
    if (!contactMessage) {
      logger.warn('Contact message not found', { id: req.params.id });
      return error(res, 'Contact message not found', 404);
    }

    logger.info('Contact message retrieved successfully', { id: req.params.id });
    success(res, contactMessage);
  } catch (err) {
    logger.error('Error fetching contact message by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Submit a contact message
exports.createContactMessage = async (req, res, next) => {
  try {
    logger.info('Receiving new contact message', { name: req.body.name });

    const validatedData = createContactMessageDTO.parse(stripEmptyStrings(req.body));
    const contactMessage = await ContactMessageService.create(validatedData);

    logger.info('Contact message saved successfully', { contactMessageId: contactMessage._id });
    success(res, contactMessage, 201);
  } catch (err) {
    logger.error('Failed to save contact message', { error: err.message });
    next(err);
  }
};

// Delete a contact message
exports.deleteContactMessage = async (req, res, next) => {
  try {
    logger.info('Soft-deleting contact message', { id: req.params.id });
    const deleted = await ContactMessageService.softDelete(req.params.id);

    if (!deleted) {
      logger.warn('Contact message not found for delete', { id: req.params.id });
      return error(res, 'Contact message not found', 404);
    }

    logger.info('Contact message soft-deleted successfully', { id: req.params.id });
    success(res, { message: 'Contact message deleted successfully' });
  } catch (err) {
    logger.error('Failed to soft-delete contact message', { id: req.params.id, error: err.message });
    next(err);
  }
};
