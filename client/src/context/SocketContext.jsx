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
        <div className="fixed bottom-6 right-6 z-50 animate-bounce glass-panel-heavy rounded-2xl p-5 max-w-sm w-80 shadow-2xl border border-brand-500/30 text-slate-100 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-sm text-brand-400 flex items-center gap-2">
                {activeToast.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1">{activeToast.message}</p>
            </div>
            <button 
              onClick={dismissToast} 
              className="text-slate-400 hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-3">
            <div className="bg-brand-500 h-full animate-[progress_5s_linear]" style={{ width: '100%' }}></div>
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
