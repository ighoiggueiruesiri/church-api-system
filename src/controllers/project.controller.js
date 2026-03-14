const ProjectService = require('../services/project.service');
const { createProjectDTO, updateProjectDTO } = require('../dtos/project.dto');
const { success, error } = require('../utils/response');
const { logger } = require('../config/logger');
const { resolveImageUrls } = require('../utils/imageUrl');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');
const { injectUploadedFilePaths } = require('../utils/injectUploadedFilePaths');

// Get all projects
exports.getProjects = async (req, res, next) => {
  const startTime = Date.now();
  try {
    logger.info('Fetching projects list', {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip
    });

    const page       = parseInt(req.query.page) || 1;
    const limit      = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.searchTerm?.trim() || '';

    const result = await ProjectService.getAll(page, limit, searchTerm);
    result.data = resolveImageUrls(result.data);

    const duration = Date.now() - startTime;
    logger.info('Projects fetched successfully', {
      count: result.data.length,
      durationMs: duration,
      page,
      totalPages: result.pagination.pages
    });

    success(res, result);
  } catch (err) {
    logger.error('Failed to fetch projects', { error: err.message, stack: err.stack });
    next(err);
  }
};

// Get a specific project
exports.getProjectById = async (req, res, next) => {
  try {
    logger.info('Fetching single project', { id: req.params.id });

    const project = await ProjectService.getById(req.params.id);
    if (!project) {
      logger.warn('Project not found', { id: req.params.id });
      return error(res, 'Project not found', 404);
    }

    logger.info('Project retrieved successfully', { id: req.params.id, title: project.title });
    success(res, resolveImageUrls(project));
  } catch (err) {
    logger.error('Error fetching project by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Create a project
exports.createProject = async (req, res, next) => {
  try {
    logger.info('Creating new project', { title: req.body.title });

    injectUploadedFilePaths(req);
    const validatedData = createProjectDTO.parse(stripEmptyStrings(req.body));

    const project = await ProjectService.create(validatedData);

    logger.info('Project created successfully', { projectId: project._id });
    success(res, resolveImageUrls(project), 201);
  } catch (err) {
    logger.error('Failed to create project', { error: err.message });
    next(err);
  }
};

// Update a project
exports.updateProject = async (req, res, next) => {
  try {
    logger.info('Updating project', { id: req.params.id });

    injectUploadedFilePaths(req);
    const validatedData = updateProjectDTO.parse(stripEmptyStrings(req.body));

    const updated = await ProjectService.update(req.params.id, validatedData);
    if (!updated) return error(res, 'Project not found', 404);

    logger.info('Project updated successfully', { id: req.params.id });
    success(res, resolveImageUrls(updated));
  } catch (err) {
    logger.error('Failed to update project', { error: err.message });
    next(err);
  }
};

// Delete a project
exports.deleteProject = async (req, res, next) => {
  try {
    logger.info('Soft-deleting project', { id: req.params.id });
    const deleted = await ProjectService.softDelete(req.params.id);

    if (!deleted) {
      logger.warn('Project not found for delete', { id: req.params.id });
      return error(res, 'Project not found', 404);
    }

    logger.info('Project soft-deleted successfully', { id: req.params.id });
    success(res, { message: 'Project deleted successfully' });
  } catch (err) {
    logger.error('Failed to soft-delete project', { id: req.params.id, error: err.message });
    next(err);
  }
};
