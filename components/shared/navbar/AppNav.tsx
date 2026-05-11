'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Bell, Compass, Search, Star, Moon, Sun, 
  User, LayoutDashboard, Settings, LogOut, 
  ChevronDown, Heart, MessageCircle, UserPlus 
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/Logo'
import { toast } from 'sonner'

interface NotifItem {
  id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
  post_id: string | null
  actor?: { username: string; avatar_url: string | null } | null
}

export function AppNav() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const supabase = createClient()
  const pathname = usePathname()

  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [profileOpen,   setProfileOpen]   = useState(false)
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [notifications, setNotifications] = useState<NotifItem[]>([])
  const [notifLoading,  setNotifLoading]  = useState(false)
  const [isLoggingOut,  setIsLoggingOut]  = useState(false)
  const [avatarUrl,     setAvatarUrl]     = useState<string | null>(null)

  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef   = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (!user?.id) return
    supabase.from('profiles').select('avatar_url').eq('id', user.id).single()
      .then(({ data }: any) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url) })
  }, [user?.id])

  const fetchNotifs = useCallback(async (uid: string) => {
    setNotifLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, message, is_read, created_at, post_id, actor:profiles(username, avatar_url)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Notif fetch error:', error)
      setNotifLoading(false)
      return
    }

    if (data) {
      setNotifications(data.map((item: any) => ({
        ...item,
        actor: Array.isArray(item.actor) ? (item.actor[0] ?? null) : (item.actor ?? null),
      })) as NotifItem[])
    }
    setNotifLoading(false)
  }, [])

  useEffect(() => {
    if (!user?.id) return
    fetchNotifs(user.id)
    const channel = supabase.channel('appnav-notifs-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        async (payload: any) => {
          let n = payload.new as NotifItem
          if (payload.new?.actor_id) {
            const { data: actor } = await supabase.from('profiles').select('username,avatar_url').eq('id', payload.new.actor_id).single()
            if (actor) n = { ...n, actor }
          }
          setNotifications(prev => [n, ...prev.slice(0, 49)])
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload: any) => setNotifications(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const markAllRead = async () => {
    if (!user?.id) return
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
  }

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false)
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
    try { await logout() }
    catch { toast.error('Gagal logout') }
    finally { setIsLoggingOut(false) }
  }

  const handleNotifOpen = () => {
    setNotifOpen(v => !v)
    setProfileOpen(false)
    if (!notifOpen && unreadCount > 0 && user?.id) setTimeout(() => markAllRead(), 2500)
  }

  const navLinks = [
    { href: '/feed',      icon: Compass, label: 'Feed'      },
    { href: '/explore',   icon: Search,  label: 'News & Events'   },
    { href: '/nasa',      icon: Star,    label: 'NASA'       },
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
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24)
    if (m < 1) return 'Baru'
    if (m < 60) return `${m}m`
    if (h < 24) return `${h}j`
    return `${day}h`
  }

  const username     = (user as any)?.username || (user as any)?.email?.split('@')[0] || 'Explorer'
  const email        = (user as any)?.email || ''
  const avatarLetter = username.charAt(0).toUpperCase()

  return (
    <nav className="sh-nav sh-nav--app" aria-label="Application Navigation">
      <div className="sh-nav__bar">

        <Link href="/" className="ln-logo" aria-label="StellarHub Home">
          <Logo size={28} glow />
          <div className="ln-logo__text">
            <span className="ln-logo__name">StellarHub</span>
          </div>
        </Link>

        <div className="sh-nav__links">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} className={`nav-link nav-link--app ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
                <Icon style={{ width: 14, height: 14 }} />
                {label}
                {active && <span className="nav-link-pill" />}
              </Link>
            )
          })}
        </div>

        <div className="sh-nav__actions">
          <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="nav-icon-btn-wrap">
            <button 
              className="nav-icon-btn" 
              onClick={handleNotifOpen} 
              aria-label={`Notifications, ${unreadCount} unread`}
              aria-haspopup="true"
              aria-expanded={notifOpen}
            >
              <Bell style={{ width: 15, height: 15 }} />
              {unreadCount > 0 && (
                <span className="nav-notif-dot" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            <div className={`nav-dropdown nav-notif-panel ${notifOpen ? 'is-open' : ''}`} role="menu" aria-label="Notifications list">
              <div className="nav-dropdown-header">
                <span className="nav-dropdown-title">Notifikasi</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {unreadCount > 0 && <span className="nav-badge-count" role="status">{unreadCount} baru</span>}
                  <Link href="/notifications" className="nav-notif-viewall" onClick={() => setNotifOpen(false)}>Lihat Semua</Link>
                </div>
              </div>
              <div className="nav-notif-list">
                {notifLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(140,145,180,.5)', fontSize: 13 }}>Memuat...</div>
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
                    <div key={n.id} className={`nav-notif-item ${n.is_read ? '' : 'unread'}`} role="menuitem">
                      <div className="nav-notif-avatar-wrap">
                        {actorAvatar
                          ? <img src={actorAvatar} alt="" className="nav-notif-avatar-img" />
                          : <div className="nav-notif-avatar-fallback">{actorName.charAt(0).toUpperCase()}</div>
                        }
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

          {/* Profile */}
          <div ref={profileRef} className="nav-profile-wrap">
            <button
              className={`nav-profile-btn ${profileOpen ? 'is-open' : ''}`}
              onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
              aria-label="User profile menu"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="nav-avatar nav-avatar--img" />
                : <div className="nav-avatar">{avatarLetter}</div>
              }
              <span className="nav-username">{username}</span>
              <ChevronDown className={`nav-chevron ${profileOpen ? 'is-rotated' : ''}`} style={{ width: 12, height: 12 }} />
            </button>
            <div className={`nav-dropdown nav-profile-dropdown ${profileOpen ? 'is-open' : ''}`} role="menu" aria-label="User menu">
              <div className="nav-profile-header">
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="nav-avatar nav-avatar--lg nav-avatar--img" />
                  : <div className="nav-avatar nav-avatar--lg">{avatarLetter}</div>
                }
                <div className="nav-profile-info">
                  <p className="nav-profile-name">{username}</p>
                  <p className="nav-profile-email">{email}</p>
                </div>
              </div>
              <div className="nav-dropdown-body">
                {[
                  { href: '/profile',       icon: User,            label: 'Profile'    },
                  { href: '/notifications', icon: Bell,            label: 'Notifikasi', badge: unreadCount },
                  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'  },
                  { href: '/settings',      icon: Settings,        label: 'Settings'   },
                ].map(({ href, icon: Icon, label, badge }) => (
                  <Link key={href} href={href} className="nav-dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
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
                <button className="nav-dropdown-item nav-dropdown-item--danger" onClick={handleSignOut} disabled={isLoggingOut} role="menuitem">
                  {isLoggingOut
                    ? <><div className="spinner-small" /> Signing out...</>
                    : <><LogOut style={{ width: 14, height: 14 }} /> Sign Out</>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className={`nav-mobile-toggle ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="ham-line ham-line--1" />
            <span className="ham-line ham-line--2" />
            <span className="ham-line ham-line--3" />
          </button>
        </div>
      </div>

      <div 
        className={`nav-mobile-drawer ${mobileOpen ? 'is-open' : ''}`}
        aria-hidden={!mobileOpen}
      >
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
          <button className="nav-mobile-link nav-mobile-link--icon nav-mobile-link--danger" onClick={handleSignOut} disabled={isLoggingOut}>
            {isLoggingOut
              ? <><div className="spinner-small" /> Signing out...</>
              : <><LogOut style={{ width: 16, height: 16 }} /> Sign Out</>
            }
          </button>
        </div>
      </div>
    </nav>
  )
}
