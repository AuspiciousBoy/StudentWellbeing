const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'studentwell_jwt_secret_key_98765';

let io;
// Map to track active user socket connections: userId -> Set of socketIds
const userSockets = new Map();
// Map to track active socket roles: socketId -> { userId, role }
const socketUsers = new Map();

const init = (httpServer) => {
  io = socketIO(httpServer, {
    cors: {
      origin: '*', // Allow all origins for dev simplicity
      methods: ['GET', 'POST']
    }
  });

  // Authentication Middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const role = socket.user.role;

    console.log(`[Socket Service] User connected: ${userId} (${role}) on socket: ${socket.id}`);

    // Register user socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socketUsers.set(socket.id, { userId, role });

    // Join room based on role (e.g., student room, faculty room, admin room)
    socket.join(`role:${role}`);
    // Join room based on userId for direct messages
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`[Socket Service] User disconnected: ${userId} on socket: ${socket.id}`);
      
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
      socketUsers.delete(socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Send notification to a specific user
const sendNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
    console.log(`[Socket Service] Sent notification to user ${userId}`);
  }
};

// Broadcast to a specific role (e.g. at-risk alerts to all faculty)
const sendToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
    console.log(`[Socket Service] Broadcasted event '${event}' to role ${role}`);
  }
};

// Global broadcast
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`[Socket Service] Broadcasted event '${event}' globally`);
  }
};

module.exports = {
  init,
  getIO,
  sendNotification,
  sendToRole,
  broadcast
};
