'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { Logo } from './Logo'
import { 
  Bell, User, LogOut, Settings, Moon, Sun, 
  Menu, X, Sparkles, ChevronDown, 
  Home, Compass, Telescope
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

/**
 * NAVBAR CSS - Injected directly to ensure 100% stability
 */
const NAV_CSS = `
  .sh-nav { position:fixed; top:0; left:0; right:0; z-index:1000; height:64px; display:flex; align-items:center; background:rgba(9,9,11,0.85); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.1); }
  .sh-nav__bar { width:100%; max-width:1200px; margin:0 auto; padding:0 20px; display:flex; align-items:center; justify-content:space-between; }
  .sh-nav__links { display:none; align-items:center; gap:8px; }
  @media(min-width:768px){ .sh-nav__links { display:flex; } }
  .nav-link { display:flex; align-items:center; gap:8px; padding:8px 16px; border-radius:12px; font-size:14px; font-weight:500; color:#a1a1aa; text-decoration:none; transition:all 0.2s; position:relative; }
  .nav-link:hover, .nav-link.is-active { color:#fff; background:rgba(255,255,255,0.05); }
  .nav-link.is-active .nav-link-pill { position:absolute; inset:0; border-radius:12px; border:1px solid rgba(99,102,241,0.3); background:rgba(99,102,241,0.1); z-index:-1; }
  .sh-nav__actions { display:flex; align-items:center; gap:12px; }
  .nav-icon-btn { width:36px; height:36px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#a1a1aa; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; position:relative; }
  .nav-icon-btn:hover { color:#fff; background:rgba(255,255,255,0.1); }
  .nav-notif-dot { position:absolute; top:-4px; right:-4px; width:14px; height:14px; background:#ef4444; border-radius:50%; border:2px solid #09090b; }
  .nav-profile-btn { display:flex; align-items:center; gap:10px; padding:4px 12px 4px 4px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); cursor:pointer; color:#fff; transition:all 0.2s; }
  .nav-profile-btn:hover { background:rgba(255,255,255,0.1); }
  .nav-avatar { width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,#6366f1,#0ea5e9); display:flex; align-items:center; justify-content:center; font-weight:bold; overflow:hidden; }
  .nav-avatar img { width:100%; height:100%; object-fit:cover; }
  .nav-username { font-size:13px; font-weight:500; display:none; }
  @media(min-width:480px){ .nav-username { display:block; } }
  .nav-dropdown { position:absolute; top:70px; right:20px; width:240px; background:#09090b; border:1px solid rgba(255,255,255,0.1); border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.5); overflow:hidden; z-index:1100; padding:8px; }
  .nav-dropdown-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; color:#a1a1aa; text-decoration:none; font-size:13px; transition:all 0.2s; cursor:pointer; border:none; background:none; width:100%; text-align:left; }
  .nav-dropdown-item:hover { color:#fff; background:rgba(255,255,255,0.05); }
  .nav-dropdown-item--danger { color:#f87171; }
  .nav-dropdown-item--danger:hover { background:rgba(239,68,68,0.1); color:#f87171; }
  .nav-mobile-toggle { display:flex; flex-direction:column; gap:4px; width:36px; height:36px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); cursor:pointer; align-items:center; justify-content:center; }
  @media(min-width:768px){ .nav-mobile-toggle { display:none; } }
  .ham-line { width:18px; height:2px; background:#a1a1aa; border-radius:2px; transition:all 0.3s; }
  .nav-mobile-toggle.is-open .ham-line:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .nav-mobile-toggle.is-open .ham-line:nth-child(2) { opacity: 0; }
  .nav-mobile-toggle.is-open .ham-line:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
  .nav-mobile-drawer { position:fixed; top:74px; left:16px; right:16px; background:#09090b; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:8px; z-index:1000; display:flex; flex-direction:column; gap:4px; box-shadow:0 20px 40px rgba(0,0,0,0.5); }
  .nav-mobile-link { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; color:#a1a1aa; text-decoration:none; font-size:14px; font-weight:500; }
  .nav-mobile-link.is-active { color:#fff; background:rgba(99,102,241,0.1); }
`

function MainNav({ user, logout }: any) {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const links = [
    { label: 'Feed', href: '/feed', icon: Home },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'NASA', href: '/nasa', icon: Telescope },
  ]

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <nav className="sh-nav">
      <style>{NAV_CSS}</style>
      <div className="sh-nav__bar">
        <Link href="/feed" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={28} glow />
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: '-0.02em' }}>StellarHub</span>
        </Link>

        <div className="sh-nav__links">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'is-active' : ''}`}>
              <l.icon size={16} /> {l.label}
              {pathname === l.href && <div className="nav-link-pill" />}
            </Link>
          ))}
        </div>

        <div className="sh-nav__actions">
          <button className="nav-icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          
          <div className="nav-icon-btn-wrap">
            <button className="nav-icon-btn" aria-label="Notifications">
              <Bell size={18}/>
            </button>
          </div>

          <div className="nav-profile-wrap" ref={profileRef} style={{ position: 'relative' }}>
            <button className="nav-profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="nav-avatar">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : user?.username?.[0] || 'U'}
              </div>
              <span className="nav-username">{user?.username || 'User'}</span>
              <ChevronDown size={14} style={{ opacity: 0.5 }}/>
            </button>
            {profileOpen && (
              <div className="nav-dropdown">
                <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 4 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13, color: '#fff' }}>{user?.username}</div>
                  <div style={{ fontSize: 11, color: '#52525b' }}>{user?.email}</div>
                </div>
                <Link href={`/profile/${user?.username}`} className="nav-dropdown-item" onClick={() => setProfileOpen(false)}><User size={14}/> Profil Saya</Link>
                <Link href="/settings" className="nav-dropdown-item" onClick={() => setProfileOpen(false)}><Settings size={14}/> Pengaturan</Link>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                <button className="nav-dropdown-item nav-dropdown-item--danger" onClick={() => { logout(); setProfileOpen(false); }}><LogOut size={14}/> Keluar</button>
              </div>
            )}
          </div>

          <button className={`nav-mobile-toggle ${mobileOpen ? 'is-open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="ham-line" />
            <span className="ham-line" />
            <span className="ham-line" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="nav-mobile-drawer">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-mobile-link ${pathname === l.href ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}>
              <l.icon size={16}/> {l.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 8px' }} />
          <button className="nav-mobile-link" style={{ color: '#f87171', border: 'none', background: 'none', width: '100%', textAlign: 'left' }} onClick={() => { logout(); setMobileOpen(false); }}>
            <LogOut size={16}/> Keluar
          </button>
        </div>
      )}
    </nav>
  )
}

function LandingNav({ user }: any) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`sh-nav ${scrolled ? 'scrolled' : ''}`} style={{ background: scrolled ? 'rgba(9,9,11,0.9)' : 'transparent', border: 'none' }}>
      <style>{NAV_CSS}</style>
      <div className="sh-nav__bar">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={28} glow />
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>StellarHub</span>
        </Link>
        <div className="sh-nav__actions">
          {user ? (
            <Link href="/feed" style={{ padding: '8px 20px', borderRadius: 12, background: '#fff', color: '#000', fontWeight: 'bold', textDecoration: 'none', fontSize: 14 }}>Launch App</Link>
          ) : (
            <>
              <Link href="/login" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: '500' }}>Sign In</Link>
              <Link href="/register" style={{ padding: '8px 20px', borderRadius: 12, background: '#fff', color: '#000', fontWeight: 'bold', textDecoration: 'none', fontSize: 14, marginLeft: 10 }}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isLanding = pathname === '/'
  const isAuth = ['/login', '/register', '/forgot-password'].some(p => pathname?.startsWith(p))

  if (isAuth) {
    return (
      <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={28} glow />
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>StellarHub</span>
        </Link>
      </nav>
    )
  }

  if (isLanding) return <LandingNav user={user} />
  if (user) return <MainNav user={user} logout={logout} />
  
  return <LandingNav user={user} />
}