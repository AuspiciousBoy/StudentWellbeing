const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const { protect, restrictTo } = require('../config/jwt');

// Protect all routes here to Faculty role only
router.use(protect);
router.use(restrictTo('faculty'));

router.get('/dashboard', facultyController.getDashboardData);
router.post('/marks', facultyController.uploadMarks);
router.post('/attendance', facultyController.logAttendance);
router.post('/assignments', facultyController.createAssignment);
router.post('/assignments/grade', facultyController.gradeSubmission);
router.post('/announcement', facultyController.broadcastAnnouncement);
router.get('/students', facultyController.getStudents);

module.exports = router;
