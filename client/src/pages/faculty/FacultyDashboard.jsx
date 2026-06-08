import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Megaphone, 
  Send, 
  Award,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function FacultyDashboard() {
  const { apiFetch } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Announcement state
  const [announceSubject, setAnnounceSubject] = useState('');
  const [announceMessage, setAnnounceMessage] = useState('');
  const [announceLoading, setAnnounceLoading] = useState(false);

  // Grading states
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      const res = await apiFetch('/api/faculty/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Broadcast announcement
  const handleAnnounceSubmit = async (e) => {
    e.preventDefault();
    if (!announceSubject.trim() || !announceMessage.trim() || announceLoading) return;

    setAnnounceLoading(true);
    try {
      const res = await apiFetch('/api/faculty/announcement', {
        method: 'POST',
        body: JSON.stringify({
          subject: announceSubject.trim(),
          message: announceMessage.trim()
        })
      });

      if (res.ok) {
        setAnnounceSubject('');
        setAnnounceMessage('');
        alert('Announcement broadcasted to all students in real time!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnnounceLoading(false);
    }
  };

  // Submit Grade
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradeInput || gradingLoading) return;

    setGradingLoading(true);
    try {
      const res = await apiFetch('/api/faculty/assignments/grade', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId: selectedAssignment._id,
          studentId: selectedSubmission.studentId._id || selectedSubmission.studentId,
          grade: Number(gradeInput),
          feedback: feedbackInput
        })
      });

      if (res.ok) {
        alert('Grade and feedback posted successfully!');
        setGradeInput('');
        setFeedbackInput('');
        setSelectedSubmission(null);
        
        // Reload all data
        const oldSelectedId = selectedAssignment._id;
        await loadDashboard();
        
        // Restore selected assignment view
        const freshDataRes = await apiFetch('/api/faculty/dashboard');
        if (freshDataRes.ok) {
          const freshData = await freshDataRes.json();
          const restored = freshData.assignments.find(a => a._id === oldSelectedId);
          setSelectedAssignment(restored);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGradingLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex-1 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { assignmentsCount, studentsCount, atRiskStudents, assignments } = dashboardData || {};

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-8">
      <PageHeader
        label="Faculty Panel"
        title="Faculty Dashboard"
        subtitle="Monitor at-risk wellbeing logs, evaluate assignment files, and broadcast updates."
      />

      {/* Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Students Coached" 
          value={studentsCount || 0} 
          icon={Users} 
          description="Total enrolled students"
        />
        <StatCard 
          title="Active Evaluations" 
          value={assignmentsCount || 0} 
          icon={FileText} 
          description="Assignments created by you"
        />
        <StatCard 
          title="At-Risk Alerts" 
          value={atRiskStudents?.length || 0} 
          icon={AlertTriangle} 
          description="High stress or low attendance"
          trend={atRiskStudents?.length > 0 ? { type: 'negative', value: `${atRiskStudents.length} Active`, label: 'Needs attention' } : { type: 'positive', value: '0 Alert', label: 'All good' }}
          purple={atRiskStudents?.length > 0}
        />
      </div>

      {/* Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: At-risk alert feed & Broadcast */}
        <div className="flex flex-col gap-8">
          
          {/* At risk list */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="text-rose-500 w-5 h-5" />
              At-Risk Student Alerts (Attendance & Wellbeing)
            </h3>
            
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
              {atRiskStudents?.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center font-medium my-auto">
                  No students currently flagged as at-risk.
                </p>
              ) : (
                atRiskStudents?.map(student => (
                  <div key={student._id} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{student.name}</h4>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{student.email}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2.5 py-0.5 rounded-md">
                        Flagged
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>Attendance: <strong className={student.attendanceRate < 75 ? 'text-rose-400' : 'text-slate-300'}>{student.attendanceRate}%</strong></span>
                      <span className="border-l border-slate-800 pl-2">Stress Level: <strong className="text-wellbeing-400">{student.stressLevel}/10</strong></span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex flex-col gap-1">
                      {student.reasons.map((r, i) => (
                        <p key={i} className="text-[10px] text-rose-400/80 font-medium flex items-center gap-1.5">
                          • {r}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Broadcast Form */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Megaphone className="w-5 h-5 text-brand-400" />
              Broadcast Real-Time Announcement
            </h3>

            <form onSubmit={handleAnnounceSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Announcement Subject (e.g. Midterm prep guide)"
                  required
                  value={announceSubject}
                  onChange={(e) => setAnnounceSubject(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <textarea
                  placeholder="Announcement Message (sent instantly to all student notification feeds)..."
                  required
                  value={announceMessage}
                  onChange={(e) => setAnnounceMessage(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={announceLoading}
                className="bg-brand-500 hover:bg-brand-450 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all self-start cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Notice
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Assignment Manager & Grading Drawer */}
        <div className="flex flex-col gap-8">
          
          {/* Assignment List */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 flex-1 flex flex-col">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-brand-400" />
              Grades & Submissions Evaluator
            </h3>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1 mb-4 flex-1">
              {assignments?.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10 font-semibold my-auto">
                  No evaluations created yet. Use 'New Assignment' tab to create.
                </p>
              ) : (
                assignments?.map(ass => {
                  const submissionCount = ass.submissions?.length || 0;
                  const gradedCount = ass.submissions?.filter(s => s.grade !== null).length || 0;
                  
                  return (
                    <div 
                      key={ass._id}
                      onClick={() => {
                        setSelectedAssignment(ass);
                        setSelectedSubmission(null);
                      }}
                      className={`p-4 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                        selectedAssignment?._id === ass._id
                          ? 'bg-brand-500/10 border-brand-500'
                          : 'bg-slate-900/40 border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{ass.title}</h4>
                        <span className="text-[9px] text-slate-500 block mt-0.5 uppercase tracking-wider font-bold">{ass.subject}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-brand-400">
                          {gradedCount}/{submissionCount}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5 font-bold uppercase tracking-wider">Graded</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected assignment submissions list */}
            {selectedAssignment && (
              <div className="border-t border-slate-900 pt-4 animate-fade-in flex-1">
                <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">
                  Submissions for: <span className="text-brand-400">{selectedAssignment.title}</span>
                </h4>
                
                <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                  {selectedAssignment.submissions?.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic py-2 text-center">No submissions received yet.</p>
                  ) : (
                    selectedAssignment.submissions.map(sub => {
                      const isGraded = sub.grade !== null;
                      return (
                        <div 
                          key={sub._id}
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setGradeInput(sub.grade !== null ? sub.grade.toString() : '');
                            setFeedbackInput(sub.feedback || '');
                          }}
                          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            selectedSubmission?._id === sub._id
                              ? 'bg-wellbeing-500/10 border-wellbeing-500'
                              : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-200">
                              {sub.studentId?.name || 'Student'}
                            </span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {isGraded ? (
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {sub.grade}/100
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Un-evaluated
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Selected submission grading form */}
            {selectedSubmission && (
              <div className="border-t border-slate-900 pt-4 mt-4 animate-fade-in">
                <h4 className="text-xs font-bold text-wellbeing-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Evaluate: {selectedSubmission.studentId?.name || 'Student'}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-900 mb-3 whitespace-pre-wrap">
                  "{selectedSubmission.submissionText}"
                </p>

                {selectedSubmission.fileUrl && (
                  <a 
                    href={selectedSubmission.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-450 hover:underline mb-4"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Attached Homework File
                  </a>
                )}

                <form onSubmit={handleGradeSubmit} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Grade / 100"
                        required
                        value={gradeInput}
                        onChange={(e) => setGradeInput(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-wellbeing-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Feedback (e.g. Excellent logic!)"
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-wellbeing-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={gradingLoading}
                      className="bg-wellbeing-600 hover:bg-wellbeing-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Post Grade
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="px-3 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-500 text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
