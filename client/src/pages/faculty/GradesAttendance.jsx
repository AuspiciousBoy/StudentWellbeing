import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, CalendarDays, Award, User as UserIcon, Send } from 'lucide-react';

export default function GradesAttendance() {
  const { apiFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // General selection
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Attendance form states
  const [attSubject, setAttSubject] = useState('');
  const [attStatus, setAttStatus] = useState('present');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attLoading, setAttLoading] = useState(false);

  // Performance form states
  const [perfSubject, setPerfSubject] = useState('');
  const [perfExamName, setPerfExamName] = useState('');
  const [perfMarks, setPerfMarks] = useState('');
  const [perfMaxMarks, setPerfMaxMarks] = useState(100);
  const [perfLoading, setPerfLoading] = useState(false);

  const loadStudents = async () => {
    try {
      const res = await apiFetch('/api/faculty/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudentId(data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load students list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Submit Attendance log
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !attSubject.trim() || attLoading) return;

    setAttLoading(true);
    try {
      const res = await apiFetch('/api/faculty/attendance', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          subject: attSubject.trim(),
          status: attStatus,
          date: attDate
        })
      });

      if (res.ok) {
        alert('Attendance logged and notification sent!');
        setAttSubject('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAttLoading(false);
    }
  };

  // Submit Performance Marks
  const handlePerformanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !perfSubject.trim() || !perfExamName.trim() || !perfMarks || perfLoading) return;

    setPerfLoading(true);
    try {
      const res = await apiFetch('/api/faculty/marks', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          subject: perfSubject.trim(),
          examName: perfExamName.trim(),
          marks: Number(perfMarks),
          maxMarks: Number(perfMaxMarks)
        })
      });

      if (res.ok) {
        alert('Marks posted and student dashboard updated!');
        setPerfSubject('');
        setPerfExamName('');
        setPerfMarks('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPerfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-brand-400" />
          Grades & Attendance Registry
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Select a student to log class attendance or post grades for exams.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <UserIcon className="w-12 h-12 text-slate-700 mx-auto" />
          <p className="text-xs text-slate-500 mt-3 font-semibold">No students found in the database.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Student Selector */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 max-w-md">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Selected Target Student
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer appearance-none"
              >
                {students.map(std => (
                  <option key={std._id} value={std._id}>
                    {std.name} ({std.email}) - Sem {std.semester}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form splits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Form 1: Log Attendance */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
                <CalendarDays className="w-5 h-5 text-brand-400" />
                Log Daily Attendance
              </h3>

              <form onSubmit={handleAttendanceSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Operating Systems"
                    value={attSubject}
                    onChange={(e) => setAttSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                      Status
                    </label>
                    <select
                      value={attStatus}
                      onChange={(e) => setAttStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={attLoading}
                  className="bg-brand-500 hover:bg-brand-450 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all self-start cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Attendance
                </button>
              </form>
            </div>

            {/* Form 2: Post Exam Grades */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
                <Award className="w-5 h-5 text-wellbeing-400" />
                Upload Evaluation Marks
              </h3>

              <form onSubmit={handlePerformanceSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Networks, AI"
                    value={perfSubject}
                    onChange={(e) => setPerfSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-wellbeing-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                    Evaluation Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm 1, Project Phase 1, Quiz 3"
                    value={perfExamName}
                    onChange={(e) => setPerfExamName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-wellbeing-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                      Marks Obtained
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 85"
                      value={perfMarks}
                      onChange={(e) => setPerfMarks(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-wellbeing-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                      Maximum Marks
                    </label>
                    <input
                      type="number"
                      required
                      value={perfMaxMarks}
                      onChange={(e) => setPerfMaxMarks(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-wellbeing-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={perfLoading}
                  className="bg-wellbeing-600 hover:bg-wellbeing-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all self-start cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Grades
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
