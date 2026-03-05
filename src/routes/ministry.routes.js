const express = require('express');
const router = express.Router();
const controller = require('../controllers/ministry.controller');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', controller.getMinistries);
router.get('/:id', validateObjectId, controller.getMinistryById);
router.post('/', controller.createMinistry);
router.put('/:id', validateObjectId, controller.updateMinistry);
router.delete('/:id', validateObjectId, controller.deleteMinistry);

module.exports = router;