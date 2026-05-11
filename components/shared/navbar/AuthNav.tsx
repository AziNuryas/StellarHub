'use client'

import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export function AuthNav() {
  return (
    <nav className="sh-nav sh-nav--auth" aria-label="Auth Navigation">
      <div className="sh-nav__bar">
        <Link href="/" className="ln-logo" aria-label="StellarHub Home">
          <Logo size={28} glow />
          <div className="ln-logo__text">
            <span className="ln-logo__name">StellarHub</span>
          </div>
        </Link>
        <div className="nav-auth-status">
          <span className="nav-auth-dot" />
          <span className="nav-auth-label">Secure Connection</span>
        </div>
      </div>
    </nav>
  )
}
