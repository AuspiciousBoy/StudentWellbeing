const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { protect, restrictTo } = require('../config/jwt');
const { upload } = require('../middleware/upload.middleware');

// Protect all routes here
router.use(protect);
router.use(restrictTo('student'));

router.get('/dashboard', studentController.getDashboardData);
router.post('/mood', studentController.logMood);
router.get('/study-plan', studentController.getStudyPlan);
router.post('/study-plan/generate', studentController.generateAIStudyPlan);
router.put('/study-plan/goal', studentController.updateStudyGoal);
router.get('/assignments', studentController.getAssignments);

// Accept file upload for assignment submission
router.post('/assignments/submit', upload.single('file'), studentController.submitAssignment);

// Notifications endpoints (protect only)
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:notifId/read', studentController.markNotificationRead);

module.exports = router;
