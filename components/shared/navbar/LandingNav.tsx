'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Sparkles, Menu, X } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

export function LandingNav({ user }: { user: any }) {
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pressing, setPressing] = useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const onScroll = useCallback(() => setScrolled(window.scrollY > 40), [])

  useEffect(() => {
    setMounted(true)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 640) setDrawerOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setDrawerOpen(false)
    }
    if (drawerOpen) document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [drawerOpen])

  const links = [
    { label: 'Fitur', href: '#features' },
    { label: 'Cara Kerja', href: '#how-it-works' },
  ]

  return (
    <div className={[
      'ln-wrap',
      mounted ? 'ln-wrap--in' : '',
      scrolled ? 'ln-wrap--scrolled' : '',
    ].filter(Boolean).join(' ')}>

      <nav className="ln-pill" aria-label="Main Navigation">
        <div className="ln-glass" />
        <div className="ln-tint" />
        <div className="ln-shine" />
        <div className="ln-rim" />

        <div className="ln-bar">
          <Link href="/" className="ln-logo" aria-label="StellarHub Home">
            <Logo size={28} glow />
            <div className="ln-logo__text">
              <span className="ln-logo__name">StellarHub</span>
            </div>
          </Link>

          <div className="ln-divider" />

          <div className="ln-links">
            {links.map(l => (
              <a
                key={l.label}
                href={l.href}
                className={`ln-link ${pressing === l.label ? 'ln-link--press' : ''}`}
                onMouseDown={() => setPressing(l.label)}
                onMouseUp={() => setPressing(null)}
                onMouseLeave={() => setPressing(null)}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="ln-actions">
            {user ? (
              <>
                <Link href="/feed" className="ln-signin">Feed</Link>
                <Link href="/feed" className="ln-cta">
                  <Sparkles size={12} /> Launch App
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="ln-signin">Sign In</Link>
                <Link href="/register" className="ln-cta">
                  <Sparkles size={12} /> Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className={`ln-ham ${drawerOpen ? 'ln-ham--open' : ''}`}
            onClick={() => setDrawerOpen(v => !v)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
          >
            <span className="ln-ham__icon">
              {drawerOpen ? <X size={18} /> : <Menu size={18} />}
            </span>
          </button>
        </div>
      </nav>

      <div 
        ref={drawerRef} 
        className={`ln-drawer ${drawerOpen ? 'ln-drawer--open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        <div className="ln-drawer__glass" />
        <div className="ln-drawer__body">
          {links.map(l => (
            <a key={l.label} href={l.href} className="ln-drawer__link" onClick={() => setDrawerOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="ln-drawer__sep" />
          {user ? (
            <>
              <Link href="/feed" className="ln-drawer__link" onClick={() => setDrawerOpen(false)}>Feed</Link>
              <Link href="/profile" className="ln-drawer__link" onClick={() => setDrawerOpen(false)}>Profile</Link>
              <Link href="/feed" className="ln-cta ln-cta--full" onClick={() => setDrawerOpen(false)}>
                <Sparkles size={12} /> Launch App
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="ln-drawer__link" onClick={() => setDrawerOpen(false)}>Sign In</Link>
              <Link href="/register" className="ln-cta ln-cta--full" onClick={() => setDrawerOpen(false)}>
                <Sparkles size={12} /> Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
