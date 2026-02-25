'use client'

import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext' // ← TAMBAHKAN
import {
  Rocket, LayoutDashboard, Sparkles, Compass, Users, Star, Bell, Search,
  LogOut, Settings, User, ChevronDown, Heart, MessageCircle, UserPlus,
  Moon, Sun, Monitor // ← TAMBAHKAN ICON THEME
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
   LANDING NAVBAR
───────────────────────────────────────────────────── */
function LandingNav({ user }: { user: any }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

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
              <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
            ))}
          </div>
          <div className="sh-nav__actions sh-nav__actions--desktop">
            {user ? (
              <>
                <Link href="/feed" className="nav-link">Feed</Link>
                <Link href="/feed" className="nav-btn-primary">
                  <Sparkles style={{ width: 13, height: 13 }} />
                  Go to Feed
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">Sign In</Link>
                <Link href="/register" className="nav-btn-primary">
                  <Sparkles style={{ width: 13, height: 13 }} />
                  Get Started
                </Link>
              </>
            )}
          </div>
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
        <div className={`nav-mobile-drawer ${mobileOpen ? 'is-open' : ''}`}>
          <div className="nav-mobile-inner">
            {links.map(l => (
              <a key={l.label} href={l.href} className="nav-mobile-link" onClick={() => setMobileOpen(false)}>{l.label}</a>
            ))}
            <div className="nav-mobile-divider" />
            {user ? (
              <>
                <Link href="/feed" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Feed</Link>
                <Link href="/profile" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Profile</Link>
                <Link href="/feed" className="nav-btn-primary nav-btn-full" onClick={() => setMobileOpen(false)}>
                  <Sparkles style={{ width: 13, height: 13 }} /> Go to Feed
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/register" className="nav-btn-primary nav-btn-full" onClick={() => setMobileOpen(false)}>
                  <Sparkles style={{ width: 13, height: 13 }} /> Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

/* ─────────────────────────────────────────────────────
   AUTH NAVBAR
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
   NOTIFICATION ITEM TYPE
───────────────────────────────────────────────────── */
interface NotifItem {
  id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
  post_id: string | null
  actor?: { username: string; avatar_url: string | null } | null
}

/* ─────────────────────────────────────────────────────
   APP NAVBAR
───────────────────────────────────────────────────── */
function AppNav() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme() // ← TAMBAHKAN
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotifItem[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Fetch avatar dari profiles table
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      })
  }, [user?.id])

  const fetchNotifs = useCallback(async (uid: string) => {
    setNotifLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('id, type, message, is_read, created_at, post_id, actor:profiles!notifications_actor_id_fkey(username, avatar_url)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) {
      const fixed = data.map(item => ({
        ...item,
        actor: Array.isArray(item.actor) ? (item.actor[0] ?? null) : (item.actor ?? null),
      })) as NotifItem[]
      setNotifications(fixed)
    }
    setNotifLoading(false)
  }, [])

  useEffect(() => {
    if (!user?.id) return

    fetchNotifs(user.id)

    const channel = supabase
      .channel('navbar-notifs-' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, async (payload: any) => {
        let newNotif = payload.new as NotifItem
        if (payload.new?.actor_id) {
          const { data: actor } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.actor_id)
            .single()
          if (actor) newNotif = { ...newNotif, actor }
        }
        setNotifications(prev => [newNotif, ...prev.slice(0, 49)])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        setNotifications(prev =>
          prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
        )
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const markAllRead = async () => {
    if (!user?.id) return
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const handleSignOut = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Gagal logout')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleNotifOpen = () => {
    setNotifOpen(v => !v)
    setProfileOpen(false)
    if (!notifOpen && unreadCount > 0 && user?.id) {
      setTimeout(() => markAllRead(), 2500)
    }
  }

  const navLinks = [
    { href: '/feed',      icon: Compass,  label: 'Feed'      },
    { href: '/explore',   icon: Search,   label: 'Explore'   },
    { href: '/community', icon: Users,    label: 'Community' },
    { href: '/nasa',      icon: Star,     label: 'NASA'      },
  ]

  const notifIconConfig: Record<string, { icon: any; color: string; bg: string }> = {
    like:    { icon: Heart,         color: '#f472b6', bg: 'rgba(244,114,182,.15)' },
    comment: { icon: MessageCircle, color: '#38bdf8', bg: 'rgba(56,189,248,.15)'  },
    follow:  { icon: UserPlus,      color: '#34d399', bg: 'rgba(52,211,153,.15)'  },
    default: { icon: Bell,          color: '#818cf8', bg: 'rgba(129,140,248,.15)' },
  }
  const getNotifIcon = (type: string) => notifIconConfig[type] ?? notifIconConfig.default

  function timeAgoShort(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const day = Math.floor(h / 24)
    if (m < 1) return 'Baru'
    if (m < 60) return `${m}m`
    if (h < 24) return `${h}j`
    return `${day}h`
  }

  const username = (user as any)?.username || (user as any)?.email?.split('@')[0] || 'Explorer'
  const email = (user as any)?.email || ''
  const avatarLetter = username.charAt(0).toUpperCase()

  return (
    <>
      <NavStyles />
      <nav className="sh-nav sh-nav--app sh-nav--scrolled">
        <div className="sh-nav__bar">
          <Logo size="sm" />

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

          <div className="sh-nav__actions">
            {/* THEME TOGGLE */}
            <button 
              className="nav-icon-btn" 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* NOTIFICATIONS */}
            <div ref={notifRef} className="nav-icon-btn-wrap">
              <button className="nav-icon-btn" onClick={handleNotifOpen} aria-label="Notifications">
                <Bell style={{ width: 15, height: 15 }} />
                {unreadCount > 0 && (
                  <span className="nav-notif-dot">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className={`nav-dropdown nav-notif-panel ${notifOpen ? 'is-open' : ''}`}>
                <div className="nav-dropdown-header">
                  <span className="nav-dropdown-title">Notifikasi</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {unreadCount > 0 && (
                      <span className="nav-badge-count">{unreadCount} baru</span>
                    )}
                    <Link href="/notifications" className="nav-notif-viewall" onClick={() => setNotifOpen(false)}>
                      Lihat Semua
                    </Link>
                  </div>
                </div>

                <div className="nav-notif-list">
                  {notifLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(140,145,180,.5)', fontSize: 13 }}>
                      Memuat...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                      <p style={{ fontSize: 13, color: 'rgba(140,145,180,.5)' }}>Belum ada notifikasi</p>
                    </div>
                  ) : notifications.slice(0, 8).map(n => {
                    const { icon: NIcon, color, bg } = getNotifIcon(n.type)
                    const actorName = n.actor?.username || 'User'
                    const actorAvatar = n.actor?.avatar_url
                    return (
                      <div key={n.id} className={`nav-notif-item ${n.is_read ? '' : 'unread'}`}>
                        <div className="nav-notif-avatar-wrap">
                          {actorAvatar ? (
                            <img src={actorAvatar} alt={actorName} className="nav-notif-avatar-img" />
                          ) : (
                            <div className="nav-notif-avatar-fallback">
                              {actorName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="nav-notif-type-badge" style={{ background: bg }}>
                            <NIcon style={{ width: 9, height: 9, color }} />
                          </div>
                        </div>
                        <div className="nav-notif-content">
                          <p className="nav-notif-text">{n.message}</p>
                          <p className="nav-notif-time">{timeAgoShort(n.created_at)}</p>
                        </div>
                        {!n.is_read && <div className="nav-notif-unread-dot" />}
                      </div>
                    )
                  })}
                </div>

                <div className="nav-dropdown-footer">
                  <Link href="/notifications" className="nav-dropdown-all" onClick={() => setNotifOpen(false)}>
                    Lihat semua notifikasi →
                  </Link>
                </div>
              </div>
            </div>

            {/* PROFILE */}
            <div ref={profileRef} className="nav-profile-wrap">
              <button
                className={`nav-profile-btn ${profileOpen ? 'is-open' : ''}`}
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={username} className="nav-avatar nav-avatar--img" />
                ) : (
                  <div className="nav-avatar">{avatarLetter}</div>
                )}
                <span className="nav-username">{username}</span>
                <ChevronDown className={`nav-chevron ${profileOpen ? 'is-rotated' : ''}`} style={{ width: 12, height: 12 }} />
              </button>

              <div className={`nav-dropdown nav-profile-dropdown ${profileOpen ? 'is-open' : ''}`}>
                <div className="nav-profile-header">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={username} className="nav-avatar nav-avatar--lg nav-avatar--img" />
                  ) : (
                    <div className="nav-avatar nav-avatar--lg">{avatarLetter}</div>
                  )}
                  <div className="nav-profile-info">
                    <p className="nav-profile-name">{username}</p>
                    <p className="nav-profile-email">{email}</p>
                  </div>
                </div>
                <div className="nav-dropdown-body">
                  {[
                    { href: '/profile',       icon: User,            label: 'Profile'     },
                    { href: '/notifications', icon: Bell,            label: 'Notifikasi', badge: unreadCount },
                    { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'   },
                    { href: '/settings',      icon: Settings,        label: 'Settings'    },
                  ].map(({ href, icon: Icon, label, badge }) => (
                    <Link key={href} href={href} className="nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                      <Icon style={{ width: 14, height: 14, color: 'rgba(160,165,210,0.55)' }} />
                      {label}
                      {badge ? (
                        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#818cf8', background: 'rgba(129,140,248,.15)', padding: '2px 6px', borderRadius: 6 }}>
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  ))}
                  <div className="nav-dropdown-sep" />
                  <button
                    className="nav-dropdown-item nav-dropdown-item--danger"
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <><div className="spinner-small" /> Signing out...</>
                    ) : (
                      <><LogOut style={{ width: 14, height: 14 }} /> Sign Out</>
                    )}
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

        <div className={`nav-mobile-drawer ${mobileOpen ? 'is-open' : ''}`}>
          <div className="nav-mobile-inner">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href}
                  className={`nav-mobile-link nav-mobile-link--icon ${active ? 'is-active' : ''}`}
                  onClick={() => setMobileOpen(false)}>
                  <Icon style={{ width: 16, height: 16 }} /> {label}
                </Link>
              )
            })}
            <div className="nav-mobile-divider" />
            <Link href="/notifications" className="nav-mobile-link nav-mobile-link--icon" onClick={() => setMobileOpen(false)}>
              <Bell style={{ width: 16, height: 16 }} />
              Notifikasi
              {unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, background: 'rgba(129,140,248,.2)', color: '#818cf8', padding: '2px 7px', borderRadius: 6 }}>{unreadCount}</span>
              )}
            </Link>
            <Link href="/settings" className="nav-mobile-link nav-mobile-link--icon" onClick={() => setMobileOpen(false)}>
              <Settings style={{ width: 16, height: 16 }} /> Settings
            </Link>
            <button
              className="nav-mobile-link nav-mobile-link--icon nav-mobile-link--danger"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <><div className="spinner-small" /> Signing out...</>
              ) : (
                <><LogOut style={{ width: 16, height: 16 }} /> Sign Out</>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

/* ─────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────── */
function NavStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

      :root {
        /* Dark theme (default) */
        --nav-bg: rgba(5,8,16,0.78);
        --nav-border: rgba(255,255,255,0.07);
        --nav-text: rgba(180,185,220,0.7);
        --nav-text-hover: rgba(240,240,255,0.95);
        --nav-accent: #6366f1;
      }

      [data-theme="light"] {
        --nav-bg: rgba(255,255,255,0.85);
        --nav-border: rgba(0,0,0,0.07);
        --nav-text: #334155;
        --nav-text-hover: #0f172a;
        --nav-accent: #7c3aed;
      }

      .sh-nav { position:fixed; top:0; left:0; right:0; z-index:1000; isolation:isolate; }
      .sh-nav::before { content:''; position:absolute; inset:0; transition:background 0.4s ease,border-color 0.4s ease,backdrop-filter 0.4s ease,box-shadow 0.4s ease; border-bottom:1px solid transparent; z-index:-1; }
      .sh-nav--landing::before { background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; }
      .sh-nav--landing.sh-nav--scrolled::before, .sh-nav--app::before, .sh-nav--auth::before { background:var(--nav-bg); backdrop-filter:blur(20px) saturate(160%); -webkit-backdrop-filter:blur(20px) saturate(160%); border-bottom-color:var(--nav-border); box-shadow:0 1px 40px rgba(0,0,0,0.45); }

      .sh-nav__bar { position:relative; max-width:1200px; margin:0 auto; padding:0 20px; height:64px; display:flex; align-items:center; gap:16px; }

      .nav-logo-link { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
      .nav-logo-icon { position:relative; width:38px; height:38px; flex-shrink:0; }
      .nav-logo-sm { width:34px; height:34px; }
      .nav-logo-glow { position:absolute; inset:-4px; border-radius:14px; background:rgba(99,102,241,0.25); filter:blur(8px); opacity:0; transition:opacity 0.3s; }
      .nav-logo-link:hover .nav-logo-glow { opacity:1; }
      .nav-logo-box { position:relative; width:100%; height:100%; border-radius:12px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#6366f1,#0ea5e9); box-shadow:0 0 20px rgba(99,102,241,0.3); transition:transform 0.2s; }
      .nav-logo-link:hover .nav-logo-box { transform:scale(1.05) rotate(-2deg); }
      .nav-logo-text { display:flex; flex-direction:column; line-height:1; }
      .nav-logo-name { font-family:'Syne',sans-serif; font-weight:800; font-size:1.05rem; letter-spacing:-0.02em; background:linear-gradient(120deg,#c4b5fd,#818cf8,#38bdf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
      .nav-logo-sub { font-size:9px; color:rgba(160,165,200,0.45); text-transform:uppercase; letter-spacing:0.18em; margin-top:3px; font-weight:500; }

      .sh-nav__links { display:none; align-items:center; gap:4px; }
      @media(min-width:768px){ .sh-nav__links { display:flex; } .sh-nav__links--app { flex:1; justify-content:center; } }
      .nav-link { display:flex; align-items:center; gap:7px; padding:7px 14px; border-radius:12px; font-size:13.5px; font-weight:500; color:var(--nav-text); text-decoration:none; transition:color 0.2s,background 0.2s; position:relative; font-family:'DM Sans',sans-serif; white-space:nowrap; }
      .nav-link:hover { color:var(--nav-text-hover); background:rgba(255,255,255,0.055); }
      .nav-link--app.is-active { color:var(--nav-text-hover); background:rgba(255,255,255,0.07); }
      .nav-link-pill { position:absolute; inset:0; border-radius:12px; border:1px solid rgba(99,102,241,0.3); background:rgba(99,102,241,0.1); pointer-events:none; animation:pillIn 0.25s ease both; }
      @keyframes pillIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }

      .sh-nav__actions { display:flex; align-items:center; gap:8px; margin-left:auto; flex-shrink:0; }

      .nav-btn-primary { display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:12px; font-size:13.5px; font-weight:700; color:#fff !important; text-decoration:none; background:linear-gradient(135deg,#6366f1,#0ea5e9); border:none; cursor:pointer; transition:transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275),box-shadow 0.3s; font-family:'Syne',sans-serif; letter-spacing:-0.01em; position:relative; overflow:hidden; white-space:nowrap; -webkit-text-fill-color:#fff; }
      .nav-btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent); opacity:0; transition:opacity 0.3s; }
      .nav-btn-primary:hover { transform:translateY(-1px) scale(1.04); box-shadow:0 0 24px rgba(99,102,241,0.45); }
      .nav-btn-primary:hover::before { opacity:1; }
      .nav-btn-primary:active { transform:scale(0.97); }
      .nav-btn-full { width:100%; justify-content:center; }

      .nav-auth-status { display:flex; align-items:center; gap:8px; font-size:10px; color:rgba(160,165,200,0.5); text-transform:uppercase; letter-spacing:0.2em; font-weight:600; margin-left:auto; font-family:'Syne',sans-serif; }
      .nav-auth-dot { width:7px; height:7px; border-radius:50%; background:#10b981; box-shadow:0 0 8px rgba(16,185,129,0.7); animation:authPulse 2s ease-in-out infinite; }
      @keyframes authPulse { 0%,100%{box-shadow:0 0 6px rgba(16,185,129,0.7)} 50%{box-shadow:0 0 14px rgba(16,185,129,0.9),0 0 22px rgba(16,185,129,0.3)} }
      .nav-auth-label { display:none; }
      @media(min-width:480px){ .nav-auth-label { display:inline; } }

      .nav-icon-btn-wrap { position:relative; }
      .nav-icon-btn { position:relative; display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px; border:1px solid var(--nav-border); background:rgba(255,255,255,0.04); color:var(--nav-text); cursor:pointer; transition:all 0.2s; }
      .nav-icon-btn:hover { background:rgba(255,255,255,0.08); border-color:var(--nav-border); color:var(--nav-text-hover); }

      .nav-notif-dot { 
        position:absolute; top:-5px; right:-5px; 
        min-width:16px; height:16px; border-radius:8px; 
        background:#ef4444;
        box-shadow:0 0 0 2px rgba(5,8,16,.95), 0 0 8px rgba(239,68,68,.6);
        border:none;
        font-size:9px; font-weight:800; color:#fff; 
        display:flex; align-items:center; justify-content:center; 
        padding:0 3px; font-family:'Syne',sans-serif; 
        animation:notifPop 0.35s cubic-bezier(0.175,0.885,0.32,1.6) both; 
        pointer-events:none; 
        letter-spacing:0;
      }
      @keyframes notifPop { from{transform:scale(0)} to{transform:scale(1)} }

      .nav-profile-wrap { position:relative; }
      .nav-profile-btn { display:flex; align-items:center; gap:8px; padding:4px 12px 4px 4px; border-radius:12px; border:1px solid var(--nav-border); background:rgba(255,255,255,0.04); cursor:pointer; transition:background 0.2s,border-color 0.2s; }
      .nav-profile-btn:hover, .nav-profile-btn.is-open { background:rgba(255,255,255,0.07); border-color:var(--nav-border); }
      .nav-avatar { width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,#6366f1,#0ea5e9); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:#fff; font-family:'Syne',sans-serif; flex-shrink:0; }
      .nav-avatar--lg { width:38px; height:38px; border-radius:11px; font-size:16px; }
      .nav-avatar--img { object-fit:cover; padding:0; background:none; font-size:0; }
      .nav-username { font-size:13px; font-weight:600; color:var(--nav-text); font-family:'DM Sans',sans-serif; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:none; }
      @media(min-width:480px){ .nav-username { display:block; } }
      .nav-chevron { color:var(--nav-text); transition:transform 0.25s ease; flex-shrink:0; }
      .nav-chevron.is-rotated { transform:rotate(180deg); }

      .nav-notif-avatar-wrap { position:relative; flex-shrink:0; width:36px; height:36px; }
      .nav-notif-avatar-img { width:36px; height:36px; border-radius:10px; object-fit:cover; display:block; }
      .nav-notif-avatar-fallback { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#6366f1,#0ea5e9); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:#fff; font-family:'Syne',sans-serif; }
      .nav-notif-type-badge { position:absolute; bottom:-3px; right:-3px; width:16px; height:16px; border-radius:5px; display:flex; align-items:center; justify-content:center; border:1.5px solid rgba(8,12,24,.9); }

      .nav-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:var(--nav-bg); border:1px solid var(--nav-border); border-radius:20px; box-shadow:0 8px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05); backdrop-filter:blur(28px) saturate(160%); -webkit-backdrop-filter:blur(28px) saturate(160%); overflow:hidden; opacity:0; transform:translateY(-8px) scale(0.97); pointer-events:none; transition:opacity 0.22s ease,transform 0.22s cubic-bezier(0.16,1,0.3,1); z-index:100; }
      .nav-dropdown.is-open { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }

      .nav-notif-panel { width:340px; right:-40px; }
      @media(max-width:479px){ .nav-notif-panel { right:-80px; width:290px; } }

      .nav-dropdown-header { display:flex; align-items:center; justify-content:space-between; padding:14px 16px 10px; border-bottom:1px solid var(--nav-border); }
      .nav-dropdown-title { font-size:12px; font-weight:700; color:var(--nav-text); font-family:'Syne',sans-serif; letter-spacing:0.04em; }
      .nav-badge-count { font-size:10px; font-weight:700; color:#a78bfa; background:rgba(167,139,250,0.12); border:1px solid rgba(167,139,250,0.2); padding:2px 8px; border-radius:100px; font-family:'Syne',sans-serif; }
      .nav-notif-viewall { font-size:11px; font-weight:600; color:rgba(129,140,248,.7); text-decoration:none; transition:color .2s; font-family:'DM Sans',sans-serif; }
      .nav-notif-viewall:hover { color:#818cf8; }

      .nav-notif-list { max-height:320px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:rgba(129,140,248,.2) transparent; }
      .nav-notif-list::-webkit-scrollbar { width:4px; }
      .nav-notif-list::-webkit-scrollbar-thumb { background:rgba(129,140,248,.2); border-radius:4px; }

      .nav-notif-item { display:flex; align-items:flex-start; gap:10px; padding:10px 16px; transition:background 0.15s; position:relative; cursor:pointer; }
      .nav-notif-item:hover { background:rgba(255,255,255,0.03); }
      .nav-notif-item.unread { background:rgba(129,140,248,.04); }
      .nav-notif-item.unread:hover { background:rgba(129,140,248,.08); }
      .nav-notif-content { flex:1; min-width:0; }
      .nav-notif-text { font-size:12.5px; color:var(--nav-text-hover); line-height:1.45; font-weight:400; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .nav-notif-time { font-size:10.5px; color:var(--nav-text); margin-top:3px; font-weight:500; }
      .nav-notif-unread-dot { width:7px; height:7px; border-radius:50%; background:#818cf8; flex-shrink:0; margin-top:5px; }

      .nav-dropdown-footer { padding:10px 14px 12px; border-top:1px solid var(--nav-border); text-align:center; }
      .nav-dropdown-all { font-size:12px; font-weight:700; color:rgba(167,139,250,0.75); text-decoration:none; font-family:'Syne',sans-serif; transition:color 0.2s; }
      .nav-dropdown-all:hover { color:rgba(167,139,250,1); }

      .nav-profile-dropdown { width:220px; }
      .nav-profile-header { display:flex; align-items:center; gap:12px; padding:14px 14px 12px; border-bottom:1px solid var(--nav-border); }
      .nav-profile-info { flex:1; min-width:0; }
      .nav-profile-name { font-size:13.5px; font-weight:700; color:var(--nav-text-hover); font-family:'Syne',sans-serif; letter-spacing:-0.01em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .nav-profile-email { font-size:10.5px; color:var(--nav-text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px; }

      .nav-dropdown-body { padding:8px; }
      .nav-dropdown-item { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:10px; font-size:13px; color:var(--nav-text); text-decoration:none; cursor:pointer; border:none; background:none; width:100%; text-align:left; transition:background 0.15s,color 0.15s; font-family:'DM Sans',sans-serif; font-weight:500; }
      .nav-dropdown-item:hover { background:rgba(255,255,255,0.05); color:var(--nav-text-hover); }
      .nav-dropdown-item--danger { color:rgba(248,113,113,0.8); }
      .nav-dropdown-item--danger:hover { background:rgba(239,68,68,0.08); color:rgba(252,165,165,0.9); }
      .nav-dropdown-sep { height:1px; background:var(--nav-border); margin:4px 0; }

      .nav-mobile-toggle { display:flex; flex-direction:column; justify-content:center; align-items:center; gap:5px; width:38px; height:38px; border-radius:10px; border:1px solid var(--nav-border); background:rgba(255,255,255,0.04); cursor:pointer; padding:0; transition:background 0.2s,border-color 0.2s; flex-shrink:0; }
      .nav-mobile-toggle:hover { background:rgba(255,255,255,0.07); border-color:var(--nav-border); }
      @media(min-width:768px){ .nav-mobile-toggle { display:none; } }
      .ham-line { display:block; width:18px; height:1.5px; border-radius:2px; background:var(--nav-text); transition:transform 0.3s cubic-bezier(0.16,1,0.3,1),opacity 0.3s ease,width 0.3s ease; transform-origin:center; }
      .nav-mobile-toggle.is-open .ham-line--1 { transform:translateY(6.5px) rotate(45deg); }
      .nav-mobile-toggle.is-open .ham-line--2 { opacity:0; transform:scaleX(0); }
      .nav-mobile-toggle.is-open .ham-line--3 { transform:translateY(-6.5px) rotate(-45deg); }

      .nav-mobile-drawer { position:relative; overflow:hidden; max-height:0; transition:max-height 0.4s cubic-bezier(0.16,1,0.3,1),opacity 0.3s ease; opacity:0; }
      .nav-mobile-drawer.is-open { max-height:520px; opacity:1; }
      .nav-mobile-inner { margin:0 12px 12px; padding:10px; border-radius:18px; border:1px solid var(--nav-border); background:var(--nav-bg); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); display:flex; flex-direction:column; gap:4px; }
      .nav-mobile-link { display:flex; align-items:center; padding:12px 16px; border-radius:12px; font-size:14px; font-weight:500; color:var(--nav-text); text-decoration:none; cursor:pointer; border:none; background:none; width:100%; text-align:left; transition:background 0.18s,color 0.18s; font-family:'DM Sans',sans-serif; }
      .nav-mobile-link--icon { gap:12px; }
      .nav-mobile-link:hover { background:rgba(255,255,255,0.05); color:var(--nav-text-hover); }
      .nav-mobile-link.is-active { background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2); color:var(--nav-text-hover); }
      .nav-mobile-link--danger { color:rgba(248,113,113,0.75); }
      .nav-mobile-link--danger:hover { background:rgba(239,68,68,0.07); color:rgba(252,165,165,0.9); }
      .nav-mobile-divider { height:1px; background:var(--nav-border); margin:4px 0; }

      .spinner-small { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; animation:spin 0.8s linear infinite; }
      @keyframes spin { to{transform:rotate(360deg)} }
      @media(prefers-reduced-motion:reduce){ *,*::before,*::after { transition-duration:0.01ms !important; animation:none !important; } }
    `}</style>
  )
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export default function Navbar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthPage = authPaths.some(p => pathname.startsWith(p))
  const isLanding = pathname === '/'

  if (isAuthPage) return <AuthNav />
  if (isLanding) return <LandingNav user={user} />
  if (user) return <AppNav />
  return <AuthNav />
}