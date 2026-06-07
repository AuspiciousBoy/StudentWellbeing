const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const facultyRoutes = require('./faculty.routes');
const adminRoutes = require('./admin.routes');
const aiRoutes = require('./ai.routes');
const resourceRoutes = require('./resource.routes');
const notificationRoutes = require('./notification.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/resources', resourceRoutes);
router.use('/notifications', notificationRoutes);

// Simple health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

module.exports = router;
