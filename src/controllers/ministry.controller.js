const MinistryService = require('../services/ministry.service');
const { createMinistryDTO, updateMinistryDTO } = require('../dtos/ministry.dto');
const { success, error } = require('../utils/response');  //response helper
const { logger } = require('../config/logger');          //log helper
const { resolveImageUrls } = require('../utils/imageUrl');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');
const { injectUploadedFilePaths } = require('../utils/injectUploadedFilePaths');
const mongoose = require('mongoose');

//Get all minitries
exports.getMinistries = async (req, res, next) => {
  const startTime = Date.now(); //time for the purpose of logging

  try {

    //log
    logger.info('Fetching ministries list', { 
      page: req.query.page || 1, 
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip 
    });

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.searchTerm?.trim() || '';

    const result = await MinistryService.getAll(page, limit, searchTerm);

    //log
    const duration = Date.now() - startTime;
    logger.info('Ministries fetched successfully', { 
      count: result.data.length, 
      durationMs: duration,
      page,
      totalPages: result.pagination.pages
    });

    // Rewrite all stored relative image paths → full absolute URLs
    result.data = resolveImageUrls(result.data);

    success(res, result);

  } catch (err) {

    //log
    logger.error('Failed to fetch ministries', { error: err.message, stack: err.stack });

    next(err);
  }
};

//Get a specific ministry
exports.getMinistryById = async (req, res, next) => {
  try {
    //log
    logger.info('Fetching single ministry', { id: req.params.id });

    const ministry = await MinistryService.getById(req.params.id);

    if (!ministry) {

      //log
      logger.warn('Ministry not found', { id: req.params.id });
      return error(res, "Ministry not found", 404)
    };

    //log
    logger.info('Ministry retrieved successfully', { id: req.params.id, title: ministry.title });

    success(res, resolveImageUrls(ministry));

  } catch (err) {

    //log
    logger.error('Error fetching ministry by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

//create a ministry
exports.createMinistry = async (req, res, next) => {
  try {

    //log
    logger.info('Creating new ministry', { title: req.body.title });

    // Move uploaded file paths (e.g. headImage) into req.body before DTO parse
    injectUploadedFilePaths(req);

    const validatedData = createMinistryDTO.parse(stripEmptyStrings(req.body));
    const ministry = await MinistryService.create(validatedData);

    //log
    logger.info('Ministry created successfully', { 
      ministryId: ministry._id, 
      title: ministry.title 
    });

    success(res, resolveImageUrls(ministry.toObject ? ministry.toObject() : ministry), 201);

  } catch (err) {

    //log
    logger.error('Failed to create ministry', { 
      attemptedTitle: req.body.title, 
      error: err.message 
    });

    next(err); // Zod or DB error will be caught by global handler
  }
};

// Update a ministry
exports.updateMinistry = async (req, res, next) => {
  try {
    //log
    logger.info('Updating ministry', { id: req.params.id });

    // Move uploaded file paths into req.body before DTO parse
    injectUploadedFilePaths(req);

    const validatedData = updateMinistryDTO.parse(stripEmptyStrings(req.body));
    const updated = await MinistryService.update(req.params.id, validatedData);

    if (!updated) { 
      //log
      logger.warn('Ministry not found for update', { id: req.params.id });

      return error(res, "Ministry not found", 404);
    }
    //log
    logger.info('Ministry updated successfully', { id: req.params.id, title: updated.title });

    success(res, resolveImageUrls(updated));
  } catch (err) {

    //log
    logger.error('Failed to update ministry', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Delete a ministry
exports.deleteMinistry = async (req, res, next) => {
  try {
    //log
    logger.info('Soft-deleting ministry', { id: req.params.id });
    const deleted = await MinistryService.softDelete(req.params.id);

    if (!deleted){ 
      //log
      logger.warn('Ministry not found for delete', { id: req.params.id });
      return error(res, "Ministry not found", 404);
    }

    //log
    logger.info('Ministry soft-deleted successfully', { id: req.params.id });
    success(res, { message: "Ministry deleted successfully" });
    
  } catch (err) {

    //log
    logger.error('Failed to soft-delete ministry', { id: req.params.id, error: err.message });
    next(err);
  }
};