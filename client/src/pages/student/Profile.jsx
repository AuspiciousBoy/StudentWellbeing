import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Flame, Award, ShieldAlert, Sparkles } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  // Static list of possible achievements in the system
  const achievements = [
    {
      id: 'First Step',
      name: 'First Step',
      description: 'Logged in and earned your first academic/wellbeing XP.',
      emoji: '🌱',
      color: 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
    },
    {
      id: 'Consistent Learner',
      name: 'Consistent Learner',
      description: 'Logged in and maintained a 3-day active streak.',
      emoji: '🔥',
      color: 'bg-amber-500/10 border-amber-500/35 text-amber-400'
    },
    {
      id: 'Elite Scholar',
      name: 'Elite Scholar',
      description: 'Pushed limits and climbed to Level 5 or higher.',
      emoji: '🎓',
      color: 'bg-brand-500/10 border-brand-500/35 text-brand-400'
    }
  ];

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-8">
      {/* Header banner */}
      <div className="relative glass-panel rounded-3xl p-8 border border-slate-800/80 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* User Card */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-wellbeing-500 flex items-center justify-center font-black text-white text-3xl shadow-xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700 rounded-md px-2 py-0.5 uppercase tracking-wider">
                {user.role}
              </span>
              <span className="text-[10px] font-black bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md px-2 py-0.5 uppercase tracking-wider">
                Dept: {user.department || 'N/A'}
              </span>
              <span className="text-[10px] font-black bg-wellbeing-500/10 text-wellbeing-400 border border-wellbeing-500/20 rounded-md px-2 py-0.5 uppercase tracking-wider">
                Semester: {user.semester || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Level and streak values */}
        <div className="flex gap-4">
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center w-28 text-center">
            <Award className="w-6 h-6 text-wellbeing-400 mb-1" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level</span>
            <span className="text-xl font-extrabold text-white mt-0.5">{user.level || 1}</span>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center w-28 text-center">
            <Flame className="w-6 h-6 text-amber-500 mb-1 fill-amber-500/10 animate-pulse" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Streak</span>
            <span className="text-xl font-extrabold text-white mt-0.5">{user.streak || 0} Days</span>
          </div>
        </div>
      </div>

      {/* Gamification center section */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-brand-400" />
          Unlocked Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map((badge) => {
            const isUnlocked = user.badges?.includes(badge.id);
            return (
              <div 
                key={badge.id}
                className={`border rounded-2xl p-6 flex flex-col justify-between items-center text-center transition-all duration-300 relative ${
                  isUnlocked 
                    ? `${badge.color} shadow-lg` 
                    : 'bg-slate-950 border-slate-900 text-slate-650 opacity-40'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute top-3 right-3" title="Locked">
                    <ShieldAlert className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                
                <span className={`text-4xl mb-4 p-3 rounded-full ${isUnlocked ? 'bg-slate-900/30' : 'bg-slate-950'}`}>
                  {badge.emoji}
                </span>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-5">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md">
                      <Sparkles className="w-2.5 h-2.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-900 text-slate-500 rounded-md">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
