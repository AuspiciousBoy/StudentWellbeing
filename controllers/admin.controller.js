const User = require('../models/user.model');
const Performance = require('../models/performance.model');
const Attendance = require('../models/attendance.model');
const Mood = require('../models/mood.model');
const Document = require('../models/document.model');

// Get global administrative dashboard metrics
const getDashboardData = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const docsCount = await Document.countDocuments();

    // 1. Calculate school-wide attendance rate
    const attendance = await Attendance.find();
    const totalAttendanceCount = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const globalAttendanceRate = totalAttendanceCount > 0 ? Math.round((presentCount / totalAttendanceCount) * 100) : 100;

    // 2. Average stress and engagement levels
    const moodLogs = await Mood.find();
    const totalMoodLogs = moodLogs.length;
    const avgStress = totalMoodLogs > 0
      ? (moodLogs.reduce((sum, m) => sum + m.stressLevel, 0) / totalMoodLogs).toFixed(1)
      : 'N/A';
    const avgEngagement = totalMoodLogs > 0
      ? (moodLogs.reduce((sum, m) => sum + m.engagementLevel, 0) / totalMoodLogs).toFixed(1)
      : 'N/A';

    // 3. Mood distribution breakdown
    const moodDistribution = {
      happy: 0,
      neutral: 0,
      stressed: 0,
      anxious: 0,
      sad: 0
    };
    moodLogs.forEach(log => {
      if (moodDistribution[log.mood] !== undefined) {
        moodDistribution[log.mood]++;
      }
    });

    const allUsers = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      metrics: {
        usersCount,
        studentsCount,
        facultyCount,
        adminCount,
        docsCount,
        globalAttendanceRate,
        avgStress,
        avgEngagement,
        moodDistribution
      },
      users: allUsers
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Update a user's role or info
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, role, department, semester } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (semester) user.semester = Number(semester);

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = {
  getDashboardData,
  updateUser,
  deleteUser
};
