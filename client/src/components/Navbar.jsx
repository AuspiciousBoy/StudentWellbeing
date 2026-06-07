import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Flame, Award, LogOut, User as UserIcon, Menu, X, CheckCheck } from 'lucide-react';

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

  // Close dropdown on outside click
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
    <nav className="glass-panel-heavy border-b border-slate-800 sticky top-0 z-40 px-4 md:px-6 py-3.5 flex items-center justify-between app-unique-wrap">
      {/* Left: Brand + Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile only) */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-2xl handcrafted-card flex items-center justify-center font-bold text-white text-base shadow-lg">
            {/* Custom inline SVG mark to make the brand less generic */}
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="var(--accent-1)" />
                  <stop offset="1" stopColor="var(--accent-2)" />
                </linearGradient>
              </defs>
              <rect x="6" y="10" width="40" height="44" rx="10" fill="url(#g1)" />
              <path d="M18 36 C22 28 30 24 38 26" stroke="rgba(255,255,255,0.95)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-lg tracking-tight text-white title-accent">StudentWell</span>
              <span className="text-[9px] block text-slate-500 tracking-widest uppercase font-semibold">Adaptive Learning Hub</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Stats + Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Gamification stats (students only, desktop) */}
        {user.role === 'student' && (
          <div className="hidden lg:flex items-center gap-3 border-r border-slate-800 pr-5">
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-500 animate-pulse" />
              <span className="text-xs font-bold">{user.streak || 0}d Streak</span>
            </div>
            <div className="flex items-center gap-2 bg-wellbeing-500/10 text-wellbeing-400 px-3 py-1.5 rounded-full border border-wellbeing-500/20">
              <Award className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Lv {user.level || 1}</span>
              <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-wellbeing-500 h-full transition-all duration-700"
                  style={{ width: `${(user.xp % 100) || 0}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">{user.xp || 0} XP</span>
            </div>
          </div>
        )}

        {/* User pill */}
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-wellbeing-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <h4 className="text-xs font-bold text-slate-200 leading-tight">{user.name}</h4>
            <span className="text-[10px] text-slate-400 capitalize font-semibold">{user.role}</span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(v => !v);
              if (!showNotifications) fetchNotifications();
            }}
            className="relative p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-black leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel-heavy rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50 animate-fade-in handcrafted-card sketch-outline">
                  <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                <h4 className="font-bold text-xs text-slate-200">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-bold"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50 relative">
                <svg className="organic-blob" width="220" height="140" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 80 C40 10 130 0 200 60 C180 120 100 140 30 110" fill="#0b81e3" />
                </svg>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center font-medium">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 15).map(n => (
                    <div
                      key={n._id}
                      className={`px-4 py-3 transition-colors cursor-pointer ${n.isRead ? '' : 'bg-brand-500/5 hover:bg-brand-500/8'}`}
                      onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h5 className={`text-[11px] font-bold leading-snug ${n.isRead ? 'text-slate-500' : 'text-slate-200'} ${notifTypeColors[n.type] || ''}`}>
                          {n.title}
                        </h5>
                        {!n.isRead && (
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <span className="text-[9px] text-slate-600 block mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
