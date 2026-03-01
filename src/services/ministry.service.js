const Ministry = require('../models/Ministry');

class MinistryService {

  //Get all ministries
  async getAll() {
    return await Ministry.find();
  }

  //get a minitry
  async getById(id) {
    return await Ministry.findById(id);
  }
  
  //create a ministry
  async create(data) {
    return await Ministry.create(data);
  }

  //update a ministry
  async updateMinistry(id, data) {
    return await Ministry.findByIdAndUpdate(id, data, { 
        new: true, // Returns the updated document instead of the old one
        runValidators: true // Ensures the update follows your Schema rules
    });
  }

  //delete a ministry
  async deleteMinistry(id) {
    return await Ministry.findByIdAndDelete(id);
  }
}

module.exports = new MinistryService();