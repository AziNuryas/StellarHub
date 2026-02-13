'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  Rocket, Mail, Lock, Eye, EyeOff,
  Github, Globe, Loader2, ArrowRight, Star,
} from 'lucide-react';

/* ── seeded rand (no hydration mismatch) ── */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
const rand = seededRand(77);
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: rand() * 100, y: rand() * 100,
  size: rand() * 2 + 0.5,
  delay: rand() * 8, dur: rand() * 5 + 4,
  opacity: rand() * 0.6 + 0.15,
}));
const METEORS = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  x: rand() * 70 + 10, y: rand() * 40,
  delay: rand() * 12 + i * 4,
  dur: rand() * 0.8 + 0.6,
  length: rand() * 100 + 70,
}));

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();
  const [mounted,          setMounted]          = useState(false);
  const [checkingSession,  setCheckingSession]  = useState(true);
  const [loading,          setLoading]          = useState(false);
  const [oauthLoading,     setOauthLoading]     = useState<'google'|'github'|null>(null);
  const [showPassword,     setShowPassword]     = useState(false);
  const [formData,         setFormData]         = useState({ email: '', password: '' });

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { router.push('/feed'); router.refresh(); }
      else setCheckingSession(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(formData);
      if (error) throw error;
      toast.success('Welcome back, Explorer! 🚀');
      router.push('/feed');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || `${provider} login failed`);
      setOauthLoading(null);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050810' }}>
        <Loader2 style={{ width: 36, height: 36, color: '#818cf8', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="sh-login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .sh-login-root {
          min-height: 100svh;
          background: #050810;
          color: #f0f0ff;
          font-family: 'DM Sans', system-ui, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 20px;
          position: relative;
          overflow: hidden;
        }

        /* ── BACKGROUND ── */
        .lg-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
        }
        .lg-blob {
          position: absolute; border-radius: 50%; filter: blur(80px);
        }
        .lg-blob-1 {
          width: 600px; height: 600px; top: -200px; left: -150px;
          background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
          animation: blobPulse 13s ease-in-out infinite;
        }
        .lg-blob-2 {
          width: 500px; height: 500px; bottom: -150px; right: -120px;
          background: radial-gradient(circle, rgba(14,165,233,0.13) 0%, transparent 70%);
          animation: blobPulse 16s ease-in-out 6s infinite;
        }
        .lg-blob-3 {
          width: 280px; height: 280px; top: 40%; left: 60%;
          background: radial-gradient(circle, rgba(244,114,182,0.07) 0%, transparent 70%);
          animation: blobPulse 19s ease-in-out 3s infinite;
        }
        @keyframes blobPulse {
          0%,100% { opacity:.6; transform:scale(1); }
          50% { opacity:1; transform:scale(1.08); }
        }
        .lg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 100%);
        }
        .lg-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(5,8,16,0.7) 100%);
        }

        /* Stars */
        .lg-star {
          position: absolute; border-radius: 50%; background: #fff;
          animation: twinkle var(--tw-dur) ease-in-out var(--tw-delay) infinite;
        }
        @keyframes twinkle {
          0%,100% { opacity:.04; transform:scale(1); }
          50% { opacity:var(--peak); transform:scale(1.8); }
        }
        /* Meteors */
        .lg-meteor {
          position: absolute; height: 1.5px; border-radius: 100px;
          background: linear-gradient(90deg, rgba(255,255,255,.9), rgba(196,181,253,.5), transparent);
          transform: rotate(-30deg); opacity: 0;
          animation: shoot var(--m-dur) ease-out var(--m-delay) infinite;
        }
        @keyframes shoot {
          0%   { opacity:0; transform:rotate(-30deg) translateX(0px); }
          5%   { opacity:1; }
          80%  { opacity:.4; }
          100% { opacity:0; transform:rotate(-30deg) translateX(var(--m-len)); }
        }

        /* ── CARD ── */
        .lg-wrap {
          position: relative; z-index: 10;
          width: 100%; max-width: 460px;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(32px) scale(.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        /* Logo + header */
        .lg-header { text-align: center; margin-bottom: 36px; }
        .lg-logo-ring {
          position: relative; display: inline-block; margin-bottom: 24px;
        }
        .lg-logo-glow {
          position: absolute; inset: -6px;
          border-radius: 26px;
          background: linear-gradient(135deg, rgba(124,58,237,.45), rgba(14,165,233,.35));
          filter: blur(14px);
          animation: glowPulse 3s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%,100%{opacity:.6} 50%{opacity:1}
        }
        .lg-logo-box {
          position: relative;
          width: 68px; height: 68px; border-radius: 22px;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .lg-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 2.4rem; line-height: 1.05;
          letter-spacing: -0.025em;
          margin-bottom: 10px;
        }
        .lg-sub {
          font-size: 0.9rem; font-weight: 300;
          color: rgba(180,185,220,0.6); line-height: 1.6;
        }

        /* Gradient text */
        .tg {
          background: linear-gradient(110deg,#c4b5fd 0%,#818cf8 40%,#38bdf8 70%,#34d399 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Card glass */
        .lg-card {
          background: rgba(255,255,255,0.042);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          padding: 36px;
          box-shadow: 0 0 0 1px rgba(255,255,255,.04), 0 40px 80px rgba(0,0,0,.45), 0 0 80px rgba(124,58,237,.05);
        }

        /* OAuth buttons */
        .oauth-row { display: flex; gap: 10px; margin-bottom: 28px; }
        .oauth-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 16px; border-radius: 14px;
          font-size: 13.5px; font-weight: 600; font-family: 'Syne', sans-serif;
          color: rgba(220,225,255,.85);
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.09);
          cursor: pointer;
          transition: background .2s, border-color .2s, transform .2s;
        }
        .oauth-btn:hover:not(:disabled) {
          background: rgba(255,255,255,.08);
          border-color: rgba(255,255,255,.15);
          transform: translateY(-2px);
        }
        .oauth-btn:disabled { opacity: .45; cursor: not-allowed; }

        /* Divider */
        .or-divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 26px;
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .18em; color: rgba(120,125,165,.5);
          font-family: 'Syne', sans-serif;
        }
        .or-line { flex:1; height:1px; background: rgba(255,255,255,.07); }

        /* Form fields */
        .field-group { display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px; }
        .field-label {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .12em; color: rgba(180,185,220,.7);
          font-family: 'Syne', sans-serif; margin-bottom: 8px; display: block;
        }
        .field-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: rgba(130,135,180,.5); pointer-events: none;
        }
        .field-input {
          width: 100%; padding: 14px 16px 14px 46px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 14px;
          color: rgba(225,230,255,.9);
          font-size: 14.5px; font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(110,115,160,.45); }
        .field-input:focus {
          border-color: rgba(124,58,237,.5);
          background: rgba(124,58,237,.04);
          box-shadow: 0 0 0 3px rgba(124,58,237,.1);
        }
        .field-input-right { padding-right: 46px; }
        .field-btn-right {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(130,135,180,.5); display: flex;
          transition: color .2s;
        }
        .field-btn-right:hover { color: rgba(200,205,245,.8); }

        /* Forgot */
        .forgot-row { display: flex; justify-content: flex-end; margin-top: -8px; }
        .forgot-link {
          font-size: 12px; font-weight: 600; color: rgba(167,139,250,.7);
          text-decoration: none; font-family: 'Syne', sans-serif;
          transition: color .2s;
        }
        .forgot-link:hover { color: rgba(196,181,253,.95); }

        /* Submit */
        .submit-btn {
          width: 100%; padding: 15px 24px;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          border: none; border-radius: 16px;
          color: #fff; font-size: 15px; font-weight: 700;
          font-family: 'Syne', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          position: relative; overflow: hidden;
          transition: transform .2s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s;
        }
        .submit-btn::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(255,255,255,.14), transparent);
          opacity:0; transition:opacity .3s;
        }
        .submit-btn:hover::before { opacity:1; }
        .submit-btn::after {
          content:''; position:absolute; top:0; left:-100%;
          width:60%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent);
          transition: left .5s ease;
        }
        .submit-btn:hover::after { left:150%; }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 40px rgba(124,58,237,.45), 0 8px 30px rgba(0,0,0,.4);
        }
        .submit-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }

        /* Bottom links */
        .lg-bottom { margin-top: 26px; text-align: center; }
        .lg-bottom p { font-size: 13.5px; color: rgba(140,145,185,.6); margin-bottom:10px; }
        .lg-link {
          color: rgba(167,139,250,.85); font-weight: 600;
          text-decoration: none; font-family: 'Syne', sans-serif;
          display: inline-flex; align-items: center; gap: 4px;
          transition: color .2s;
        }
        .lg-link:hover { color: rgba(196,181,253,1); }
        .lg-back {
          font-size: 12px; color: rgba(100,105,145,.5);
          text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
          transition: color .2s; font-family: 'Syne', sans-serif;
        }
        .lg-back:hover { color: rgba(160,165,210,.8); }

        /* Live badge */
        .live-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 100px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          margin-bottom: 20px;
          font-size: 10px; font-weight: 700;
          letter-spacing: .18em; text-transform: uppercase;
          color: rgba(200,210,240,.65);
          font-family: 'Syne', sans-serif;
        }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981; box-shadow: 0 0 8px #10b981;
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%,100%{ box-shadow:0 0 8px #10b981; }
          50%{ box-shadow:0 0 16px #10b981,0 0 24px rgba(16,185,129,.4); }
        }

        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── BACKGROUND ── */}
      <div className="lg-bg">
        <div className="lg-blob lg-blob-1" />
        <div className="lg-blob lg-blob-2" />
        <div className="lg-blob lg-blob-3" />
        <div className="lg-grid" />
        {mounted && (
          <>
            {STARS.map(s => (
              <span key={s.id} className="lg-star" style={{
                left:`${s.x}%`, top:`${s.y}%`,
                width:s.size, height:s.size,
                '--tw-dur':`${s.dur}s`, '--tw-delay':`${s.delay}s`, '--peak':s.opacity,
              } as React.CSSProperties}/>
            ))}
            {METEORS.map(m => (
              <span key={m.id} className="lg-meteor" style={{
                left:`${m.x}%`, top:`${m.y}%`, width:m.length,
                '--m-dur':`${m.dur}s`, '--m-delay':`${m.delay}s`, '--m-len':`${m.length*2.5}px`,
              } as React.CSSProperties}/>
            ))}
          </>
        )}
        <div className="lg-vignette" />
      </div>

      {/* ── CARD ── */}
      <div className="lg-wrap">
        {/* Header */}
        <div className="lg-header">
          <div className="live-badge">
            <span className="live-dot" />
            StellarHub · Space Community
          </div>
          <div className="lg-logo-ring">
            <div className="lg-logo-glow" />
            <div className="lg-logo-box">
              <Rocket style={{ width:30, height:30, color:'#fff' }} />
            </div>
          </div>
          <h1 className="lg-title">
            Welcome<br/>
            <span className="tg">Back, Explorer</span>
          </h1>
          <p className="lg-sub">Your cosmos awaits. Sign in to continue.</p>
        </div>

        {/* Glass card */}
        <div className="lg-card">
          {/* OAuth */}
          <div className="oauth-row">
            <button
              className="oauth-btn"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading || loading}
            >
              {oauthLoading === 'google'
                ? <Loader2 style={{width:15,height:15,animation:'spin 1s linear infinite'}}/>
                : <Globe style={{width:15,height:15}}/>
              }
              Google
            </button>
            <button
              className="oauth-btn"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading || loading}
            >
              {oauthLoading === 'github'
                ? <Loader2 style={{width:15,height:15,animation:'spin 1s linear infinite'}}/>
                : <Github style={{width:15,height:15}}/>
              }
              GitHub
            </button>
          </div>

          <div className="or-divider">
            <span className="or-line"/>or continue with email<span className="or-line"/>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field-group">
              {/* Email */}
              <div>
                <label className="field-label">Email</label>
                <div className="field-wrap">
                  <Mail className="field-icon" style={{width:16,height:16}}/>
                  <input
                    type="email"
                    className="field-input"
                    placeholder="astro@explorer.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email:e.target.value})}
                    required
                  />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <Lock className="field-icon" style={{width:16,height:16}}/>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="field-input field-input-right"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password:e.target.value})}
                    required
                  />
                  <button type="button" className="field-btn-right" onClick={() => setShowPassword(v=>!v)}>
                    {showPassword
                      ? <EyeOff style={{width:16,height:16}}/>
                      : <Eye style={{width:16,height:16}}/>
                    }
                  </button>
                </div>
              </div>
            </div>

            <div className="forgot-row">
              <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !!oauthLoading}
              style={{marginTop:22}}
            >
              {loading
                ? <><Loader2 style={{width:16,height:16,animation:'spin 1s linear infinite'}}/>Signing in…</>
                : <><Star style={{width:16,height:16}}/>Sign In<ArrowRight style={{width:16,height:16}}/></>
              }
            </button>
          </form>

          <div className="lg-bottom">
            <p>
              No account yet?{' '}
              <Link href="/register" className="lg-link">
                Create one free <ArrowRight style={{width:12,height:12}}/>
              </Link>
            </p>
            <Link href="/" className="lg-back">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}