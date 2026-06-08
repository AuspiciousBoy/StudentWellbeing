import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Trophy,
  GraduationCap,
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
      { id: 'dashboard',    name: 'Dashboard',        icon: LayoutDashboard },
      { id: 'analytics',    name: 'Analytics',         icon: BarChart3 },
      { id: 'study-center', name: 'Study Center & AI',  icon: BookOpen },
      { id: 'assignments',  name: 'Assignments',       icon: FileCheck },
      { id: 'profile',      name: 'Achievements',      icon: Trophy },
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
    if (onClose) onClose();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-8 md:hidden">
        <span className="section-label">Navigation</span>
        <button onClick={onClose} className="p-1.5 text-neutral-600 hover:text-brand-400 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="gold-line w-8 mb-6 hidden md:block" />
      <span className="hidden md:block section-label mb-6">Menu</span>

      <div className="flex flex-col gap-1">
        {currentMenu.map(({ id, name, icon: Icon }, index) => {
          const isActive = currentView === id;
          const num = String(index + 1).padStart(2, '0');
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`group flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-300 text-left w-full border-l-2 ${
                isActive
                  ? 'border-brand-400 bg-brand-500/8 text-white'
                  : 'border-transparent text-neutral-500 hover:text-white hover:border-brand-400/40 hover:bg-white/3'
              }`}
            >
              <span className={`nav-number ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}`}>
                {num}
              </span>
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-400' : 'text-neutral-600 group-hover:text-brand-400/70'}`} />
              <span className="tracking-wide">{name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <div className="gold-line-full mb-4" />
        <div className="p-4 border border-white/8 bg-white/2">
          <h5 className="text-[11px] font-semibold text-brand-400 uppercase tracking-widest">
            {user.role === 'student' ? 'Need help?' : 'Quick Tip'}
          </h5>
          <p className="text-[10px] text-neutral-600 mt-2 leading-relaxed">
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
      <aside className="w-64 border-r border-white/8 hidden md:flex flex-col min-h-[calc(100vh-65px)] bg-surface-400/50">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="fixed top-0 left-0 h-full w-72 bg-surface-300 border-r border-white/10 z-50 md:hidden flex flex-col shadow-gold-lg">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
