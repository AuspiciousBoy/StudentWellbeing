import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Toast notifications display state
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to WebSocket server using path proxying or direct connection
    const newSocket = io('/', {
      auth: { token }
    });

    setSocket(newSocket);

    // General notification listener
    newSocket.on('notification', (notif) => {
      console.log('[Socket] New notification received:', notif);
      
      // Add toast
      setActiveToast({
        id: Date.now(),
        title: notif.title || 'Notification',
        message: notif.message || '',
        type: notif.type || 'info'
      });

      // Clear toast after 5 seconds
      setTimeout(() => {
        setActiveToast(null);
      }, 5000);
    });

    // Custom alerts listeners based on role
    if (user.role === 'faculty') {
      newSocket.on('wellbeing_alert', (data) => {
        setActiveToast({
          id: Date.now(),
          title: '⚠️ Student Wellbeing Alert!',
          message: `${data.studentName} is experiencing high stress.`,
          type: 'wellbeing'
        });
      });
    }

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const dismissToast = () => {
    setActiveToast(null);
  };

  return (
    <SocketContext.Provider value={{ socket, activeToast, dismissToast }}>
      {children}
      
      {/* Real-time floating Notification Toast Banner */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up glass-panel-heavy p-5 max-w-sm w-80 shadow-gold-lg border border-brand-400/30 text-white transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-brand-400 flex items-center gap-2 uppercase tracking-wider">
                {activeToast.title}
              </h4>
              <p className="text-xs text-neutral-400 mt-1">{activeToast.message}</p>
            </div>
            <button 
              onClick={dismissToast} 
              className="text-neutral-500 hover:text-brand-400 text-xs px-1 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="w-full bg-white/10 h-px overflow-hidden mt-3">
            <div className="bg-brand-400 h-full animate-[progress_5s_linear]" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
