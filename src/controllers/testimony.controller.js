const TestimonyService = require('../services/testimony.service');
const { createTestimonyDTO, updateTestimonyDTO } = require('../dtos/testimony.dto');
const { success, error } = require('../utils/response');
const { logger } = require('../config/logger');
const { resolveImageUrls } = require('../utils/imageUrl');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');
const { injectUploadedFilePaths } = require('../utils/injectUploadedFilePaths');

// Get all testimonies
exports.getTestimonies = async (req, res, next) => {
  const startTime = Date.now();
  try {
    logger.info('Fetching testimonies list', {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip
    });

    const page       = parseInt(req.query.page) || 1;
    const limit      = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.searchTerm?.trim() || '';

    const result = await TestimonyService.getAll(page, limit, searchTerm);
    result.data = resolveImageUrls(result.data);

    const duration = Date.now() - startTime;
    logger.info('Testimonies fetched successfully', {
      count: result.data.length,
      durationMs: duration,
      page,
      totalPages: result.pagination.pages
    });

    success(res, result);
  } catch (err) {
    logger.error('Failed to fetch testimonies', { error: err.message, stack: err.stack });
    next(err);
  }
};

// Get a specific testimony
exports.getTestimonyById = async (req, res, next) => {
  try {
    logger.info('Fetching single testimony', { id: req.params.id });

    const testimony = await TestimonyService.getById(req.params.id);
    if (!testimony) {
      logger.warn('Testimony not found', { id: req.params.id });
      return error(res, 'Testimony not found', 404);
    }

    logger.info('Testimony retrieved successfully', { id: req.params.id, name: testimony.name });
    success(res, resolveImageUrls(testimony));
  } catch (err) {
    logger.error('Error fetching testimony by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Create a testimony
exports.createTestimony = async (req, res, next) => {
  try {
    logger.info('Creating new testimony', { name: req.body.name });

    injectUploadedFilePaths(req);
    const validatedData = createTestimonyDTO.parse(stripEmptyStrings(req.body));

    const testimony = await TestimonyService.create(validatedData);

    logger.info('Testimony created successfully', { testimonyId: testimony._id });
    success(res, resolveImageUrls(testimony), 201);
  } catch (err) {
    logger.error('Failed to create testimony', { error: err.message });
    next(err);
  }
};

// Update a testimony
exports.updateTestimony = async (req, res, next) => {
  try {
    logger.info('Updating testimony', { id: req.params.id });

    injectUploadedFilePaths(req);
    const validatedData = updateTestimonyDTO.parse(stripEmptyStrings(req.body));

    const updated = await TestimonyService.update(req.params.id, validatedData);
    if (!updated) return error(res, 'Testimony not found', 404);

    logger.info('Testimony updated successfully', { id: req.params.id });
    success(res, resolveImageUrls(updated));
  } catch (err) {
    logger.error('Failed to update testimony', { error: err.message });
    next(err);
  }
};

// Delete a testimony
exports.deleteTestimony = async (req, res, next) => {
  try {
    logger.info('Soft-deleting testimony', { id: req.params.id });
    const deleted = await TestimonyService.softDelete(req.params.id);

    if (!deleted) {
      logger.warn('Testimony not found for delete', { id: req.params.id });
      return error(res, 'Testimony not found', 404);
    }

    logger.info('Testimony soft-deleted successfully', { id: req.params.id });
    success(res, { message: 'Testimony deleted successfully' });
  } catch (err) {
    logger.error('Failed to soft-delete testimony', { id: req.params.id, error: err.message });
    next(err);
  }
};
