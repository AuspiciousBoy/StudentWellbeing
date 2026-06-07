const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { protect } = require('../config/jwt');
const { uploadMemory } = require('../middleware/upload.middleware');

// All endpoints require a validated JWT
router.use(protect);

router.post('/upload', uploadMemory.single('file'), resourceController.uploadDocument);
router.get('/list', resourceController.listDocuments);
router.post('/query/:docId', resourceController.queryDocument);
router.delete('/:docId', resourceController.deleteDocument);

module.exports = router;
