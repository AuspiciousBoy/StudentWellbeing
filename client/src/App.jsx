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

  // Reset view when user role changes
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
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-wellbeing-500 flex items-center justify-center font-black text-white text-2xl shadow-xl animate-pulse">
            S
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-500" />
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
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm font-semibold">Page not found: <code className="text-brand-400">{currentView}</code></p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
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
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
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
