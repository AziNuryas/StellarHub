'use client'

import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  Rocket, LayoutDashboard, Sparkles, Menu, X,
  Compass, Users, Star, Bell, Search,
  LogOut, Settings, User, ChevronDown, Heart
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type NavMode = 'landing' | 'auth' | 'app'

/* ─────────────────────────────────────────────────────
   LOGO COMPONENT
───────────────────────────────────────────────────── */
function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const isSmall = size === 'sm'
  return (
    <Link href="/" className="nav-logo-link">
      <div className={`nav-logo-icon ${isSmall ? 'nav-logo-sm' : ''}`}>
        <div className="nav-logo-glow" />
        <div className="nav-logo-box">
          <Rocket style={{ width: isSmall ? 14 : 16, height: isSmall ? 14 : 16, color: '#fff' }} />
        </div>
      </div>
      <div className="nav-logo-text">
        <span className="nav-logo-name">StellarHub</span>
        <span className="nav-logo-sub">Space Platform</span>
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────────────
   LANDING NAVBAR (PUBLIC - selalu tampil untuk non-login)
───────────────────────────────────────────────────── */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Close mobile on resize
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
  ]

  return (
    <>
      <NavStyles />
      <nav className={`sh-nav sh-nav--landing ${scrolled ? 'sh-nav--scrolled' : ''}`}>
        <div className="sh-nav__bar">
          <Logo />
          <div className="sh-nav__links sh-nav__links--desktop">
            {links.map(l => (
              <a key={l.label} href={l.href} className="nav-link">
                {l.label}
              </a>
            ))}
          </div>
          <div className="sh-nav__actions sh-nav__actions--desktop">
            {/* ✅ SELALU ke /login, jangan conditional! */}
            <Link href="/login" className="nav-link">Sign In</Link>
            <Link href="/register" className="nav-btn-primary">
              <Sparkles style={{ width: 13, height: 13 }} />
              Get Started
            </Link>
          </div>
          <button
            className={`nav-mobile-toggle ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="ham-line ham-line--1" />
            <span className="ham-line ham-line--2" />
            <span className="ham-line ham-line--3" />
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`nav-mobile-drawer ${mobileOpen ? 'is-open' : ''}`} aria-hidden={!mobileOpen}>
          <div className="nav-mobile-inner">
            {links.map(l => (
              <a key={l.label} href={l.href} className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="nav-mobile-divider" />
            {/* ✅ Mobile juga selalu ke /login dan /register */}
            <Link href="/login" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link href="/register" className="nav-btn-primary nav-btn-full" onClick={() => setMobileOpen(false)}>
              <Sparkles style={{ width: 13, height: 13 }} />
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

/* ─────────────────────────────────────────────────────
   AUTH NAVBAR (halaman login/register)
───────────────────────────────────────────────────── */
function AuthNav() {
  return (
    <>
      <NavStyles />
      <nav className="sh-nav sh-nav--auth sh-nav--scrolled">
        <div className="sh-nav__bar">
          <Logo size="sm" />
          <div className="nav-auth-status">
            <span className="nav-auth-dot" />
            <span className="nav-auth-label">Secure Connection</span>
          </div>
        </div>
      </nav>
    </>
  )
}

/* ─────────────────────────────────────────────────────
   APP NAVBAR (sudah login)
───────────────────────────────────────────────────── */
function AppNav() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Close mobile on resize
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // ✅ Redirect ke landing page, jangan pake window.location
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/feed',      icon: Compass,         label: 'Feed'      },
    { href: '/explore',   icon: Search,          label: 'Explore'   },
    { href: '/community', icon: Users,           label: 'Community' },
    { href: '/nasa',      icon: Star,            label: 'NASA'      },
  ]

  const username = (user as any)?.username || (user as any)?.email?.split('@')[0] || 'Explorer'
  const email = (user as any)?.email || ''
  const avatarLetter = username.charAt(0).toUpperCase()

  return (
    <>
      <NavStyles />
      <nav className="sh-nav sh-nav--app sh-nav--scrolled">
        <div className="sh-nav__bar">
          <Logo size="sm" />

          {/* Desktop nav links */}
          <div className="sh-nav__links sh-nav__links--app">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href}
                  className={`nav-link nav-link--app ${active ? 'is-active' : ''}`}>
                  <Icon style={{ width: 14, height: 14 }} />
                  {label}
                  {active && <span className="nav-link-pill" />}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="sh-nav__actions">

            {/* Notifications */}
            <div ref={notifRef} className="nav-icon-btn-wrap">
              <button
                className="nav-icon-btn"
                onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
                aria-label="Notifications"
              >
                <Bell style={{ width: 15, height: 15 }} />
                <span className="nav-notif-dot" />
              </button>
              <div className={`nav-dropdown nav-notif-panel ${notifOpen ? 'is-open' : ''}`}>
                <div className="nav-dropdown-header">
                  <span className="nav-dropdown-title">Notifications</span>
                  <span className="nav-badge-count">3 new</span>
                </div>
                {[
                  { icon: Star, text: 'NASA posted a new APOD image', time: '2m ago', dot: '#a78bfa' },
                  { icon: Heart, text: 'Alex Chen liked your post', time: '8m ago', dot: '#f472b6' },
                  { icon: Users, text: '5 new explorers joined', time: '1h ago', dot: '#38bdf8' },
                ].map((n, i) => (
                  <div key={i} className="nav-notif-item">
                    <div className="nav-notif-icon" style={{ background: `${n.dot}22`, border: `1px solid ${n.dot}33` }}>
                      <n.icon style={{ width: 11, height: 11, color: n.dot }} />
                    </div>
                    <div className="nav-notif-content">
                      <p className="nav-notif-text">{n.text}</p>
                      <p className="nav-notif-time">{n.time}</p>
                    </div>
                  </div>
                ))}
                <div className="nav-dropdown-footer">
                  <Link href="/notifications" className="nav-dropdown-all">View all</Link>
                </div>
              </div>
            </div>

            {/* Profile dropdown */}
            <div ref={profileRef} className="nav-profile-wrap">
              <button
                className={`nav-profile-btn ${profileOpen ? 'is-open' : ''}`}
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
              >
                <div className="nav-avatar">{avatarLetter}</div>
                <span className="nav-username">{username}</span>
                <ChevronDown className={`nav-chevron ${profileOpen ? 'is-rotated' : ''}`} style={{ width: 12, height: 12 }} />
              </button>

              <div className={`nav-dropdown nav-profile-dropdown ${profileOpen ? 'is-open' : ''}`}>
                {/* User header */}
                <div className="nav-profile-header">
                  <div className="nav-avatar nav-avatar--lg">{avatarLetter}</div>
                  <div className="nav-profile-info">
                    <p className="nav-profile-name">{username}</p>
                    <p className="nav-profile-email">{email}</p>
                  </div>
                </div>

                <div className="nav-dropdown-body">
                  {[
                    { href: '/profile',   icon: User,           label: 'Profile'   },
                    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { href: '/settings',  icon: Settings,       label: 'Settings'  },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href} className="nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                      <Icon style={{ width: 14, height: 14, color: 'rgba(160,165,210,0.55)' }} />
                      {label}
                    </Link>
                  ))}
                  <div className="nav-dropdown-sep" />
                  <button className="nav-dropdown-item nav-dropdown-item--danger" onClick={handleSignOut}>
                    <LogOut style={{ width: 14, height: 14 }} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              className={`nav-mobile-toggle ${mobileOpen ? 'is-open' : ''}`}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span className="ham-line ham-line--1" />
              <span className="ham-line ham-line--2" />
              <span className="ham-line ham-line--3" />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`nav-mobile-drawer ${mobileOpen ? 'is-open' : ''}`}>
          <div className="nav-mobile-inner">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href}
                  className={`nav-mobile-link nav-mobile-link--icon ${active ? 'is-active' : ''}`}
                  onClick={() => setMobileOpen(false)}>
                  <Icon style={{ width: 16, height: 16 }} />
                  {label}
                </Link>
              )
            })}
            <div className="nav-mobile-divider" />
            <Link href="/settings" className="nav-mobile-link nav-mobile-link--icon" onClick={() => setMobileOpen(false)}>
              <Settings style={{ width: 16, height: 16 }} />
              Settings
            </Link>
            <button className="nav-mobile-link nav-mobile-link--icon nav-mobile-link--danger" onClick={handleSignOut}>
              <LogOut style={{ width: 16, height: 16 }} />
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

/* ─────────────────────────────────────────────────────
   ALL NAVBAR STYLES (no external CSS files needed)
───────────────────────────────────────────────────── */
function NavStyles() {
  return (
    <style>{`
      /* ── FONTS (only if not loaded in root layout) ── */
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

      /* ── BASE ── */
      .sh-nav {
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 1000;
        isolation: isolate;
      }

      /* ── BACKGROUND LAYER ── */
      .sh-nav::before {
        content: '';
        position: absolute;
        inset: 0;
        transition: background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease;
        border-bottom: 1px solid transparent;
        z-index: -1;
      }

      /* Landing: transparent by default */
      .sh-nav--landing::before {
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      .sh-nav--landing.sh-nav--scrolled::before,
      .sh-nav--app::before,
      .sh-nav--auth::before {
        background: rgba(5,8,16,0.78);
        backdrop-filter: blur(20px) saturate(160%);
        -webkit-backdrop-filter: blur(20px) saturate(160%);
        border-bottom-color: rgba(255,255,255,0.07);
        box-shadow: 0 1px 40px rgba(0,0,0,0.45);
      }

      /* App nav: slightly deeper glass */
      .sh-nav--app::before {
        background: rgba(5,8,16,0.82);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
      }

      /* ── NAVBAR BAR ── */
      .sh-nav__bar {
        position: relative;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        height: 64px;
        display: flex;
        align-items: center;
        gap: 16px;
      }

      /* ── LOGO ── */
      .nav-logo-link {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        flex-shrink: 0;
      }
      .nav-logo-icon {
        position: relative;
        width: 38px; height: 38px;
        flex-shrink: 0;
      }
      .nav-logo-sm { width: 34px; height: 34px; }
      .nav-logo-glow {
        position: absolute;
        inset: -4px;
        border-radius: 14px;
        background: rgba(99,102,241,0.25);
        filter: blur(8px);
        opacity: 0;
        transition: opacity 0.3s;
      }
      .nav-logo-link:hover .nav-logo-glow { opacity: 1; }
      .nav-logo-box {
        position: relative;
        width: 100%; height: 100%;
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #6366f1, #0ea5e9);
        box-shadow: 0 0 20px rgba(99,102,241,0.3);
        transition: transform 0.2s;
      }
      .nav-logo-link:hover .nav-logo-box { transform: scale(1.05) rotate(-2deg); }
      .nav-logo-text { display: flex; flex-direction: column; line-height: 1; }
      .nav-logo-name {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 1.05rem;
        letter-spacing: -0.02em;
        background: linear-gradient(120deg, #c4b5fd, #818cf8, #38bdf8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .nav-logo-sub {
        font-size: 9px;
        color: rgba(160,165,200,0.45);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        margin-top: 3px;
        font-weight: 500;
      }

      /* ── DESKTOP LINKS ── */
      .sh-nav__links {
        display: none;
        align-items: center;
        gap: 4px;
      }
      @media (min-width: 768px) {
        .sh-nav__links { display: flex; }
        .sh-nav__links--app { flex: 1; justify-content: center; }
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 7px 14px;
        border-radius: 12px;
        font-size: 13.5px;
        font-weight: 500;
        color: rgba(180,185,220,0.7);
        text-decoration: none;
        transition: color 0.2s, background 0.2s;
        position: relative;
        font-family: 'DM Sans', sans-serif;
        white-space: nowrap;
      }
      .nav-link:hover {
        color: rgba(240,240,255,0.95);
        background: rgba(255,255,255,0.055);
      }

      /* App link active state */
      .nav-link--app.is-active {
        color: rgba(240,240,255,0.95);
        background: rgba(255,255,255,0.07);
      }
      .nav-link-pill {
        position: absolute;
        inset: 0;
        border-radius: 12px;
        border: 1px solid rgba(99,102,241,0.3);
        background: rgba(99,102,241,0.1);
        pointer-events: none;
        animation: pillIn 0.25s ease both;
      }
      @keyframes pillIn {
        from { opacity: 0; transform: scale(0.94); }
        to   { opacity: 1; transform: scale(1); }
      }

      /* ── DESKTOP ACTIONS ── */
      .sh-nav__actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
        flex-shrink: 0;
      }
      .sh-nav__actions--desktop { display: none; }
      @media (min-width: 768px) {
        .sh-nav__actions--desktop { display: flex; }
      }

      /* ── PRIMARY BTN ── */
      .nav-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 18px;
        border-radius: 12px;
        font-size: 13.5px;
        font-weight: 700;
        color: #fff !important;
        text-decoration: none;
        background: linear-gradient(135deg, #6366f1, #0ea5e9);
        border: none;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
        font-family: 'Syne', sans-serif;
        letter-spacing: -0.01em;
        position: relative;
        overflow: hidden;
        white-space: nowrap;
        -webkit-text-fill-color: #fff;
      }
      .nav-btn-primary::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
        opacity: 0;
        transition: opacity 0.3s;
      }
      .nav-btn-primary:hover { transform: translateY(-1px) scale(1.04); box-shadow: 0 0 24px rgba(99,102,241,0.45); }
      .nav-btn-primary:hover::before { opacity: 1; }
      .nav-btn-primary:active { transform: scale(0.97); }
      .nav-btn-full { width: 100%; justify-content: center; }

      /* ── AUTH STATUS ── */
      .nav-auth-status {
        display: flex; align-items: center; gap: 8px;
        font-size: 10px;
        color: rgba(160,165,200,0.5);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-weight: 600;
        margin-left: auto;
        font-family: 'Syne', sans-serif;
      }
      .nav-auth-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px rgba(16,185,129,0.7);
        animation: authPulse 2s ease-in-out infinite;
      }
      @keyframes authPulse {
        0%, 100% { box-shadow: 0 0 6px rgba(16,185,129,0.7); }
        50% { box-shadow: 0 0 14px rgba(16,185,129,0.9), 0 0 22px rgba(16,185,129,0.3); }
      }
      @media (min-width: 768px) { .nav-auth-label { display: inline; } }
      .nav-auth-label { display: none; }
      @media (min-width: 480px) { .nav-auth-label { display: inline; } }

      /* ── ICON BUTTON ── */
      .nav-icon-btn-wrap { position: relative; }
      .nav-icon-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px; height: 36px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
        color: rgba(180,185,220,0.7);
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s, color 0.2s;
      }
      .nav-icon-btn:hover {
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.14);
        color: rgba(240,240,255,0.9);
      }
      .nav-notif-dot {
        position: absolute;
        top: 6px; right: 6px;
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #6366f1;
        box-shadow: 0 0 6px rgba(99,102,241,0.7);
        border: 1.5px solid rgba(5,8,16,0.8);
        animation: notifPop 0.4s ease both;
      }
      @keyframes notifPop {
        from { transform: scale(0); }
        to   { transform: scale(1); }
      }

      /* ── PROFILE BTN ── */
      .nav-profile-wrap { position: relative; }
      .nav-profile-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px 4px 4px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.09);
        background: rgba(255,255,255,0.04);
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
      }
      .nav-profile-btn:hover,
      .nav-profile-btn.is-open {
        background: rgba(255,255,255,0.07);
        border-color: rgba(255,255,255,0.14);
      }
      .nav-avatar {
        width: 28px; height: 28px;
        border-radius: 8px;
        background: linear-gradient(135deg, #6366f1, #0ea5e9);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px;
        font-weight: 800;
        color: #fff;
        font-family: 'Syne', sans-serif;
        flex-shrink: 0;
      }
      .nav-avatar--lg {
        width: 38px; height: 38px;
        border-radius: 11px;
        font-size: 16px;
      }
      .nav-username {
        font-size: 13px;
        font-weight: 600;
        color: rgba(220,225,255,0.85);
        font-family: 'DM Sans', sans-serif;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: none;
      }
      @media (min-width: 480px) { .nav-username { display: block; } }
      .nav-chevron {
        color: rgba(160,165,200,0.45);
        transition: transform 0.25s ease;
        flex-shrink: 0;
      }
      .nav-chevron.is-rotated { transform: rotate(180deg); }

      /* ── DROPDOWN BASE ── */
      .nav-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        background: rgba(8,12,24,0.95);
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 20px;
        box-shadow: 0 8px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
        backdrop-filter: blur(28px) saturate(160%);
        -webkit-backdrop-filter: blur(28px) saturate(160%);
        overflow: hidden;
        /* CSS-only open/close */
        opacity: 0;
        transform: translateY(-8px) scale(0.97);
        pointer-events: none;
        transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 100;
      }
      .nav-dropdown.is-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      /* ── NOTIF PANEL ── */
      .nav-notif-panel { width: 300px; right: -40px; }
      @media (max-width: 479px) { .nav-notif-panel { right: -80px; width: 280px; } }

      .nav-dropdown-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 10px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .nav-dropdown-title {
        font-size: 12px;
        font-weight: 700;
        color: rgba(220,225,255,0.9);
        font-family: 'Syne', sans-serif;
        letter-spacing: 0.04em;
      }
      .nav-badge-count {
        font-size: 10px;
        font-weight: 700;
        color: #a78bfa;
        background: rgba(167,139,250,0.12);
        border: 1px solid rgba(167,139,250,0.2);
        padding: 2px 8px;
        border-radius: 100px;
        font-family: 'Syne', sans-serif;
      }
      .nav-notif-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 14px;
        transition: background 0.15s;
      }
      .nav-notif-item:hover { background: rgba(255,255,255,0.03); }
      .nav-notif-icon {
        width: 28px; height: 28px;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .nav-notif-content { flex: 1; min-width: 0; }
      .nav-notif-text {
        font-size: 12px;
        color: rgba(200,205,240,0.8);
        line-height: 1.4;
        font-weight: 400;
      }
      .nav-notif-time {
        font-size: 10px;
        color: rgba(140,145,180,0.5);
        margin-top: 3px;
        font-weight: 500;
      }
      .nav-dropdown-footer {
        padding: 10px 14px 12px;
        border-top: 1px solid rgba(255,255,255,0.06);
        text-align: center;
      }
      .nav-dropdown-all {
        font-size: 12px;
        font-weight: 700;
        color: rgba(167,139,250,0.75);
        text-decoration: none;
        font-family: 'Syne', sans-serif;
        transition: color 0.2s;
      }
      .nav-dropdown-all:hover { color: rgba(167,139,250,1); }

      /* ── PROFILE DROPDOWN ── */
      .nav-profile-dropdown { width: 220px; }

      .nav-profile-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 14px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }
      .nav-profile-info { flex: 1; min-width: 0; }
      .nav-profile-name {
        font-size: 13.5px;
        font-weight: 700;
        color: rgba(235,238,255,0.95);
        font-family: 'Syne', sans-serif;
        letter-spacing: -0.01em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .nav-profile-email {
        font-size: 10.5px;
        color: rgba(140,145,180,0.55);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 2px;
      }

      .nav-dropdown-body { padding: 8px; }
      .nav-dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border-radius: 10px;
        font-size: 13px;
        color: rgba(195,200,235,0.75);
        text-decoration: none;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        transition: background 0.15s, color 0.15s;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
      }
      .nav-dropdown-item:hover {
        background: rgba(255,255,255,0.05);
        color: rgba(235,238,255,0.95);
      }
      .nav-dropdown-item--danger { color: rgba(248,113,113,0.8); }
      .nav-dropdown-item--danger:hover {
        background: rgba(239,68,68,0.08);
        color: rgba(252,165,165,0.9);
      }
      .nav-dropdown-sep {
        height: 1px;
        background: rgba(255,255,255,0.06);
        margin: 4px 0;
      }

      /* ── HAMBURGER ── */
      .nav-mobile-toggle {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
        width: 38px; height: 38px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.09);
        background: rgba(255,255,255,0.04);
        cursor: pointer;
        padding: 0;
        transition: background 0.2s, border-color 0.2s;
        flex-shrink: 0;
      }
      .nav-mobile-toggle:hover {
        background: rgba(255,255,255,0.07);
        border-color: rgba(255,255,255,0.14);
      }
      @media (min-width: 768px) { .nav-mobile-toggle { display: none; } }

      .ham-line {
        display: block;
        width: 18px;
        height: 1.5px;
        border-radius: 2px;
        background: rgba(200,205,240,0.7);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, width 0.3s ease;
        transform-origin: center;
      }
      .nav-mobile-toggle.is-open .ham-line--1 {
        transform: translateY(6.5px) rotate(45deg);
      }
      .nav-mobile-toggle.is-open .ham-line--2 {
        opacity: 0;
        transform: scaleX(0);
      }
      .nav-mobile-toggle.is-open .ham-line--3 {
        transform: translateY(-6.5px) rotate(-45deg);
      }

      /* ── MOBILE DRAWER ── */
      .nav-mobile-drawer {
        position: relative;
        overflow: hidden;
        max-height: 0;
        transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        opacity: 0;
      }
      .nav-mobile-drawer.is-open {
        max-height: 480px;
        opacity: 1;
      }

      .nav-mobile-inner {
        margin: 0 12px 12px;
        padding: 10px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.09);
        background: rgba(5,8,16,0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .nav-mobile-link {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        color: rgba(180,185,220,0.7);
        text-decoration: none;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        transition: background 0.18s, color 0.18s;
        font-family: 'DM Sans', sans-serif;
      }
      .nav-mobile-link--icon { gap: 12px; }
      .nav-mobile-link:hover {
        background: rgba(255,255,255,0.05);
        color: rgba(235,238,255,0.9);
      }
      .nav-mobile-link.is-active {
        background: rgba(99,102,241,0.1);
        border: 1px solid rgba(99,102,241,0.2);
        color: rgba(235,238,255,0.95);
      }
      .nav-mobile-link--danger { color: rgba(248,113,113,0.75); }
      .nav-mobile-link--danger:hover {
        background: rgba(239,68,68,0.07);
        color: rgba(252,165,165,0.9);
      }
      .nav-mobile-divider {
        height: 1px;
        background: rgba(255,255,255,0.07);
        margin: 4px 0;
      }

      /* ── REDUCED MOTION ── */
      @media (prefers-reduced-motion: reduce) {
        .sh-nav::before,
        .nav-logo-box,
        .nav-link,
        .nav-btn-primary,
        .nav-icon-btn,
        .nav-profile-btn,
        .nav-dropdown,
        .nav-mobile-drawer,
        .ham-line {
          transition-duration: 0.01ms !important;
          animation: none !important;
        }
      }
    `}</style>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT — auto-detects mode
═══════════════════════════════════════════════════════ */
export default function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()

  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuth = authPaths.some(p => pathname.startsWith(p))
  
  // ✅ PALING PENTING: LANDING PAGE HARUS PAKAI LANDING NAVBAR, MESKIPUN USER UDAH LOGIN!
  const isLanding = pathname === '/'
  
  console.log('Navbar mode:', { pathname, isLanding, isAuth, isLoggedIn: !!user })

  // ✅ PRIORITAS: 
  // 1. Landing page (/) → LandingNav
  // 2. Halaman auth (login/register) → AuthNav  
  // 3. User login & bukan landing → AppNav
  // 4. Sisanya → LandingNav (fallback)
  
  if (isLanding) {
    return <LandingNav />
  }
  
  if (isAuth) {
    return <AuthNav />
  }
  
  if (user) {
    return <AppNav />
  }
  
  return <LandingNav />
}