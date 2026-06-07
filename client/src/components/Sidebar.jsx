import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Trophy,
  GraduationCap,
  CalendarDays,
  FilePlus2,
  Users,
  BarChart3,
  X
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, mobileOpen, onClose }) {
  const { user } = useAuth();
  if (!user) return null;

  const menuItems = {
    student: [
      { id: 'dashboard',    name: 'Dashboard',       icon: LayoutDashboard },
      { id: 'analytics',    name: 'Analytics',        icon: BarChart3 },
      { id: 'study-center', name: 'Study Center & AI', icon: BookOpen },
      { id: 'assignments',  name: 'Assignments',      icon: FileCheck },
      { id: 'profile',      name: 'Achievements',     icon: Trophy },
    ],
    faculty: [
      { id: 'faculty-dashboard',  name: 'Faculty Panel',       icon: LayoutDashboard },
      { id: 'grades-attendance',  name: 'Grades & Attendance',  icon: GraduationCap },
      { id: 'create-assignment',  name: 'New Assignment',       icon: FilePlus2 },
    ],
    admin: [
      { id: 'admin-dashboard', name: 'Admin Control', icon: Users },
    ],
  };

  const currentMenu = menuItems[user.role] || [];

  const handleNav = (id) => {
    setCurrentView(id);
    if (onClose) onClose();  // close mobile drawer on navigate
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-5">
      {/* Mobile close button */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Navigation</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      <span className="hidden md:block text-[10px] text-slate-500 font-black uppercase tracking-widest pl-3 mb-3">Navigation</span>

      <div className="flex flex-col gap-1.5">
        {currentMenu.map(({ id, name, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left w-full ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {name}
            </button>
          );
        })}
      </div>

      {/* Bottom hint card */}
      <div className="mt-auto pt-6">
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
          <h5 className="text-[11px] font-bold text-slate-300">
            {user.role === 'student' ? 'Need help?' : 'Quick Tip'}
          </h5>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            {user.role === 'student'
              ? 'Visit the Study Center to chat with the AI tutor or ask questions about uploaded PDFs.'
              : user.role === 'faculty'
              ? 'Use Grades & Attendance to log marks and track student wellbeing alerts.'
              : 'Manage users and review global wellbeing trends from the Admin Control panel.'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 card-elegant border-r border-slate-700 hidden md:flex flex-col min-h-[calc(100vh-73px)] rounded-none">
        <SidebarContent />
      </aside>

      {/* Mobile slide-over overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="fixed top-0 left-0 h-full w-72 card-elegant border-r border-slate-700 z-50 md:hidden flex flex-col shadow-xl rounded-none">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
