const PrayerRequestService = require('../services/prayerRequest.service');
const { createPrayerRequestDTO, updatePrayerRequestDTO } = require('../dtos/prayerRequest.dto');
const { success, error } = require('../utils/response');
const { logger } = require('../config/logger');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');

// Get all prayer requests
exports.getPrayerRequests = async (req, res, next) => {
  const startTime = Date.now();
  try {
    logger.info('Fetching prayer requests list', {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip
    });

    const page       = parseInt(req.query.page) || 1;
    const limit      = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.searchTerm?.trim() || '';

    const result = await PrayerRequestService.getAll(page, limit, searchTerm);

    logger.info('Prayer requests fetched successfully', {
      count: result.data.length,
      durationMs: Date.now() - startTime,
      page,
      totalPages: result.pagination.pages
    });

    success(res, result);
  } catch (err) {
    logger.error('Failed to fetch prayer requests', { error: err.message, stack: err.stack });
    next(err);
  }
};

// Get a specific prayer request
exports.getPrayerRequestById = async (req, res, next) => {
  try {
    logger.info('Fetching single prayer request', { id: req.params.id });

    const prayerRequest = await PrayerRequestService.getById(req.params.id);
    if (!prayerRequest) {
      logger.warn('Prayer request not found', { id: req.params.id });
      return error(res, 'Prayer request not found', 404);
    }

    logger.info('Prayer request retrieved successfully', { id: req.params.id });
    success(res, prayerRequest);
  } catch (err) {
    logger.error('Error fetching prayer request by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Submit a prayer request
exports.createPrayerRequest = async (req, res, next) => {
  try {
    logger.info('Receiving new prayer request', { name: req.body.name });

    const validatedData = createPrayerRequestDTO.parse(stripEmptyStrings(req.body));
    const prayerRequest = await PrayerRequestService.create(validatedData);

    logger.info('Prayer request saved successfully', { prayerRequestId: prayerRequest._id });
    success(res, prayerRequest, 201);
  } catch (err) {
    logger.error('Failed to save prayer request', { error: err.message });
    next(err);
  }
};

// Delete a prayer request
exports.deletePrayerRequest = async (req, res, next) => {
  try {
    logger.info('Soft-deleting prayer request', { id: req.params.id });
    const deleted = await PrayerRequestService.softDelete(req.params.id);

    if (!deleted) {
      logger.warn('Prayer request not found for delete', { id: req.params.id });
      return error(res, 'Prayer request not found', 404);
    }

    logger.info('Prayer request soft-deleted successfully', { id: req.params.id });
    success(res, { message: 'Prayer request deleted successfully' });
  } catch (err) {
    logger.error('Failed to soft-delete prayer request', { id: req.params.id, error: err.message });
    next(err);
  }
};
