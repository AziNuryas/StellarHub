'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Rocket, Satellite, Star, Users,
  ArrowRight, Globe, Heart, Bookmark,
  Search, Zap, ChevronRight, Play,
  Camera, Newspaper, Share2, Sparkles, Eye, Radio,
} from 'lucide-react'

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}
const rand = seededRand(42)

const STARS = Array.from({ length: 100 }, (_, i) => ({
  id: i, x: rand() * 100, y: rand() * 100,
  size: rand() * 2.2 + 0.4, delay: rand() * 10, dur: rand() * 6 + 4,
  opacity: rand() * 0.7 + 0.15, drift: rand() * 30 - 15, driftDur: rand() * 20 + 25,
}))
const METEORS = Array.from({ length: 7 }, (_, i) => ({
  id: i, x: rand() * 70 + 10, y: rand() * 45,
  delay: rand() * 14 + i * 3, dur: rand() * 1.0 + 0.7, length: rand() * 120 + 80,
}))
const NEBULAS = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: rand() * 100, y: rand() * 100,
  size: rand() * 3 + 1.5, delay: rand() * 12, dur: rand() * 8 + 8,
  color: ['#a78bfa','#38bdf8','#f472b6','#34d399','#fbbf24'][Math.floor(rand() * 5)],
  opacity: rand() * 0.35 + 0.08, driftX: rand() * 40 - 20, driftY: rand() * 40 - 20,
}))
const GALAXIES = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: rand() * 90 + 5, y: rand() * 90 + 5,
  size: rand() * 4 + 3, delay: rand() * 15, dur: rand() * 12 + 10, opacity: rand() * 0.22 + 0.05,
}))

const FEATURES = [
  { icon: Camera, title: 'NASA API Integration', desc: 'Pull live APOD & Mars Rover imagery directly into your feed. Real data, every single day.', accent: '#a78bfa', tag: 'Live Data', glow: 'rgba(167,139,250,0.15)' },
  { icon: Newspaper, title: 'Create & Share Posts', desc: 'Compose posts with image URLs and captions. Share cosmic discoveries with the universe.', accent: '#38bdf8', tag: 'Social', glow: 'rgba(56,189,248,0.12)' },
  { icon: Heart, title: 'Like & Bookmark', desc: 'React to posts and build a personal archive of your favourite space moments in time.', accent: '#f472b6', tag: 'Engagement', glow: 'rgba(244,114,182,0.12)' },
  { icon: Radio, title: 'Dynamic Feed System', desc: 'Real-time feed powered by Supabase — content stays fresh as the universe expands.', accent: '#34d399', tag: 'Real-time', glow: 'rgba(52,211,153,0.12)' },
]
const STEPS = [
  { num: '01', label: 'Sign Up', detail: 'Create your free account in seconds. No credit card required.' },
  { num: '02', label: 'Explore', detail: 'Browse NASA imagery and community posts from across the cosmos.' },
  { num: '03', label: 'Engage', detail: 'Post, like, bookmark, and connect with fellow space explorers.' },
]
const STATS = [
  { val: '150K+', label: 'Explorers', icon: Users },
  { val: '25M+', label: 'Observations', icon: Eye },
  { val: '180+', label: 'Countries', icon: Globe },
  { val: '24/7', label: 'Live Feed', icon: Satellite },
]

export default function StellarHubLanding() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setMounted(true)

    // ✅ FIX: Only check session to update UI (show correct CTA text)
    // DO NOT redirect here — user must explicitly navigate
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setUser(data) })
    })

    observerRef.current = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view') }) },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => { observerRef.current?.observe(el) })
    }, 100)
    return () => observerRef.current?.disconnect()
  }, [])

  // ✅ CTA destination: /feed if logged in, /register if not
  // But no auto-redirect — user stays on landing page and CHOOSES to click
  const primaryCTA = user ? '/feed' : '/register'
  const primaryLabel = user ? 'Go to Feed' : 'Get Started Free'
  const finalCTA = user ? '/feed' : '/register'
  const finalLabel = user ? 'Open Feed' : 'Launch Into Space'

  return (
    <div className="sh-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .sh-root{min-height:100svh;background:#050810;color:#f0f0ff;overflow-x:hidden;font-family:'DM Sans',system-ui,sans-serif;}
        ::-webkit-scrollbar{width:2px;}::-webkit-scrollbar-track{background:#050810;}::-webkit-scrollbar-thumb{background:linear-gradient(#7c3aed,#0ea5e9);}
        ::selection{background:rgba(124,58,237,0.3);color:#fff;}
        :root{--purple:#7c3aed;--blue:#0ea5e9;--teal:#14b8a6;--pink:#ec4899;--green:#10b981;--glass:rgba(255,255,255,0.04);--glass-border:rgba(255,255,255,0.08);--glass-hover:rgba(255,255,255,0.07);--ease-spring:cubic-bezier(0.175,0.885,0.32,1.275);--ease-out:cubic-bezier(0.16,1,0.3,1);}
        .tg{background:linear-gradient(110deg,#c4b5fd 0%,#818cf8 35%,#38bdf8 65%,#34d399 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% auto;animation:gradMove 6s ease infinite;}
        @keyframes gradMove{0%,100%{background-position:0% center}50%{background-position:100% center}}
        .gl{background:var(--glass);border:1px solid var(--glass-border);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);}
        .gl-deep{background:rgba(255,255,255,0.055);border:1px solid rgba(255,255,255,0.10);backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);}
        .sh-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
        .star{position:absolute;border-radius:50%;background:#fff;animation:twinkle var(--tw-dur) ease-in-out var(--tw-delay) infinite,drift var(--dr-dur) ease-in-out var(--dr-delay) infinite alternate;}
        @keyframes twinkle{0%,100%{opacity:0.04;transform:scale(1)}40%{opacity:var(--peak);transform:scale(1.9)}60%{opacity:calc(var(--peak)*0.7);transform:scale(1.5)}}
        @keyframes drift{from{transform:translateX(0px) translateY(0px)}to{transform:translateX(var(--dx)) translateY(var(--dy))}}
        .meteor{position:absolute;height:1.5px;border-radius:100px;background:linear-gradient(90deg,rgba(255,255,255,0.9),rgba(196,181,253,0.6),transparent);transform-origin:left center;transform:rotate(-30deg);opacity:0;animation:shoot var(--m-dur) ease-out var(--m-delay) infinite;}
        @keyframes shoot{0%{opacity:0;transform:rotate(-30deg) translateX(0px)}5%{opacity:1}70%{opacity:0.6}100%{opacity:0;transform:rotate(-30deg) translateX(var(--m-len))}}
        .nebula-dot{position:absolute;border-radius:50%;filter:blur(1.5px);animation:nebulaTwinkle var(--nb-dur) ease-in-out var(--nb-delay) infinite,nebulaDrift var(--nb-drift-dur) ease-in-out var(--nb-delay) infinite alternate;}
        @keyframes nebulaTwinkle{0%,100%{opacity:0.04;transform:scale(0.8)}50%{opacity:var(--nb-peak);transform:scale(1.4)}}
        @keyframes nebulaDrift{from{transform:translate(0px,0px) scale(1)}to{transform:translate(var(--nb-dx),var(--nb-dy)) scale(1.2)}}
        .galaxy{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.55) 0%,rgba(196,181,253,0.2) 40%,transparent 70%);filter:blur(0.8px);animation:galaxyPulse var(--gx-dur) ease-in-out var(--gx-delay) infinite;}
        @keyframes galaxyPulse{0%,100%{opacity:var(--gx-min);transform:scale(1) rotate(0deg)}33%{opacity:var(--gx-peak);transform:scale(1.3) rotate(3deg)}66%{opacity:calc(var(--gx-min)*1.5);transform:scale(0.85) rotate(-2deg)}}
        .blob{position:absolute;border-radius:50%;filter:blur(90px);}
        .blob-1{width:750px;height:750px;top:-220px;left:-180px;background:radial-gradient(circle,rgba(124,58,237,0.20) 0%,rgba(99,102,241,0.08) 50%,transparent 72%);animation:blobPulse 13s ease-in-out infinite;}
        .blob-2{width:600px;height:600px;top:25%;right:-120px;background:radial-gradient(circle,rgba(14,165,233,0.14) 0%,rgba(56,189,248,0.06) 50%,transparent 72%);animation:blobPulse 16s ease-in-out 5s infinite;}
        .blob-3{width:480px;height:480px;bottom:5%;left:15%;background:radial-gradient(circle,rgba(20,184,166,0.11) 0%,transparent 70%);animation:blobPulse 11s ease-in-out 9s infinite;}
        .blob-4{width:340px;height:340px;top:55%;left:55%;background:radial-gradient(circle,rgba(244,114,182,0.07) 0%,transparent 70%);animation:blobPulse 18s ease-in-out 3s infinite;}
        @keyframes blobPulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.10)}}
        .grid-lines{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.016) 1px,transparent 1px);background-size:90px 90px;mask-image:radial-gradient(ellipse 85% 65% at 50% 25%,black 0%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 85% 65% at 50% 25%,black 0%,transparent 100%);}
        .vignette{position:absolute;inset:0;background:radial-gradient(ellipse 100% 100% at 50% 50%,transparent 40%,rgba(5,8,16,0.65) 100%);}
        .sh-section{position:relative;z-index:10;}
        .hero{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(80px,12vw,120px) 20px clamp(60px,8vw,100px);text-align:center;}
        .hero-badge{display:inline-flex;align-items:center;gap:10px;padding:8px 20px;border-radius:100px;margin-bottom:clamp(24px,4vw,40px);animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both;}
        .badge-dot{width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;animation:dotPulse 2s ease-in-out infinite;}
        @keyframes dotPulse{0%,100%{box-shadow:0 0 8px #10b981}50%{box-shadow:0 0 16px #10b981,0 0 24px rgba(16,185,129,0.4)}}
        .hero-h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(3rem,9vw,8rem);line-height:0.95;letter-spacing:-0.02em;margin-bottom:clamp(16px,3vw,28px);animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.22s both;}
        .hero-sub{font-size:clamp(1rem,2vw,1.2rem);color:rgba(200,205,230,0.7);max-width:600px;margin:0 auto clamp(32px,5vw,48px);line-height:1.8;font-weight:300;animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.36s both;}
        .cta-row{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-bottom:clamp(40px,6vw,72px);animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.50s both;}
        .btn-primary{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;border-radius:16px;color:#fff;font-weight:700;font-size:0.95rem;font-family:'Syne',sans-serif;background:linear-gradient(135deg,var(--purple) 0%,var(--blue) 100%);border:none;cursor:pointer;text-decoration:none;transition:transform 0.2s var(--ease-spring),box-shadow 0.3s ease;position:relative;overflow:hidden;}
        .btn-primary::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent);opacity:0;transition:opacity 0.3s;}
        .btn-primary:hover::before{opacity:1;}
        .btn-primary:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 0 40px rgba(124,58,237,0.5),0 8px 30px rgba(0,0,0,0.4);}
        .btn-primary:active{transform:scale(0.98);}
        .btn-primary::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transition:left 0.5s ease;}
        .btn-primary:hover::after{left:150%;}
        .btn-secondary{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;border-radius:16px;color:rgba(220,225,255,0.85);font-weight:600;font-size:0.95rem;font-family:'Syne',sans-serif;text-decoration:none;transition:transform 0.2s var(--ease-spring),background 0.3s,border-color 0.3s;}
        .btn-secondary:hover{transform:translateY(-2px) scale(1.02);background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.16);}
        .play-circle{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .arr-anim{transition:transform 0.2s ease;}
        .btn-primary:hover .arr-anim,.btn-secondary:hover .arr-anim{transform:translateX(4px);}
        .stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:680px;width:100%;margin:0 auto;animation:fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.65s both;}
        @media(min-width:640px){.stats-grid{grid-template-columns:repeat(4,1fr);}}
        .stat-card{border-radius:20px;padding:20px 14px;display:flex;flex-direction:column;align-items:center;gap:6px;transition:transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275),border-color 0.3s ease,box-shadow 0.3s ease;}
        .stat-card:hover{transform:translateY(-6px) scale(1.05);border-color:rgba(167,139,250,0.25);box-shadow:0 12px 40px rgba(124,58,237,0.12),0 0 0 1px rgba(167,139,250,0.1);}
        .stat-val{font-family:'Syne',sans-serif;font-size:1.7rem;font-weight:800;color:#fff;letter-spacing:-0.03em;}
        .stat-label{font-size:10px;color:rgba(180,185,210,0.55);text-transform:uppercase;letter-spacing:0.2em;font-weight:600;}
        .scroll-hint{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0;animation:fadeIn 0.8s ease 2.2s both;}
        .scroll-line{width:1px;height:44px;background:linear-gradient(to bottom,transparent,rgba(124,58,237,0.6),rgba(56,189,248,0.3),transparent);animation:scrollLine 2.4s cubic-bezier(0.45,0,0.55,1) 2.2s infinite;}
        @keyframes scrollLine{0%{transform:scaleY(0) translateY(-100%);opacity:0;transform-origin:top}20%{opacity:1}50%{transform:scaleY(1);transform-origin:top;opacity:1}51%{transform:scaleY(1);transform-origin:bottom}80%{opacity:0.5}100%{transform:scaleY(0);transform-origin:bottom;opacity:0}}
        .sec-label{display:inline-flex;align-items:center;gap:10px;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;font-weight:700;margin-bottom:20px;font-family:'Syne',sans-serif;}
        .sec-line{display:block;width:28px;height:1px;opacity:0.5;}
        .sec-h2{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(2rem,5vw,3.8rem);line-height:1.05;letter-spacing:-0.02em;}
        .features-grid{display:grid;gap:16px;}
        @media(min-width:768px){.features-grid{grid-template-columns:repeat(2,1fr);}}
        .feat-card{position:relative;border-radius:28px;padding:clamp(24px,4vw,36px);overflow:hidden;transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275),border-color 0.35s ease,box-shadow 0.35s ease;cursor:default;}
        .feat-card:hover{transform:translateY(-6px) scale(1.015);border-color:rgba(255,255,255,0.13);box-shadow:0 20px 60px rgba(0,0,0,0.3);}
        .feat-glow{position:absolute;inset:0;border-radius:28px;opacity:0;transition:opacity 0.6s ease;pointer-events:none;}
        .feat-card:hover .feat-glow{opacity:1;}
        .feat-icon-wrap{width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;flex-shrink:0;}
        .feat-tag{padding:4px 12px;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;font-family:'Syne',sans-serif;}
        .feat-h3{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:12px;letter-spacing:-0.01em;}
        .feat-p{color:rgba(180,185,220,0.7);line-height:1.75;font-size:0.92rem;font-weight:300;}
        .feat-link{display:inline-flex;align-items:center;gap:6px;font-size:0.85rem;font-weight:700;margin-top:20px;text-decoration:none;transition:gap 0.2s;font-family:'Syne',sans-serif;}
        .feat-link:hover{gap:10px;}
        .mockup-wrap{max-width:900px;margin:0 auto;}
        .mockup-card{border-radius:24px;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,0.06),0 40px 80px rgba(0,0,0,0.5),0 0 100px rgba(124,58,237,0.06);}
        .mockup-bar{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:10px;}
        .traffic-dot{width:12px;height:12px;border-radius:50%;}
        .mockup-url{flex:1;height:26px;border-radius:8px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;gap:8px;font-size:11px;color:rgba(200,205,230,0.45);letter-spacing:0.05em;}
        .mockup-status{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;}
        .steps-grid{display:grid;gap:32px;position:relative;}
        @media(min-width:768px){.steps-grid{grid-template-columns:repeat(3,1fr);}}
        .step-connector{display:none;position:absolute;top:44px;left:17%;width:66%;height:1px;background:linear-gradient(to right,transparent,rgba(124,58,237,0.3),rgba(14,165,233,0.3),transparent);}
        @media(min-width:768px){.step-connector{display:block;}}
        .step-item{display:flex;flex-direction:column;align-items:center;text-align:center;gap:0;}
        .step-circle{width:90px;height:90px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:20px;transition:transform 0.3s var(--ease-spring);position:relative;}
        .step-item:hover .step-circle{transform:scale(1.12);}
        .step-circle::after{content:'';position:absolute;inset:-1px;border-radius:50%;background:linear-gradient(135deg,rgba(124,58,237,0.4),rgba(14,165,233,0.4));z-index:-1;opacity:0;transition:opacity 0.3s;}
        .step-item:hover .step-circle::after{opacity:1;}
        .step-num{font-family:'DM Serif Display',serif;font-size:2rem;color:#fff;line-height:1;}
        .step-sup{font-size:9px;color:rgba(167,139,250,0.8);text-transform:uppercase;letter-spacing:0.18em;font-weight:700;font-family:'Syne',sans-serif;margin-bottom:2px;}
        .step-label{font-family:'Syne',sans-serif;font-weight:700;font-size:1.1rem;color:#fff;margin-bottom:8px;}
        .step-detail{font-size:0.88rem;color:rgba(160,165,200,0.65);line-height:1.72;font-weight:300;}
        .nasa-card{border-radius:28px;padding:clamp(28px,5vw,56px);overflow:hidden;position:relative;box-shadow:0 0 60px rgba(14,165,233,0.06);}
        .nasa-inner{position:relative;z-index:1;display:flex;flex-direction:column;gap:40px;align-items:center;}
        @media(min-width:768px){.nasa-inner{flex-direction:row;gap:60px;align-items:center;}}
        .nasa-orb{position:relative;width:160px;height:160px;flex-shrink:0;}
        .nasa-ring-outer{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(14,165,233,0.25);animation:spin 20s linear infinite;}
        .nasa-ring-inner{position:absolute;inset:20px;border-radius:50%;border:1px solid rgba(124,58,237,0.18);animation:spin 14s linear reverse infinite;}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .nasa-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
        .nasa-icon-box{width:72px;height:72px;border-radius:20px;display:flex;align-items:center;justify-content:center;background:rgba(14,165,233,0.12);border:1px solid rgba(14,165,233,0.25);}
        .nasa-chip{position:absolute;padding:4px 12px;border-radius:100px;font-size:10px;font-weight:700;color:#fff;font-family:'Syne',sans-serif;letter-spacing:0.1em;animation:floatChip 3s ease-in-out infinite;}
        .nc-1{top:5%;right:10%;animation-delay:0s;}
        .nc-2{bottom:10%;right:5%;animation-delay:1.5s;}
        @keyframes floatChip{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .nasa-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;}
        .nasa-tag{padding:6px 14px;border-radius:12px;font-size:11px;font-weight:600;color:rgba(200,205,235,0.8);font-family:'Syne',sans-serif;letter-spacing:0.08em;transition:background 0.2s,border-color 0.2s;}
        .nasa-tag:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.15);}
        .cta-section{padding:clamp(80px,12vw,160px) 20px;}
        .cta-glow{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;}
        .cta-glow-inner{width:700px;height:400px;border-radius:50%;background:radial-gradient(ellipse,rgba(124,58,237,0.18) 0%,rgba(14,165,233,0.08) 40%,transparent 70%);filter:blur(60px);}
        .sh-footer{border-top:1px solid rgba(255,255,255,0.06);padding:clamp(32px,5vw,48px) 20px;}
        .footer-inner{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:20px;}
        @media(min-width:768px){.footer-inner{flex-direction:row;justify-content:space-between;}}
        .footer-logo{display:flex;align-items:center;gap:12px;text-decoration:none;}
        .footer-logo-icon{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(124,58,237,0.5),rgba(14,165,233,0.5));border:1px solid rgba(255,255,255,0.12);}
        .footer-links{display:flex;gap:24px;}
        .footer-links a{font-size:13px;color:rgba(160,165,200,0.5);text-decoration:none;transition:color 0.2s;font-weight:500;}
        .footer-links a:hover{color:rgba(220,225,255,0.9);}
        .footer-copy{font-size:11px;color:rgba(120,125,160,0.5);font-weight:500;}
        .reveal{opacity:0;transform:translateY(48px);transition:opacity 0.85s cubic-bezier(0.16,1,0.3,1),transform 0.85s cubic-bezier(0.16,1,0.3,1);}
        .reveal.in-view{opacity:1;transform:translateY(0);}
        .reveal-d1{transition-delay:0.06s;}.reveal-d2{transition-delay:0.14s;}.reveal-d3{transition-delay:0.22s;}.reveal-d4{transition-delay:0.30s;}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(40px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:0.8}}
        .sec-pad{padding:clamp(60px,10vw,120px) 20px;}
        .sec-inner{max-width:1100px;margin:0 auto;}
        .sec-text-center{text-align:center;margin-bottom:clamp(40px,7vw,80px);}
        .mock-post{border-radius:18px;padding:16px;}
        .mock-avatar{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;}
        .mock-img{height:100px;border-radius:12px;margin:12px 0;display:flex;align-items:center;justify-content:center;}
        .mock-actions{display:flex;align-items:center;gap:16px;}
        .mock-action{display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(160,165,210,0.6);}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;}}
      `}</style>

      {/* BACKGROUND */}
      <div className="sh-bg">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" /><div className="blob blob-4" />
        <div className="grid-lines" />
        {mounted && (
          <>
            {STARS.map(s => (
              <span key={`s-${s.id}`} className="star" style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, '--tw-dur':`${s.dur}s`, '--tw-delay':`${s.delay}s`, '--peak':s.opacity, '--dr-dur':`${s.driftDur}s`, '--dr-delay':`${s.delay*0.3}s`, '--dx':`${s.drift}px`, '--dy':`${s.drift*0.4}px` } as React.CSSProperties} />
            ))}
            {METEORS.map(m => (
              <span key={`m-${m.id}`} className="meteor" style={{ left:`${m.x}%`, top:`${m.y}%`, width:m.length, '--m-dur':`${m.dur}s`, '--m-delay':`${m.delay}s`, '--m-len':`${m.length*2.5}px` } as React.CSSProperties} />
            ))}
            {NEBULAS.map(n => (
              <span key={`n-${n.id}`} className="nebula-dot" style={{ left:`${n.x}%`, top:`${n.y}%`, width:n.size, height:n.size, background:n.color, '--nb-dur':`${n.dur}s`, '--nb-delay':`${n.delay}s`, '--nb-peak':n.opacity, '--nb-drift-dur':`${n.dur*2.5}s`, '--nb-dx':`${n.driftX}px`, '--nb-dy':`${n.driftY}px` } as React.CSSProperties} />
            ))}
            {GALAXIES.map(g => (
              <span key={`g-${g.id}`} className="galaxy" style={{ left:`${g.x}%`, top:`${g.y}%`, width:g.size, height:g.size, '--gx-dur':`${g.dur}s`, '--gx-delay':`${g.delay}s`, '--gx-peak':g.opacity, '--gx-min':g.opacity*0.3 } as React.CSSProperties} />
            ))}
          </>
        )}
        <div className="vignette" />
      </div>

      {/* HERO */}
      <section className="sh-section hero" style={{ position: 'relative' }}>
        <div className="hero-badge gl">
          <span className="badge-dot" />
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(200,210,240,0.75)', fontFamily:"'Syne',sans-serif" }}>
            Live · NASA APIs · Space Community
          </span>
        </div>
        <h1 className="hero-h1">
          <span style={{ color:'#f0f0ff', display:'block' }}>Explore the</span>
          <span className="tg" style={{ display:'block', marginTop:4 }}>Cosmos Together</span>
        </h1>
        <p className="hero-sub">
          StellarHub bridges space enthusiasts with live NASA data, community posts, and a dynamic feed that turns curiosity into discovery.
        </p>
        {/* ✅ CTA — no auto redirect, user explicitly clicks */}
        <div className="cta-row">
          <Link href={primaryCTA} className="btn-primary">
            <Rocket style={{ width:16, height:16 }} />
            {primaryLabel}
            <ArrowRight className="arr-anim" style={{ width:16, height:16 }} />
          </Link>
          <Link href="/explore" className="btn-secondary gl">
            <span className="play-circle"><Play style={{ width:11, height:11, marginLeft:1 }} /></span>
            Explore Now
            <ArrowRight className="arr-anim" style={{ width:14, height:14, opacity:0.6 }} />
          </Link>
        </div>
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="stat-card gl">
              <s.icon style={{ width:15, height:15, color:'#a78bfa', marginBottom:2 }} />
              <span className="stat-val">{s.val}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="scroll-hint">
          <div className="scroll-line" />
          <span style={{ fontSize:9, color:'rgba(120,125,160,0.5)', textTransform:'uppercase', letterSpacing:'0.22em', fontWeight:700, fontFamily:"'Syne',sans-serif" }}>Scroll</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="sh-section sec-pad">
        <div className="sec-inner">
          <div className="sec-text-center reveal">
            <div className="sec-label" style={{ color:'#a78bfa', justifyContent:'center' }}>
              <span className="sec-line" style={{ background:'#a78bfa' }} />Platform Features<span className="sec-line" style={{ background:'#a78bfa' }} />
            </div>
            <h2 className="sec-h2"><span style={{ display:'block', color:'#f0f0ff' }}>Everything you need to</span><span className="tg">navigate the stars</span></h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feat-card gl reveal reveal-d${(i%4)+1}`}>
                <div className="feat-glow" style={{ background:`radial-gradient(ellipse at 25% 55%,${f.glow} 0%,transparent 65%)` }} />
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
                    <div className="feat-icon-wrap" style={{ background:`${f.accent}18`, border:`1px solid ${f.accent}30` }}>
                      <f.icon style={{ width:22, height:22, color:f.accent }} />
                    </div>
                    <span className="feat-tag gl" style={{ color:f.accent }}>{f.tag}</span>
                  </div>
                  <h3 className="feat-h3">{f.title}</h3>
                  <p className="feat-p">{f.desc}</p>
                  <a href="#" className="feat-link" style={{ color:f.accent }}>Learn more<ChevronRight style={{ width:14, height:14 }} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOCKUP */}
      <section className="sh-section" style={{ padding:'0 20px 80px' }}>
        <div className="mockup-wrap reveal">
          <div className="mockup-card gl-deep">
            <div className="mockup-bar">
              <div style={{ display:'flex', gap:6 }}>
                <div className="traffic-dot" style={{ background:'rgba(239,68,68,0.6)' }} />
                <div className="traffic-dot" style={{ background:'rgba(234,179,8,0.6)' }} />
                <div className="traffic-dot" style={{ background:'rgba(34,197,94,0.6)' }} />
              </div>
              <div className="mockup-url" style={{ flex:1, margin:'0 16px' }}>
                <div className="mockup-status" /><span>stellarhub.app/feed</span>
              </div>
              <Sparkles style={{ width:14, height:14, color:'#a78bfa' }} />
            </div>
            <div style={{ padding:16, display:'grid', gridTemplateColumns:'1fr', gap:14 }}>
              {[
                { name:'Alex Chen', tag:'APOD Today', likes:'2.4k', color:'#7c3aed' },
                { name:'Maria Kowalski', tag:'Mars Rover', likes:'891', color:'#0ea5e9' },
              ].map((post, i) => (
                <div key={i} className="mock-post gl">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="mock-avatar" style={{ background:post.color }}>{post.name[0]}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#f0f0ff' }}>{post.name}</div>
                      <div style={{ fontSize:10, color:'rgba(160,165,210,0.55)' }}>{post.tag}</div>
                    </div>
                  </div>
                  <div className="mock-img" style={{ background:`linear-gradient(135deg,${post.color}22,rgba(0,0,0,0.4))` }}>
                    <Star style={{ width:28, height:28, color:'rgba(255,255,255,0.12)' }} />
                  </div>
                  <div className="mock-actions">
                    <span className="mock-action"><Heart style={{ width:12, height:12 }} />{post.likes}</span>
                    <span className="mock-action"><Bookmark style={{ width:12, height:12 }} />Save</span>
                    <span className="mock-action"><Share2 style={{ width:12, height:12 }} />Share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="sh-section sec-pad">
        <div className="sec-inner">
          <div className="sec-text-center reveal">
            <div className="sec-label" style={{ color:'#38bdf8', justifyContent:'center' }}>
              <span className="sec-line" style={{ background:'#38bdf8' }} />How It Works<span className="sec-line" style={{ background:'#38bdf8' }} />
            </div>
            <h2 className="sec-h2"><span style={{ display:'block', color:'#f0f0ff' }}>Three steps to</span><span className="tg">your first orbit</span></h2>
          </div>
          <div className="steps-grid reveal">
            <div className="step-connector" />
            {STEPS.map((step, i) => (
              <div key={i} className="step-item">
                <div className="step-circle gl-deep" style={{ boxShadow:'0 0 30px rgba(124,58,237,0.08)' }}>
                  <span className="step-sup">Step</span>
                  <span className="step-num">{step.num}</span>
                </div>
                <div className="step-label">{step.label}</div>
                <p className="step-detail">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NASA HIGHLIGHT */}
      <section className="sh-section" style={{ padding:'0 20px 80px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div className="nasa-card gl-deep reveal">
            <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(14,165,233,0.10),transparent 70%)', pointerEvents:'none' }} />
            <div className="nasa-inner">
              <div className="nasa-orb">
                <div className="nasa-ring-outer" /><div className="nasa-ring-inner" />
                <div className="nasa-center"><div className="nasa-icon-box"><Satellite style={{ width:34, height:34, color:'#38bdf8' }} /></div></div>
                <span className="nasa-chip gl nc-1">APOD</span><span className="nasa-chip gl nc-2">Mars</span>
              </div>
              <div>
                <span style={{ fontSize:10, color:'#38bdf8', textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:700, fontFamily:"'Syne',sans-serif" }}>Powered by NASA Open APIs</span>
                <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(1.8rem,4vw,3rem)', color:'#f0f0ff', margin:'12px 0 16px', lineHeight:1.1, letterSpacing:'-0.02em' }}>Real space data,<br />right in your feed.</h3>
                <p style={{ color:'rgba(180,185,220,0.65)', lineHeight:1.78, fontWeight:300, fontSize:'0.93rem', marginBottom:0 }}>
                  Every day, fresh imagery from NASA's Astronomy Picture of the Day and Mars Rover missions flows directly into StellarHub — giving your community real data to explore.
                </p>
                <div className="nasa-tags">
                  {['APOD','Mars Rover','Satellite Feeds','Space Weather'].map(t => (
                    <span key={t} className="nasa-tag gl">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="sh-section cta-section" style={{ position:'relative', textAlign:'center' }}>
        <div className="cta-glow" aria-hidden><div className="cta-glow-inner" /></div>
        <div style={{ maxWidth:680, margin:'0 auto', position:'relative', zIndex:1 }} className="reveal">
          <div className="gl" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 20px', borderRadius:100, marginBottom:32 }}>
            <Star style={{ width:13, height:13, color:'#fbbf24' }} />
            <span style={{ fontSize:10, color:'rgba(200,210,240,0.7)', letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:700, fontFamily:"'Syne',sans-serif" }}>Join 150,000+ explorers</span>
          </div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(2.5rem,7vw,5.5rem)', lineHeight:0.95, letterSpacing:'-0.025em', marginBottom:24 }}>
            <span style={{ display:'block', color:'#f0f0ff' }}>Your journey</span><span className="tg">begins now.</span>
          </h2>
          <p style={{ fontSize:'1.05rem', color:'rgba(180,185,220,0.65)', maxWidth:480, margin:'0 auto 48px', lineHeight:1.76, fontWeight:300 }}>
            Sign up free, explore NASA's universe, and share discoveries with a community that looks up.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:16, justifyContent:'center', alignItems:'center' }}>
            {/* ✅ No auto-redirect — explicit user click */}
            <Link href={finalCTA} className="btn-primary" style={{ padding:'16px 40px', fontSize:'1.05rem', boxShadow:'0 0 60px rgba(124,58,237,0.38),0 8px 40px rgba(0,0,0,0.4)' }}>
              <Zap style={{ width:18, height:18 }} />
              {finalLabel}
              <ArrowRight className="arr-anim" style={{ width:18, height:18 }} />
            </Link>
            <span style={{ fontSize:13, color:'rgba(120,125,160,0.6)', fontWeight:500 }}>Free forever · No card needed</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sh-footer">
        <div className="footer-inner">
          <Link href="/" className="footer-logo">
            <div className="footer-logo-icon"><Rocket style={{ width:16, height:16, color:'#fff' }} /></div>
            <span className="tg" style={{ fontSize:'1.1rem', fontFamily:"'Syne',sans-serif", fontWeight:800, letterSpacing:'-0.02em' }}>StellarHub</span>
          </Link>
          <div className="footer-links">
            {['Privacy','Terms','API Docs','Status'].map(l => <Link key={l} href="#">{l}</Link>)}
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} StellarHub. Built for stargazers.</p>
        </div>
      </footer>
    </div>
  )
}