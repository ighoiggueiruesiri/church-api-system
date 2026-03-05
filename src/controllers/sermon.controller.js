const SermonService = require('../services/sermon.service');
const { createSermonDTO, updateSermonDTO } = require('../dtos/sermon.dto');
const { success, error } = require('../utils/response');  //response helper
const { logger } = require('../config/logger');          //log helper
const mongoose = require('mongoose');

//Get all sermons
exports.getSermons = async (req, res, next) => {
  const startTime = Date.now(); //time for the purpose of logging

  try {

    //log
    logger.info('Fetching sermons list', { 
      page: req.query.page || 1, 
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip 
    });

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.search?.trim() || '';

    const result = await SermonService.getAll(page, limit, searchTerm);

    //log
    const duration = Date.now() - startTime;
    logger.info('Sermons fetched successfully', { 
      count: result.data.length, 
      durationMs: duration,
      page,
      totalPages: result.pagination.pages
    });

    success(res, result);

  } catch (err) {

    //log
    logger.error('Failed to fetch sermons', { error: err.message, stack: err.stack });

    next(err);
  }
};

//Get a specific sermon
exports.getSermonById = async (req, res, next) => {
  try {
    //log
    logger.info('Fetching single sermon', { id: req.params.id });

    const sermon = await SermonService.getById(req.params.id);
    if (!sermon) {

      //log
      logger.warn('Sermon not found', { id: req.params.id });
      return error(res, "Sermon not found", 404)
    };

    //log
    logger.info('Sermon retrieved successfully', { id: req.params.id, title: sermon.title });

    success(res, sermon);

  } catch (err) {

    //log
    logger.error('Error fetching sermon by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

//create a sermon
exports.createSermon = async (req, res, next) => {
  try {

    //log
    logger.info('Creating new sermon', { title: req.body.title });
    const validatedData = createSermonDTO.parse(req.body);
    const sermon = await SermonService.create(validatedData);

    //log
    logger.info('Sermon created successfully', { 
      sermonId: sermon._id, 
      title: sermon.title 
    });

    success(res, sermon, 201);
  } catch (err) {

    //log
    logger.error('Failed to create sermon', { 
      attemptedTitle: req.body.title, 
      error: err.message 
    });

    next(err); // Zod or DB error will be caught by global handler
  }
};

// Update a sermon
exports.updateSermon = async (req, res, next) => {
  try {
    //log
    logger.info('Updating sermon', { id: req.params.id });

    const validatedData = updateSermonDTO.parse(req.body);
    const updated = await SermonService.update(req.params.id, validatedData);

    if (!updated) { 
      //log
      logger.warn('Sermon not found for update', { id: req.params.id });

      return error(res, "Sermon not found", 404);
    }
    //log
    logger.info('Sermon updated successfully', { id: req.params.id, title: updated.title });

    success(res, updated);
  } catch (err) {

    //log
    logger.error('Failed to update sermon', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Delete a sermon
exports.deleteSermon = async (req, res, next) => {
  try {
    //log
    logger.info('Soft-deleting sermon', { id: req.params.id });
    const deleted = await SermonService.softDelete(req.params.id);

    if (!deleted){ 
      //log
      logger.warn('Sermon not found for delete', { id: req.params.id });
      return error(res, "Sermon not found", 404);
    }

    //log
    logger.info('Sermon soft-deleted successfully', { id: req.params.id });
    success(res, { message: "Sermon deleted successfully" });
  } catch (err) {

    //log
    logger.error('Failed to soft-delete sermon', { id: req.params.id, error: err.message });
    next(err);
  }
};