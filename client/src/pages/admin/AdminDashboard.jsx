import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { Users, FileCode, Calendar, Smile, ShieldAlert, Edit2, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const { apiFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit user state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [editDept, setEditDept] = useState('');
  const [editSem, setEditSem] = useState(1);
  const [saving, setSaving] = useState(false);

  const loadDashboardData = async () => {
    try {
      const res = await apiFetch('/api/admin/dashboard');
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Edit Submit
  const handleEditSave = async (userId) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName,
          role: editRole,
          department: editDept,
          semester: Number(editSem)
        })
      });

      if (res.ok) {
        setEditingUserId(null);
        loadDashboardData();
        alert('User profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action is irreversible.')) {
      try {
        const res = await apiFetch(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          loadDashboardData();
          alert('User deleted from system.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { metrics, users } = data || {};
  const moods = metrics?.moodDistribution || {};

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Admin Operations Hub
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Monitor system metrics, review emotional wellbeing trends, and audit user permissions.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Global Directory" 
          value={metrics?.usersCount || 0} 
          icon={Users} 
          description={`${metrics?.studentsCount || 0} Students / ${metrics?.facultyCount || 0} Faculty`}
        />
        <StatCard 
          title="Indexed Files (RAG)" 
          value={metrics?.docsCount || 0} 
          icon={FileCode} 
          description="Vector indexed study resources"
        />
        <StatCard 
          title="Overall Attendance" 
          value={`${metrics?.globalAttendanceRate || 100}%`} 
          icon={Calendar} 
          description="Average school presence rate"
        />
        <StatCard 
          title="Average Student Stress" 
          value={`${metrics?.avgStress || 'N/A'}/10`} 
          icon={Smile} 
          description="Overall wellbeing check"
          purple
        />
      </div>

      {/* Wellbeing Mood Distribution Breakdown */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5">
          Student Emotional Mood Distribution Breakdown
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[
            { label: 'Happy 😊', count: moods.happy || 0, color: 'bg-emerald-500' },
            { label: 'Neutral 😐', count: moods.neutral || 0, color: 'bg-slate-500' },
            { label: 'Stressed 😰', count: moods.stressed || 0, color: 'bg-amber-500 animate-pulse' },
            { label: 'Anxious 🤢', count: moods.anxious || 0, color: 'bg-purple-500' },
            { label: 'Sad 😢', count: moods.sad || 0, color: 'bg-rose-500' }
          ].map((item, idx) => {
            const total = Object.values(moods).reduce((a, b) => a + b, 0) || 1;
            const percentage = Math.round((item.count / total) * 100);

            return (
              <div key={idx} className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-300">{item.label}</span>
                <div className="mt-4">
                  <span className="text-xl font-extrabold text-white">{item.count}</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 font-bold">({percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User audit list */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          User Account Audit & Roles Manager
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Semester</th>
                <th className="pb-3">System Role</th>
                <th className="pb-3 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {users?.map(usr => {
                const isEditing = editingUserId === usr._id;
                return (
                  <tr key={usr._id} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-3.5 pl-3 font-semibold text-slate-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      ) : (
                        usr.name
                      )}
                    </td>
                    <td className="py-3.5 text-slate-400">{usr.email}</td>
                    <td className="py-3.5 text-slate-300 font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDept}
                          onChange={(e) => setEditDept(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 w-20 text-xs text-white focus:outline-none"
                        />
                      ) : (
                        usr.department || 'N/A'
                      )}
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {isEditing && editRole === 'student' ? (
                        <input
                          type="number"
                          value={editSem}
                          onChange={(e) => setEditSem(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 w-12 text-xs text-white focus:outline-none"
                        />
                      ) : (
                        usr.role === 'student' ? usr.semester : 'N/A'
                      )}
                    </td>
                    <td className="py-3.5">
                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 cursor-pointer"
                        >
                          <option value="student">student</option>
                          <option value="faculty">faculty</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                          usr.role === 'admin' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : usr.role === 'faculty' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        }`}>
                          {usr.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-3">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditSave(usr._id)}
                            disabled={saving}
                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUserId(usr._id);
                              setEditName(usr.name);
                              setEditRole(usr.role);
                              setEditDept(usr.department || '');
                              setEditSem(usr.semester || 1);
                            }}
                            className="p-1 hover:bg-slate-800 rounded text-slate-450"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {usr._id !== metrics?._id && (
                            <button
                              onClick={() => handleDeleteUser(usr._id)}
                              className="p-1 hover:bg-rose-500/15 rounded text-rose-450"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
