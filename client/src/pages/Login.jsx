import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User as UserIcon, BookOpen, Layers, ChevronDown } from 'lucide-react';
import LoginSplash from '../components/LoginSplash';

function AnimatedTitle({ text, accentFrom = 7 }) {
  return (
    <h1 className="font-display text-6xl xl:text-7xl font-bold leading-[1.05] mb-6 overflow-hidden">
      {text.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={`login-hero-title-char ${i >= accentFrom ? 'text-gradient' : ''}`}
          style={{ animationDelay: `${0.5 + i * 0.06}s` }}
        >
          {char}
        </span>
      ))}
    </h1>
  );
}

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role,
          department,
          semester: Number(semester)
        });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginSplash onComplete={() => setSplashDone(true)} />

      <div
        className={`min-h-screen flex relative overflow-hidden transition-opacity duration-700 ${
          splashDone ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: '#0a0a0a' }}
      >
        {/* Background watermark */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none font-display font-bold leading-none opacity-[0.03]"
          style={{ fontSize: 'clamp(12rem, 30vw, 28rem)', color: '#c9a96e' }}
          aria-hidden="true"
        >
          SW
        </div>

        {/* Left hero panel */}
        <div className="hidden lg:flex flex-col justify-center w-1/2 px-16 xl:px-24 relative z-10">
          <div className="login-hero-label">
            <span className="login-hero-label__line" />
            <span className="login-hero-label__text">Student Portal — 2025</span>
          </div>

          <AnimatedTitle text="StudentWell" accentFrom={7} />

          <p
            className="text-brand-400 text-sm font-medium tracking-wide mb-4 uppercase login-hero-content--delayed"
            style={{ animationDelay: '1.2s' }}
          >
            Adaptive Learning & Wellbeing
          </p>

          <p
            className="text-neutral-400 text-sm leading-relaxed max-w-md login-hero-content--delayed"
            style={{ animationDelay: '1.35s' }}
          >
            A premium educational platform that helps students improve academic performance
            and mental wellbeing through personalized learning, analytics, and AI assistance.
          </p>

          <div
            className="flex items-center gap-6 mt-12 login-hero-content--delayed"
            style={{ animationDelay: '1.5s' }}
          >
            <div className="gold-line w-8" />
            <span className="section-label">Sign in to continue →</span>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative z-10 login-hero-content">
          <div className="lg:hidden text-center mb-8">
            <div className="login-hero-label justify-center">
              <span className="login-hero-label__line" />
              <span className="login-hero-label__text">Student Portal</span>
            </div>
            <h2 className="font-display text-4xl font-bold overflow-hidden">
              {'StudentWell'.split('').map((char, i) => (
                <span
                  key={`m-${char}-${i}`}
                  className={`login-hero-title-char ${i >= 7 ? 'text-gradient' : ''}`}
                  style={{ animationDelay: `${0.5 + i * 0.06}s` }}
                >
                  {char}
                </span>
              ))}
            </h2>
          </div>

          <div className="w-full max-w-md">
            <div className="card-elegant p-8 lg:p-10">
              <div className="flex gap-8 border-b border-white/10 mb-8">
                <button
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className={`pb-3 text-xs font-semibold uppercase tracking-widest border-b transition-all ${
                    !isRegister
                      ? 'border-brand-400 text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className={`pb-3 text-xs font-semibold uppercase tracking-widest border-b transition-all ${
                    isRegister
                      ? 'border-brand-400 text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Register
                </button>
              </div>

              {error && (
                <div className="mb-5 bg-red-950/40 border border-red-800/40 text-red-400 text-xs p-4 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {isRegister && (
                  <div>
                    <label className="section-label block mb-2">Full Name</label>
                    <div className="input-icon-wrap relative">
                      <UserIcon className="input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="section-label block mb-2">Email Address</label>
                  <div className="input-icon-wrap relative">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      required
                      placeholder="name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div>
                  <label className="section-label block mb-2">Password</label>
                  <div className="input-icon-wrap relative">
                    <Lock className="input-icon" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-luxury"
                    />
                  </div>
                </div>

                {isRegister && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="section-label block mb-2">Your Role</label>
                      <div className="input-icon-wrap input-icon-wrap--select relative">
                        <Shield className="input-icon" />
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="input-luxury appearance-none w-full"
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <ChevronDown className="input-chevron" />
                      </div>
                    </div>

                    <div>
                      <label className="section-label block mb-2">Department</label>
                      <div className="input-icon-wrap relative">
                        <BookOpen className="input-icon" />
                        <input
                          type="text"
                          placeholder="e.g. CS, EE"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="input-luxury"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isRegister && role === 'student' && (
                  <div>
                    <label className="section-label block mb-2">Current Semester</label>
                    <div className="input-icon-wrap relative">
                      <Layers className="input-icon" />
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="input-luxury"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-elegant btn-primary w-full mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
                  {!loading && <span className="text-base">→</span>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
