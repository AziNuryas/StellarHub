'use client'

import { useState } from 'react'
import { Play, Languages, Loader2, Send, Maximize2 } from 'lucide-react'

interface APODCardProps {
  item: any
  onOpen: () => void
  onTranslate: () => void
  onShare: () => void
  viewMode: 'grid' | 'list'
  formatDate: (d: string) => string
}

const badge: any = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 10, fontWeight: 700 }
const actionBtn: any = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '0 10px', transition: 'all .2s' }

export function APODCard({ item, onOpen, onTranslate, onShare, viewMode, formatDate }: APODCardProps) {
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
          {item.media_type === 'video' ? <div style={{ width: '100%', height: '100%', background: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={24} color="#818cf8" /></div> : <img src={imgUrl} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>{isToday && <span style={badge}>🔴 LIVE</span>}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(item.date)}</span></div>
          <h3 style={{ fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onClick={onOpen}>{item.title}</h3>
          <p style={{ fontSize: 12, color: 'var(--text-2)', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{displayExplanation}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button onClick={onTranslate} style={actionBtn} title="Terjemahkan" aria-label="Translate"><Languages size={14} /></button>
          <button onClick={onShare} style={{ ...actionBtn, background: 'rgba(129,140,248,0.08)', borderColor: 'rgba(129,140,248,0.2)', color: '#818cf8' }} title="Bagikan ke Feed" aria-label="Share">
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
          ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(129,140,248,0.06)' }} aria-label="Play video preview"><Play size={40} color="#818cf8" /></div>
          : item.media_type === 'video' && playVideo
          ? <iframe src={embedUrl} title={item.title} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />
          : <img src={imgUrl} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        }
        {isToday && <span style={{ ...badge, position: 'absolute', top: 12, left: 12 }}>🔴 LIVE</span>}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{formatDate(item.date)}</div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, cursor: 'pointer' }} onClick={onOpen}>{item.title}</h3>
        <p style={{ fontSize: 12, color: 'var(--text-2)', WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{displayExplanation}</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button onClick={onTranslate} style={{ ...actionBtn, flex: 1 }} aria-label="Translate content">
            {item.isTranslating ? <Loader2 size={14} className="animate-spin" /> : <><Languages size={14} /> Terjemahkan</>}
          </button>
          <button onClick={onShare} style={{ ...actionBtn, flex: 1, background: 'rgba(129,140,248,0.08)', borderColor: 'rgba(129,140,248,0.2)', color: '#818cf8' }} title="Bagikan ke Feed" aria-label="Share to feed">
            {item.isSharing ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Bagikan</>}
          </button>
          <button onClick={onOpen} style={actionBtn} aria-label="View full screen"><Maximize2 size={14} /></button>
        </div>
      </div>
    </article>
  )
}
