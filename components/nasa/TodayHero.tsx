'use client'

import { useState } from 'react'
import { Maximize2, Languages, Send, Loader2, Play } from 'lucide-react'

interface TodayHeroProps {
  item: any
  onOpen: () => void
  onTranslate: () => void
  onShare: () => void
  formatDate: (d: string) => string
}

const badge: any = { 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: 4, 
  padding: '3px 8px', 
  borderRadius: 99, 
  background: 'rgba(239,68,68,0.15)', 
  border: '1px solid rgba(239,68,68,0.25)', 
  color: '#f87171', 
  fontSize: 10, 
  fontWeight: 700 
}

export function TodayHero({ item, onOpen, onTranslate, onShare, formatDate }: TodayHeroProps) {
  const [playVideo, setPlayVideo] = useState(false)
  const isYouTube = item.media_type === 'video' && (item.url?.includes('youtube') || item.url?.includes('youtu.be'))
  const embedUrl = isYouTube ? item.url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0' : item.url

  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 32, minHeight: 420 }}>
      {(item.media_type === 'image' || item.thumbnail_url) && (
        <img src={item.media_type === 'image' ? item.url : item.thumbnail_url} 
             alt={item.title}
             loading="eager" 
             style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
      )}
      {item.media_type === 'video' && playVideo && (
        <iframe src={embedUrl} title={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />
      )}
      {item.media_type === 'video' && !playVideo && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(129,140,248,0.06)', cursor: 'pointer' }} onClick={() => setPlayVideo(true)}>
          <Play size={64} color="#818cf8" />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #07090f 0%, rgba(7,9,15,0.6) 50%, transparent)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(20px, 5vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 420 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <span style={badge}>🔴 NASA APOD</span>
          <span style={{ ...badge, background: 'rgba(129,140,248,0.12)', color: '#818cf8' }}>{formatDate(item.date)}</span>
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#e2e8f0', marginBottom: 12 }}>{item.title}</h2>
        <p style={{ color: '#94a3b8', marginBottom: 20, maxWidth: 680, fontSize: 'clamp(14px, 3vw, 16px)' }}>{item.translatedExplanation || item.explanation}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onOpen} style={{ padding: '10px 22px', borderRadius: 12, background: 'linear-gradient(135deg, #818cf8, #6d28d9)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 auto', justifyContent: 'center' }}><Maximize2 size={15} /> Lihat Penuh</button>
          <button onClick={onTranslate} style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 auto', justifyContent: 'center' }}>
            {item.isTranslating ? <Loader2 size={15} className="animate-spin" /> : <><Languages size={15} /> Terjemahkan</>}
          </button>
          <button onClick={onShare} style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 auto', justifyContent: 'center' }}>
            {item.isSharing ? <Loader2 size={15} className="animate-spin" /> : <><Send size={15} /> Bagikan ke Feed</>}
          </button>
        </div>
      </div>
    </div>
  )
}
