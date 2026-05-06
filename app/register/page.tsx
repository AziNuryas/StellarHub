'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Mail, Lock, Eye, EyeOff, User,
  ArrowRight, Loader2, Sparkles, Github,
} from 'lucide-react';

/* ── password strength ── */
function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Stellar 🚀'];
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#10b981', '#818cf8'];

export default function RegisterPage() {
  const supabase = createClient();
  const router   = useRouter();
  const [mounted,      setMounted]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData,     setFormData]     = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });
  const strength = getStrength(formData.password);

  useEffect(() => { setMounted(true); }, []);

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || `${provider} sign-in failed`);
      setOauthLoading(null);
    }
  };

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

      // Insert profile kalau user berhasil dibuat
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: formData.username || formData.email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
          bio: 'Space Explorer',
          verified: false,
        });
        // Log kalau ada error profile tapi jangan throw — user tetap bisa lanjut
        if (profileError) console.warn('Profile insert warning:', profileError.message);
      }

      // ✅ FIX: Cek apakah session langsung tersedia (email confirm OFF)
      if (data.session) {
        // Session langsung ada — user bisa langsung masuk
        toast.success('🎉 Account created! Launching into orbit…');
        router.push('/feed');
        router.refresh();
        return;
      }

      // ✅ FIX: Session belum ada, coba signIn manual
      // Ini terjadi kalau email confirm masih ON di Supabase
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (!loginErr) {
        // Login berhasil
        toast.success('🎉 Account created! Launching into orbit…');
        router.push('/feed');
        router.refresh();
      } else {
        // Email confirmation required — kasih tau user cek email
        toast.success('✉️ Account created! Please check your email to confirm your account.');
        router.push('/login');
      }

    } catch (err: any) {
      // Handle error spesifik
      if (err.message?.includes('User already registered')) {
        toast.error('Email already in use. Try logging in instead.');
      } else if (err.message?.includes('Password should be')) {
        toast.error('Password too weak. Use at least 6 characters.');
      } else {
        toast.error(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-reg-root">
      <style>{`
        /* fonts loaded globally via next/font in layout.tsx */

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

        /* ── WRAP ── */
        .rg-wrap {
          position:relative; z-index:10;
          width:100%; max-width:480px;
          animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .08s both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }

        /* ── HEADER ── */
        .rg-header { text-align:center; margin-bottom:30px; }
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
          position:relative;
          background:rgba(255,255,255,.02);
          border:1px solid rgba(255,255,255,.05);
          border-radius:32px;
          backdrop-filter:blur(30px) saturate(200%);
          -webkit-backdrop-filter:blur(30px) saturate(200%);
          padding:40px;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 40px 100px rgba(0,0,0,.5),0 0 80px rgba(124,58,237,.05);
          overflow:hidden;
        }
        .rg-card::before{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,.02),transparent);transform:skewX(-20deg);transition:all .8s;}
        .rg-card:hover::before{left:150%;}

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

        /* OAuth */
        .oauth-row{display:flex;gap:10px;margin-bottom:24px;}
        .oauth-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:9px;padding:13px 16px;border-radius:14px;font-size:13.5px;font-weight:600;font-family:'Syne',sans-serif;color:rgba(220,225,255,.85);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);cursor:pointer;transition:background .2s,border-color .2s,transform .2s,box-shadow .2s;}
        .oauth-btn:hover:not(:disabled){background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.16);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.25);}
        .oauth-btn:disabled{opacity:.42;cursor:not-allowed;}

        /* Divider */
        .or-divider{display:flex;align-items:center;gap:12px;margin-bottom:24px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:rgba(110,115,155,.45);font-family:'Syne',sans-serif;}
        .or-line{flex:1;height:1px;background:rgba(255,255,255,.07);}

        /* 2-col row on wider */
        .rg-row { display:grid; gap:16px; }
        @media(min-width:400px) { .rg-row { grid-template-columns:1fr 1fr; } }

        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>


      {/* ── CONTENT ── */}
      <div className="rg-wrap">
        <div className="rg-header">
          <h1 className="rg-title">
            Begin Your<br/>
            <span className="tg">Journey</span>
          </h1>
          <p className="rg-sub">Create your free account and explore the cosmos.</p>
        </div>

        <div className="rg-card">
          {/* OAuth Buttons */}
          <div className="oauth-row">
            <button type="button" className="oauth-btn" onClick={() => handleOAuth('google')} disabled={!!oauthLoading || loading}>
              {oauthLoading === 'google'
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
            <button type="button" className="oauth-btn" onClick={() => handleOAuth('github')} disabled={!!oauthLoading || loading}>
              {oauthLoading === 'github'
                ? <Loader2 style={{width:15,height:15,animation:'spin 1s linear infinite'}}/>
                : <Github style={{width:15,height:15}}/>
              }
              GitHub
            </button>
          </div>

          <div className="or-divider">
            <span className="or-line"/>or sign up with email<span className="or-line"/>
          </div>

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