'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Heart, Bookmark, Download, Share2, Search,
  RefreshCw, X, Calendar, ExternalLink,
  Maximize2, ChevronLeft, ChevronRight, Play,
  Loader2, Camera, Globe, Languages, Send,
  Satellite, Grid, List, ZoomIn, ChevronDown,
  AlertTriangle, MapPin, Clock
} from 'lucide-react'

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
interface APODItem {
  date: string
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  copyright?: string
  thumbnail_url?: string
  translatedExplanation?: string
  isTranslating?: boolean
  isSharing?: boolean
}

interface EPICImage {
  identifier: string
  caption: string
  image: string
  date: string
}

interface EONETEvent {
  id: string
  title: string
  description: string | null
  link: string
  categories: { id: string; title: string }[]
  geometries: { date: string; type: string; coordinates: [number, number] }[]
}

/* ══════════════════════════════════════════════
   HELPERS & CONSTANTS
══════════════════════════════════════════════ */
const NASA_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'
const APOD_START_DATE = '1995-06-16'
const ITEMS_PER_PAGE = 12

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

async function translateText(text: string): Promise<string> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_lang: 'ID' }),
    })
    const data = await res.json()
    return data.translated || text
  } catch { return text }
}

/* ══════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════ */
function Lightbox({ item, onClose, onPrev, onNext, hasPrev, hasNext, onTranslate, onShare }: any) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', fn)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', fn) }
  }, [hasPrev, hasNext])

  useEffect(() => { setLoaded(false) }, [item])

  const imgUrl = item.hdurl || item.url
  const displayExplanation = item.translatedExplanation || item.explanation
  const isYouTube = item.media_type === 'video' && (item.url?.includes('youtube') || item.url?.includes('youtu.be'))
  const embedUrl = isYouTube ? item.url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0' : item.url

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,4,12,0.85)', backdropFilter: 'blur(12px)', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
      
      {hasPrev && <button onClick={onPrev} style={navArrow('left')}><ChevronLeft size={24} /></button>}
      {hasNext && <button onClick={onNext} style={navArrow('right')}><ChevronRight size={24} /></button>}
      
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0' }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{formatDate(item.date)} {item.copyright && `· © ${item.copyright}`}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#f87171', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s' }}><X size={16} /></button>
        </div>

        {/* Content Area - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Media */}
          <div style={{ position: 'relative', width: '100%', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
             {!loaded && item.media_type !== 'video' && <div style={{ position: 'absolute' }}><Loader2 size={32} className="animate-spin" color="#818cf8" /></div>}
             {item.media_type === 'video'
               ? <iframe src={embedUrl} style={{ width: '100%', aspectRatio: '16/9', border: 'none' }} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />
               : <img src={imgUrl} alt={item.title} onLoad={() => setLoaded(true)} style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', opacity: loaded ? 1 : 0, transition: 'opacity .3s' }} />
             }
          </div>

          {/* Description & Actions */}
          <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <button onClick={onTranslate} style={{ ...actionBtn, padding: '8px 16px', height: 'auto', background: 'rgba(129,140,248,0.1)', borderColor: 'rgba(129,140,248,0.2)', color: '#818cf8', fontWeight: 700 }}>
                {item.isTranslating ? <Loader2 size={16} className="animate-spin" /> : <><Languages size={16} /> Terjemahkan</>}
              </button>
              <button onClick={onShare} style={{ ...actionBtn, padding: '8px 16px', height: 'auto', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)', color: '#34d399', fontWeight: 700 }}>
                {item.isSharing ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Bagikan ke Feed</>}
              </button>
              {item.media_type === 'image' && <a href={imgUrl} target="_blank" download style={{ ...actionBtn, padding: '8px 16px', height: 'auto', textDecoration: 'none' }}><Download size={16} /> Resolusi Penuh</a>}
            </div>
            
            <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
              {displayExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
const navArrow = (side: string) => ({ position: 'absolute', [side]: 20, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, transition: 'all .2s', cursor: 'pointer' } as any)

/* ══════════════════════════════════════════════
   APOD CARD
══════════════════════════════════════════════ */
function APODCard({ item, onOpen, onTranslate, onShare, viewMode }: any) {
  const imgUrl = item.thumbnail_url || item.url
  const isToday = item.date === new Date().toISOString().split('T')[0]
  const displayExplanation = item.translatedExplanation || item.explanation
  const [playVideo, setPlayVideo] = useState(false)
  const isYouTube = item.media_type === 'video' && (item.url?.includes('youtube') || item.url?.includes('youtu.be'))
  const embedUrl = isYouTube ? item.url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0' : item.url

  if (viewMode === 'list') {
    return (
      <article style={{ display: 'flex', gap: 16, padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 8 }}>
        <div style={{ width: 120, height: 80, borderRadius: 8, overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }} onClick={item.media_type === 'video' ? () => setPlayVideo(true) : onOpen}>
          {item.media_type === 'video' ? <div style={{ width: '100%', height: '100%', background: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={24} color="#818cf8" /></div> : <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>{isToday && <span style={badge}>🔴 LIVE</span>}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(item.date)}</span></div>
          <h3 style={{ fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onClick={onOpen}>{item.title}</h3>
          <p style={{ fontSize: 12, color: 'var(--text-2)', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{displayExplanation}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button onClick={onTranslate} style={actionBtn} title="Terjemahkan"><Languages size={14} /></button>
          <button onClick={onShare} style={{ ...actionBtn, background: 'rgba(129,140,248,0.08)', borderColor: 'rgba(129,140,248,0.2)', color: '#818cf8' }} title="Bagikan ke Feed">
            {item.isSharing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </article>
    )
  }
  return (
    <article style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '16/10', cursor: 'pointer' }} onClick={item.media_type === 'video' ? () => setPlayVideo(v => !v) : onOpen}>
        {item.media_type === 'video' && !playVideo
          ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(129,140,248,0.06)' }}><Play size={40} color="#818cf8" /></div>
          : item.media_type === 'video' && playVideo
          ? <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />
          : <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        }
        {isToday && <span style={{ ...badge, position: 'absolute', top: 12, left: 12 }}>🔴 LIVE</span>}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{formatDate(item.date)}</div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, cursor: 'pointer' }} onClick={onOpen}>{item.title}</h3>
        <p style={{ fontSize: 12, color: 'var(--text-2)', WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{displayExplanation}</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button onClick={onTranslate} style={{ ...actionBtn, flex: 1 }}><Languages size={14} /> Terjemahkan</button>
          <button onClick={onShare} style={{ ...actionBtn, flex: 1, background: 'rgba(129,140,248,0.08)', borderColor: 'rgba(129,140,248,0.2)', color: '#818cf8' }} title="Bagikan ke Feed">
            {item.isSharing ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Bagikan</>}
          </button>
          <button onClick={onOpen} style={actionBtn}><Maximize2 size={14} /></button>
        </div>
      </div>
    </article>
  )
}
const badge: any = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 10, fontWeight: 700 }
const actionBtn: any = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '0 10px', transition: 'all .2s' }

/* ══════════════════════════════════════════════
   TODAY HERO
══════════════════════════════════════════════ */
function TodayHero({ item, onOpen, onTranslate, onShare }: any) {
  const [playVideo, setPlayVideo] = useState(false)
  const isYouTube = item.media_type === 'video' && (item.url?.includes('youtube') || item.url?.includes('youtu.be'))
  const embedUrl = isYouTube ? item.url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0' : item.url

  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 32, minHeight: 420 }}>
      {item.media_type === 'image' && <img src={item.hdurl || item.url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />}
      {item.media_type === 'video' && playVideo && (
        <iframe src={embedUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />
      )}
      {item.media_type === 'video' && !playVideo && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(129,140,248,0.06)', cursor: 'pointer' }} onClick={() => setPlayVideo(true)}>
          <Play size={64} color="#818cf8" />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #07090f 0%, rgba(7,9,15,0.6) 50%, transparent)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 420 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}><span style={badge}>🔴 NASA APOD</span><span style={{ ...badge, background: 'rgba(129,140,248,0.12)', color: '#818cf8' }}>{formatDate(item.date)}</span></div>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#e2e8f0', marginBottom: 12 }}>{item.title}</h2>
        <p style={{ color: '#94a3b8', marginBottom: 20, maxWidth: 680 }}>{item.translatedExplanation || item.explanation}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onOpen} style={{ padding: '10px 22px', borderRadius: 12, background: 'linear-gradient(135deg, #818cf8, #6d28d9)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><Maximize2 size={15} /> Lihat Penuh</button>
          <button onClick={onTranslate} style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><Languages size={15} /> Terjemahkan</button>
          <button onClick={onShare} style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.isSharing ? <Loader2 size={15} className="animate-spin" /> : <><Send size={15} /> Bagikan ke Feed</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   EPIC SECTION
══════════════════════════════════════════════ */
function EPICSection({ images, loading }: { images: EPICImage[], loading: boolean }) {
  if (loading) {
    return (
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Globe size={20} color="#10b981" />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>🌍 EPIC – Foto Bumi Terbaru</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} style={{ aspectRatio: '1/1', background: 'var(--bg-elevated)', borderRadius: 16 }} className="skeleton" />)}
        </div>
      </div>
    )
  }
  if (!images.length) return null
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Globe size={20} color="#10b981" />
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>🌍 EPIC – Foto Bumi Terbaru</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>diambil 1.5 juta km dari Bumi</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {images.slice(0, 3).map(img => (
          <a
            key={img.identifier}
            href={`https://epic.gsfc.nasa.gov/archive/natural/${img.date.slice(0,4)}/${img.date.slice(5,7)}/${img.date.slice(8,10)}/png/${img.image}.png`}
            target="_blank"
            rel="noopener"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid var(--border)',
              transition: 'transform .2s'
            }}>
              <img
                src={`https://epic.gsfc.nasa.gov/archive/natural/${img.date.slice(0,4)}/${img.date.slice(5,7)}/${img.date.slice(8,10)}/thumbs/${img.image}.jpg`}
                alt={img.caption}
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
              />
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>{img.caption}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(img.date)}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   EONET SECTION
══════════════════════════════════════════════ */
function EONETSection({ events, loading }: { events: EONETEvent[], loading: boolean }) {
  if (loading) {
    return (
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <AlertTriangle size={20} color="#f97316" />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>⚠️ EONET – Bencana Alam Aktif</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 70, background: 'var(--bg-elevated)', borderRadius: 12 }} className="skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (!events?.length) return null

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <AlertTriangle size={20} color="#f97316" />
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>⚠️ EONET – Bencana Alam Aktif</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          real-time dari NASA
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map(event => {
          // ✅ SAFE EXTRACTION (ANTI CRASH)
          const geo = event.geometries?.[0]
          const lat = geo?.coordinates?.[1]
          const lon = geo?.coordinates?.[0]
          const date = geo?.date

          return (
            <a
              key={event.id}
              href={event.link}
              target="_blank"
              rel="noopener"
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                padding: 16,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                transition: 'border-color .2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
                      {event.title}
                    </h4>

                    <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                      {event.categories?.map(cat => (
                        <span
                          key={cat.id}
                          style={{
                            fontSize: 11,
                            background: 'rgba(249,115,22,0.1)',
                            color: '#f97316',
                            padding: '2px 8px',
                            borderRadius: 99
                          }}
                        >
                          {cat.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 📍 KOORDINAT (SAFE) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                    <MapPin size={12} />
                    <span style={{ fontSize: 12 }}>
                      {lat !== undefined && lon !== undefined
                        ? `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`
                        : 'Lokasi tidak tersedia'}
                    </span>
                  </div>
                </div>

                {/* 🕒 DATE (SAFE) */}
                {date && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 8,
                    color: 'var(--text-muted)'
                  }}>
                    <Clock size={12} />
                    <span style={{ fontSize: 11 }}>
                      {new Date(date).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}


/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function NasaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<APODItem[]>([])
  const [loadingAPOD, setLoadingAPOD] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all')
  const oldestDateRef = useRef<string>('')
  const observerRef = useRef<HTMLDivElement>(null)
  const hasReachedEnd = oldestDateRef.current && oldestDateRef.current <= APOD_START_DATE

  const [epicImages, setEpicImages] = useState<EPICImage[]>([])
  const [loadingEPIC, setLoadingEPIC] = useState(true)

  const [eonetEvents, setEonetEvents] = useState<EONETEvent[]>([])
  const [loadingEONET, setLoadingEONET] = useState(true)

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  // Share APOD to Feed
  const handleShare = async (idx: number) => {
    if (!user) { toast.error('Login dulu untuk membagikan'); router.push('/login'); return }
    const item = items[idx]
    if (item.isSharing) return

    setItems(prev => prev.map((it, i) => i === idx ? { ...it, isSharing: true } : it))

    try {
      const content = `🌌 **${item.title}**\n\n${item.translatedExplanation || item.explanation}\n\n📅 ${formatDate(item.date)}${item.copyright ? ` · © ${item.copyright}` : ''}\n🔗 Sumber: NASA Astronomy Picture of the Day`

      const imgUrl = item.media_type === 'image' ? (item.hdurl || item.url) : (item.thumbnail_url || null)

      const { data: post, error } = await supabase.from('posts').insert({
        content,
        user_id: user.id,
        title: `🌌 NASA APOD: ${item.title}`,
        image_url: imgUrl,
      }).select().single()

      if (error) throw error

      // Also add to post_images if there's an image
      if (imgUrl && post) {
        await supabase.from('post_images').insert({ post_id: post.id, url: imgUrl, order_index: 0 })
      }

      toast.success('Berhasil dibagikan ke Feed! 🚀', {
        action: { label: 'Lihat Feed', onClick: () => router.push('/feed') },
      })
    } catch (e: any) {
      toast.error(e?.message || 'Gagal membagikan')
    } finally {
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, isSharing: false } : it))
    }
  }

  const fetchEPIC = async () => {
    try {
      const res = await fetch(`https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_KEY}`)
      const data = await res.json()
      const images: EPICImage[] = data.slice(0, 6).map((item: any) => ({
        identifier: item.identifier,
        caption: item.caption,
        image: item.image,
        date: item.date
      }))
      setEpicImages(images)
    } catch (e) {
      console.warn('EPIC fetch error', e)
    } finally {
      setLoadingEPIC(false)
    }
  }

  const fetchEONET = async () => {
    try {
      const res = await fetch(`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=5`)
      const data = await res.json()
      setEonetEvents(data.events)
    } catch (e) {
      console.warn('EONET fetch error', e)
    } finally {
      setLoadingEONET(false)
    }
  }

  const loadAPODData = useCallback(async (endDate: string, count: number) => {
    const start = new Date(endDate)
    start.setDate(start.getDate() - (count - 1))
    const from = start.toISOString().split('T')[0]
    const to = endDate
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&start_date=${from}&end_date=${to}&thumbs=true`
    const res = await fetch(url)
    const data = await res.json()
    return data.reverse().map((item: any) => ({
      ...item,
      media_type: item.media_type === 'video' ? 'video' : 'image',
      thumbnail_url: item.thumbnail_url,
    }))
  }, [])

  const loadInitialAPOD = async () => {
    setLoadingAPOD(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const apods = await loadAPODData(today, ITEMS_PER_PAGE)
      oldestDateRef.current = apods[apods.length - 1]?.date || ''
      setItems(apods)
    } catch { toast.error('Gagal memuat APOD') }
    finally { setLoadingAPOD(false) }
  }

  const loadMoreAPOD = async () => {
    if (loadingMore || hasReachedEnd) return
    setLoadingMore(true)
    try {
      const prevDay = new Date(oldestDateRef.current)
      prevDay.setDate(prevDay.getDate() - 1)
      const endDate = prevDay.toISOString().split('T')[0]
      const apods = await loadAPODData(endDate, ITEMS_PER_PAGE)
      const filtered = apods.filter((a: APODItem) => a.date >= APOD_START_DATE)
      if (!filtered.length) { oldestDateRef.current = APOD_START_DATE; return }
      oldestDateRef.current = filtered[filtered.length - 1].date
      setItems(prev => [...prev, ...filtered])
    } catch { toast.error('Gagal memuat lebih banyak') }
    finally { setLoadingMore(false) }
  }

  const handleTranslate = async (idx: number) => {
    const item = items[idx]
    if (item.translatedExplanation || item.isTranslating) return
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, isTranslating: true } : it))
    try {
      const translated = await translateText(item.explanation)
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, translatedExplanation: translated, isTranslating: false } : it))
    } catch { toast.error('Gagal menerjemahkan') }
  }

  useEffect(() => {
    loadInitialAPOD()
    fetchEPIC()
    fetchEONET()
  }, [])

  useEffect(() => {
    if (loadingAPOD || loadingMore) return
    const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting) loadMoreAPOD() }, { threshold: 0.1, rootMargin: '200px' })
    const el = observerRef.current
    if (el) obs.observe(el)
    return () => { if (el) obs.unobserve(el) }
  }, [loadingAPOD, loadingMore])

  const filteredAPOD = items.filter(item => {
    if (mediaFilter !== 'all' && item.media_type !== mediaFilter) return false
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.explanation.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100svh', padding: '80px 16px', fontFamily: 'var(--font)', color: 'var(--text)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 99, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)', marginBottom: 16 }}>
            <Satellite size={12} color="#818cf8" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>NASA · APOD · EPIC · EONET</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800 }}>Astronomy Picture of the Day</h1>
          <p style={{ color: 'var(--text-muted)' }}>Arsip lengkap NASA sejak 1995 + data real-time Bumi & bencana</p>
        </div>

        {loadingAPOD ? (
          <div style={{ height: 420, background: 'var(--bg-elevated)', borderRadius: 24, marginBottom: 32 }} className="skeleton" />
        ) : items[0] && (
          <TodayHero item={items[0]} onOpen={() => setLightboxIdx(0)} onTranslate={() => handleTranslate(0)} onShare={() => handleShare(0)} />
        )}

        <EPICSection images={epicImages} loading={loadingEPIC} />
        <EONETSection events={eonetEvents} loading={loadingEONET} />

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              placeholder="Cari APOD..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
            />
          </div>
          <select value={mediaFilter} onChange={e => setMediaFilter(e.target.value as any)} style={{ padding: '0 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}>
            <option value="all">Semua</option><option value="image">Foto</option><option value="video">Video</option>
          </select>
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} style={{ padding: '0 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}>
            {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
          </button>
        </div>

        {!loadingAPOD && (
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            {filteredAPOD.length} item · {search ? `pencarian "${search}"` : `total ${items.length} hari termuat`}
          </div>
        )}

        {loadingAPOD ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {Array(9).fill(0).map((_, i) => <div key={i} style={{ aspectRatio: '16/10', background: 'var(--bg-elevated)', borderRadius: 16 }} className="skeleton" />)}
          </div>
        ) : filteredAPOD.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40 }}>Tidak ada data</p>
        ) : (
          <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 } : { display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredAPOD.slice(1).map(item => {
              const idx = items.indexOf(item)
              return <APODCard key={item.date} item={item} viewMode={viewMode} onOpen={() => setLightboxIdx(idx)} onTranslate={() => handleTranslate(idx)} onShare={() => handleShare(idx)} />
            })}
          </div>
        )}

        <div ref={observerRef} style={{ textAlign: 'center', padding: 40 }}>
          {loadingMore && <Loader2 className="animate-spin" />}
          {hasReachedEnd && !loadingMore && <span>🏁 Arsip pertama NASA APOD (1995)</span>}
          {!hasReachedEnd && !loadingMore && items.length > 0 && (
            <button onClick={loadMoreAPOD} style={{ padding: '10px 24px', borderRadius: 40, border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              Muat Lebih Banyak <ChevronDown size={14} />
            </button>
          )}
        </div>
      </div>

      {lightboxIdx !== null && items[lightboxIdx] && (
        <Lightbox
          item={items[lightboxIdx]}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => Math.max(0, i! - 1))}
          onNext={() => setLightboxIdx(i => Math.min(items.length - 1, i! + 1))}
          hasPrev={lightboxIdx > 0}
          hasNext={lightboxIdx < items.length - 1}
          onTranslate={() => handleTranslate(lightboxIdx)}
          onShare={() => handleShare(lightboxIdx)}
        />
      )}
    </div>
  )
}