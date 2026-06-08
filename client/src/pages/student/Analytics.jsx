import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, TrendingUp, Heart, Calendar, Award } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

// ── Mini Bar Chart (SVG) ──────────────────────────────────────────────
function BarChart({ data, color = '#0984e3', maxVal }) {
  const max = maxVal || Math.max(...data.map(d => d.value), 1);
  const h = 100;
  const barW = 24;
  const gap = 8;
  const total = data.length;
  const svgW = total * (barW + gap);

  return (
    <svg viewBox={`0 0 ${svgW} ${h + 24}`} className="w-full" style={{ height: 130 }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.value / max) * h);
        const x = i * (barW + gap);
        const y = h - barH;
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx={4}
              fill={color}
              opacity={0.85}
            />
            {/* Value label */}
            <text
              x={x + barW / 2} y={y - 4}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={8}
              fontWeight="600"
            >
              {d.value}
            </text>
            {/* X-axis label */}
            <text
              x={x + barW / 2} y={h + 16}
              textAnchor="middle"
              fill="#64748b"
              fontSize={7}
              fontWeight="600"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Mini Line Chart (SVG) ─────────────────────────────────────────────
function LineChart({ data, color = '#b832fc', maxVal }) {
  const max = maxVal || Math.max(...data.map(d => d.value), 10);
  const W = 300;
  const H = 80;
  if (data.length < 2) {
    return <p className="text-xs text-slate-600 text-center py-6">Not enough data points.</p>;
  }

  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.value / max) * H;
    return { x, y, ...d };
  });

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = `M${pts[0].x},${H} ${pts.map(p => `L${p.x},${p.y}`).join(' ')} L${pts[pts.length - 1].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ height: 110 }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill="url(#lineGrad)" />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={color} />
          <text x={p.x} y={H + 14} textAnchor="middle" fill="#64748b" fontSize={7} fontWeight="600">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Mood emoji map ────────────────────────────────────────────────────
const MOOD_EMOJI = { happy: '😊', neutral: '😐', stressed: '😰', anxious: '🤢', sad: '😢' };
const MOOD_COLOR = {
  happy: '#10b981', neutral: '#94a3b8', stressed: '#f59e0b', anxious: '#a78bfa', sad: '#f43f5e'
};

// ── Main Analytics Page ───────────────────────────────────────────────
export default function Analytics() {
  const { apiFetch } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/student/dashboard');
        if (res.ok) setDashData(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex-1 flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500" />
    </div>
  );

  const { performance = [], attendance = [], moodLogs = [], summary = {}, student } = dashData || {};

  // ── Build chart data ──────────────────────────────────────────────
  // Grades per subject (average)
  const subjectMap = {};
  performance.forEach(p => {
    if (!subjectMap[p.subject]) subjectMap[p.subject] = { total: 0, count: 0, max: 0 };
    subjectMap[p.subject].total += p.marks;
    subjectMap[p.subject].max += p.maxMarks;
    subjectMap[p.subject].count += 1;
  });
  const gradeData = Object.entries(subjectMap).map(([subj, v]) => ({
    label: subj.slice(0, 6),
    value: Math.round((v.total / v.max) * 100),
  })).slice(0, 8);

  // Attendance by subject
  const attMap = {};
  attendance.forEach(a => {
    if (!attMap[a.subject]) attMap[a.subject] = { present: 0, total: 0 };
    attMap[a.subject].total += 1;
    if (a.status !== 'absent') attMap[a.subject].present += 1;
  });
  const attData = Object.entries(attMap).map(([subj, v]) => ({
    label: subj.slice(0, 6),
    value: Math.round((v.present / v.total) * 100),
  })).slice(0, 8);

  // Mood stress over time (last 7 logs)
  const stressData = [...moodLogs].reverse().slice(0, 7).map((m, i) => ({
    label: `D${i + 1}`,
    value: m.stressLevel,
  }));

  // Engagement over time
  const engageData = [...moodLogs].reverse().slice(0, 7).map((m, i) => ({
    label: `D${i + 1}`,
    value: m.engagementLevel,
  }));

  // Mood distribution
  const moodDist = {};
  moodLogs.forEach(m => { moodDist[m.mood] = (moodDist[m.mood] || 0) + 1; });
  const totalMoods = moodLogs.length || 1;

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-8">
      <PageHeader
        label="Analytics"
        icon={BarChart3}
        title="Performance & Wellbeing"
        subtitle="Visual breakdown of your academic grades, attendance patterns, and mood trends."
      />

      {/* ── Summary KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Avg Grade',
            value: `${summary.attendanceRate !== undefined ? summary.averageGrade || 0 : 0}%`,
            icon: Award,
            color: 'text-brand-400',
            bg: 'bg-brand-500/10 border-brand-500/20'
          },
          {
            label: 'Attendance',
            value: `${summary.attendanceRate || 100}%`,
            icon: Calendar,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20'
          },
          {
            label: 'Streak',
            value: `${student?.streak || 0} Days`,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20'
          },
          {
            label: 'Mood Logs',
            value: moodLogs.length,
            icon: Heart,
            color: 'text-wellbeing-400',
            bg: 'bg-wellbeing-500/10 border-wellbeing-500/20'
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`glass-panel rounded-2xl p-5 border flex items-center gap-4 ${bg}`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Grade by subject */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-400" />
            Grade % by Subject
          </h3>
          {gradeData.length === 0
            ? <EmptyChart msg="No grades posted yet." />
            : <BarChart data={gradeData} color="#0984e3" maxVal={100} />
          }
        </div>

        {/* Attendance by subject */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Attendance % by Subject
          </h3>
          {attData.length === 0
            ? <EmptyChart msg="No attendance records yet." />
            : <BarChart data={attData} color="#f59e0b" maxVal={100} />
          }
        </div>

        {/* Stress trend */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            Stress Level Trend (Last 7 Logs)
          </h3>
          {stressData.length < 2
            ? <EmptyChart msg="Log at least 2 daily check-ins to see your stress trend." />
            : <LineChart data={stressData} color="#f43f5e" maxVal={10} />
          }
        </div>

        {/* Engagement trend */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Heart className="w-4 h-4 text-wellbeing-400" />
            Engagement Level Trend (Last 7 Logs)
          </h3>
          {engageData.length < 2
            ? <EmptyChart msg="Log at least 2 daily check-ins to see your engagement trend." />
            : <LineChart data={engageData} color="#b832fc" maxVal={10} />
          }
        </div>
      </div>

      {/* ── Mood Distribution ── */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Heart className="w-4 h-4 text-wellbeing-400" />
          Mood Distribution (All Time)
        </h3>

        {moodLogs.length === 0 ? (
          <EmptyChart msg="No mood check-ins logged yet. Start your daily wellbeing check from the Dashboard!" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {['happy', 'neutral', 'stressed', 'anxious', 'sad'].map(mood => {
              const count = moodDist[mood] || 0;
              const pct = Math.round((count / totalMoods) * 100);
              return (
                <div
                  key={mood}
                  className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2"
                >
                  <span className="text-3xl">{MOOD_EMOJI[mood]}</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider capitalize">{mood}</p>
                  <p className="text-xl font-extrabold text-white">{count}</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: MOOD_COLOR[mood] }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold">{pct}%</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ msg }) {
  return (
    <div className="h-24 flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
      <p className="text-[11px] text-slate-600 font-medium text-center px-4">{msg}</p>
    </div>
  );
}
