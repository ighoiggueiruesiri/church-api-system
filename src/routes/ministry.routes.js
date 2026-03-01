const express = require('express');
const router = express.Router();
const controller = require('../controllers/ministry.controller');

router.get('/', controller.getMinistries);
router.get('/:id', controller.getMinistryById);
router.post('/', controller.createMinistry);
router.put('/:id', controller.updateMinistry);
router.delete('/:id', controller.deleteMinistry);

module.exports = router;