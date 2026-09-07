const RestroomFeedbackService = require('../services/restroomFeedback.service');
const { createRestroomFeedbackDTO } = require('../dtos/restroomFeedback.dto');
const { success, error } = require('../utils/response');
const { logger } = require('../config/logger');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');

// Get all feedback entries
exports.getRestroomFeedback = async (req, res, next) => {
  const startTime = Date.now();
  try {
    logger.info('Fetching restroom feedback list', {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip
    });

    const page       = parseInt(req.query.page) || 1;
    const limit      = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.searchTerm?.trim() || '';
    const filters = {
      location:  req.query.location,
      minRating: req.query.minRating,
      issue:     req.query.issue,
    };

    const result = await RestroomFeedbackService.getAll(page, limit, searchTerm, filters);

    logger.info('Restroom feedback fetched successfully', {
      count: result.data.length,
      durationMs: Date.now() - startTime,
      page,
      totalPages: result.pagination.pages
    });

    success(res, result);
  } catch (err) {
    logger.error('Failed to fetch restroom feedback', { error: err.message, stack: err.stack });
    next(err);
  }
};

// Get a specific feedback entry
exports.getRestroomFeedbackById = async (req, res, next) => {
  try {
    logger.info('Fetching single restroom feedback entry', { id: req.params.id });

    const feedback = await RestroomFeedbackService.getById(req.params.id);
    if (!feedback) {
      logger.warn('Restroom feedback not found', { id: req.params.id });
      return error(res, 'Feedback entry not found', 404);
    }

    logger.info('Restroom feedback retrieved successfully', { id: req.params.id });
    success(res, feedback);
  } catch (err) {
    logger.error('Error fetching restroom feedback by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Submit feedback
exports.createRestroomFeedback = async (req, res, next) => {
  try {
    logger.info('Receiving new restroom feedback', { location: req.body.location, rating: req.body.rating });

    const validatedData = createRestroomFeedbackDTO.parse(stripEmptyStrings(req.body));
    const feedback = await RestroomFeedbackService.create(validatedData);

    logger.info('Restroom feedback saved successfully', { feedbackId: feedback._id });
    success(res, feedback, 201);
  } catch (err) {
    logger.error('Failed to save restroom feedback', { error: err.message });
    next(err);
  }
};

// Delete a feedback entry
exports.deleteRestroomFeedback = async (req, res, next) => {
  try {
    logger.info('Soft-deleting restroom feedback', { id: req.params.id });
    const deleted = await RestroomFeedbackService.softDelete(req.params.id);

    if (!deleted) {
      logger.warn('Restroom feedback not found for delete', { id: req.params.id });
      return error(res, 'Feedback entry not found', 404);
    }

    logger.info('Restroom feedback soft-deleted successfully', { id: req.params.id });
    success(res, { message: 'Feedback entry deleted successfully' });
  } catch (err) {
    logger.error('Failed to soft-delete restroom feedback', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Summary stats (avg rating, total count) — handy for an admin dashboard widget
exports.getRestroomFeedbackSummary = async (req, res, next) => {
  try {
    const summary = await RestroomFeedbackService.getSummary();
    success(res, summary);
  } catch (err) {
    logger.error('Failed to fetch restroom feedback summary', { error: err.message });
    next(err);
  }
};