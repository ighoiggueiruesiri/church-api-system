const EventService = require('../services/event.service');
const { createEventDTO, updateEventDTO } = require('../dtos/event.dto');
const { success, error } = require('../utils/response');  //response helper
const { logger } = require('../config/logger');          //log helper
const { resolveImageUrls } = require('../utils/imageUrl');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');
const { injectUploadedFilePaths } = require('../utils/injectUploadedFilePaths');
const mongoose = require('mongoose');

//Get all Events
exports.getEvents = async (req, res, next) => {
  const startTime = Date.now(); //time for the purpose of logging

  try {

    //log
    logger.info('Fetching Events list', { 
      page: req.query.page || 1, 
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip 
    });

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.searchTerm?.trim() || '';

    const result = await EventService.getAll(page, limit, searchTerm);
    result.data = resolveImageUrls(result.data);
    
    //log
    const duration = Date.now() - startTime;
    logger.info('Events fetched successfully', { 
      count: result.data.length, 
      durationMs: duration,
      page,
      totalPages: result.pagination.pages
    });

    success(res, result);

  } catch (err) {

    //log
    logger.error('Failed to fetch Events', { error: err.message, stack: err.stack });

    next(err);
  }
};

//Get a specific Event
exports.getEventById = async (req, res, next) => {
  try {
    //log
    logger.info('Fetching single Event', { id: req.params.id });

    const Event = await EventService.getById(req.params.id);
    if (!Event) {

      //log
      logger.warn('Event not found', { id: req.params.id });
      return error(res, "Event not found", 404)
    };

    //log
    logger.info('Event retrieved successfully', { id: req.params.id, title: Event.title });

    success(res, resolveImageUrls(Event));

  } catch (err) {

    //log
    logger.error('Error fetching Event by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

//create a Event
exports.createEvent = async (req, res, next) => {
  try {

    //log
    logger.info('Creating new Event', { title: req.body.title });

    injectUploadedFilePaths(req);
    const validatedData = createEventDTO.parse(stripEmptyStrings(req.body));
    const Event = await EventService.create(validatedData);

    //log
    logger.info('Event created successfully', { 
      EventId: Event._id, 
      title: Event.title 
    });

    success(res, resolveImageUrls(Event), 201);
  } catch (err) {

    //log
    logger.error('Failed to create Event', { 
      attemptedTitle: req.body.title, 
      error: err.message 
    });

    next(err); // Zod or DB error will be caught by global handler
  }
};

// Update a Event
exports.updateEvent = async (req, res, next) => {
  try {
    //log
    logger.info('Updating Event', { id: req.params.id });

    injectUploadedFilePaths(req);
    const validatedData = updateEventDTO.parse(stripEmptyStrings(req.body));
    const updated = await EventService.update(req.params.id, validatedData);

    if (!updated) { 
      //log
      logger.warn('Event not found for update', { id: req.params.id });

      return error(res, "Event not found", 404);
    }
    //log
    logger.info('Event updated successfully', { id: req.params.id, title: updated.title });

    success(res, resolveImageUrls(updated));
  } catch (err) {

    //log
    logger.error('Failed to update Event', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Delete a Event
exports.deleteEvent = async (req, res, next) => {
  try {
    //log
    logger.info('Soft-deleting Event', { id: req.params.id });
    const deleted = await EventService.softDelete(req.params.id);

    if (!deleted){ 
      //log
      logger.warn('Event not found for delete', { id: req.params.id });
      return error(res, "Event not found", 404);
    }

    //log
    logger.info('Event soft-deleted successfully', { id: req.params.id });
    success(res, { message: "Event deleted successfully" });
  } catch (err) {

    //log
    logger.error('Failed to soft-delete Event', { id: req.params.id, error: err.message });
    next(err);
  }
};