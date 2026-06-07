const User = require('../models/user.model');
const Performance = require('../models/performance.model');
const Attendance = require('../models/attendance.model');
const Mood = require('../models/mood.model');
const StudyPlan = require('../models/studyPlan.model');
const Assignment = require('../models/assignment.model');
const Notification = require('../models/notification.model');
const gamificationService = require('../services/gamification.service');
const socketService = require('../services/socket.service');
const ollamaService = require('../services/ollama.service');

// Get student academic analytics
const getDashboardData = async (req, res) => {
  const studentId = req.user.id;

  try {
    const student = await User.findById(studentId).select('-password');
    const performance = await Performance.find({ studentId }).sort({ date: -1 });
    const attendance = await Attendance.find({ studentId }).sort({ date: -1 });
    const moodLogs = await Mood.find({ studentId }).sort({ date: -1 }).limit(7);

    // Calculate aggregate attendance rates
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Calculate average marks
    const averageGrade = performance.length > 0
      ? Math.round(performance.reduce((sum, p) => sum + (p.marks / p.maxMarks) * 100, 0) / performance.length)
      : 0;

    res.json({
      student,
      performance,
      attendance,
      moodLogs,
      summary: {
        attendanceRate,
        averageGrade,
        totalAssignmentsSubmitted: 0 // Will populate this later if needed
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Log Mood and wellbeing check
const logMood = async (req, res) => {
  const studentId = req.user.id;
  const { mood, stressLevel, engagementLevel, notes } = req.body;

  try {
    const newLog = await Mood.create({
      studentId,
      mood,
      stressLevel: Number(stressLevel),
      engagementLevel: Number(engagementLevel),
      notes: notes || ''
    });

    const student = await User.findById(studentId);
    
    // Award XP for daily check-in
    await gamificationService.awardXP(studentId, 15, 'Daily wellbeing mood check-in');

    // Wellbeing alert system for at-risk students:
    // If stress is high (>= 8) or mood is anxious/depressed/sad and engagement is low (<= 3)
    if (Number(stressLevel) >= 8 || mood === 'sad' || mood === 'anxious') {
      const alertMsg = `${student.name} is experiencing high stress (Level: ${stressLevel}/10) or mood struggles (${mood}). Notes: "${notes || 'None'}".`;
      
      // Find all faculty members to alert, or alert via sockets
      const facultyUsers = await User.find({ role: 'faculty' });
      for (const faculty of facultyUsers) {
        const adminAlert = new Notification({
          userId: faculty._id,
          title: 'At-Risk Wellbeing Alert!',
          message: alertMsg,
          type: 'wellbeing'
        });
        await adminAlert.save();
        socketService.sendNotification(faculty._id, {
          type: 'AT_RISK_ALERT',
          studentName: student.name,
          studentEmail: student.email,
          stressLevel,
          mood,
          notes: notes || 'None'
        });
      }

      // Notify faculty room
      socketService.sendToRole('faculty', 'wellbeing_alert', {
        studentName: student.name,
        studentEmail: student.email,
        stressLevel,
        mood,
        notes: notes || 'None'
      });
    }

    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Generate personalized study plan based on academic analytics
const generateAIStudyPlan = async (req, res) => {
  const studentId = req.user.id;

  try {
    const student = await User.findById(studentId);
    const performance = await Performance.find({ studentId }).limit(5);
    const attendance = await Attendance.find({ studentId }).limit(10);

    // Summarize student academic state for Ollama
    const gradesSummary = performance.map(p => `${p.subject}: ${p.marks}/${p.maxMarks} on ${p.examName}`).join(', ');
    const attendanceSummary = attendance.length > 0
      ? `Recent attendance: ${attendance.filter(a => a.status === 'present').length} present out of ${attendance.length} classes.`
      : 'No attendance records yet.';

    const prompt = `Student Name: ${student.name}
Grades: ${gradesSummary || 'No grades logged yet.'}
Attendance: ${attendanceSummary}

Analyze these details and output a list of exactly 4 clear, actionable study recommendations or goals for this student to improve performance and wellbeing. Format the goals as a list separated by newlines. Keep them short and specific.`;

    const systemPrompt = "You are an AI Academic Advisor. Output exactly 4 bullet points of actionable suggestions. Start each bullet point with a dash (-) and do not write introductory text.";

    console.log('[AI Study Plan] Querying AI service...');
    const rawSuggestions = await ollamaService.generateCompletion(prompt, systemPrompt);
    
    // Parse the recommendations
    const recommendations = rawSuggestions
      .split('\n')
      .map(r => r.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(r => r.length > 0)
      .slice(0, 4);

    // Fallback if formatting failed
    if (recommendations.length === 0) {
      recommendations.push(
        'Review recent assignment errors to build fundamental concepts.',
        'Schedule dedicated study blocks of 45 minutes for core subjects.',
        'Attend next week\'s tutoring/faculty office hours for clarification.',
        'Log mood daily to monitor learning engagement and stress.'
      );
    }

    // Set up weekly goals
    const weeklyGoals = recommendations.map(rec => ({
      task: rec,
      status: 'pending'
    }));

    // Update or create StudyPlan
    let studyPlan = await StudyPlan.findOne({ studentId });
    if (studyPlan) {
      studyPlan.recommendations = recommendations;
      studyPlan.weeklyGoals = weeklyGoals;
      studyPlan.generatedByAI = true;
      await studyPlan.save();
    } else {
      studyPlan = await StudyPlan.create({
        studentId,
        recommendations,
        weeklyGoals,
        generatedByAI: true
      });
    }

    // Award XP
    await gamificationService.awardXP(studentId, 25, 'Generated personalized study plan');

    res.json(studyPlan);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Get current study plan
const getStudyPlan = async (req, res) => {
  const studentId = req.user.id;
  try {
    let studyPlan = await StudyPlan.findOne({ studentId });
    if (!studyPlan) {
      // Create a default study plan
      const defaultRecs = [
        'Establish a regular daily study routine.',
        'Aim for at least 75% attendance in all classes.',
        'Complete assignments at least 24 hours before deadlines.',
        'Take regular wellbeing breaks to manage study stress.'
      ];
      studyPlan = await StudyPlan.create({
        studentId,
        recommendations: defaultRecs,
        weeklyGoals: defaultRecs.map(rec => ({ task: rec, status: 'pending' })),
        generatedByAI: false
      });
    }
    res.json(studyPlan);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Update study goal status
const updateStudyGoal = async (req, res) => {
  const studentId = req.user.id;
  const { goalId, status } = req.body;

  try {
    const studyPlan = await StudyPlan.findOne({ studentId });
    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    const goal = studyPlan.weeklyGoals.id(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal item not found' });
    }

    const oldStatus = goal.status;
    goal.status = status;
    await studyPlan.save();

    // Reward XP on completion
    if (status === 'completed' && oldStatus !== 'completed') {
      await gamificationService.awardXP(studentId, 20, 'Completed a study goal task');
    }

    res.json(studyPlan);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Fetch assignments with student submission status
const getAssignments = async (req, res) => {
  const studentId = req.user.id;

  try {
    const assignments = await Assignment.find().populate('assignedBy', 'name');
    
    // Format response to include submission status for the student
    const formattedAssignments = assignments.map(a => {
      const submission = a.submissions.find(s => s.studentId.toString() === studentId);
      return {
        _id: a._id,
        title: a.title,
        description: a.description,
        subject: a.subject,
        dueDate: a.dueDate,
        assignedBy: a.assignedBy,
        createdAt: a.createdAt,
        isSubmitted: !!submission,
        submission: submission || null
      };
    });

    res.json(formattedAssignments);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Submit assignment
const submitAssignment = async (req, res) => {
  const studentId = req.user.id;
  const { assignmentId, submissionText } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existingIndex = assignment.submissions.findIndex(s => s.studentId.toString() === studentId);

    if (existingIndex > -1) {
      // Update submission
      assignment.submissions[existingIndex].submissionText = submissionText || '';
      if (fileUrl) assignment.submissions[existingIndex].fileUrl = fileUrl;
      assignment.submissions[existingIndex].submittedAt = new Date();
    } else {
      // Create new submission
      assignment.submissions.push({
        studentId,
        submissionText: submissionText || '',
        fileUrl,
        submittedAt: new Date()
      });
    }

    await assignment.save();

    // Award XP
    await gamificationService.awardXP(studentId, 40, `Submitted assignment: ${assignment.title}`);

    // Notify the assigning faculty member
    const studentUser = await User.findById(studentId);
    const newNotif = new Notification({
      userId: assignment.assignedBy,
      title: 'Assignment Submitted',
      message: `${studentUser.name} submitted the assignment: "${assignment.title}"`,
      type: 'assignment'
    });
    await newNotif.save();
    socketService.sendNotification(assignment.assignedBy, {
      type: 'SUBMISSION_RECEIVED',
      studentName: studentUser.name,
      assignmentTitle: assignment.title,
      assignmentId: assignment._id
    });

    res.json({ message: 'Assignment submitted successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Fetch notifications
const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
  const { notifId } = req.params;
  try {
    const notif = await Notification.findById(notifId);
    if (notif) {
      notif.isRead = true;
      await notif.save();
      res.json(notif);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = {
  getDashboardData,
  logMood,
  generateAIStudyPlan,
  getStudyPlan,
  updateStudyGoal,
  getAssignments,
  submitAssignment,
  getNotifications,
  markNotificationRead
};
