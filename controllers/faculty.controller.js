const User = require('../models/user.model');
const Performance = require('../models/performance.model');
const Attendance = require('../models/attendance.model');
const Mood = require('../models/mood.model');
const Assignment = require('../models/assignment.model');
const Notification = require('../models/notification.model');
const socketService = require('../services/socket.service');
const gamificationService = require('../services/gamification.service');

// Get faculty dashboard data (including at-risk students alert)
const getDashboardData = async (req, res) => {
  const facultyId = req.user.id;

  try {
    const students = await User.find({ role: 'student' }).select('-password');
    const assignments = await Assignment.find({ assignedBy: facultyId });

    const atRiskStudents = [];

    for (const student of students) {
      // 1. Check Attendance
      const attendance = await Attendance.find({ studentId: student._id });
      const totalClasses = attendance.length;
      const presentClasses = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const attendanceRate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

      // 2. Check Wellbeing (Moods in past 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentMoods = await Mood.find({
        studentId: student._id,
        createdAt: { $gte: sevenDaysAgo }
      });

      const highStressLog = recentMoods.find(m => m.stressLevel >= 8 || m.mood === 'sad' || m.mood === 'anxious');

      let riskReason = [];
      if (attendanceRate < 75 && totalClasses >= 3) {
        riskReason.push(`Low attendance: ${Math.round(attendanceRate)}%`);
      }
      if (highStressLog) {
        riskReason.push(`High stress/low mood logged recently (Stress: ${highStressLog.stressLevel}/10, Mood: ${highStressLog.mood})`);
      }

      if (riskReason.length > 0) {
        atRiskStudents.push({
          _id: student._id,
          name: student.name,
          email: student.email,
          department: student.department,
          semester: student.semester,
          attendanceRate: Math.round(attendanceRate),
          recentMood: highStressLog ? highStressLog.mood : 'N/A',
          stressLevel: highStressLog ? highStressLog.stressLevel : 'N/A',
          reasons: riskReason
        });
      }
    }

    res.json({
      assignmentsCount: assignments.length,
      studentsCount: students.length,
      atRiskStudents,
      assignments
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Upload student marks
const uploadMarks = async (req, res) => {
  const { studentId, subject, marks, maxMarks, examName } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student user not found' });
    }

    const performance = await Performance.create({
      studentId,
      subject,
      marks: Number(marks),
      maxMarks: Number(maxMarks || 100),
      examName
    });

    // Notify Student
    const notif = new Notification({
      userId: studentId,
      title: 'New Marks Posted',
      message: `Your grades for ${subject} (${examName}) have been posted: ${marks}/${maxMarks || 100}`,
      type: 'assignment'
    });
    await notif.save();
    
    socketService.sendNotification(studentId, {
      type: 'MARKS_POSTED',
      subject,
      examName,
      marks,
      maxMarks
    });

    res.status(201).json(performance);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Log Student Attendance
const logAttendance = async (req, res) => {
  const { studentId, subject, status, date } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student user not found' });
    }

    const attendanceRecord = await Attendance.create({
      studentId,
      subject,
      status,
      date: date ? new Date(date) : new Date()
    });

    // Notify student if absent or late
    if (status === 'absent' || status === 'late') {
      const notif = new Notification({
        userId: studentId,
        title: `Attendance Alert: Marked ${status}`,
        message: `You were marked ${status} in ${subject} on ${new Date(date || Date.now()).toLocaleDateString()}`,
        type: 'attendance'
      });
      await notif.save();
      socketService.sendNotification(studentId, {
        type: 'ATTENDANCE_ALERT',
        subject,
        status,
        date: date || Date.now()
      });
    }

    res.status(201).json(attendanceRecord);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Create a new assignment
const createAssignment = async (req, res) => {
  const facultyId = req.user.id;
  const { title, description, subject, dueDate } = req.body;

  try {
    const assignment = await Assignment.create({
      title,
      description,
      subject,
      dueDate: new Date(dueDate),
      assignedBy: facultyId
    });

    // Notify all students in database
    const students = await User.find({ role: 'student' });
    for (const student of students) {
      const notif = new Notification({
        userId: student._id,
        title: 'New Assignment Added',
        message: `New assignment: "${title}" in subject: ${subject}. Due date: ${new Date(dueDate).toLocaleDateString()}`,
        type: 'assignment'
      });
      await notif.save();
      
      socketService.sendNotification(student._id, {
        type: 'NEW_ASSIGNMENT',
        title,
        subject,
        dueDate
      });
    }

    socketService.sendToRole('student', 'new_assignment', {
      title,
      subject,
      dueDate
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Grade Student Submission
const gradeSubmission = async (req, res) => {
  const { assignmentId, studentId, grade, feedback } = req.body;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.find(s => s.studentId.toString() === studentId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = Number(grade);
    submission.feedback = feedback || '';
    await assignment.save();

    // Reward extra XP to student for high grades (grade >= 80 out of 100)
    let bonusMessage = '';
    if (Number(grade) >= 80) {
      await gamificationService.awardXP(studentId, 30, `Excellent grade (${grade}%) on assignment: ${assignment.title}`);
      bonusMessage = ' Plus +30 XP bonus for an excellent score!';
    }

    // Add to Performance collection as well
    await Performance.create({
      studentId,
      subject: assignment.subject,
      marks: Number(grade),
      maxMarks: 100,
      examName: `Assignment: ${assignment.title}`
    });

    // Notify student
    const notif = new Notification({
      userId: studentId,
      title: 'Assignment Graded',
      message: `Your submission for "${assignment.title}" has been graded: ${grade}/100.${bonusMessage}`,
      type: 'assignment'
    });
    await notif.save();
    
    socketService.sendNotification(studentId, {
      type: 'ASSIGNMENT_GRADED',
      title: assignment.title,
      grade,
      feedback
    });

    res.json({ message: 'Submission graded successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Broadcast Faculty Announcement
const broadcastAnnouncement = async (req, res) => {
  const facultyId = req.user.id;
  const { subject, message } = req.body;

  try {
    const faculty = await User.findById(facultyId);

    // Notify all students in database
    const students = await User.find({ role: 'student' });
    for (const student of students) {
      const notif = new Notification({
        userId: student._id,
        title: `Faculty Announcement: ${subject}`,
        message: `${message} (from Prof. ${faculty.name})`,
        type: 'announcement'
      });
      await notif.save();
      
      socketService.sendNotification(student._id, {
        type: 'ANNOUNCEMENT',
        subject,
        message,
        facultyName: faculty.name
      });
    }

    socketService.sendToRole('student', 'announcement', {
      subject,
      message,
      facultyName: faculty.name
    });

    res.json({ message: 'Announcement broadcasted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Fetch student list (for marks / attendance selection)
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = {
  getDashboardData,
  uploadMarks,
  logAttendance,
  createAssignment,
  gradeSubmission,
  broadcastAnnouncement,
  getStudents
};
