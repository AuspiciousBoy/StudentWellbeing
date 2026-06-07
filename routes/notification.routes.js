const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notification.controller');
const { protect } = require('../config/jwt');

// All authenticated users (student, faculty, admin) can read their own notifications
router.use(protect);

router.get('/', getNotifications);
router.put('/:notifId/read', markRead);
router.put('/mark-all/read', markAllRead);

module.exports = router;
