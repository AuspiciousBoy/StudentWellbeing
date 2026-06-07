const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect, restrictTo } = require('../config/jwt');

// Protect all routes to Students (learning assistant)
router.use(protect);
router.use(restrictTo('student'));

router.get('/chat', aiController.getChatHistory);
router.post('/chat', aiController.sendChatMessage);
router.delete('/chat', aiController.clearChatHistory);

module.exports = router;
