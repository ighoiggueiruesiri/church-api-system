const Project = require('../models/project');
const { logger } = require('../config/logger');

class ProjectService {

  async getAll(page = 1, limit = 10, searchTerm = '') {
    const start = Date.now();
    try {
      logger.info('Fetching projects', { page, limit, searchTerm: searchTerm || '(none)' });

      const query = { deletedAt: null };

      if (searchTerm.trim()) {
        const regex = new RegExp(searchTerm.trim(), 'i');
        query.$or = [
          { title: regex },
          { desc:  regex },
        ];
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Project.find(query).skip(skip).limit(Math.min(limit, 100)).lean(),
        Project.countDocuments(query)
      ]);

      logger.debug('Projects search completed', {
        durationMs: Date.now() - start,
        resultsFound: data.length,
        totalRecords: total
      });

      return {
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    } catch (err) {
      logger.error('Database error in get all projects', { error: err.message, searchTerm });
      throw err;
    }
  }

  async getById(id) {
    try {
      logger.debug('Starting get project by id query', { _id: id });
      const project = await Project.findOne({ _id: id, deletedAt: null }).lean();
      logger.debug('Get project by id query successfully', { _id: id });
      return project;
    } catch (err) {
      logger.error('Database error in get project by ID', { _id: id, error: err.message });
      throw err;
    }
  }

  async create(data) {
    try {
      logger.debug('Inserting new project document', { title: data.title });
      const project = await Project.create(data);
      logger.debug('Project document inserted successfully', { _id: project._id });
      return project;
    } catch (err) {
      logger.error('Create failed in create project service', { title: data.title, error: err.message });
      throw err;
    }
  }

  async update(id, data) {
    try {
      logger.debug('Updating project document', { _id: id });
      const project = await Project.findOneAndUpdate(
        { _id: id, deletedAt: null },
        data,
        { new: true, runValidators: true }
      ).lean();
      logger.debug('Project document updated successfully', { _id: id });
      return project;
    } catch (err) {
      logger.error('Project update failed in update service', { _id: id, error: err.message });
      throw err;
    }
  }

  async softDelete(id) {
    try {
      logger.debug('Soft deleting project document', { _id: id });
      const project = await Project.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );
      logger.debug('Project document soft deleted successfully', { _id: id });
      return project;
    } catch (err) {
      logger.error('Project delete failed in soft delete service', { _id: id, error: err.message });
      throw err;
    }
  }
}

module.exports = new ProjectService();
