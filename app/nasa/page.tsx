'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Search, List, Grid, Satellite, Loader2, ChevronDown } from 'lucide-react'

// Components
import { TodayHero } from '@/components/nasa/TodayHero'
import { APODCard } from '@/components/nasa/APODCard'
import { Lightbox } from '@/components/nasa/Lightbox'

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

/* ══════════════════════════════════════════════
   HELPERS & CONSTANTS
══════════════════════════════════════════════ */
const NASA_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'
const APOD_START_DATE = '1995-06-16'
const ITEMS_PER_PAGE = 6

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  } catch { return d }
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

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => setUser(user))
  }, [supabase.auth])

  // Share APOD to Feed
  const handleShare = async (idx: number) => {
    if (!user) { 
      toast.error('Silakan login terlebih dahulu untuk membagikan ke feed.')
      router.push('/login')
      return 
    }
    
    const item = items[idx]
    if (item.isSharing) return

    setItems(prev => prev.map((it, i) => i === idx ? { ...it, isSharing: true } : it))

    try {
      // Clean, professional format without emojis or markdown stars
      const cleanTitle = item.title.replace(/\*/g, '');
      let content = `NASA APOD: ${cleanTitle}\n\n${item.translatedExplanation || item.explanation}`;
      if (item.copyright) content += `\n\n© ${item.copyright}`;
      
      const imgUrl = item.media_type === 'image' ? (item.hdurl || item.url) : (item.thumbnail_url || null);

      const params = new URLSearchParams();
      params.set('share_text', content);
      if (imgUrl) params.set('share_image', imgUrl);

      router.push(`/feed?${params.toString()}`);
    } catch (e: any) {
      console.error('Error sharing APOD:', e)
      toast.error('Gagal menyiapkan teks bagikan.')
    } finally {
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, isSharing: false } : it))
    }
  }

  const loadAPODData = useCallback(async (endDate: string, count: number) => {
    try {
      const start = new Date(endDate)
      start.setDate(start.getDate() - (count - 1))
      const from = start.toISOString().split('T')[0]
      const to = endDate
      
      const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&start_date=${from}&end_date=${to}&thumbs=true`
      const res = await fetch(url)
      const data = await res.json()
      
      if (!res.ok) {
        if (data.msg?.includes('No data available')) return []
        throw new Error(data.msg || 'Terjadi kesalahan pada API NASA')
      }
      
      if (Array.isArray(data)) {
        return data.reverse().map((item: any) => ({
          ...item,
          media_type: item.media_type === 'video' ? 'video' : 'image',
          thumbnail_url: item.thumbnail_url,
        }))
      }
      return []
    } catch (err: any) {
      console.error('Error fetching NASA data:', err)
      return []
    }
  }, [])

  const loadInitialAPOD = async () => {
    setLoadingAPOD(true)
    try {
      const latestRes = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&thumbs=true`)
      const latestData = await latestRes.json()
      
      if (!latestRes.ok) throw new Error(latestData.msg || 'Gagal terhubung ke NASA')

      const apods = await loadAPODData(latestData.date, ITEMS_PER_PAGE)
      if (apods.length > 0) {
        oldestDateRef.current = apods[apods.length - 1]?.date || ''
        setItems(apods)
      } else {
        toast.error('Data APOD tidak tersedia saat ini.')
      }
    } catch (e: any) { 
      console.error(e)
      toast.error(e.message || 'Gagal memuat data dari NASA. Periksa koneksi internet Anda.') 
    } finally { 
      setLoadingAPOD(false) 
    }
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
      
      if (!filtered.length) { 
        oldestDateRef.current = APOD_START_DATE
        return 
      }
      
      oldestDateRef.current = filtered[filtered.length - 1].date
      setItems(prev => [...prev, ...filtered])
    } catch (err) {
      console.error('Error loading more NASA data:', err)
      toast.error('Gagal memuat data tambahan.')
    } finally { 
      setLoadingMore(false) 
    }
  }

  const handleTranslate = async (idx: number) => {
    const item = items[idx]
    if (item.translatedExplanation || item.isTranslating) return
    
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, isTranslating: true } : it))
    
    try {
      const translated = await translateText(item.explanation)
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, translatedExplanation: translated, isTranslating: false } : it))
    } catch { 
      toast.error('Gagal menerjemahkan deskripsi.')
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, isTranslating: false } : it))
    }
  }

  useEffect(() => {
    loadInitialAPOD()
  }, [])

  useEffect(() => {
    if (loadingAPOD || loadingMore) return
    const obs = new IntersectionObserver(entries => { 
      if (entries[0].isIntersecting) loadMoreAPOD() 
    }, { threshold: 0.1, rootMargin: '400px' })
    
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
    <div style={{ minHeight: '100svh', padding: '80px 16px', color: 'var(--text)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 99, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)', marginBottom: 16 }}>
            <Satellite size={12} color="#818cf8" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>NASA · APOD</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800 }}>Astronomy Picture of the Day</h1>
          <p style={{ color: 'var(--text-muted)' }}>Arsip lengkap NASA sejak 1995</p>
        </header>

        {loadingAPOD ? (
          <div style={{ height: 420, background: 'var(--bg-elevated)', borderRadius: 24, marginBottom: 32 }} className="skeleton" />
        ) : items[0] ? (
          <TodayHero 
            item={items[0]} 
            onOpen={() => setLightboxIdx(0)} 
            onTranslate={() => handleTranslate(0)} 
            onShare={() => handleShare(0)} 
            formatDate={formatDate}
          />
        ) : null}

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              placeholder="Cari arsip APOD..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Cari arsip NASA APOD"
              style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
            />
          </div>
          <select 
            value={mediaFilter} 
            onChange={e => setMediaFilter(e.target.value as any)} 
            aria-label="Filter tipe media"
            style={{ padding: '0 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          >
            <option value="all">Semua Tipe</option>
            <option value="image">Foto</option>
            <option value="video">Video</option>
          </select>
          <button 
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} 
            aria-label={`Ubah ke tampilan ${viewMode === 'grid' ? 'list' : 'grid'}`}
            style={{ padding: '0 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}
          >
            {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
          </button>
        </div>

        {!loadingAPOD && (
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            {filteredAPOD.length} item · {search ? `pencarian "${search}"` : `total ${items.length} hari termuat`}
          </div>
        )}

        {loadingAPOD ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
            {Array(9).fill(0).map((_, i) => <div key={i} style={{ aspectRatio: '16/10', background: 'var(--bg-elevated)', borderRadius: 16 }} className="skeleton" />)}
          </div>
        ) : filteredAPOD.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Tidak ada data yang cocok dengan kriteria pencarian Anda.</p>
        ) : (
          <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 } : { display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredAPOD.slice(1).map(item => {
              const idx = items.indexOf(item)
              return (
                <APODCard 
                  key={item.date} 
                  item={item} 
                  viewMode={viewMode} 
                  onOpen={() => setLightboxIdx(idx)} 
                  onTranslate={() => handleTranslate(idx)} 
                  onShare={() => handleShare(idx)} 
                  formatDate={formatDate}
                />
              )
            })}
          </div>
        )}

        <div ref={observerRef} style={{ textAlign: 'center', padding: 40 }}>
          {loadingMore && <Loader2 className="animate-spin" aria-label="Memuat lebih banyak data" />}
          {hasReachedEnd && !loadingMore && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>🏁 Anda telah mencapai awal sejarah NASA APOD (1995)</span>}
          {!hasReachedEnd && !loadingMore && items.length > 0 && (
            <button 
              onClick={loadMoreAPOD} 
              style={{ padding: '10px 24px', borderRadius: 40, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)', cursor: 'pointer' }}
            >
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
          formatDate={formatDate}
        />
      )}
    </div>
  )
}