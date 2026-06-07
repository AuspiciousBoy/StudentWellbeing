const Notification = require('../models/notification.model');

// Get notifications for any authenticated user
const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Mark a notification as read
const markRead = async (req, res) => {
  const { notifId } = req.params;
  try {
    const notif = await Notification.findById(notifId);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    notif.isRead = true;
    await notif.save();
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Mark ALL as read
const markAllRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = { getNotifications, markRead, markAllRead };
