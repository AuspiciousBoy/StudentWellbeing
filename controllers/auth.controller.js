const User = require('../models/user.model');
const { generateToken } = require('../config/jwt');
const gamificationService = require('../services/gamification.service');

// Register user
const register = async (req, res) => {
  const { name, email, password, role, department, semester } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      department: department || '',
      semester: semester || 1
    });

    if (user) {
      // Trigger daily streak initialize if student
      if (user.role === 'student') {
        await gamificationService.updateStreak(user._id);
        await gamificationService.awardXP(user._id, 10, 'Creating an account');
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Trigger daily streak update if student
      if (user.role === 'student') {
        await gamificationService.updateStreak(user._id);
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      if (user.role === 'student') {
        await gamificationService.updateStreak(user._id);
      }
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
