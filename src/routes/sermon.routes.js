const express = require('express');
const router = express.Router();
const controller = require('../controllers/sermon.controller');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', controller.getSermons);
router.get('/:id', validateObjectId, controller.getSermonById);
router.post('/', controller.createSermon);
router.put('/:id', validateObjectId, controller.updateSermon);
router.delete('/:id', validateObjectId, controller.deleteSermon);

module.exports = router;