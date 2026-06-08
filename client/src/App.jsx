import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudyCenter from './pages/student/StudyCenter';
import Assignments from './pages/student/Assignments';
import Profile from './pages/student/Profile';
import Analytics from './pages/student/Analytics';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import GradesAttendance from './pages/faculty/GradesAttendance';
import CreateAssignment from './pages/faculty/CreateAssignment';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function DashboardShell() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrentView(
        user.role === 'student' ? 'dashboard'
          : user.role === 'faculty' ? 'faculty-dashboard'
          : 'admin-dashboard'
      );
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ background: '#0a0a0a' }}>
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <span className="font-display text-4xl font-bold text-white">
            SW<span className="text-brand-400">.</span>
          </span>
          <div className="animate-spin rounded-full h-5 w-5 border border-brand-400/30 border-t-brand-400" />
          <span className="section-label">Loading portal...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':         return <StudentDashboard />;
      case 'analytics':         return <Analytics />;
      case 'study-center':      return <StudyCenter />;
      case 'assignments':       return <Assignments />;
      case 'profile':           return <Profile />;
      case 'faculty-dashboard': return <FacultyDashboard />;
      case 'grades-attendance': return <GradesAttendance />;
      case 'create-assignment': return <CreateAssignment />;
      case 'admin-dashboard':   return <AdminDashboard />;
      default:
        return (
          <div className="p-8 text-center text-neutral-600">
            <p className="text-sm font-medium">Page not found: <code className="text-brand-400">{currentView}</code></p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      <Navbar
        onMobileMenuToggle={() => setMobileMenuOpen(v => !v)}
        mobileMenuOpen={mobileMenuOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <DashboardShell />
      </SocketProvider>
    </AuthProvider>
  );
}
