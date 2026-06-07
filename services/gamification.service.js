const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const socketService = require('./socket.service');

// Formula to check level from XP: each level requires level * 100 XP
// Cumulative XP required for Level N:
// Level 1: 0 XP
// Level 2: 100 XP
// Level 3: 300 XP (100 + 200)
// Level 4: 600 XP (100 + 200 + 300)
// Or simplified: level = Math.floor(xp / 100) + 1. Let's use the simplified version for easy tracking.
const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1;
};

const awardXP = async (userId, amount, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') return null;

    const oldXP = user.xp;
    const oldLevel = user.level;
    
    user.xp += amount;
    const newLevel = calculateLevel(user.xp);
    user.level = newLevel;

    // Check badges
    const newBadges = [];
    
    // First XP Badge
    if (oldXP === 0 && user.xp > 0 && !user.badges.includes('First Step')) {
      user.badges.push('First Step');
      newBadges.push('First Step');
    }

    // High Level Badge
    if (newLevel >= 5 && !user.badges.includes('Elite Scholar')) {
      user.badges.push('Elite Scholar');
      newBadges.push('Elite Scholar');
    }

    // Active Streak Badge
    if (user.streak >= 3 && !user.badges.includes('Consistent Learner')) {
      user.badges.push('Consistent Learner');
      newBadges.push('Consistent Learner');
    }

    await user.save();

    // Send notifications for XP
    const xpNotification = new Notification({
      userId,
      title: `Earned +${amount} XP!`,
      message: `You earned XP for: ${reason}`,
      type: 'wellbeing'
    });
    await xpNotification.save();
    socketService.sendNotification(userId, {
      type: 'XP_AWARDED',
      amount,
      reason,
      totalXp: user.xp
    });

    // Send notification for level up
    if (newLevel > oldLevel) {
      const levelNotification = new Notification({
        userId,
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel}!`,
        type: 'wellbeing'
      });
      await levelNotification.save();
      socketService.sendNotification(userId, {
        type: 'LEVEL_UP',
        level: newLevel
      });
    }

    // Send notification for badges
    for (const badge of newBadges) {
      const badgeNotification = new Notification({
        userId,
        title: 'New Achievement Badge Unlocked!',
        message: `You have earned the "${badge}" badge!`,
        type: 'wellbeing'
      });
      await badgeNotification.save();
      socketService.sendNotification(userId, {
        type: 'BADGE_UNLOCKED',
        badge
      });
    }

    return user;
  } catch (error) {
    console.error('[Gamification Service] Error awarding XP:', error);
  }
};

const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (!user.lastActive) {
      user.streak = 1;
      user.lastActive = now;
      await user.save();
      return user;
    }

    const lastActiveDate = new Date(user.lastActive.getFullYear(), user.lastActive.getMonth(), user.lastActive.getDate());
    const diffTime = Math.abs(today - lastActiveDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Active consecutive day
      user.streak += 1;
      user.lastActive = now;
      await user.save();
      
      // Award XP for streak maintenance
      await awardXP(userId, 20, `Maintaining a ${user.streak}-day learning streak!`);
    } else if (diffDays > 1) {
      // Streak broken
      user.streak = 1;
      user.lastActive = now;
      await user.save();
    } else {
      // Already active today, update active timestamp but keep streak
      user.lastActive = now;
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('[Gamification Service] Error updating streak:', error);
  }
};

module.exports = {
  awardXP,
  updateStreak
};
