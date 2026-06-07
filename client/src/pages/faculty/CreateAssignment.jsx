import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FilePlus2, Send } from 'lucide-react';

export default function CreateAssignment() {
  const { apiFetch } = useAuth();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !dueDate || !description.trim() || loading) return;

    setLoading(true);
    try {
      const res = await apiFetch('/api/faculty/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          subject: subject.trim(),
          dueDate,
          description: description.trim()
        })
      });

      if (res.ok) {
        alert('Assignment published successfully! All students have been notified.');
        setTitle('');
        setSubject('');
        setDueDate('');
        setDescription('');
      }
    } catch (err) {
      console.error('Failed to create assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FilePlus2 className="w-8 h-8 text-brand-400" />
          Draft Evaluation Task
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Publish a new assignment or homework challenge. This broadcast sends instant alerts to all enrolled students.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                Assignment Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Lab Write-up"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Databases"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
              Due Date & Deadline
            </label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 pl-1">
              Instructions & Description
            </label>
            <textarea
              placeholder="Write the detailed assignment instructions, required code file format, or research questions here..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-450 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition-all self-start cursor-pointer disabled:opacity-50 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25"
          >
            <Send className="w-3.5 h-3.5" />
            Publish Evaluation
          </button>
        </form>
      </div>
    </div>
  );
}
