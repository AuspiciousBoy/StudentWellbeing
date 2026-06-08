import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Flame, Award, LogOut, Menu, X, CheckCheck } from 'lucide-react';

export default function Navbar({ onMobileMenuToggle, mobileMenuOpen }) {
  const { user, logout, apiFetch } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/notifications/mark-all/read', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  const notifTypeColors = {
    assignment: 'text-brand-400',
    attendance: 'text-amber-400',
    wellbeing: 'text-wellbeing-400',
    announcement: 'text-emerald-400',
  };

  return (
    <nav className="app-unique-wrap sticky top-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between">
      {/* Left: Brand + Mobile Menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 text-neutral-500 hover:text-brand-400 transition-all"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold tracking-tight text-white">
            SW<span className="text-brand-400">.</span>
          </span>
          <div className="hidden sm:block h-4 w-px bg-white/10" />
          <div className="hidden sm:block">
            <span className="font-display text-sm font-semibold text-white tracking-wide">StudentWell</span>
            <span className="block section-label mt-0.5">Adaptive Learning Hub</span>
          </div>
        </div>
      </div>

      {/* Right: Stats + Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        {user.role === 'student' && (
          <div className="hidden lg:flex items-center gap-3 border-r border-white/10 pr-5">
            <div className="flex items-center gap-1.5 badge-modern">
              <Flame className="w-3.5 h-3.5 fill-brand-400 text-brand-400 animate-pulse-gentle" />
              <span className="text-xs font-semibold">{user.streak || 0}d Streak</span>
            </div>
            <div className="flex items-center gap-2 badge-modern">
              <Award className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-semibold">Lv {user.level || 1}</span>
              <div className="w-14 bg-white/10 h-1 overflow-hidden">
                <div
                  className="bg-brand-400 h-full transition-all duration-700"
                  style={{ width: `${(user.xp % 100) || 0}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-500 font-medium">{user.xp || 0} XP</span>
            </div>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2.5">
          <div className="w-8 h-8 gradient-gold flex items-center justify-center text-black font-bold text-sm">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <h4 className="text-xs font-semibold text-white leading-tight">{user.name}</h4>
            <span className="text-[10px] text-neutral-500 capitalize section-label">{user.role}</span>
          </div>
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(v => !v);
              if (!showNotifications) fetchNotifications();
            }}
            className="relative p-2.5 text-neutral-500 hover:text-brand-400 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-brand-400 text-black rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel-heavy shadow-gold-lg overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                <h4 className="font-semibold text-xs text-white uppercase tracking-widest">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-semibold uppercase tracking-wider"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-neutral-600 py-8 text-center">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 15).map(n => (
                    <div
                      key={n._id}
                      className={`px-4 py-3 transition-colors cursor-pointer ${n.isRead ? '' : 'bg-brand-500/5 hover:bg-brand-500/10'}`}
                      onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h5 className={`text-[11px] font-semibold leading-snug ${n.isRead ? 'text-neutral-600' : 'text-white'} ${notifTypeColors[n.type] || ''}`}>
                          {n.title}
                        </h5>
                        {!n.isRead && (
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-600 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <span className="text-[9px] text-neutral-700 block mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="p-2.5 text-neutral-500 hover:text-red-400 border border-transparent hover:border-red-900/40 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
