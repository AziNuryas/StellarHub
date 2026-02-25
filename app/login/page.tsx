'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  Rocket, Mail, Lock, Eye, EyeOff,
  Github, Loader2, ArrowRight, Star,
} from 'lucide-react';

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
const rand = seededRand(77);
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i, x: rand() * 100, y: rand() * 100,
  size: rand() * 2 + 0.5, delay: rand() * 8, dur: rand() * 5 + 4,
  opacity: rand() * 0.6 + 0.15,
}));
const METEORS = Array.from({ length: 4 }, (_, i) => ({
  id: i, x: rand() * 70 + 10, y: rand() * 40,
  delay: rand() * 12 + i * 4, dur: rand() * 0.8 + 0.6, length: rand() * 100 + 70,
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

  useEffect(() => {
    setMounted(true);
    // ✅ FIX: Cek session TAPI JANGAN REDIRECT!
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setExistingSession(session); // Simpen session, jangan redirect
      }
      setChecking(false);
    });
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
        // ✅ FIX: Set session dulu, jangan langsung redirect
        setExistingSession(data.session);
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
          redirectTo: `${siteUrl}/login`, // ✅ Redirect balik ke login, bukan callback
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        .sh-root{min-height:100svh;background:#050810;color:#f0f0ff;font-family:'DM Sans',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px 20px;position:relative;overflow:hidden;}
        .lg-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
        .lg-blob{position:absolute;border-radius:50%;filter:blur(80px);}
        .lg-blob-1{width:600px;height:600px;top:-200px;left:-150px;background:radial-gradient(circle,rgba(124,58,237,.18) 0%,transparent 70%);animation:blobP 13s ease-in-out infinite;}
        .lg-blob-2{width:500px;height:500px;bottom:-150px;right:-120px;background:radial-gradient(circle,rgba(14,165,233,.13) 0%,transparent 70%);animation:blobP 16s ease-in-out 6s infinite;}
        .lg-blob-3{width:280px;height:280px;top:40%;left:60%;background:radial-gradient(circle,rgba(244,114,182,.07) 0%,transparent 70%);animation:blobP 19s ease-in-out 3s infinite;}
        @keyframes blobP{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
        .lg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,black 0%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,black 0%,transparent 100%);}
        .lg-vignette{position:absolute;inset:0;background:radial-gradient(ellipse 100% 100% at 50% 50%,transparent 35%,rgba(5,8,16,.7) 100%);}
        .lg-star{position:absolute;border-radius:50%;background:#fff;animation:twinkle var(--tw-dur) ease-in-out var(--tw-delay) infinite;}
        @keyframes twinkle{0%,100%{opacity:.04;transform:scale(1)}50%{opacity:var(--peak);transform:scale(1.8)}}
        .lg-meteor{position:absolute;height:1.5px;border-radius:100px;background:linear-gradient(90deg,rgba(255,255,255,.9),rgba(196,181,253,.5),transparent);transform:rotate(-30deg);opacity:0;animation:shoot var(--m-dur) ease-out var(--m-delay) infinite;}
        @keyframes shoot{0%{opacity:0;transform:rotate(-30deg) translateX(0)}5%{opacity:1}80%{opacity:.4}100%{opacity:0;transform:rotate(-30deg) translateX(var(--m-len))}}

        .lg-wrap{position:relative;z-index:10;width:100%;max-width:460px;animation:fadeUp .85s cubic-bezier(.16,1,.3,1) .08s both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}

        /* ── HEADER ── */
        .lg-header{text-align:center;margin-bottom:32px;}
        .lg-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);margin-bottom:24px;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(200,210,240,.65);font-family:'Syne',sans-serif;}
        .lg-badge-dot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;animation:dotP 2s ease-in-out infinite;flex-shrink:0;}
        @keyframes dotP{0%,100%{box-shadow:0 0 8px #10b981}50%{box-shadow:0 0 16px #10b981,0 0 24px rgba(16,185,129,.4)}}

        /* ── LOGO ── */
        .lg-logo-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;width:84px;height:84px;margin-bottom:22px;}
        .lg-logo-glow{position:absolute;inset:-10px;border-radius:28px;background:linear-gradient(135deg,rgba(124,58,237,.45),rgba(14,165,233,.35));filter:blur(18px);animation:glowP 3s ease-in-out infinite;z-index:0;}
        @keyframes glowP{0%,100%{opacity:.55}50%{opacity:1}}
        .lg-logo-box{position:relative;z-index:1;width:72px;height:72px;border-radius:22px;background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 50%,#0ea5e9 100%);display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.18);box-shadow:0 0 0 1px rgba(124,58,237,.3),0 8px 32px rgba(124,58,237,.35),inset 0 1px 0 rgba(255,255,255,.2);}

        .lg-title{font-family:'DM Serif Display',Georgia,serif;font-size:2.4rem;line-height:1.05;letter-spacing:-.025em;margin:0 0 10px;}
        .lg-sub{font-size:.9rem;font-weight:300;color:rgba(180,185,220,.6);line-height:1.6;margin:0;}
        .tg{background:linear-gradient(110deg,#c4b5fd 0%,#818cf8 40%,#38bdf8 70%,#34d399 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% auto;animation:gradMove 6s ease infinite;}
        @keyframes gradMove{0%,100%{background-position:0% center}50%{background-position:100% center}}

        /* ── CARD ── */
        .lg-card{background:rgba(255,255,255,.042);border:1px solid rgba(255,255,255,.09);border-radius:28px;backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);padding:36px;box-shadow:0 0 0 1px rgba(255,255,255,.04),0 40px 80px rgba(0,0,0,.45),0 0 80px rgba(124,58,237,.05);}

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

      {/* BG */}
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

      {/* CONTENT */}
      <div className="lg-wrap">
        <div className="lg-header">
          <div className="lg-badge">
            <span className="lg-badge-dot"/>
            StellarHub · Space Community
          </div>
          <div className="lg-logo-wrap">
            <div className="lg-logo-glow"/>
            <div className="lg-logo-box">
              <Rocket style={{width:32,height:32,color:'#fff'}}/>
            </div>
          </div>
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