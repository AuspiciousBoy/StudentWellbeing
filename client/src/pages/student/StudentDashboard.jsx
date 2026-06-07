import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import CircularProgress from '../../components/CircularProgress';
import { 
  Smile, 
  BookOpen, 
  CheckSquare, 
  BrainCircuit, 
  Send, 
  Sparkles,
  Calendar,
  Frown,
  Meh,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, apiFetch, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mood form states
  const [mood, setMood] = useState('happy');
  const [stressLevel, setStressLevel] = useState(5);
  const [engagementLevel, setEngagementLevel] = useState(8);
  const [notes, setNotes] = useState('');
  const [moodLogged, setMoodLogged] = useState(false);

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      const res = await apiFetch('/api/student/dashboard');
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
        if (dashboardData.student) {
          setUser(dashboardData.student); // Keep auth user in sync
        }
      }

      const planRes = await apiFetch('/api/student/study-plan');
      if (planRes.ok) {
        const planData = await planRes.json();
        setStudyPlan(planData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Submit Mood Log
  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/student/mood', {
        method: 'POST',
        body: JSON.stringify({
          mood,
          stressLevel,
          engagementLevel,
          notes
        })
      });

      if (res.ok) {
        setMoodLogged(true);
        setNotes('');
        loadDashboard(); // reload to get new mood entries and updated XP/level
        
        setTimeout(() => {
          setMoodLogged(false);
        }, 4000);
      }
    } catch (err) {
      console.error('Failed to log mood:', err);
    }
  };

  // Toggle Study Goal
  const handleToggleGoal = async (goalId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await apiFetch('/api/student/study-plan/goal', {
        method: 'PUT',
        body: JSON.stringify({
          goalId,
          status: nextStatus
        })
      });

      if (res.ok) {
        const updatedPlan = await res.json();
        setStudyPlan(updatedPlan);
        loadDashboard(); // reload for XP
      }
    } catch (err) {
      console.error('Failed to toggle goal:', err);
    }
  };

  // Trigger AI Study Plan Generation
  const handleGenerateAIPlan = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/student/study-plan/generate', {
        method: 'POST'
      });
      if (res.ok) {
        const newPlan = await res.json();
        setStudyPlan(newPlan);
        loadDashboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { student, performance, moodLogs, summary } = data || {};

  const moodsList = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'stressed', emoji: '😰', label: 'Stressed' },
    { id: 'anxious', emoji: '🤢', label: 'Anxious' },
    { id: 'sad', emoji: '😢', label: 'Sad' }
  ];

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-8">
      {/* Welcome header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {user.name}!
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Here is your personalized academic and wellbeing summary for today.
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Attendance Rate" 
          value={`${summary?.attendanceRate || 100}%`} 
          icon={Calendar} 
          description="Global attendance average"
          trend={summary?.attendanceRate >= 75 ? { type: 'positive', value: 'Good', label: 'Above 75%' } : { type: 'negative', value: 'Low', label: 'Below 75%' }}
        />
        <StatCard 
          title="Average Grade" 
          value={`${summary?.averageGrade || 0}%`} 
          icon={BookOpen} 
          description="Average across all evaluations"
        />
        <StatCard 
          title="Learning Streak" 
          value={`${student?.streak || 0} Days`} 
          icon={Smile} 
          description="Daily active logins"
          purple
        />
        <StatCard 
          title="Current Level" 
          value={`Level ${student?.level || 1}`} 
          icon={BrainCircuit} 
          description={`${student?.xp || 0} total XP earned`}
          purple
        />
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) - Wellbeing & Study Goals */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Daily Wellbeing Mood Logger */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-wellbeing-400" />
              Daily Wellbeing Check-in
            </h3>
            
            {moodLogged ? (
              <div className="bg-wellbeing-500/10 border border-wellbeing-500/20 rounded-2xl p-8 text-center animate-pulse">
                <span className="text-4xl">🌟</span>
                <h4 className="font-extrabold text-white mt-3 text-lg">Wellbeing Logged!</h4>
                <p className="text-sm text-slate-400 mt-1">
                  You earned <strong className="text-wellbeing-400">+15 XP</strong> for tuning in to your health.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMoodSubmit} className="flex flex-col gap-5">
                {/* Mood picker */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                    How do you feel today?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {moodsList.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMood(m.id)}
                        className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all ${
                          mood === m.id
                            ? 'bg-wellbeing-500/10 border-wellbeing-500 text-white font-bold scale-105'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl mb-1">{m.emoji}</span>
                        <span className="text-[10px] tracking-wider uppercase font-semibold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Stress Level</span>
                      <span className="text-wellbeing-400">{stressLevel}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value)}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-wellbeing-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                      <span>Relaxed</span>
                      <span>High Stress</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Study Engagement</span>
                      <span className="text-brand-400">{engagementLevel}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={engagementLevel}
                      onChange={(e) => setEngagementLevel(e.target.value)}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                      <span>Burned Out</span>
                      <span>Highly Engaged</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Reflective Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Briefly write down how you feel, what is stressing you, or things you did today..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-wellbeing-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-wellbeing-600 to-wellbeing-500 hover:from-wellbeing-500 hover:to-wellbeing-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-wellbeing-500/15 hover:shadow-wellbeing-500/30 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer self-start"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Wellbeing Check
                </button>
              </form>
            )}
          </div>

          {/* Study Plan recommendations & Checkbox list */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-brand-400" />
                Your Weekly AI Study Goals
              </h3>
              <button
                onClick={handleGenerateAIPlan}
                className="bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white border border-brand-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Advisor
              </button>
            </div>

            {studyPlan && studyPlan.weeklyGoals?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {studyPlan.weeklyGoals.map((goal) => {
                  const isCompleted = goal.status === 'completed';
                  return (
                    <div
                      key={goal._id}
                      onClick={() => handleToggleGoal(goal._id, goal.status)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        readOnly
                        className="mt-0.5 rounded border-slate-700 text-brand-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <p className={`text-xs font-medium text-slate-200 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                          {goal.task}
                        </p>
                      </div>
                      {!isCompleted && (
                        <span className="text-[9px] text-slate-400 font-bold bg-slate-800/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          +20 XP
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                No active goals. Click 'Ask AI Advisor' to generate custom academic suggestions.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width) - Attendance Ring & Performance history */}
        <div className="flex flex-col gap-8">
          
          {/* Circular attendance widget */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 self-start">
              Attendance Gauge
            </h3>
            <CircularProgress 
              value={summary?.attendanceRate || 0} 
              size={140} 
              strokeWidth={12} 
              subtitle="Presence"
              colorClass={summary?.attendanceRate >= 75 ? "stroke-brand-500" : "stroke-rose-500"}
            />
            {summary?.attendanceRate < 75 && (
              <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 mt-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-[10px] text-rose-400 font-semibold leading-relaxed">
                  Your attendance is under the 75% requirement. Faculty alerts have been notified. Attend more lectures to recover.
                </p>
              </div>
            )}
          </div>

          {/* Academic log histories */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              Recent Evaluations
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[280px] pr-1 flex-1">
              {performance && performance.length > 0 ? (
                performance.map(p => (
                  <div key={p._id} className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{p.subject}</h4>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{p.examName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-brand-400">{p.marks}/{p.maxMarks}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {Math.round((p.marks / p.maxMarks) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-10 my-auto">No grades posted yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
