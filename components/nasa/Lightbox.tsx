'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X, Loader2, Languages, Send, Download } from 'lucide-react'

interface LightboxProps {
  item: any
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  onTranslate: () => void
  onShare: () => void
  formatDate: (d: string) => string
}

const navArrow = (side: string) => ({ position: 'absolute', [side]: 20, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, transition: 'all .2s', cursor: 'pointer' } as any)
const actionBtn: any = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '0 10px', transition: 'all .2s' }

export function Lightbox({ item, onClose, onPrev, onNext, hasPrev, hasNext, onTranslate, onShare, formatDate }: LightboxProps) {
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
  }, [hasPrev, hasNext, onClose, onPrev, onNext])

  useEffect(() => { setLoaded(false) }, [item])

  const imgUrl = item.hdurl || item.url
  const displayExplanation = item.translatedExplanation || item.explanation
  const isYouTube = item.media_type === 'video' && (item.url?.includes('youtube') || item.url?.includes('youtu.be'))
  const embedUrl = isYouTube ? item.url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0' : item.url

  return (
    <div 
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,4,12,0.85)', backdropFilter: 'blur(12px)', padding: 20 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} aria-hidden="true" />
      
      {hasPrev && <button onClick={onPrev} style={navArrow('left')} aria-label="Previous image"><ChevronLeft size={24} /></button>}
      {hasNext && <button onClick={onNext} style={navArrow('right')} aria-label="Next image"><ChevronRight size={24} /></button>}
      
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 24, width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div id="lightbox-title" style={{ fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: 800, color: '#e2e8f0' }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{formatDate(item.date)} {item.copyright && `· © ${item.copyright}`}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#f87171', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s', flexShrink: 0, marginLeft: 12 }} aria-label="Close dialog"><X size={16} /></button>
        </div>

        {/* Content Area - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Media */}
          <div style={{ position: 'relative', width: '100%', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250 }}>
             {!loaded && item.media_type !== 'video' && <div style={{ position: 'absolute' }}><Loader2 size={32} className="animate-spin" color="#818cf8" /></div>}
             {item.media_type === 'video'
               ? <iframe src={embedUrl} title={item.title} style={{ width: '100%', aspectRatio: '16/9', border: 'none' }} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />
               : <img src={imgUrl} alt={item.title} onLoad={() => setLoaded(true)} style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', opacity: loaded ? 1 : 0, transition: 'opacity .3s' }} />
             }
          </div>

          {/* Description & Actions */}
          <div style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <button onClick={onTranslate} style={{ ...actionBtn, padding: '8px 16px', height: 'auto', background: 'rgba(129,140,248,0.1)', borderColor: 'rgba(129,140,248,0.2)', color: '#818cf8', fontWeight: 700, flex: '1 1 auto' }} aria-label="Translate description">
                {item.isTranslating ? <Loader2 size={16} className="animate-spin" /> : <><Languages size={16} /> Terjemahkan</>}
              </button>
              <button onClick={onShare} style={{ ...actionBtn, padding: '8px 16px', height: 'auto', background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)', color: '#34d399', fontWeight: 700, flex: '1 1 auto' }} aria-label="Share to feed">
                {item.isSharing ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Bagikan ke Feed</>}
              </button>
              {item.media_type === 'image' && <a href={imgUrl} target="_blank" rel="noopener noreferrer" download style={{ ...actionBtn, padding: '8px 16px', height: 'auto', textDecoration: 'none', flex: '1 1 auto' }} aria-label="Download full resolution image"><Download size={16} /> Resolusi Penuh</a>}
            </div>
            
            <p style={{ fontSize: 'clamp(14px, 3vw, 15px)', color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
              {displayExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
