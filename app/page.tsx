'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Rocket, Satellite, Star, Users, ArrowRight, Globe, Heart,
  Bookmark, Zap, ChevronRight, Play, Camera, Newspaper, Share2,
  Sparkles, Eye, Radio, Mail, MapPin, Send, MessageCircle,
  Github, Twitter, Instagram, Shield, Cpu, Award, Wifi,
} from 'lucide-react'

declare global { interface Window { gsap: any; ScrollTrigger: any } }

function seededRand(s: number) {
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}
const rand = seededRand(42)
const STARS = Array.from({ length: 220 }, (_, i) => ({
  id: i, x: rand() * 100, y: rand() * 100,
  sz: rand() * 2.8 + 0.4, dl: rand() * 9, dr: rand() * 5 + 3, op: rand() * 0.85 + 0.15,
}))

const FEATURES = [
  { icon: Camera,    title: 'NASA Live Imagery',      desc: 'Foto luar angkasa terbaru dari NASA APOD langsung di feed kamu setiap hari. Data nyata dari kosmos.', accent: '#c084fc', tag: 'Live Data',   points: ['APOD harian otomatis','Mars Rover real-time','Resolusi penuh'] },
  { icon: Newspaper, title: 'Buat & Bagikan Post',    desc: 'Tulis caption, tempel URL gambar, dan bagikan penemuan kosmis ke komunitas global yang antusias.', accent: '#818cf8', tag: 'Social',      points: ['Editor post intuitif','Tag lokasi & kategori','Jadwal posting'] },
  { icon: Heart,     title: 'Like & Koleksi',          desc: 'Klik suka pada postingan inspiratif dan simpan ke koleksi pribadi. Arsip momen favoritmu selamanya.', accent: '#f472b6', tag: 'Engagement', points: ['Animasi like interaktif','Koleksi terorganisir','Notifikasi real-time'] },
  { icon: Radio,     title: 'Feed Dinamis Real-time', desc: 'Feed bertenaga Supabase yang terus diperbarui tanpa reload. Konten segar mengalir sepanjang waktu.', accent: '#34d399', tag: 'Real-time',  points: ['Update tanpa reload','Filter & sort canggih','Infinite scroll'] },
]
const STATS = [
  { val: '150K+', label: 'Penjelajah',    icon: Users,     c: '#c084fc' },
  { val: '25M+',  label: 'Observasi',     icon: Eye,       c: '#818cf8' },
  { val: '180+',  label: 'Negara',        icon: Globe,     c: '#34d399' },
  { val: '24/7',  label: 'Live Feed',     icon: Satellite, c: '#f472b6' },
]
const STEPS = [
  { n: '01', label: 'Daftar Gratis',          icon: Rocket,    c: '#c084fc', detail: 'Buat akun dalam 30 detik. Tidak perlu kartu kredit. Langsung aktif menjelajah jagat raya bersama ribuan astronomer amatir.' },
  { n: '02', label: 'Jelajahi Alam Semesta',  icon: Satellite, c: '#818cf8', detail: 'Temukan foto-foto menakjubkan dari NASA, lihat postingan komunitas global, nikmati konten luar angkasa terkini.' },
  { n: '03', label: 'Bagikan Penemuanmu',     icon: Share2,    c: '#34d399', detail: 'Post penemuanmu, like konten terbaik, simpan ke koleksi, dan bangun koneksi dengan sesama pecinta luar angkasa.' },
]
const TRUST = [
  { icon: Shield, title: 'Aman & Terpercaya', desc: 'Data enkripsi end-to-end.' },
  { icon: Cpu,    title: 'Bertenaga AI',       desc: 'Rekomendasi konten cerdas.' },
  { icon: Wifi,   title: 'Uptime 99.9%',       desc: 'Infrastruktur cloud global.' },
  { icon: Award,  title: 'Komunitas #1',       desc: 'Platform astronomi terbaik.' },
]
const TESTI = [
  { n: 'Reza Firmansyah', r: 'Astronom Amatir, Bandung',           av: 'R', c: '#7c3aed', t: 'StellarHub mengubah cara saya menikmati astronomi. Feed NASA harian-nya luar biasa — setiap pagi selalu ada foto galaksi baru yang memukau.' },
  { n: 'Siti Nuraini',    r: 'Fotografer Langit Malam, Yogyakarta', av: 'S', c: '#4f46e5', t: 'Platform terbaik untuk berbagi foto langit malam saya. Komunitas di sini sangat supportif dan antusias. Sudah 3 bulan aktif!' },
  { n: 'Dimas Pratama',   r: 'Mahasiswa Fisika, Surabaya',          av: 'D', c: '#0ea5e9', t: 'Sebagai mahasiswa fisika, StellarHub jadi referensi harian. Data Mars Rover langsung dari NASA tersaji dengan visual keren.' },
]

export default function StellarHubLanding() {
  const [user, setUser]   = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [form, setForm]   = useState({ name: '', email: '', message: '' })
  const [sent, setSent]   = useState(false)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    const load = (src: string) => new Promise<void>(res => {
      if (document.querySelector(`script[src="${src}"]`)) return res()
      const s = document.createElement('script'); s.src = src; s.onload = () => res(); document.head.appendChild(s)
    })
    Promise.all([
      load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
      load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'),
    ]).then(() => {
      const { gsap, ScrollTrigger } = window
      gsap.registerPlugin(ScrollTrigger)

      gsap.set('.hero-wrap', { autoAlpha: 1 })
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.h-badge',  { autoAlpha: 0, y: 32, duration: 0.9, delay: 0.3 })
        .from('.h-line1',  { autoAlpha: 0, y: 100, skewY: 4, duration: 1.2 }, '-=0.5')
        .from('.h-line2',  { autoAlpha: 0, y: 100, skewY: 4, duration: 1.2 }, '-=1.0')
        .from('.h-sub',    { autoAlpha: 0, y: 40, duration: 0.9 }, '-=0.75')
        .from('.h-cta > *',{ autoAlpha: 0, y: 30, stagger: 0.12, duration: 0.8 }, '-=0.65')
        .from('.h-stat',   { autoAlpha: 0, y: 50, scale: 0.85, stagger: 0.1, duration: 0.85, ease: 'back.out(1.8)' }, '-=0.5')

      document.querySelectorAll('.rv').forEach((el: any) => {
        gsap.from(el, { autoAlpha: 0, y: 70, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' } })
      })

      gsap.from('.fc', {
        autoAlpha: 0, y: 90, scale: 0.88, stagger: 0.14, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.feat-grid', start: 'top 87%', toggleActions: 'play none none none' },
      })
      document.querySelectorAll('.fc').forEach((card: any) => {
        card.addEventListener('mouseenter', () =>
          gsap.to(card, { scale: 1.03, rotateZ: (Math.random() - 0.5) * 2, duration: 0.35, ease: 'back.out(3)' }))
        card.addEventListener('mouseleave', () =>
          gsap.to(card, { scale: 1, rotateZ: 0, rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }))
        card.addEventListener('mousemove', (e: any) => {
          const r = card.getBoundingClientRect()
          const x = (e.clientX - r.left - r.width/2) / r.width
          const y = (e.clientY - r.top  - r.height/2) / r.height
          gsap.to(card, { rotateY: x*16, rotateX: -y*16, duration: 0.4, ease: 'power2.out', transformPerspective: 900 })
        })
      })

      gsap.from('.sc', {
        autoAlpha: 0, x: -70, rotate: -3, stagger: 0.16, duration: 1.0, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.step-row', start: 'top 87%', toggleActions: 'play none none none' },
      })
      document.querySelectorAll('.sc').forEach((card: any) => {
        card.addEventListener('mouseenter', () =>
          gsap.to(card, { y: -10, rotate: 1, scale: 1.03, duration: 0.35, ease: 'back.out(2)' }))
        card.addEventListener('mouseleave', () =>
          gsap.to(card, { y: 0, rotate: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1,0.4)' }))
      })

      gsap.from('.ti', {
        autoAlpha: 0, y: 50, scale: 0.85, stagger: 0.1, duration: 0.85, ease: 'back.out(1.8)',
        scrollTrigger: { trigger: '.trust-row', start: 'top 88%', toggleActions: 'play none none none' },
      })
      document.querySelectorAll('.ti').forEach((el: any) => {
        el.addEventListener('mouseenter', () => gsap.to(el, { y: -8, scale: 1.06, rotate: (Math.random()-0.5)*1.5, duration: 0.3, ease: 'back.out(2)' }))
        el.addEventListener('mouseleave', () => gsap.to(el, { y: 0, scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' }))
      })

      gsap.from('.tc', {
        autoAlpha: 0, y: 70, rotateX: 18, scale: 0.92, stagger: 0.15, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.testi-row', start: 'top 88%', toggleActions: 'play none none none' },
      })
      document.querySelectorAll('.tc').forEach((card: any) => {
        card.addEventListener('mouseenter', () => gsap.to(card, { y: -10, scale: 1.03, duration: 0.3, ease: 'back.out(2)' }))
        card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, scale: 1, duration: 0.65, ease: 'elastic.out(1,0.45)' }))
      })

      gsap.from('.nasa-l', { autoAlpha: 0, x: -90, rotate: 2,  duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.nasa-row', start: 'top 87%', toggleActions: 'play none none none' } })
      gsap.from('.nasa-r', { autoAlpha: 0, x:  90, rotate: -2, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.nasa-row', start: 'top 87%', toggleActions: 'play none none none' } })

      document.querySelectorAll('.sv').forEach((el: any) => {
        const tv = el.dataset.v || '', num = parseFloat(tv.replace(/[^0-9.]/g, '')), suf = tv.replace(/[0-9.]/g, '')
        const obj = { v: 0 }
        gsap.to(obj, { v: num, duration: 2.5, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) + suf },
          scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
      })

      gsap.to('.ra', { rotation: 360,  duration: 20, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
      gsap.to('.rb', { rotation: -360, duration: 13, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
      gsap.to('.rc', { rotation: 360,  duration: 35, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })

      document.querySelectorAll('.fp').forEach((p: any, i) => {
        gsap.to(p, { y: -(25+i*9), x: (i%2?1:-1)*(8+i*4), duration: 3+i*0.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i*0.5 })
      })

      const shoot = () => {
        const s = document.querySelector('.sstar') as HTMLElement; if (!s) return
        const sx = Math.random()*window.innerWidth*0.65, sy = Math.random()*window.innerHeight*0.45
        gsap.set(s, { x: sx, y: sy, opacity: 0, scaleX: 1, rotate: -28 })
        gsap.timeline()
          .to(s, { opacity: 1, duration: 0.07 })
          .to(s, { x: sx+360, y: sy+145, opacity: 0, scaleX: 4.5, duration: 0.72, ease: 'power2.in' })
          .call(() => setTimeout(shoot, Math.random()*6000+2500))
      }
      setTimeout(shoot, 1800)

      gsap.from('.ff', {
        autoAlpha: 0, y: 40, stagger: 0.1, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: '.cform', start: 'top 85%', toggleActions: 'play none none none' },
      })
      gsap.from('.ci-card', {
        autoAlpha: 0, x: -55, stagger: 0.13, duration: 0.95, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.cinfo', start: 'top 85%', toggleActions: 'play none none none' },
      })
    })
  }, [])

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setUser(data) })
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { gsap } = window
    if (gsap) {
      gsap.timeline()
        .to('.cform', { scale: 0.95, duration: 0.12, ease: 'power2.in' })
        .to('.cform', { scale: 1,    duration: 0.6,  ease: 'elastic.out(1,0.45)' })
    }
    setSent(true); setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 5000)
  }

  return (
    <div id="sh">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');
        
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        
        :root{
          --bg:#04030a;
          --tx:#fff;--tx2:rgba(230,225,255,0.85);--tx3:rgba(190,180,245,0.52);
          --sp:cubic-bezier(0.175,0.885,0.32,1.275);--eo:cubic-bezier(0.16,1,0.3,1);
        }
        
        html{scroll-behavior:smooth}
        
        #sh{
          min-height:100svh;
          color:var(--tx);
          overflow-x:hidden;
          font-family:'Plus Jakarta Sans',system-ui,sans-serif;
          -webkit-font-smoothing:antialiased;
          position: relative;
        }
        
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:var(--bg)}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#7c3aed,#818cf8)}
        ::selection{background:rgba(124,58,237,0.4);color:#fff}

        /* ===== BACKGROUND YANG PASTI KELIATAN ===== */
        #bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(145deg, #1a0f2e 0%, #0c0a1f 40%, #050314 80%, #1a1030 100%);
        }

        /* Gradient lapisan 1 - Ungu terang di kiri atas */
        #bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 10% 20%, rgba(156, 39, 176, 0.6) 0%, transparent 50%);
          z-index: 1;
          mix-blend-mode: screen;
        }

        /* Gradient lapisan 2 - Biru terang di kanan bawah */
        #bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 90% 80%, rgba(33, 150, 243, 0.5) 0%, transparent 55%);
          z-index: 2;
          mix-blend-mode: screen;
        }

        /* Lapisan tambahan - Pink di tengah */
        .bg-layer-3 {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 40% 50%, rgba(233, 30, 99, 0.4) 0%, transparent 60%);
          z-index: 3;
          mix-blend-mode: overlay;
        }

        /* Lapisan grid */
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 4;
          opacity: 0.3;
        }

        /* Vignette */
        .bg-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.7) 90%);
          z-index: 5;
        }

        /* Stars */
        .star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: twinkle var(--dr) ease-in-out infinite;
          z-index: 6;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        /* Saturn - biar makin hidup */
        .saturn-wrap {
          position: absolute;
          top: -5%;
          right: -5%;
          width: 500px;
          height: 500px;
          opacity: 0.25;
          animation: float 15s ease-in-out infinite;
          z-index: 7;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .saturn-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 100px;
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 50%;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
        }

        .saturn-ring::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
        }

        /* Content wrapper */
        .sec, footer {
          position: relative;
          z-index: 20;
        }

        /* ===== GLASS EFFECT (tetap sama) ===== */
        .glass{
          background:rgba(12,6,28,0.42);
          border:1px solid rgba(167,139,250,0.22);
          backdrop-filter:blur(40px) saturate(200%) brightness(1.2);
          -webkit-backdrop-filter:blur(40px) saturate(200%) brightness(1.2);
          box-shadow:inset 0 1px 0 rgba(196,181,253,0.16),inset 0 -1px 0 rgba(0,0,0,0.28),0 8px 32px rgba(0,0,0,0.4);
        }
        .glass-strong{
          background:rgba(10,5,24,0.52);
          border:1px solid rgba(167,139,250,0.3);
          backdrop-filter:blur(56px) saturate(220%) brightness(1.15);
          -webkit-backdrop-filter:blur(56px) saturate(220%) brightness(1.15);
          box-shadow:inset 0 1px 0 rgba(196,181,253,0.2),0 16px 60px rgba(0,0,0,0.55);
        }

        .sec{position:relative;z-index:20}
        .wrap{max-width:1140px;margin:0 auto}
        .pad{padding:clamp(80px,12vw,140px) 24px}

        .tg{background:linear-gradient(115deg,#ddd6fe 0%,#a78bfa 22%,#818cf8 48%,#c084fc 72%,#f0abfc 90%,#ddd6fe 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:260% auto;animation:ga 8s ease infinite}
        @keyframes ga{0%,100%{background-position:0% center}50%{background-position:100% center}}
        
        .eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.24em}
        .el{display:block;width:28px;height:1.5px;border-radius:2px;opacity:.55}
        .h2{font-family:'Playfair Display',serif;font-size:clamp(2.4rem,6vw,5rem);font-weight:900;line-height:.96;letter-spacing:-.025em}
        .sub{font-size:clamp(.97rem,1.8vw,1.15rem);color:var(--tx2);font-weight:500;line-height:1.8;max-width:600px}

        .hero{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:clamp(100px,14vw,140px) 24px clamp(80px,10vw,110px);text-align:center;position:relative}
        .hero-wrap{visibility:hidden;position:relative;z-index:2}
        .h-badge{display:inline-flex;align-items:center;gap:10px;padding:9px 24px;border-radius:100px;margin-bottom:48px}
        .bdot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.22);animation:bp 2.2s ease-in-out infinite}
        @keyframes bp{0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,.22)}50%{box-shadow:0 0 0 10px rgba(16,185,129,0)}}
        .btext{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(210,200,255,.9)}
        .h1{font-family:'Playfair Display',serif;font-size:clamp(4rem,11vw,10.5rem);font-weight:900;line-height:.88;letter-spacing:-.03em;margin-bottom:clamp(20px,3vw,32px)}
        .h-line1{display:block;color:#fff}
        .h-line2{display:block}
        .h-sub{font-size:clamp(1.05rem,2vw,1.22rem);font-weight:500;color:var(--tx2);max-width:580px;margin:0 auto clamp(36px,5vw,52px);line-height:1.82}

        .h-cta{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-bottom:clamp(52px,8vw,88px)}
        .btn{display:inline-flex;align-items:center;gap:10px;padding:16px 38px;border-radius:18px;color:#fff;font-weight:700;font-size:.97rem;font-family:'Plus Jakarta Sans',sans-serif;background:linear-gradient(135deg,#7c3aed,#4f46e5);text-decoration:none;border:none;cursor:pointer;position:relative;overflow:hidden;transition:transform .25s var(--sp),box-shadow .3s;box-shadow:0 6px 32px rgba(124,58,237,.5),inset 0 1px 0 rgba(255,255,255,.15)}
        .btn:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s}
        .btn:hover:before{opacity:1}
        .btn:hover{transform:translateY(-4px) scale(1.04);box-shadow:0 0 60px rgba(124,58,237,.65),0 16px 40px rgba(0,0,0,.4)}
        .btn:active{transform:scale(.97)}
        .btn .sh{position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);transition:left .6s ease}
        .btn:hover .sh{left:160%}
        .btn-o{display:inline-flex;align-items:center;gap:10px;padding:16px 32px;border-radius:18px;color:var(--tx2);font-weight:600;font-size:.95rem;text-decoration:none;transition:transform .25s var(--sp),background .3s,border-color .3s}
        .btn-o:hover{transform:translateY(-3px)}
        .arr{transition:transform .22s ease}.btn:hover .arr,.btn-o:hover .arr{transform:translateX(5px)}
        .porb{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}

        .stats{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:700px;width:100%;margin:0 auto}
        @media(min-width:560px){.stats{grid-template-columns:repeat(4,1fr)}}
        .h-stat{border-radius:24px;padding:22px 14px;display:flex;flex-direction:column;align-items:center;gap:7px;
          background:rgba(12,6,28,0.4);border:1px solid rgba(167,139,250,.22);
          backdrop-filter:blur(36px) saturate(200%) brightness(1.2);-webkit-backdrop-filter:blur(36px) saturate(200%) brightness(1.2);
          transition:transform .35s var(--sp),border-color .3s,box-shadow .3s}
        .h-stat:hover{transform:translateY(-10px) scale(1.09);border-color:rgba(196,181,253,.45);box-shadow:0 20px 60px rgba(124,58,237,.25),0 0 0 1px rgba(196,181,253,.22)}
        .sv{font-family:'Playfair Display',serif;font-size:2.1rem;font-weight:900;color:#fff;letter-spacing:-.03em}
        .sl{font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.22em;font-weight:700}

        .shint{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2}
        .sline{width:1px;height:52px;background:linear-gradient(to bottom,transparent,rgba(139,92,246,.9),transparent);animation:sl 2.4s ease-in-out infinite}
        @keyframes sl{0%,100%{opacity:.2;transform:scaleY(.5)}50%{opacity:1;transform:scaleY(1)}}
        .slbl{font-size:9px;color:var(--tx3);text-transform:uppercase;letter-spacing:.28em;font-weight:700}

        .feat-grid{display:grid;gap:18px}
        @media(min-width:768px){.feat-grid{grid-template-columns:repeat(2,1fr)}}
        .fc{border-radius:28px;padding:clamp(28px,4vw,44px);position:relative;overflow:hidden;
          background:rgba(10,5,24,0.38);border:1px solid rgba(139,92,246,.22);
          backdrop-filter:blur(44px) saturate(210%) brightness(1.18);-webkit-backdrop-filter:blur(44px) saturate(210%) brightness(1.18);
          box-shadow:inset 0 1px 0 rgba(196,181,253,.12),0 8px 40px rgba(0,0,0,.45);
          transform-style:preserve-3d;will-change:transform;cursor:default;transition:border-color .35s,box-shadow .35s}
        .fc:hover{border-color:rgba(196,181,253,.38);box-shadow:inset 0 1px 0 rgba(196,181,253,.18),0 30px 80px rgba(0,0,0,.55)}
        .fc-glow{position:absolute;inset:0;border-radius:28px;opacity:0;transition:opacity .5s;pointer-events:none}
        .fc:hover .fc-glow{opacity:1}
        .fibox{width:58px;height:58px;border-radius:18px;display:flex;align-items:center;justify-content:center;margin-bottom:22px}
        .ftag{padding:5px 13px;border-radius:100px;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.16em}
        .ft{font-size:1.22rem;font-weight:800;color:#fff;margin-bottom:12px;letter-spacing:-.01em}
        .fd{color:var(--tx2);line-height:1.8;font-size:.93rem;font-weight:500;margin-bottom:18px}
        .fpts{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
        .fpt{display:flex;align-items:center;gap:9px;font-size:.85rem;font-weight:600;color:var(--tx2)}
        .fpdot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .flink{display:inline-flex;align-items:center;gap:6px;font-size:.85rem;font-weight:700;text-decoration:none;transition:gap .2s}
        .flink:hover{gap:10px}

        .mock{max-width:880px;margin:0 auto;border-radius:28px;overflow:hidden;
          background:rgba(8,4,20,0.48);border:1px solid rgba(139,92,246,.2);
          backdrop-filter:blur(36px) saturate(180%);-webkit-backdrop-filter:blur(36px) saturate(180%);
          box-shadow:0 0 0 1px rgba(255,255,255,.04),0 60px 120px rgba(0,0,0,.65)}
        .mbar{padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px}
        .mdr{width:12px;height:12px;border-radius:50%}
        .murl{flex:1;height:28px;border-radius:9px;margin:0 16px;background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;gap:8px;font-size:11px;color:rgba(196,181,253,.45);font-family:'JetBrains Mono',monospace;letter-spacing:.04em}
        .live{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 7px #10b981;animation:lp 1.5s ease-in-out infinite}
        @keyframes lp{0%,100%{box-shadow:0 0 7px #10b981}50%{box-shadow:0 0 14px #10b981,0 0 22px rgba(16,185,129,.4)}}
        .mpost{border-radius:18px;padding:16px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.055)}
        .mav{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0}
        .mimg{height:88px;border-radius:14px;margin:12px 0;display:flex;align-items:center;justify-content:center}

        .step-row{display:flex;flex-direction:column;gap:22px}
        @media(min-width:768px){.step-row{flex-direction:row;gap:24px;align-items:stretch}}
        .sc{flex:1;border-radius:28px;padding:clamp(28px,4vw,40px);position:relative;overflow:hidden;
          background:rgba(10,5,24,0.4);border:1px solid rgba(139,92,246,.22);
          backdrop-filter:blur(44px) saturate(200%) brightness(1.15);-webkit-backdrop-filter:blur(44px) saturate(200%) brightness(1.15);
          box-shadow:inset 0 1px 0 rgba(196,181,253,.12),0 8px 36px rgba(0,0,0,.4);
          transition:border-color .35s,box-shadow .35s;will-change:transform}
        .sc:hover{border-color:rgba(196,181,253,.36);box-shadow:inset 0 1px 0 rgba(196,181,253,.16),0 24px 70px rgba(0,0,0,.55)}
        .sn{font-family:'Playfair Display',serif;font-size:4.8rem;font-weight:900;line-height:1;letter-spacing:-.04em;opacity:.08;position:absolute;top:18px;right:22px}
        .sibox{width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;margin-bottom:18px}
        .slabel{font-size:1.18rem;font-weight:800;color:#fff;margin-bottom:10px}
        .sdetail{color:var(--tx2);font-size:.9rem;line-height:1.8;font-weight:500}

        .trust-row{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
        @media(min-width:640px){.trust-row{grid-template-columns:repeat(4,1fr)}}
        .ti{border-radius:22px;padding:24px 18px;text-align:center;
          background:rgba(10,5,24,0.4);border:1px solid rgba(139,92,246,.2);
          backdrop-filter:blur(36px) saturate(200%);-webkit-backdrop-filter:blur(36px) saturate(200%);
          box-shadow:inset 0 1px 0 rgba(196,181,253,.08);will-change:transform}
        .tiicon{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;background:rgba(139,92,246,.14);border:1px solid rgba(139,92,246,.26)}
        .titl{font-size:.9rem;font-weight:800;color:#fff;margin-bottom:6px}
        .tidesc{font-size:.8rem;color:var(--tx3);line-height:1.7;font-weight:500}

        .testi-row{display:grid;gap:18px}
        @media(min-width:768px){.testi-row{grid-template-columns:repeat(3,1fr)}}
        .tc{border-radius:24px;padding:28px;position:relative;overflow:hidden;
          background:rgba(10,5,24,0.4);border:1px solid rgba(139,92,246,.22);
          backdrop-filter:blur(44px) saturate(200%) brightness(1.12);-webkit-backdrop-filter:blur(44px) saturate(200%) brightness(1.12);
          box-shadow:inset 0 1px 0 rgba(196,181,253,.1),0 8px 36px rgba(0,0,0,.4);
          will-change:transform;transform-style:preserve-3d}
        .tq{font-size:3rem;line-height:1;color:rgba(167,139,250,.26);font-family:'Playfair Display',serif;margin-bottom:12px}
        .tt{font-size:.9rem;color:var(--tx2);line-height:1.82;font-weight:500;margin-bottom:20px}
        .tav{width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0}
        .tn{font-size:.9rem;font-weight:800;color:#fff;margin-bottom:2px}
        .tr{font-size:.78rem;color:var(--tx3);font-weight:500}

        .nasa-wrap{padding:clamp(60px,10vw,120px) 24px}
        .nasa-card{border-radius:32px;padding:clamp(36px,5vw,64px);position:relative;overflow:hidden;
          background:rgba(8,4,20,0.48);border:1px solid rgba(139,92,246,.28);
          backdrop-filter:blur(56px) saturate(220%) brightness(1.1);-webkit-backdrop-filter:blur(56px) saturate(220%) brightness(1.1);
          box-shadow:inset 0 1px 0 rgba(196,181,253,.14),0 60px 120px rgba(0,0,0,.6)}
        .ng1{position:absolute;top:-80px;right:-80px;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(14,165,233,.18),transparent 60%);pointer-events:none}
        .ng2{position:absolute;bottom:-60px;left:-60px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.14),transparent 60%);pointer-events:none}
        .nasa-row{position:relative;z-index:1;display:flex;flex-direction:column;gap:48px;align-items:center}
        @media(min-width:768px){.nasa-row{flex-direction:row;gap:64px}}
        .norb{position:relative;width:200px;height:200px;flex-shrink:0}
        .ra,.rb,.rc{position:absolute;border-radius:50%;will-change:transform}
        .ra{inset:0;border:1.5px solid rgba(14,165,233,.32)}
        .rb{inset:24px;border:1.5px solid rgba(139,92,246,.28)}
        .rc{inset:44px;border:1px solid rgba(232,121,249,.22)}
        .ncore{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
        .nibox{width:84px;height:84px;border-radius:24px;display:flex;align-items:center;justify-content:center;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.28)}
        .fp{position:absolute;width:9px;height:9px;border-radius:50%}
        .fp1{background:#38bdf8;top:6%;right:18%;box-shadow:0 0 12px #38bdf8}
        .fp2{background:#c084fc;bottom:12%;right:8%;box-shadow:0 0 12px #c084fc}
        .fp3{background:#34d399;top:50%;left:4%;box-shadow:0 0 10px #34d399}
        .ntag{display:flex;flex-wrap:wrap;gap:9px;margin-top:22px}
        .ntagi{padding:8px 18px;border-radius:14px;font-size:11px;font-weight:600;color:var(--tx2);letter-spacing:.07em;
          background:rgba(10,5,24,0.42);border:1px solid rgba(139,92,246,.2);
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);transition:background .2s,border-color .2s}
        .ntagi:hover{background:rgba(139,92,246,.14);border-color:rgba(139,92,246,.38)}

        .cta-sec{padding:clamp(80px,12vw,160px) 24px;text-align:center;position:relative}
        .cta-blob{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
        .cta-b{width:900px;height:500px;border-radius:50%;background:radial-gradient(ellipse,rgba(124,58,237,.2) 0%,rgba(99,102,241,.08) 40%,transparent 70%);filter:blur(80px)}

        .contact-sec{padding:clamp(80px,12vw,140px) 24px}
        .cgrid{display:grid;gap:52px}
        @media(min-width:768px){.cgrid{grid-template-columns:1fr 1fr;align-items:start}}
        .cinfo{display:flex;flex-direction:column;gap:16px}
        .ci-card{display:flex;align-items:flex-start;gap:18px;padding:22px 24px;border-radius:22px;text-decoration:none;
          background:rgba(10,5,24,0.4);border:1px solid rgba(139,92,246,.22);
          backdrop-filter:blur(36px) saturate(200%);-webkit-backdrop-filter:blur(36px) saturate(200%);
          box-shadow:inset 0 1px 0 rgba(196,181,253,.08);
          transition:border-color .3s,transform .3s var(--sp),box-shadow .3s}
        .ci-card:hover{transform:translateX(8px) scale(1.02);border-color:rgba(196,181,253,.38);box-shadow:inset 0 1px 0 rgba(196,181,253,.14),0 10px 40px rgba(124,58,237,.16)}
        .ciicon{width:50px;height:50px;border-radius:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .cilabel{font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.18em;font-weight:800;margin-bottom:5px}
        .cival{font-size:1rem;color:#fff;font-weight:800;margin-bottom:3px}
        .cisub{font-size:.82rem;color:var(--tx3);font-weight:500}
        .cform{border-radius:30px;padding:clamp(24px,4vw,46px);
          background:rgba(8,4,20,0.5);border:1px solid rgba(139,92,246,.26);
          backdrop-filter:blur(56px) saturate(220%);-webkit-backdrop-filter:blur(56px) saturate(220%);
          box-shadow:inset 0 1px 0 rgba(196,181,253,.13),0 16px 60px rgba(0,0,0,.5)}
        .ff{display:flex;flex-direction:column;gap:9px}
        .flabel{font-size:11px;font-weight:800;color:var(--tx3);text-transform:uppercase;letter-spacing:.16em}
        .fwrap{position:relative}
        .inp{width:100%;padding:14px 20px;border-radius:15px;background:rgba(255,255,255,.055);border:1.5px solid rgba(139,92,246,.2);color:#fff;font-size:.94rem;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;outline:none;transition:border-color .3s,box-shadow .3s,background .3s}
        .inp:focus{border-color:rgba(139,92,246,.65);box-shadow:0 0 0 4px rgba(124,58,237,.13);background:rgba(255,255,255,.08)}
        .inp::placeholder{color:rgba(180,168,230,.32)}
        textarea.inp{resize:vertical;min-height:140px;line-height:1.65}
        .fbar{position:absolute;bottom:-1px;left:50%;width:0%;height:2px;background:linear-gradient(90deg,#7c3aed,#818cf8);border-radius:2px;transform:translateX(-50%);transition:width .38s var(--eo)}
        .inp:focus~.fbar{width:100%}
        .sbtn{width:100%;padding:17px;border-radius:17px;color:#fff;font-size:1.02rem;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;cursor:pointer;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 6px 30px rgba(124,58,237,.5),inset 0 1px 0 rgba(255,255,255,.13);transition:transform .25s var(--sp),box-shadow .3s}
        .sbtn:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.13),transparent);opacity:0;transition:opacity .3s}
        .sbtn:hover:before{opacity:1}
        .sbtn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 0 50px rgba(124,58,237,.6),0 12px 36px rgba(0,0,0,.4)}
        .sbtn .sh{position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);transition:left .6s ease}
        .sbtn:hover .sh{left:160%}
        .ok{padding:16px 22px;border-radius:17px;margin-bottom:22px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.28);display:flex;align-items:center;gap:12px;font-size:.93rem;color:#6ee7b7;font-weight:700;animation:oki .45s var(--eo)}
        @keyframes oki{from{opacity:0;transform:translateY(18px) scale(.93)}to{opacity:1;transform:none}}

        .ft{border-top:1px solid rgba(255,255,255,.06);padding:clamp(36px,5vw,56px) 24px}
        .fti{max-width:1140px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:24px}
        @media(min-width:768px){.fti{flex-direction:row;justify-content:space-between}}
        .flogo{display:flex;align-items:center;gap:12px;text-decoration:none}
        .flogob{width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(124,58,237,.55),rgba(79,70,229,.55));border:1px solid rgba(255,255,255,.13)}
        .fnav{display:flex;gap:28px;flex-wrap:wrap;justify-content:center}
        .fnav a{font-size:13px;color:var(--tx3);text-decoration:none;transition:color .2s;font-weight:600}
        .fnav a:hover{color:rgba(230,225,255,.92)}
        .fsoc{display:flex;gap:11px}
        .socb{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(10,5,24,.42);border:1px solid rgba(139,92,246,.18);backdrop-filter:blur(20px);transition:transform .2s var(--sp),border-color .2s,background .2s}
        .socb:hover{transform:translateY(-4px) scale(1.12);background:rgba(139,92,246,.18);border-color:rgba(196,181,253,.32)}
        .fcopy{font-size:12px;color:var(--tx3);font-weight:600}

        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      {/* BACKGROUND - BIKIN PASTI KELIATAN */}
      <div id="bg">
        {/* Lapisan gradient tambahan - PASTI KELIATAN */}
        <div className="bg-layer-3"></div>
        <div className="bg-grid"></div>
        <div className="bg-vignette"></div>
        
        {/* Saturn effect */}
        <div className="saturn-wrap">
          <div className="saturn-ring"></div>
        </div>

        {/* Stars */}
        {mounted && STARS.map(s => (
          <span key={s.id} className="star" style={{ 
            left:`${s.x}%`, 
            top:`${s.y}%`, 
            width:s.sz * 1.5, 
            height:s.sz * 1.5, 
            '--dr':`${s.dr}s`, 
            '--dl':`${s.dl}s`
          } as any}/>
        ))}
      </div>

      {/* HERO - kontennya sama persis */}
      <section className="sec hero">
        <div className="hero-wrap">
          <div className="h-badge glass">
            <span className="bdot"/><span className="btext">Live · NASA APIs · Space Community</span>
          </div>
          <h1 className="h1">
            <span className="h-line1">Jelajahi</span>
            <span className="h-line2 tg">Alam Semesta</span>
          </h1>
          <p className="h-sub">StellarHub adalah platform komunitas luar angkasa — gabungkan foto NASA langsung, posting penemuanmu, dan terhubung dengan ribuan pecinta antariksa dari seluruh dunia.</p>
          <div className="h-cta">
            <Link href={user ? '/feed' : '/register'} className="btn">
              <span className="sh"/><Rocket style={{width:17,height:17}}/>{user ? 'Buka Feed' : 'Mulai Gratis'}<ArrowRight className="arr" style={{width:17,height:17}}/>
            </Link>
            <Link href="/explore" className="btn-o glass">
              <span className="porb"><Play style={{width:10,height:10,marginLeft:1}}/></span>
              Jelajahi<ArrowRight className="arr" style={{width:14,height:14,opacity:.6}}/>
            </Link>
          </div>
          <div className="stats">
            {STATS.map((s, i) => (
              <div key={i} className="h-stat">
                <s.icon style={{width:15,height:15,color:s.c,marginBottom:3}}/>
                <span className="sv" data-v={s.val}>{s.val}</span>
                <span className="sl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="shint"><div className="sline"/><span className="slbl">Scroll</span></div>
      </section>

      {/* FEATURES */}
      <section className="sec pad">
        <div className="wrap">
          <div style={{textAlign:'center',marginBottom:'clamp(48px,7vw,88px)'}} className="rv">
            <div className="eyebrow" style={{color:'#a78bfa',justifyContent:'center',marginBottom:18}}>
              <span className="el" style={{background:'#a78bfa'}}/>Fitur Platform<span className="el" style={{background:'#a78bfa'}}/>
            </div>
            <h2 className="h2" style={{marginBottom:20}}>
              <span style={{display:'block',color:'#fff'}}>Semua yang kamu butuhkan</span>
              <span className="tg">untuk menjelajah bintang</span>
            </h2>
            <p className="sub" style={{margin:'0 auto'}}>Dari data NASA real-time hingga komunitas aktif — StellarHub menghadirkan pengalaman eksplorasi luar angkasa terlengkap.</p>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="fc">
                <div className="fc-glow" style={{background:`radial-gradient(ellipse at 15% 55%,${f.accent}1e 0%,transparent 60%)`}}/>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22}}>
                    <div className="fibox" style={{background:`${f.accent}15`,border:`1px solid ${f.accent}2e`}}>
                      <f.icon style={{width:24,height:24,color:f.accent}}/>
                    </div>
                    <span className="ftag glass" style={{color:f.accent}}>{f.tag}</span>
                  </div>
                  <h3 className="ft">{f.title}</h3>
                  <p className="fd">{f.desc}</p>
                  <div className="fpts">
                    {f.points.map((p, j) => (
                      <div key={j} className="fpt">
                        <span className="fpdot" style={{background:f.accent,boxShadow:`0 0 7px ${f.accent}`}}/>
                        {p}
                      </div>
                    ))}
                  </div>
                  <a href="#" className="flink" style={{color:f.accent}}>Pelajari lebih <ChevronRight style={{width:15,height:15}}/></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOCKUP */}
      <section className="sec" style={{padding:'0 24px 80px'}}>
        <div className="mock rv">
          <div className="mbar">
            <div style={{display:'flex',gap:7}}>
              <div className="mdr" style={{background:'rgba(239,68,68,.6)'}}/><div className="mdr" style={{background:'rgba(234,179,8,.6)'}}/><div className="mdr" style={{background:'rgba(34,197,94,.6)'}}/>
            </div>
            <div className="murl"><div className="live"/><span>stellarhub.app/feed</span></div>
            <Sparkles style={{width:14,height:14,color:'#a78bfa'}}/>
          </div>
          <div style={{padding:18,display:'grid',gap:14}}>
            {[{n:'Alex Chen',t:'APOD Today',l:'2.4k',c:'38',bg:'#7c3aed'},{n:'Maria Kowalski',t:'Mars Rover',l:'891',c:'17',bg:'#4f46e5'},{n:'James Park',t:'Nebula M42',l:'3.1k',c:'54',bg:'#0ea5e9'}].map((p, i) => (
              <div key={i} className="mpost">
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div className="mav" style={{background:p.bg}}>{p.n[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:'#fff'}}>{p.n}</div>
                    <div style={{fontSize:10,color:'var(--tx3)',fontWeight:600}}>{p.t}</div>
                  </div>
                  <span style={{fontSize:9,padding:'3px 10px',borderRadius:100,background:`${p.bg}28`,border:`1px solid ${p.bg}45`,color:'rgba(220,215,255,.75)',fontWeight:700,letterSpacing:'.1em'}}>NEW</span>
                </div>
                <div className="mimg" style={{background:`linear-gradient(135deg,${p.bg}28,rgba(0,0,0,.42))`}}>
                  <Star style={{width:28,height:28,color:'rgba(255,255,255,.08)'}}/>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:18}}>
                  <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--tx3)',fontWeight:700}}><Heart style={{width:12,height:12}}/>{p.l}</span>
                  <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--tx3)',fontWeight:700}}><Bookmark style={{width:12,height:12}}/>Simpan</span>
                  <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--tx3)',fontWeight:700}}><Share2 style={{width:12,height:12}}/>Share</span>
                  <span style={{marginLeft:'auto',fontSize:11,color:'var(--tx3)',fontWeight:700}}>{p.c} komen</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="sec pad">
        <div className="wrap">
          <div style={{textAlign:'center',marginBottom:'clamp(48px,7vw,88px)'}} className="rv">
            <div className="eyebrow" style={{color:'#818cf8',justifyContent:'center',marginBottom:18}}>
              <span className="el" style={{background:'#818cf8'}}/>Cara Kerja<span className="el" style={{background:'#818cf8'}}/>
            </div>
            <h2 className="h2" style={{marginBottom:20}}>
              <span style={{display:'block',color:'#fff'}}>Tiga langkah menuju</span>
              <span className="tg">orbit pertamamu</span>
            </h2>
            <p className="sub" style={{margin:'0 auto'}}>Dari nol sampai menjelajahi galaksi hanya dalam beberapa menit. Gratis, mudah, dan menyenangkan.</p>
          </div>
          <div className="step-row">
            {STEPS.map((s, i) => (
              <div key={i} className="sc">
                <span className="sn" style={{color:s.c}}>{s.n}</span>
                <div className="sibox" style={{background:`${s.c}15`,border:`1px solid ${s.c}2e`}}>
                  <s.icon style={{width:24,height:24,color:s.c}}/>
                </div>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:100,fontSize:'9.5px',fontWeight:800,textTransform:'uppercase' as const,letterSpacing:'.14em',marginBottom:14,background:`${s.c}18`,border:`1px solid ${s.c}30`,color:s.c}}>
                  Step {s.n}
                </div>
                <div className="slabel">{s.label}</div>
                <p className="sdetail">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="sec" style={{padding:'0 24px 100px'}}>
        <div className="wrap">
          <div className="trust-row">
            {TRUST.map((t, i) => (
              <div key={i} className="ti">
                <div className="tiicon"><t.icon style={{width:20,height:20,color:'#a78bfa'}}/></div>
                <div className="titl">{t.title}</div>
                <div className="tidesc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NASA */}
      <section className="sec nasa-wrap">
        <div className="wrap">
          <div className="nasa-card rv">
            <div className="ng1"/><div className="ng2"/>
            <div className="nasa-row">
              <div className="nasa-l" style={{flexShrink:0}}>
                <div className="norb">
                  <div className="ra"/><div className="rb"/><div className="rc"/>
                  <div className="ncore"><div className="nibox"><Satellite style={{width:38,height:38,color:'#38bdf8'}}/></div></div>
                  <div className="fp fp1"/><div className="fp fp2"/><div className="fp fp3"/>
                </div>
              </div>
              <div className="nasa-r">
                <span style={{fontSize:10.5,color:'#38bdf8',textTransform:'uppercase' as const,letterSpacing:'.22em',fontWeight:800,marginBottom:16,display:'block'}}>Powered by NASA Open APIs</span>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2rem,4.5vw,3.4rem)',color:'#fff',margin:'14px 0 16px',lineHeight:1.05,letterSpacing:'-.02em',fontWeight:900}}>Data luar angkasa nyata,<br/>langsung ke feed kamu.</h3>
                <p style={{color:'var(--tx2)',lineHeight:1.82,fontWeight:500,fontSize:'.95rem',marginBottom:22}}>Setiap hari, foto dari NASA Astronomy Picture of the Day dan Mars Rover missions mengalir langsung ke StellarHub. Data sains sungguhan yang tersaji dengan tampilan yang cantik.</p>
                <div className="ntag">
                  {['APOD Harian','Mars Rover','Satellite Feeds','Space Weather','Exoplanet Data'].map(t => (
                    <span key={t} className="ntagi">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sec pad">
        <div className="wrap">
          <div style={{textAlign:'center',marginBottom:'clamp(48px,7vw,88px)'}} className="rv">
            <div className="eyebrow" style={{color:'#f472b6',justifyContent:'center',marginBottom:18}}>
              <span className="el" style={{background:'#f472b6'}}/>Kata Mereka<span className="el" style={{background:'#f472b6'}}/>
            </div>
            <h2 className="h2">
              <span style={{display:'block',color:'#fff'}}>Dipercaya para</span>
              <span className="tg">penjelajah bintang</span>
            </h2>
          </div>
          <div className="testi-row">
            {TESTI.map((t, i) => (
              <div key={i} className="tc">
                <div className="tq">"</div>
                <p className="tt">{t.t}</p>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div className="tav" style={{background:t.c}}>{t.av}</div>
                  <div><div className="tn">{t.n}</div><div className="tr">{t.r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIG CTA */}
      <section className="sec cta-sec">
        <div className="cta-blob" aria-hidden><div className="cta-b"/></div>
        <div style={{maxWidth:700,margin:'0 auto',position:'relative',zIndex:1}} className="rv">
          <div className="glass" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'9px 24px',borderRadius:100,marginBottom:40}}>
            <Star style={{width:13,height:13,color:'#fbbf24'}}/>
            <span style={{fontSize:10.5,color:'var(--tx2)',letterSpacing:'.2em',textTransform:'uppercase',fontWeight:800}}>Bergabung dengan 150,000+ penjelajah</span>
          </div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(3rem,9vw,6.5rem)',lineHeight:.9,letterSpacing:'-.025em',marginBottom:26,fontWeight:900}}>
            <span style={{display:'block',color:'#fff'}}>Perjalananmu</span>
            <span className="tg">dimulai sekarang.</span>
          </h2>
          <p style={{fontSize:'1.08rem',color:'var(--tx2)',maxWidth:480,margin:'0 auto 56px',lineHeight:1.82,fontWeight:500}}>Daftar gratis, jelajahi alam semesta NASA, dan bagikan penemuanmu bersama komunitas yang selalu memandang ke atas.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:16,justifyContent:'center',alignItems:'center'}}>
            <Link href={user ? '/feed' : '/register'} className="btn" style={{padding:'18px 48px',fontSize:'1.08rem',boxShadow:'0 0 80px rgba(124,58,237,.48),0 12px 50px rgba(0,0,0,.5)'}}>
              <span className="sh"/><Zap style={{width:20,height:20}}/>{user ? 'Buka Feed' : 'Mulai Eksplorasi'}<ArrowRight className="arr" style={{width:20,height:20}}/>
            </Link>
            <span style={{fontSize:14,color:'var(--tx3)',fontWeight:600}}>Gratis · Tanpa kartu kredit</span>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="sec contact-sec">
        <div className="wrap">
          <div style={{textAlign:'center',marginBottom:'clamp(48px,7vw,88px)'}} className="rv">
            <div className="eyebrow" style={{color:'#34d399',justifyContent:'center',marginBottom:18}}>
              <span className="el" style={{background:'#34d399'}}/>Hubungi Kami<span className="el" style={{background:'#34d399'}}/>
            </div>
            <h2 className="h2" style={{marginBottom:20}}>
              <span style={{display:'block',color:'#fff'}}>Ada pertanyaan atau</span>
              <span className="tg">ingin berkolaborasi?</span>
            </h2>
            <p className="sub" style={{margin:'0 auto'}}>Tim kami siap membantu. Hubungi langsung via WhatsApp atau kirim pesan melalui form.</p>
          </div>
          <div className="cgrid">
            <div className="cinfo">
              <div style={{marginBottom:8}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.7rem',fontWeight:800,color:'#fff',marginBottom:10}}>
                  Kami ada di sini <span className="tg">untukmu.</span>
                </h3>
                <p style={{color:'var(--tx2)',fontSize:'.9rem',lineHeight:1.8,fontWeight:500}}>Baik pertanyaan teknis, ide kolaborasi, atau sekadar menyapa — kami senang mendengar dari kamu.</p>
              </div>
              {[
                {icon:Mail,          label:'Email',    val:'stellarhub.app@gmail.com', sub:'Balas dalam 24 jam',        href:'mailto:stellarhub.app@gmail.com', ac:'#c084fc'},
                {icon:MessageCircle, label:'WhatsApp', val:'0851 3430 1278',            sub:'Chat langsung dengan kami', href:'https://wa.me/6285134301278',      ac:'#34d399'},
                {icon:MapPin,        label:'Lokasi',   val:'Brebes Salem, Jawa Tengah', sub:'Indonesia 🇮🇩',             href:'#',                                ac:'#818cf8'},
              ].map((c, i) => (
                <a key={i} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="ci-card" style={{textDecoration:'none'}}>
                  <div className="ciicon" style={{background:`${c.ac}16`,border:`1px solid ${c.ac}32`}}>
                    <c.icon style={{width:20,height:20,color:c.ac}}/>
                  </div>
                  <div>
                    <div className="cilabel">{c.label}</div>
                    <div className="cival">{c.val}</div>
                    <div className="cisub">{c.sub}</div>
                  </div>
                </a>
              ))}
              <div className="glass" style={{borderRadius:22,padding:'22px 24px'}}>
                <div style={{fontSize:11,color:'var(--tx3)',textTransform:'uppercase' as const,letterSpacing:'.16em',fontWeight:800,marginBottom:14}}>Follow kami</div>
                <div style={{display:'flex',gap:11}}>
                  {[{I:Twitter,h:'#',l:'Twitter'},{I:Github,h:'#',l:'GitHub'},{I:Instagram,h:'#',l:'Instagram'}].map(s => (
                    <a key={s.l} href={s.h} className="socb" aria-label={s.l}><s.I style={{width:16,height:16,color:'var(--tx2)'}}/></a>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="cform">
                {sent && (
                  <div className="ok">
                    <Sparkles style={{width:18,height:18,color:'#34d399',flexShrink:0}}/>
                    Pesan terkirim! Kami akan segera menghubungimu. 🚀
                  </div>
                )}
                <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:22}}>
                  <div style={{display:'grid',gap:18,gridTemplateColumns:'1fr 1fr'}}>
                    <div className="ff">
                      <label className="flabel">Nama</label>
                      <div className="fwrap">
                        <input className="inp" type="text" placeholder="Budi Santoso" required value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))}/>
                        <div className="fbar"/>
                      </div>
                    </div>
                    <div className="ff">
                      <label className="flabel">Email</label>
                      <div className="fwrap">
                        <input className="inp" type="email" placeholder="kamu@email.com" required value={form.email} onChange={e => setForm(p => ({...p, email:e.target.value}))}/>
                        <div className="fbar"/>
                      </div>
                    </div>
                  </div>
                  <div className="ff">
                    <label className="flabel">Pesan</label>
                    <div className="fwrap">
                      <textarea className="inp" placeholder="Ceritakan ide atau pertanyaanmu…" required value={form.message} onChange={e => setForm(p => ({...p, message:e.target.value}))}/>
                      <div className="fbar"/>
                    </div>
                  </div>
                  <button type="submit" className="sbtn">
                    <span className="sh"/><Send style={{width:17,height:17}}/>Kirim Pesan<ArrowRight style={{width:17,height:17}}/>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ft">
        <div className="fti">
          <Link href="/" className="flogo">
            <div className="flogob"><Rocket style={{width:17,height:17,color:'#fff'}}/></div>
            <span className="tg" style={{fontSize:'1.12rem',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,letterSpacing:'-.02em'}}>StellarHub</span>
          </Link>
          <nav className="fnav">
            {['Privacy','Terms','API Docs','Status','Blog'].map(l => <Link key={l} href="#">{l}</Link>)}
          </nav>
          <div className="fsoc">
            {[Twitter, Github, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="socb"><Icon style={{width:15,height:15,color:'var(--tx3)'}}/></a>
            ))}
          </div>
          <p className="fcopy">© {new Date().getFullYear()} StellarHub. Built for stargazers. 🚀</p>
        </div>
      </footer>
    </div>
  )
}