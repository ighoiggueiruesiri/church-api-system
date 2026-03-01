const MinistryService = require('../services/ministry.service');
const { createMinistryDTO, updateMinistryDTO } = require('../dtos/ministry.dto');
const mongoose = require('mongoose');

//Get all minitries
exports.getMinistries = async (req, res) => {
  try {
    const ministries = await MinistryService.getAll();
    res.status(200).json(ministries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Get a specific ministry
exports.getMinistryById = async (req, res) => {
  try {
    const { id } = req.params;
    const ministry = await MinistryService.getById(id);
    
    if (!ministry) {
      return res.status(404).json({ message: "Ministry not found" });
    }
    
    res.status(200).json(ministry);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID format or Server Error" });
  }
};

//create a ministry
exports.createMinistry = async (req, res) => {
  try {
    const validatedData = createMinistryDTO.parse(req.body); // DTO validation
    const ministry = await MinistryService.create(validatedData); // Service call
    res.status(201).json(ministry);
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

// Update a ministry
exports.updateMinistry = async (req, res) => {
  try {
    const { id } = req.params;
    // Note: In a strict setup, you would pass req.body through a DTO here first
    const updatedMinistry = await MinistryService.updateMinistry(id, req.body);
    
    if (!updatedMinistry) {
      return res.status(404).json({ message: "Ministry not found" });
    }
    
    res.status(200).json(updatedMinistry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a ministry
exports.deleteMinistry = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMinistry = await MinistryService.deleteMinistry(id);
    
    if (!deletedMinistry) {
      return res.status(404).json({ message: "Ministry not found" });
    }
    
    res.status(200).json({ message: "Ministry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};