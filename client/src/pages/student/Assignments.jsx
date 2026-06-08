import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { 
  FileCheck, 
  Calendar, 
  BookOpen, 
  User as UserIcon, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Award,
  ExternalLink
} from 'lucide-react';

export default function Assignments() {
  const { apiFetch } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submission form states
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAssignments = async () => {
    try {
      const res = await apiFetch('/api/student/assignments');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('assignmentId', activeAssignmentId);
    formData.append('submissionText', submissionText);
    if (submissionFile) {
      formData.append('file', submissionFile);
    }

    try {
      const token = localStorage.getItem('sw_token');
      const res = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setSubmissionText('');
        setSubmissionFile(null);
        setActiveAssignmentId(null);
        loadAssignments();
        alert('Assignment submitted successfully! You earned +40 XP!');
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
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
      <PageHeader
        label="Coursework"
        title="Assignments & Evaluations"
        subtitle="Track course assessments, submit notes or scripts, and review feedback."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.length === 0 ? (
          <div className="lg:col-span-2 text-center py-20 glass-panel rounded-3xl">
            <FileCheck className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-xs text-slate-500 mt-3 font-semibold">No assignments posted by faculty yet.</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const isSubmitted = assignment.isSubmitted;
            const isGraded = assignment.submission && assignment.submission.grade !== null;
            const isOverdue = new Date(assignment.dueDate) < new Date() && !isSubmitted;

            return (
              <div 
                key={assignment._id} 
                className={`glass-panel rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                  isGraded 
                    ? 'border-emerald-500/20' 
                    : isSubmitted 
                      ? 'border-brand-500/20' 
                      : isOverdue 
                        ? 'border-rose-500/20 shadow-lg shadow-rose-500/5' 
                        : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Upper Details */}
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-400 bg-brand-500/5 px-2.5 py-1 rounded-md border border-brand-500/10">
                      {assignment.subject}
                    </span>
                    
                    {/* Status Badge */}
                    {isGraded ? (
                      <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md px-2 py-1 uppercase tracking-wider">
                        Graded: {assignment.submission.grade}/100
                      </span>
                    ) : isSubmitted ? (
                      <span className="text-[9px] font-black bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Submitted
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[9px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    ) : (
                      <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md px-2 py-1 uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mt-4 leading-snug">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {assignment.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>By: {assignment.assignedBy?.name || 'Faculty'}</span>
                    </div>
                  </div>
                </div>

                {/* Lower Action Form / Feedback details */}
                <div className="mt-6 pt-5 border-t border-slate-900/60">
                  {isGraded ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-emerald-400">Faculty Evaluation</h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 italic">
                        "{assignment.submission.feedback || 'No comments left.'}"
                      </p>
                    </div>
                  ) : isSubmitted ? (
                    <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-850">
                      <h4 className="text-xs font-bold text-slate-400">Your Submission</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {assignment.submission.submissionText}
                      </p>
                      {assignment.submission.fileUrl && (
                        <a 
                          href={assignment.submission.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-400 hover:underline mt-2.5"
                        >
                          <ExternalLink className="w-3 h-3" /> View Submitted File
                        </a>
                      )}
                    </div>
                  ) : activeAssignmentId === assignment._id ? (
                    /* Submission Form */
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                      <div>
                        <textarea
                          placeholder="Type your submission response here..."
                          required
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          rows="3"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => setSubmissionFile(e.target.files[0])}
                          className="block w-48 text-[10px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveAssignmentId(null)}
                            className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-brand-500 hover:bg-brand-400 text-white rounded-lg px-4 py-1.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {submitting ? 'Submitting...' : 'Upload'}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setActiveAssignmentId(assignment._id)}
                      className="w-full bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white border border-brand-500/20 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Submit Evaluation (+40 XP)
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
