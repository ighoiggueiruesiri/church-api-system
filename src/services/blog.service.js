const Blog = require('../models/blog');
const { logger } = require('../config/logger');
const cache = require('../utils/cache');

class BlogService {

  async getAll(page = 1, limit = 10, searchTerm = '') {
    const start = Date.now();
    const cacheKey = `blogs:list:page:${page}:limit:${limit}:search:${searchTerm.trim() || 'none'}`;

    try {

      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      logger.info('Fetching blogs', { page, limit, searchTerm: searchTerm || '(none)' });

      const query = { deletedAt: null };

      if (searchTerm.trim()) {
        const regex = new RegExp(searchTerm.trim(), 'i');
        query.$or = [
          { title:   regex },
          { excerpt: regex },
        ];
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Math.min(limit, 100)).lean(),
        Blog.countDocuments(query)
      ]);

      logger.debug('Blogs search completed', {
        durationMs: Date.now() - start,
        resultsFound: data.length,
        totalRecords: total
      });

      const result = {
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };

      await cache.set(cacheKey, result, 300);
      return result;

    } catch (err) {
      logger.error('Database error in get all blogs', { error: err.message, searchTerm });
      throw err;
    }
  }

  async getById(id) {
    const cacheKey = `blogs:id:${id}`;
    try {
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      logger.debug('Starting get blog by id query', { _id: id });
      const blog = await Blog.findOne({ _id: id, deletedAt: null }).lean();
      logger.debug('Get blog by id query successfully', { _id: id });

      if (blog) await cache.set(cacheKey, blog, 600);
      return blog;
    } catch (err) {
      logger.error('Database error in get blog by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  async create(data) {
    try {
      logger.debug('Inserting new blog document', { title: data.title });
      const blog = await Blog.create(data);
      logger.debug('Blog document inserted successfully', { _id: blog._id });

      await cache.delByPattern('blogs:list:*');
      return blog;
    } catch (err) {
      logger.error('Create failed in create blog service', { title: data.title, error: err.message });
      throw err;
    }
  }

  async update(id, data) {
    try {
      logger.debug('Updating blog document', { _id: id });
      const blog = await Blog.findOneAndUpdate(
        { _id: id, deletedAt: null },
        data,
        { new: true, runValidators: true }
      ).lean();
      logger.debug('Blog document updated successfully', { _id: id });

      await cache.del(`blogs:id:${id}`); 
      await cache.delByPattern('blogs:list:*');
      return blog;
    } catch (err) {
      logger.error('Blog update failed in update service', { _id: id, error: err.message });
      throw err;
    }
  }

  async softDelete(id) {
    try {
      logger.debug('Soft deleting blog document', { _id: id });
      const blog = await Blog.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );
      logger.debug('Blog document soft deleted successfully', { _id: id });

      await cache.del(`blogs:id:${id}`);
      await cache.delByPattern('blogs:list:*');
      return blog;
    } catch (err) {
      logger.error('Blog delete failed in soft delete service', { _id: id, error: err.message });
      throw err;
    }
  }
}

module.exports = new BlogService();
