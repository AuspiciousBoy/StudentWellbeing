const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../config/jwt');

// Protect all routes here to Admin role only
router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardData);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
