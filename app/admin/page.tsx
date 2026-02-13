'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  Rocket, Mail, Lock, Eye, EyeOff, User, 
  Sparkles, Satellite, ChevronRight, Star, Zap,
  Globe, Circle, ArrowRight
} from 'lucide-react';

/* ─────────────────────────────────────────────────────
   SEEDED RANDOM — biar kaya landing page
───────────────────────────────────────────────────── */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
const rand = seededRand(42);

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: rand() * 100,
  y: rand() * 100,
  size: rand() * 2.2 + 0.4,
  delay: rand() * 10,
  dur: rand() * 6 + 4,
  opacity: rand() * 0.7 + 0.15,
  drift: rand() * 30 - 15,
  driftDur: rand() * 20 + 25,
}));

const METEORS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  x: rand() * 70 + 10,
  y: rand() * 45,
  delay: rand() * 14 + i * 3,
  dur: rand() * 1.0 + 0.7,
  length: rand() * 120 + 80,
}));

const NEBULAS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: rand() * 100,
  y: rand() * 100,
  size: rand() * 3 + 1.5,
  delay: rand() * 12,
  dur: rand() * 8 + 8,
  color: ['#a78bfa','#38bdf8','#f472b6','#34d399','#fbbf24'][Math.floor(rand() * 5)],
  opacity: rand() * 0.35 + 0.08,
  driftX: rand() * 40 - 20,
  driftY: rand() * 40 - 20,
}));

export default function RegisterPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username || formData.email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: formData.username || formData.email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
            bio: 'Space Explorer',
            verified: false
          });
      }

      toast.success('🎉 Account created successfully!', {
        description: 'Please check your email for verification'
      });
      
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (!loginError) {
        setTimeout(() => {
          window.location.href = '/feed';
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-root">
      <style>{`
        /* ── FONTS (sama persis kaya landing) ── */
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        /* ── RESET / BASE ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .sh-root {
          min-height: 100vh;
          background: #050810;
          color: #f0f0ff;
          overflow-x: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
          position: relative;
        }

        /* ── SCROLLBAR ── */
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #050810; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#7c3aed, #0ea5e9); }
        ::selection { background: rgba(124,58,237,0.3); color: #fff; }

        /* ── CSS CUSTOM PROPS ── */
        :root {
          --purple: #7c3aed;
          --blue: #0ea5e9;
          --teal: #14b8a6;
          --pink: #ec4899;
          --green: #10b981;
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.08);
          --glass-hover: rgba(255,255,255,0.07);
          --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
          --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── GRADIENT TEXT ── */
        .tg {
          background: linear-gradient(110deg, #c4b5fd 0%, #818cf8 35%, #38bdf8 65%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: gradMove 6s ease infinite;
        }

        @keyframes gradMove {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        /* ── GLASS UTILITIES ── */
        .gl {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .gl-deep {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
        }

        /* ── FIXED BG ── */
        .sh-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* ── TWINKLING + DRIFTING STARS ── */
        .star {
          position: absolute;
          border-radius: 50%;
          background: #fff;
          animation:
            twinkle var(--tw-dur) ease-in-out var(--tw-delay) infinite,
            drift var(--dr-dur) ease-in-out var(--dr-delay) infinite alternate;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.04; transform: scale(1); }
          40%       { opacity: var(--peak); transform: scale(1.9); }
          60%       { opacity: calc(var(--peak) * 0.7); transform: scale(1.5); }
        }
        @keyframes drift {
          from { transform: translateX(0px) translateY(0px); }
          to   { transform: translateX(var(--dx)) translateY(var(--dy)); }
        }

        /* ── SHOOTING STARS / METEORS ── */
        .meteor {
          position: absolute;
          height: 1.5px;
          border-radius: 100px;
          background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(196,181,253,0.6), transparent);
          transform-origin: left center;
          transform: rotate(-30deg);
          opacity: 0;
          animation: shoot var(--m-dur) ease-out var(--m-delay) infinite;
        }
        @keyframes shoot {
          0%   { opacity: 0; transform: rotate(-30deg) translateX(0px); }
          5%   { opacity: 1; }
          70%  { opacity: 0.6; }
          100% { opacity: 0; transform: rotate(-30deg) translateX(var(--m-len)); }
        }

        /* ── NEBULA DUST PARTICLES ── */
        .nebula-dot {
          position: absolute;
          border-radius: 50%;
          filter: blur(1.5px);
          animation:
            nebulaTwinkle var(--nb-dur) ease-in-out var(--nb-delay) infinite,
            nebulaDrift var(--nb-drift-dur) ease-in-out var(--nb-delay) infinite alternate;
        }
        @keyframes nebulaTwinkle {
          0%, 100% { opacity: 0.04; transform: scale(0.8); }
          50%       { opacity: var(--nb-peak); transform: scale(1.4); }
        }
        @keyframes nebulaDrift {
          from { transform: translate(0px, 0px) scale(1); }
          to   { transform: translate(var(--nb-dx), var(--nb-dy)) scale(1.2); }
        }

        /* ── AMBIENT BLOBS ── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
        }
        .blob-1 {
          width: 750px; height: 750px;
          top: -220px; left: -180px;
          background: radial-gradient(circle, rgba(124,58,237,0.20) 0%, rgba(99,102,241,0.08) 50%, transparent 72%);
          animation: blobPulse 13s ease-in-out infinite;
        }
        .blob-2 {
          width: 600px; height: 600px;
          top: 25%; right: -120px;
          background: radial-gradient(circle, rgba(14,165,233,0.14) 0%, rgba(56,189,248,0.06) 50%, transparent 72%);
          animation: blobPulse 16s ease-in-out 5s infinite;
        }
        .blob-3 {
          width: 480px; height: 480px;
          bottom: 5%; left: 15%;
          background: radial-gradient(circle, rgba(20,184,166,0.11) 0%, transparent 70%);
          animation: blobPulse 11s ease-in-out 9s infinite;
        }
        .blob-4 {
          width: 340px; height: 340px;
          top: 55%; left: 55%;
          background: radial-gradient(circle, rgba(244,114,182,0.07) 0%, transparent 70%);
          animation: blobPulse 18s ease-in-out 3s infinite;
        }
        @keyframes blobPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.10); }
        }

        /* ── GRID LINES ── */
        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px);
          background-size: 90px 90px;
          mask-image: radial-gradient(ellipse 85% 65% at 50% 25%, black 0%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 85% 65% at 50% 25%, black 0%, transparent 100%);
        }

        /* ── VIGNETTE ── */
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(5,8,16,0.65) 100%);
        }

        /* ── CONTENT ── */
        .sh-content {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
        }

        /* ── CARD ── */
        .register-card {
          max-width: 480px;
          width: 100%;
          animation: fadeSlideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── BADGE ── */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          border-radius: 100px;
          margin-bottom: 24px;
          animation: fadeSlideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .badge-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 8px #10b981; }
          50% { box-shadow: 0 0 16px #10b981, 0 0 24px rgba(16,185,129,0.4); }
        }

        /* ── ORBIT ── */
        .orbit-icon {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
        }
        .orbit-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(124,58,237,0.3);
          animation: spin 20s linear infinite;
        }
        .orbit-ring-inner {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          border: 1px solid rgba(14,165,233,0.2);
          animation: spin 12s linear reverse infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .orbit-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── INPUT ── */
        .input-group {
          position: relative;
          margin-bottom: 20px;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: rgba(160,165,200,0.5);
          transition: color 0.2s;
          pointer-events: none;
        }
        .input-field {
          width: 100%;
          padding: 16px 48px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          color: #f0f0ff;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(124,58,237,0.5);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .input-field::placeholder {
          color: rgba(160,165,200,0.35);
        }
        .input-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(160,165,200,0.5);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }
        .input-toggle:hover {
          color: rgba(240,240,255,0.9);
        }

        /* ── BUTTON ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 16px 32px;
          border-radius: 16px;
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          font-family: 'Syne', sans-serif;
          background: linear-gradient(135deg, var(--purple) 0%, var(--blue) 100%);
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s var(--ease-spring), box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 40px rgba(124,58,237,0.4);
        }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* ── LINK ── */
        .nav-link {
          color: rgba(160,165,200,0.7);
          text-decoration: none;
          transition: color 0.2s;
          font-size: 0.95rem;
        }
        .nav-link:hover {
          color: rgba(240,240,255,0.95);
        }
        .nav-link-accent {
          color: #a78bfa;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link-accent:hover {
          color: #c4b5fd;
        }

        /* ── DIVIDER ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
          color: rgba(160,165,200,0.35);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ══ BACKGROUND (SAMA PERSIS KAYA LANDING) ═══════════ */}
      <div className="sh-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="grid-lines" />
        
        {mounted && (
          <>
            {STARS.map(s => (
              <span key={`s-${s.id}`} className="star"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.size,
                  height: s.size,
                  '--tw-dur': `${s.dur}s`,
                  '--tw-delay': `${s.delay}s`,
                  '--peak': s.opacity,
                  '--dr-dur': `${s.driftDur}s`,
                  '--dr-delay': `${s.delay * 0.3}s`,
                  '--dx': `${s.drift}px`,
                  '--dy': `${s.drift * 0.4}px`,
                } as React.CSSProperties}
              />
            ))}
            {METEORS.map(m => (
              <span key={`m-${m.id}`} className="meteor"
                style={{
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  width: m.length,
                  '--m-dur': `${m.dur}s`,
                  '--m-delay': `${m.delay}s`,
                  '--m-len': `${m.length * 2.5}px`,
                } as React.CSSProperties}
              />
            ))}
            {NEBULAS.map(n => (
              <span key={`n-${n.id}`} className="nebula-dot"
                style={{
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  width: n.size,
                  height: n.size,
                  background: n.color,
                  '--nb-dur': `${n.dur}s`,
                  '--nb-delay': `${n.delay}s`,
                  '--nb-peak': n.opacity,
                  '--nb-drift-dur': `${n.dur * 2.5}s`,
                  '--nb-dx': `${n.driftX}px`,
                  '--nb-dy': `${n.driftY}px`,
                } as React.CSSProperties}
              />
            ))}
          </>
        )}
        <div className="vignette" />
      </div>

      {/* ══ CONTENT ════════════════════════════════════════ */}
      <div className="sh-content">
        <div className="register-card">
          {/* Orbit Icon */}
          <div className="orbit-icon">
            <div className="orbit-ring" />
            <div className="orbit-ring-inner" />
            <div className="orbit-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="hero-badge gl" style={{ margin: '0 auto 24px', width: 'fit-content' }}>
            <span className="badge-dot" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,210,240,0.75)', fontFamily: "'Syne', sans-serif" }}>
              Join the Cosmos
            </span>
          </div>

          {/* Title */}
          <h1 style={{ 
            fontFamily: "'DM Serif Display', serif", 
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ color: '#f0f0ff', display: 'block' }}>Begin Your</span>
            <span className="tg">Cosmic Journey</span>
          </h1>
          
          <p style={{ 
            textAlign: 'center', 
            color: 'rgba(160,165,200,0.65)',
            marginBottom: '40px',
            fontSize: '1rem'
          }}>
            Join 150,000+ explorers discovering the universe together
          </p>

          {/* Card */}
          <div className="gl-deep" style={{ 
            padding: '32px', 
            borderRadius: '28px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02)'
          }}>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Username */}
              <div className="input-group">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  className="input-field"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="input-group">
                <Mail className="input-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  className="input-field"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password hint */}
              <p style={{ 
                fontSize: '11px', 
                color: 'rgba(160,165,200,0.45)',
                marginTop: '4px',
                marginBottom: '8px',
                paddingLeft: '4px'
              }}>
                Minimum 6 characters
              </p>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: '16px' }}
              >
                {loading ? (
                  <>
                    <div style={{ 
                      width: 20, 
                      height: 20, 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTopColor: '#fff', 
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <Star style={{ width: 18, height: 18 }} />
                    <span>Launch Your Journey</span>
                    <ArrowRight style={{ width: 18, height: 18 }} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span className="divider-line" />
              <span>or</span>
              <span className="divider-line" />
            </div>

            {/* Login link */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(160,165,200,0.6)', marginBottom: '4px' }}>
                Already have an account?
              </p>
              <Link href="/login" className="nav-link-accent">
                Sign in to continue exploration
                <ChevronRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>

          {/* Back to home */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ChevronRight style={{ width: 16, height: 16, transform: 'rotate(180deg)' }} />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}