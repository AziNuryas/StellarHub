'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Rocket, Mail, Lock, Eye, EyeOff, User,
  ArrowRight, Loader2, Sparkles,
} from 'lucide-react';

/* ── seeded rand ── */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
const rand = seededRand(99);
const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: rand() * 100, y: rand() * 100,
  size: rand() * 2.1 + 0.4,
  delay: rand() * 9, dur: rand() * 5 + 3.5,
  opacity: rand() * 0.6 + 0.12,
}));
const METEORS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  x: rand() * 65 + 10, y: rand() * 38,
  delay: rand() * 13 + i * 3.5,
  dur: rand() * 0.9 + 0.6,
  length: rand() * 110 + 65,
}));

/* ── password strength ── */
function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..5
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Stellar 🚀'];
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#10b981', '#818cf8'];

export default function RegisterPage() {
  const supabase = createClient();
  const router   = useRouter();
  const [mounted,      setMounted]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData,     setFormData]     = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });
  const strength = getStrength(formData.password);

  useEffect(() => { setMounted(true); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { username: formData.username || formData.email.split('@')[0] },
        },
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: formData.username || formData.email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
          bio: 'Space Explorer',
          verified: false,
        });
      }

      toast.success('🎉 Account created! Launching into orbit…');
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: formData.email, password: formData.password,
      });
      if (!loginErr) { router.push('/feed'); router.refresh(); }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-reg-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .sh-reg-root {
          min-height: 100svh;
          background: #050810;
          color: #f0f0ff;
          font-family: 'DM Sans', system-ui, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          position: relative;
          overflow: hidden;
        }

        /* ── BG ── */
        .rg-bg { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
        .rg-blob { position:absolute; border-radius:50%; filter:blur(85px); }
        .rg-blob-1 {
          width:650px; height:650px; top:-220px; right:-160px;
          background:radial-gradient(circle,rgba(124,58,237,.16) 0%,transparent 70%);
          animation:blobP 14s ease-in-out infinite;
        }
        .rg-blob-2 {
          width:500px; height:500px; bottom:-120px; left:-100px;
          background:radial-gradient(circle,rgba(14,165,233,.12) 0%,transparent 70%);
          animation:blobP 17s ease-in-out 7s infinite;
        }
        .rg-blob-3 {
          width:320px; height:320px; top:50%; left:50%;
          background:radial-gradient(circle,rgba(52,211,153,.07) 0%,transparent 70%);
          animation:blobP 20s ease-in-out 4s infinite;
        }
        @keyframes blobP { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.09)} }
        .rg-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px);
          background-size:80px 80px;
          mask-image:radial-gradient(ellipse 80% 65% at 50% 35%,black 0%,transparent 100%);
          -webkit-mask-image:radial-gradient(ellipse 80% 65% at 50% 35%,black 0%,transparent 100%);
        }
        .rg-vignette {
          position:absolute; inset:0;
          background:radial-gradient(ellipse 100% 100% at 50% 50%,transparent 30%,rgba(5,8,16,.72) 100%);
        }
        .rg-star {
          position:absolute; border-radius:50%; background:#fff;
          animation:twinkle var(--tw-dur) ease-in-out var(--tw-delay) infinite;
        }
        @keyframes twinkle { 0%,100%{opacity:.03;transform:scale(1)} 50%{opacity:var(--peak);transform:scale(1.9)} }
        .rg-meteor {
          position:absolute; height:1.5px; border-radius:100px;
          background:linear-gradient(90deg,rgba(255,255,255,.9),rgba(196,181,253,.5),transparent);
          transform:rotate(-30deg); opacity:0;
          animation:shoot var(--m-dur) ease-out var(--m-delay) infinite;
        }
        @keyframes shoot {
          0%{opacity:0;transform:rotate(-30deg) translateX(0)} 5%{opacity:1}
          80%{opacity:.35} 100%{opacity:0;transform:rotate(-30deg) translateX(var(--m-len))}
        }

        /* ── WRAP ── */
        .rg-wrap {
          position:relative; z-index:10;
          width:100%; max-width:480px;
          animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .08s both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }

        /* ── HEADER ── */
        .rg-header { text-align:center; margin-bottom:30px; }
        .rg-logo-ring { position:relative; display:inline-block; margin-bottom:20px; }
        .rg-logo-glow {
          position:absolute; inset:-6px; border-radius:26px;
          background:linear-gradient(135deg,rgba(124,58,237,.4),rgba(14,165,233,.3));
          filter:blur(14px); animation:glowP 3s ease-in-out infinite;
        }
        @keyframes glowP { 0%,100%{opacity:.55} 50%{opacity:1} }
        .rg-logo-box {
          position:relative; width:66px; height:66px; border-radius:22px;
          background:linear-gradient(135deg,#7c3aed,#0ea5e9);
          display:flex; align-items:center; justify-content:center;
          border:1px solid rgba(255,255,255,.15);
        }
        .rg-title {
          font-family:'DM Serif Display',Georgia,serif;
          font-size:2.2rem; line-height:1.05; letter-spacing:-.025em; margin-bottom:10px;
        }
        .rg-sub { font-size:.88rem; font-weight:300; color:rgba(175,180,215,.6); line-height:1.6; }

        .tg {
          background:linear-gradient(110deg,#c4b5fd 0%,#818cf8 40%,#38bdf8 70%,#34d399 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        /* ── CARD ── */
        .rg-card {
          background:rgba(255,255,255,.042);
          border:1px solid rgba(255,255,255,.09);
          border-radius:28px;
          backdrop-filter:blur(24px) saturate(155%);
          -webkit-backdrop-filter:blur(24px) saturate(155%);
          padding:34px;
          box-shadow:0 0 0 1px rgba(255,255,255,.04),0 40px 80px rgba(0,0,0,.45),0 0 80px rgba(124,58,237,.05);
        }

        /* ── FIELDS ── */
        .rg-fields { display:flex; flex-direction:column; gap:16px; margin-bottom:24px; }
        .rg-label {
          font-size:11.5px; font-weight:700; text-transform:uppercase;
          letter-spacing:.12em; color:rgba(175,180,215,.65);
          font-family:'Syne',sans-serif; margin-bottom:7px; display:block;
        }
        .rg-field-wrap { position:relative; }
        .rg-icon {
          position:absolute; left:15px; top:50%; transform:translateY(-50%);
          color:rgba(120,125,175,.5); pointer-events:none;
        }
        .rg-input {
          width:100%; padding:13px 15px 13px 44px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.09); border-radius:13px;
          color:rgba(225,230,255,.9); font-size:14px;
          font-family:'DM Sans',sans-serif; outline:none;
          transition:border-color .2s,background .2s,box-shadow .2s;
          box-sizing:border-box;
        }
        .rg-input::placeholder { color:rgba(100,105,155,.42); }
        .rg-input:focus {
          border-color:rgba(124,58,237,.5);
          background:rgba(124,58,237,.04);
          box-shadow:0 0 0 3px rgba(124,58,237,.1);
        }
        .rg-input-pr { padding-right:44px; }
        .rg-pw-toggle {
          position:absolute; right:13px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color:rgba(120,125,175,.5); display:flex; transition:color .2s;
        }
        .rg-pw-toggle:hover { color:rgba(195,200,240,.8); }

        /* password strength bar */
        .pw-strength { margin-top:8px; }
        .pw-bar-bg {
          height:3px; border-radius:4px;
          background:rgba(255,255,255,.07); overflow:hidden; margin-bottom:5px;
        }
        .pw-bar-fill {
          height:100%; border-radius:4px;
          transition:width .4s ease, background .4s ease;
        }
        .pw-label { font-size:11px; font-weight:600; font-family:'Syne',sans-serif; }

        /* helper text */
        .rg-hint { font-size:11px; color:rgba(110,115,155,.5); margin-top:5px; }

        /* ── SUBMIT ── */
        .rg-submit {
          width:100%; padding:15px 24px;
          background:linear-gradient(135deg,#7c3aed,#0ea5e9);
          border:none; border-radius:16px;
          color:#fff; font-size:15px; font-weight:700;
          font-family:'Syne',sans-serif; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:10px;
          position:relative; overflow:hidden;
          transition:transform .2s cubic-bezier(.175,.885,.32,1.275),box-shadow .3s;
        }
        .rg-submit::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.14),transparent);
          opacity:0; transition:opacity .3s;
        }
        .rg-submit:hover::before { opacity:1; }
        .rg-submit::after {
          content:''; position:absolute; top:0; left:-100%;
          width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
          transition:left .5s;
        }
        .rg-submit:hover::after { left:150%; }
        .rg-submit:hover:not(:disabled) {
          transform:translateY(-2px) scale(1.02);
          box-shadow:0 0 40px rgba(124,58,237,.45),0 8px 30px rgba(0,0,0,.4);
        }
        .rg-submit:disabled { opacity:.42; cursor:not-allowed; transform:none; }

        /* terms */
        .rg-terms {
          font-size:11.5px; color:rgba(110,115,155,.5); text-align:center;
          margin-top:14px; line-height:1.6;
        }
        .rg-terms a { color:rgba(167,139,250,.6); text-decoration:none; }
        .rg-terms a:hover { color:rgba(196,181,253,.9); }

        /* bottom */
        .rg-bottom { margin-top:22px; text-align:center; }
        .rg-bottom p { font-size:13.5px; color:rgba(130,135,180,.6); margin-bottom:10px; }
        .rg-link {
          color:rgba(167,139,250,.85); font-weight:600;
          text-decoration:none; font-family:'Syne',sans-serif;
          display:inline-flex; align-items:center; gap:4px; transition:color .2s;
        }
        .rg-link:hover { color:rgba(196,181,253,1); }
        .rg-back {
          font-size:12px; color:rgba(95,100,140,.5);
          text-decoration:none; display:inline-flex; align-items:center; gap:4px;
          font-family:'Syne',sans-serif; transition:color .2s;
        }
        .rg-back:hover { color:rgba(155,160,205,.8); }

        /* badge */
        .rg-badge {
          display:inline-flex; align-items:center; gap:8px;
          padding:6px 16px; border-radius:100px;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
          margin-bottom:18px;
          font-size:10px; font-weight:700; letter-spacing:.18em; text-transform:uppercase;
          color:rgba(200,210,240,.6); font-family:'Syne',sans-serif;
        }

        /* 2-col row on wider */
        .rg-row { display:grid; gap:16px; }
        @media(min-width:400px) { .rg-row { grid-template-columns:1fr 1fr; } }

        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── BG ── */}
      <div className="rg-bg">
        <div className="rg-blob rg-blob-1"/>
        <div className="rg-blob rg-blob-2"/>
        <div className="rg-blob rg-blob-3"/>
        <div className="rg-grid"/>
        {mounted && (
          <>
            {STARS.map(s => (
              <span key={s.id} className="rg-star" style={{
                left:`${s.x}%`,top:`${s.y}%`,
                width:s.size,height:s.size,
                '--tw-dur':`${s.dur}s`,'--tw-delay':`${s.delay}s`,'--peak':s.opacity,
              } as React.CSSProperties}/>
            ))}
            {METEORS.map(m => (
              <span key={m.id} className="rg-meteor" style={{
                left:`${m.x}%`,top:`${m.y}%`,width:m.length,
                '--m-dur':`${m.dur}s`,'--m-delay':`${m.delay}s`,'--m-len':`${m.length*2.5}px`,
              } as React.CSSProperties}/>
            ))}
          </>
        )}
        <div className="rg-vignette"/>
      </div>

      {/* ── CONTENT ── */}
      <div className="rg-wrap">
        <div className="rg-header">
          <div className="rg-badge">
            <Sparkles style={{width:10,height:10,color:'#a78bfa'}}/>
            Join 150,000+ Space Explorers
          </div>
          <div className="rg-logo-ring">
            <div className="rg-logo-glow"/>
            <div className="rg-logo-box">
              <Rocket style={{width:28,height:28,color:'#fff'}}/>
            </div>
          </div>
          <h1 className="rg-title">
            Begin Your<br/>
            <span className="tg">Journey</span>
          </h1>
          <p className="rg-sub">Create your free account and explore the cosmos.</p>
        </div>

        <div className="rg-card">
          <form onSubmit={handleRegister}>
            <div className="rg-fields">

              {/* Username + Email row */}
              <div className="rg-row">
                <div>
                  <label className="rg-label">Username</label>
                  <div className="rg-field-wrap">
                    <User className="rg-icon" style={{width:15,height:15}}/>
                    <input
                      type="text"
                      className="rg-input"
                      placeholder="cosmic_explorer"
                      value={formData.username}
                      onChange={e=>setFormData({...formData,username:e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="rg-label">Email</label>
                  <div className="rg-field-wrap">
                    <Mail className="rg-icon" style={{width:15,height:15}}/>
                    <input
                      type="email"
                      className="rg-input"
                      placeholder="astro@space.io"
                      value={formData.email}
                      onChange={e=>setFormData({...formData,email:e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="rg-label">Password</label>
                <div className="rg-field-wrap">
                  <Lock className="rg-icon" style={{width:15,height:15}}/>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="rg-input rg-input-pr"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={e=>setFormData({...formData,password:e.target.value})}
                    required
                  />
                  <button type="button" className="rg-pw-toggle" onClick={()=>setShowPassword(v=>!v)}>
                    {showPassword
                      ? <EyeOff style={{width:15,height:15}}/>
                      : <Eye style={{width:15,height:15}}/>
                    }
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password.length > 0 && (
                  <div className="pw-strength">
                    <div className="pw-bar-bg">
                      <div className="pw-bar-fill" style={{
                        width:`${(strength/5)*100}%`,
                        background: STRENGTH_COLOR[strength],
                      }}/>
                    </div>
                    <span className="pw-label" style={{color: STRENGTH_COLOR[strength]}}>
                      {STRENGTH_LABEL[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="rg-label">Confirm Password</label>
                <div className="rg-field-wrap">
                  <Lock className="rg-icon" style={{width:15,height:15}}/>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="rg-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e=>setFormData({...formData,confirmPassword:e.target.value})}
                    required
                  />
                </div>
                {/* Match indicator */}
                {formData.confirmPassword.length > 0 && (
                  <p className="rg-hint" style={{
                    color: formData.password === formData.confirmPassword
                      ? '#10b981' : '#ef4444'
                  }}>
                    {formData.password === formData.confirmPassword
                      ? '✓ Passwords match'
                      : '✗ Passwords do not match'
                    }
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="rg-submit" disabled={loading}>
              {loading
                ? <><Loader2 style={{width:16,height:16,animation:'spin 1s linear infinite'}}/>Creating account…</>
                : <><Sparkles style={{width:15,height:15}}/>Launch Journey<ArrowRight style={{width:15,height:15}}/></>
              }
            </button>

            <p className="rg-terms">
              By creating an account, you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <div className="rg-bottom">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="rg-link">
                Sign in <ArrowRight style={{width:12,height:12}}/>
              </Link>
            </p>
            <Link href="/" className="rg-back">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}