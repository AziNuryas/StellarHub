'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  Mail, Lock, Eye, EyeOff,
  Github, Loader2, ArrowRight, Star, Satellite
} from 'lucide-react';
import { gsap } from 'gsap';

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  dur: Math.random() * 3 + 2,
  delay: Math.random() * 2,
  opacity: Math.random() * 0.5 + 0.3
}));

const METEORS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  length: Math.random() * 30 + 10,
  dur: Math.random() * 1.5 + 1,
  delay: Math.random() * 5,
}));

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [checking, setChecking] = useState(true);
  const [existingSession, setExistingSession] = useState<any>(null);

  const gsapLoaded = useRef(false);
  const cursorSatelliteRef = useRef<HTMLDivElement>(null);
  const freeSatelliteRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothedMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session) setExistingSession(session);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (gsapLoaded.current) return;
    gsapLoaded.current = true;

    mouseRef.current.x = window.innerWidth / 2;
    mouseRef.current.y = window.innerHeight / 2;
    smoothedMouseRef.current.x = window.innerWidth / 2;
    smoothedMouseRef.current.y = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Satellite 1: Cursor Orbit
    const cursorSat = cursorSatelliteRef.current;
    if (cursorSat) {
      let orbitAngle = 0;
      const orbitRadius = 120;
      const animateCursorOrbit = () => {
        orbitAngle += 0.02;
        smoothedMouseRef.current.x += (mouseRef.current.x - smoothedMouseRef.current.x) * 0.03;
        smoothedMouseRef.current.y += (mouseRef.current.y - smoothedMouseRef.current.y) * 0.03;
        const targetX = smoothedMouseRef.current.x + Math.cos(orbitAngle) * orbitRadius;
        const targetY = smoothedMouseRef.current.y + Math.sin(orbitAngle) * orbitRadius;
        const tangentAngle = (orbitAngle * (180 / Math.PI)) + 135;
        gsap.set(cursorSat, { x: targetX, y: targetY, rotation: tangentAngle });
        requestAnimationFrame(animateCursorOrbit);
      };
      requestAnimationFrame(animateCursorOrbit);
    }

    // Satellite 2: Free Floating
    const freeSat = freeSatelliteRef.current;
    if (freeSat) {
      gsap.set(freeSat, { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight });
      const animateFreeSat = () => {
        if (!freeSat) return;
        const newX = Math.random() * window.innerWidth;
        const newY = Math.random() * window.innerHeight;
        const currentX = gsap.getProperty(freeSat, "x") as number;
        const currentY = gsap.getProperty(freeSat, "y") as number;
        const angle = Math.atan2(newY - currentY, newX - currentX) * (180 / Math.PI);
        const dist = Math.sqrt(Math.pow(newX - currentX, 2) + Math.pow(newY - currentY, 2));
        gsap.to(freeSat, { rotation: angle + 45, duration: 1.5, ease: 'power2.inOut' });
        gsap.to(freeSat, { x: newX, y: newY, duration: dist / 40, ease: 'sine.inOut', onComplete: animateFreeSat });
      };
      animateFreeSat();
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ✅ KALAU UDAH LOGIN, TAMPILKAN PILIHAN
  if (existingSession) {
    return (
      <div className="sh-root">
        <style>{`
          .login-choice {
            background: rgba(8,10,20,.95);
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 32px;
            padding: 40px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            backdrop-filter: blur(20px);
            position: relative;
            z-index: 10;
          }
          .choice-title {
            font-size: 24px;
            font-weight: 700;
            font-family: 'Syne', sans-serif;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #c4b5fd, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .choice-email {
            color: rgba(226,232,240,.9);
            font-size: 16px;
            margin-bottom: 28px;
            padding: 12px;
            background: rgba(255,255,255,.05);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,.1);
          }
          .choice-buttons {
            display: flex;
            gap: 12px;
            flex-direction: column;
          }
          .choice-btn-primary {
            background: linear-gradient(135deg, #7c3aed, #0ea5e9);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: block;
            font-family: 'Syne', sans-serif;
            transition: all 0.2s;
          }
          .choice-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(124,58,237,0.3);
          }
          .choice-btn-secondary {
            background: rgba(255,255,255,0.05);
            color: white;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 14px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Syne', sans-serif;
            transition: all 0.2s;
          }
          .choice-btn-secondary:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.2);
          }
        `}</style>

        {/* Background stars dan meteors */}
        <div className="lg-bg">
          <div className="lg-blob lg-blob-1"/><div className="lg-blob lg-blob-2"/><div className="lg-blob lg-blob-3"/>
          <div className="lg-grid"/>
          {mounted && (
            <>
              {STARS.map(s => (
                <span key={s.id} className="lg-star" style={{
                  left:`${s.x}%`,top:`${s.y}%`,width:s.size,height:s.size,
                  '--tw-dur':`${s.dur}s`,'--tw-delay':`${s.delay}s`,'--peak':s.opacity,
                } as React.CSSProperties}/>
              ))}
              {METEORS.map(m => (
                <span key={m.id} className="lg-meteor" style={{
                  left:`${m.x}%`,top:`${m.y}%`,width:m.length,
                  '--m-dur':`${m.dur}s`,'--m-delay':`${m.delay}s`,'--m-len':`${m.length*2.5}px`,
                } as React.CSSProperties}/>
              ))}
            </>
          )}
          <div className="lg-vignette"/>
        </div>

        <div className="login-choice">
          <h2 className="choice-title">🚀 Udah Login Nih!</h2>
          <p className="choice-email">
            {existingSession.user?.email}
          </p>
          
          <div className="choice-buttons">
            <Link href="/feed" className="choice-btn-primary">
              Lanjut ke Feed
            </Link>
            
            <button 
              onClick={async () => {
                await supabase.auth.signOut()
                localStorage.clear()
                setExistingSession(null)
                window.location.reload()
              }}
              className="choice-btn-secondary"
            >
              Ganti Akun Lain
            </button>

            <Link href="/" className="lg-back" style={{marginTop:8}}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050810' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(129,140,248,.15)', borderTopColor: '#818cf8', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(formData);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Konfirmasi email dulu! Cek inbox kamu.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Email atau password salah.');
        } else {
          toast.error(error.message || 'Login gagal');
        }
        return;
      }
      if (data.session) {
  toast.success('Welcome back, Explorer! 🚀');
  router.push('/feed'); // ← langsung redirect, hapus setExistingSession
}
    } catch (err: any) {
      toast.error(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

 const handleOAuth = async (provider: 'google' | 'github') => {
  setOauthLoading(provider);
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/feed`,
      },
    });

    if (error) throw error;
  } catch (err: any) {
    toast.error(err.message || `${provider} login gagal`);
    setOauthLoading(null);
  }
};
  return (
    <div className="sh-root">
      <style>{`
        /* fonts loaded globally via next/font in layout.tsx */
        *,*::before,*::after{box-sizing:border-box;}
        .sh-root{min-height:100svh;background:#050810;color:#f0f0ff;font-family:'DM Sans',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px 20px;position:relative;overflow:hidden;}
        
        .lg-wrap{position:relative;z-index:10;width:100%;max-width:460px;animation:fadeUp .85s cubic-bezier(.16,1,.3,1) .08s both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}

        /* ── HEADER ── */
        .lg-header{text-align:center;margin-bottom:32px;}
        .lg-title{font-family:'DM Serif Display',Georgia,serif;font-size:2.4rem;line-height:1.05;letter-spacing:-.025em;margin:0 0 10px;}
        .lg-sub{font-size:.9rem;font-weight:300;color:rgba(180,185,220,.6);line-height:1.6;margin:0;}
        .tg{background:linear-gradient(110deg,#c4b5fd 0%,#818cf8 40%,#38bdf8 70%,#34d399 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% auto;animation:gradMove 6s ease infinite;}
        @keyframes gradMove{0%,100%{background-position:0% center}50%{background-position:100% center}}

        /* ── CARD ── */
        .lg-card{position:relative;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:32px;backdrop-filter:blur(30px) saturate(200%);-webkit-backdrop-filter:blur(30px) saturate(200%);padding:40px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 40px 100px rgba(0,0,0,.5),0 0 80px rgba(124,58,237,.05);overflow:hidden;}
        .lg-card::before{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,.02),transparent);transform:skewX(-20deg);transition:all .8s;}
        .lg-card:hover::before{left:150%;}

        /* ── OAUTH ── */
        .oauth-row{display:flex;gap:10px;margin-bottom:24px;}
        .oauth-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:9px;padding:13px 16px;border-radius:14px;font-size:13.5px;font-weight:600;font-family:'Syne',sans-serif;color:rgba(220,225,255,.85);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);cursor:pointer;transition:background .2s,border-color .2s,transform .2s,box-shadow .2s;}
        .oauth-btn:hover:not(:disabled){background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.16);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.25);}
        .oauth-btn:disabled{opacity:.42;cursor:not-allowed;}

        /* ── DIVIDER ── */
        .or-divider{display:flex;align-items:center;gap:12px;margin-bottom:24px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:rgba(110,115,155,.45);font-family:'Syne',sans-serif;}
        .or-line{flex:1;height:1px;background:rgba(255,255,255,.07);}

        /* ── FIELDS ── */
        .field-group{display:flex;flex-direction:column;gap:18px;margin-bottom:22px;}
        .field-label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(175,180,220,.65);font-family:'Syne',sans-serif;margin-bottom:8px;}
        .field-wrap{position:relative;}
        .field-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:rgba(120,125,175,.45);pointer-events:none;}
        .field-input{width:100%;padding:13px 15px 13px 44px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:14px;color:rgba(225,230,255,.92);font-size:14.5px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;}
        .field-input::placeholder{color:rgba(100,105,150,.38);}
        .field-input:focus{border-color:rgba(124,58,237,.55);background:rgba(124,58,237,.04);box-shadow:0 0 0 3px rgba(124,58,237,.1);}
        .field-input-pr{padding-right:46px;}
        .field-eye{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(120,125,175,.45);display:flex;padding:4px;transition:color .2s;border-radius:6px;}
        .field-eye:hover{color:rgba(190,195,240,.8);}

        /* ── FORGOT ── */
        .forgot-row{display:flex;justify-content:flex-end;margin-bottom:20px;}
        .forgot-link{font-size:12px;font-weight:600;color:rgba(167,139,250,.7);text-decoration:none;font-family:'Syne',sans-serif;transition:color .2s;}
        .forgot-link:hover{color:rgba(196,181,253,.95);}

        /* ── SUBMIT ── */
        .submit-btn{width:100%;padding:14px 24px;background:linear-gradient(135deg,#7c3aed,#0ea5e9);border:none;border-radius:16px;color:#fff;font-size:15px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;position:relative;overflow:hidden;transition:transform .2s cubic-bezier(.175,.885,.32,1.275),box-shadow .3s;box-shadow:0 4px 20px rgba(124,58,237,.3);}
        .submit-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s;}
        .submit-btn:hover::before{opacity:1;}
        .submit-btn::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);transition:left .5s ease;}
        .submit-btn:hover::after{left:150%;}
        .submit-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.02);box-shadow:0 0 40px rgba(124,58,237,.45),0 8px 30px rgba(0,0,0,.4);}
        .submit-btn:disabled{opacity:.42;cursor:not-allowed;transform:none;box-shadow:none;}

        /* ── BOTTOM ── */
        .lg-bottom{margin-top:24px;text-align:center;}
        .lg-bottom p{font-size:13.5px;color:rgba(135,140,180,.6);margin:0 0 10px;}
        .lg-link{color:rgba(167,139,250,.85);font-weight:600;text-decoration:none;font-family:'Syne',sans-serif;display:inline-flex;align-items:center;gap:4px;transition:color .2s;}
        .lg-link:hover{color:rgba(196,181,253,1);}
        .lg-back{font-size:12px;color:rgba(95,100,140,.45);text-decoration:none;display:inline-flex;align-items:center;gap:4px;font-family:'Syne',sans-serif;transition:color .2s;}
        .lg-back:hover{color:rgba(155,160,200,.75);}

        @keyframes spin{to{transform:rotate(360deg)}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
      `}</style>

      {/* ── SATELLITE 1: Cursor Orbit ── */}
      <div ref={cursorSatelliteRef} style={{ position: 'fixed', top: -24, left: -24, zIndex: 0, pointerEvents: 'none', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '150%', height: '150%', background: '#818cf8', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.6 }}></div>
        <Satellite size={32} color="#ffffff" style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }} />
      </div>

      {/* ── SATELLITE 2: Free Floating ── */}
      <div ref={freeSatelliteRef} style={{ position: 'fixed', top: -32, left: -32, zIndex: 0, pointerEvents: 'none', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '150%', height: '150%', background: '#f59e0b', borderRadius: '50%', filter: 'blur(25px)', opacity: 0.4 }}></div>
        <div style={{ transform: 'perspective(600px) rotateX(45deg) rotateY(-15deg)', filter: 'drop-shadow(10px 20px 15px rgba(0,0,0,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      </div>

      {/* CONTENT */}
      <div className="lg-wrap">
        <div className="lg-header">
          <h1 className="lg-title">Welcome<br/><span className="tg">Back, Explorer</span></h1>
          <p className="lg-sub">Your cosmos awaits. Sign in to continue.</p>
        </div>

        <div className="lg-card">
          {/* OAuth buttons */}
          <div className="oauth-row">
            <button className="oauth-btn" onClick={()=>handleOAuth('google')} disabled={!!oauthLoading||loading}>
              {oauthLoading==='google'
                ? <Loader2 style={{width:15,height:15,animation:'spin 1s linear infinite'}}/>
                : (
                  <svg width="16" height="16" viewBox="0 0 24 24" style={{flexShrink:0}}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )
              }
              Google
            </button>
            <button className="oauth-btn" onClick={()=>handleOAuth('github')} disabled={!!oauthLoading||loading}>
              {oauthLoading==='github'
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
              <div>
                <label className="field-label">Email</label>
                <div className="field-wrap">
                  <Mail className="field-icon" style={{width:16,height:16}}/>
                  <input type="email" className="field-input" placeholder="astro@explorer.com"
                    value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}
                    required autoComplete="email"/>
                </div>
              </div>
              <div>
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <Lock className="field-icon" style={{width:16,height:16}}/>
                  <input type={showPassword?'text':'password'} className="field-input field-input-pr"
                    placeholder="••••••••" value={formData.password}
                    onChange={e=>setFormData({...formData,password:e.target.value})}
                    required autoComplete="current-password"/>
                  <button type="button" className="field-eye" onClick={()=>setShowPassword(v=>!v)} tabIndex={-1}>
                    {showPassword?<EyeOff style={{width:15,height:15}}/>:<Eye style={{width:15,height:15}}/>}
                  </button>
                </div>
              </div>
            </div>

            <div className="forgot-row">
              <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="submit-btn" disabled={loading||!!oauthLoading}>
              {loading
                ? <><Loader2 style={{width:16,height:16,animation:'spin 1s linear infinite'}}/>Signing in…</>
                : <><Star style={{width:15,height:15}}/>Sign In<ArrowRight style={{width:15,height:15}}/></>
              }
            </button>
          </form>

          <div className="lg-bottom">
            <p>No account yet?{' '}
              <Link href="/register" className="lg-link">
                Create one free <ArrowRight style={{width:12,height:12}}/>
              </Link>
            </p>
            <Link href="/" className="lg-back">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}