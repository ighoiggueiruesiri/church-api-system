const BlogService = require('../services/blog.service');
const { createBlogDTO, updateBlogDTO } = require('../dtos/blog.dto');
const { success, error } = require('../utils/response');
const { logger } = require('../config/logger');
const { resolveImageUrls } = require('../utils/imageUrl');
const { stripEmptyStrings } = require('../utils/stripEmptyStrings');
const { injectUploadedFilePaths } = require('../utils/injectUploadedFilePaths');

// Get all blogs
exports.getBlogs = async (req, res, next) => {
  const startTime = Date.now();
  try {
    logger.info('Fetching blogs list', {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      searchTerm: req.query.searchTerm || '',
      ip: req.ip
    });

    const page       = parseInt(req.query.page) || 1;
    const limit      = Math.min(parseInt(req.query.limit) || 10, 100);
    const searchTerm = req.query.searchTerm?.trim() || '';

    const result = await BlogService.getAll(page, limit, searchTerm);
    result.data = resolveImageUrls(result.data);

    const duration = Date.now() - startTime;
    logger.info('Blogs fetched successfully', {
      count: result.data.length,
      durationMs: duration,
      page,
      totalPages: result.pagination.pages
    });

    success(res, result);
  } catch (err) {
    logger.error('Failed to fetch blogs', { error: err.message, stack: err.stack });
    next(err);
  }
};

// Get a specific blog
exports.getBlogById = async (req, res, next) => {
  try {
    logger.info('Fetching single blog', { id: req.params.id });

    const blog = await BlogService.getById(req.params.id);
    if (!blog) {
      logger.warn('Blog not found', { id: req.params.id });
      return error(res, 'Blog not found', 404);
    }

    logger.info('Blog retrieved successfully', { id: req.params.id, title: blog.title });
    success(res, resolveImageUrls(blog));
  } catch (err) {
    logger.error('Error fetching blog by ID', { id: req.params.id, error: err.message });
    next(err);
  }
};

// Create a blog
exports.createBlog = async (req, res, next) => {
  try {
    logger.info('Creating new blog', { title: req.body.title });

    injectUploadedFilePaths(req);
    const validatedData = createBlogDTO.parse(stripEmptyStrings(req.body));

    const blog = await BlogService.create(validatedData);

    logger.info('Blog created successfully', { blogId: blog._id });
    success(res, resolveImageUrls(blog), 201);
  } catch (err) {
    logger.error('Failed to create blog', { error: err.message });
    next(err);
  }
};

// Update a blog
exports.updateBlog = async (req, res, next) => {
  try {
    logger.info('Updating blog', { id: req.params.id });

    injectUploadedFilePaths(req);
    const validatedData = updateBlogDTO.parse(stripEmptyStrings(req.body));

    const updated = await BlogService.update(req.params.id, validatedData);
    if (!updated) return error(res, 'Blog not found', 404);

    logger.info('Blog updated successfully', { id: req.params.id });
    success(res, resolveImageUrls(updated));
  } catch (err) {
    logger.error('Failed to update blog', { error: err.message });
    next(err);
  }
};

// Delete a blog
exports.deleteBlog = async (req, res, next) => {
  try {
    logger.info('Soft-deleting blog', { id: req.params.id });
    const deleted = await BlogService.softDelete(req.params.id);

    if (!deleted) {
      logger.warn('Blog not found for delete', { id: req.params.id });
      return error(res, 'Blog not found', 404);
    }

    logger.info('Blog soft-deleted successfully', { id: req.params.id });
    success(res, { message: 'Blog deleted successfully' });
  } catch (err) {
    logger.error('Failed to soft-delete blog', { id: req.params.id, error: err.message });
    next(err);
  }
};
