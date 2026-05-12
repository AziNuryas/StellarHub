'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Clock, ExternalLink, Calendar, Loader2, X, AlertTriangle, Languages, Share2, Sparkles, MessageCircle, Globe, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
  
export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  
  const observerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch news content from Spaceflight News API
  const fetchExploreContent = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }

      const offset = (reset ? 0 : page) * 20
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      const res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=20&offset=${offset}${searchParam}`, {
        signal: AbortSignal.timeout(8000)
      })
      
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()

      if (reset) {
        setContents(data.results || [])
      } else {
        setContents(prev => [...prev, ...(data.results || [])])
      }

      setHasMore(data.next !== null)
      setPage(prev => reset ? 1 : prev + 1)
      
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching news:', error)
        toast.error('Gagal memuat berita luar angkasa')
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [searchQuery, page])

  // Initial load
  useEffect(() => {
    fetchExploreContent(true)
  }, [])

  // Refresh when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExploreContent(true)
      
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      
      router.push(`/explore?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore && !searchQuery) {
          fetchExploreContent()
        }
      },
      { threshold: 0.5 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, loadingMore, hasMore, searchQuery])



  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
    }
    fetchExploreContent(true)
  }

  // Handle tag click
  const handleTagClick = (tag: string) => {
    setSearchQuery(`#${tag}`)
    fetchExploreContent(true)
  }

  // Handle Share to Feed
  const handleShareToFeed = async (item: any) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Silakan login untuk membagikan ke feed')
      return
    }

    try {
      const cleanTitle = item.title.replace(/\*/g, '');
      const content = `Space News: ${cleanTitle}\n\n${item.summary}\n\nSource: ${item.url}`;
      
      const params = new URLSearchParams();
      params.set('share_text', content);
      if (item.image_url) params.set('share_image', item.image_url);

      router.push(`/feed?${params.toString()}`);
    } catch (error: any) {
      console.error('Error sharing to feed:', error)
      toast.error('Gagal menyiapkan teks bagikan')
    }
  }

  // News Card Component
  const NewsCard = ({ item }: { item: any }) => {
    const [translatedTitle, setTranslatedTitle] = useState('')
    const [translatedSummary, setTranslatedSummary] = useState('')
    const [isTranslating, setIsTranslating] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [showPopup, setShowPopup] = useState(false)

    const handleTranslate = async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (translatedTitle) {
        setTranslatedTitle('')
        setTranslatedSummary('')
        return
      }

      setIsTranslating(true)
      try {
        const [titleRes, summaryRes] = await Promise.all([
          fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: item.title })
          }),
          fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: item.summary })
          })
        ])

        const titleData = await titleRes.json()
        const summaryData = await summaryRes.json()

        setTranslatedTitle(titleData.translated)
        setTranslatedSummary(summaryData.translated)
      } catch (error) {
        toast.error('Gagal menerjemahkan berita')
      } finally {
        setIsTranslating(false)
      }
    }

    const shareToFeed = async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsSharing(true)
      await handleShareToFeed(item)
      setIsSharing(false)
    }

    // Optimization logic: ringkas (take first 2 sentences)
    const getOptimizedText = (text: string) => {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
      return sentences.slice(0, 2).join(' ') + (sentences.length > 2 ? '...' : '')
    }

    return (
      <div 
        className="news-card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-8px)'
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = 'var(--border-color)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #1a1a2e, #16213e)', fontSize: 32 }}>📰</div>
          )}
          <div style={{ 
            position: 'absolute', top: 16, left: 16, padding: '6px 12px', 
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', 
            borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#fff', 
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Globe size={12} color="#38bdf8" />
            {item.news_site}
          </div>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            <Calendar size={14} />
            {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          <h3 style={{ 
            fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', 
            marginBottom: 12, lineHeight: 1.4, fontFamily: "'Archivo Black', sans-serif" 
          }}>
            {translatedTitle || item.title}
          </h3>

          <div style={{ position: 'relative', flex: 1 }}>
            <p style={{ 
              fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, 
              marginBottom: 20, display: '-webkit-box', 
              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', 
              overflow: 'hidden' 
            }}>
              {getOptimizedText(translatedSummary || item.summary)}
            </p>
            
            <Dialog open={showPopup} onOpenChange={setShowPopup}>
              <DialogTrigger asChild>
                <button 
                  style={{
                    position: 'absolute', bottom: -5, right: 0, 
                    background: 'none', border: 'none', color: 'var(--accent)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    padding: '2px 8px', borderRadius: 4, transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                >
                  Detail & Teks Asli →
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-transparent border-none shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                <div style={{
                  background: 'rgba(11,14,26,0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(129,140,248,0.25)',
                  borderRadius: 24,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  {item.image_url && (
                    <div style={{ height: 140, position: 'relative' }}>
                      <img src={item.image_url} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,14,26,1) 10%, transparent)' }} />
                    </div>
                  )}

                  <div style={{ padding: '0 32px 32px', marginTop: item.image_url ? -40 : 32, position: 'relative', zIndex: 10 }}>
                    <DialogHeader>
                      <DialogTitle style={{
                        fontSize: 22, fontWeight: 800, fontFamily: "'Archivo Black', sans-serif",
                        color: '#fff', marginBottom: 24, lineHeight: 1.4,
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                      }}>
                        {translatedTitle || item.title}
                      </DialogTitle>
                    </DialogHeader>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16,
                        padding: 20
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8' }} />
                          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8' }}>Penjelasan Lengkap</span>
                        </div>
                        <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
                          {item.summary}
                        </p>
                      </div>
                      
                      {translatedSummary && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(14,165,233,0.05))',
                          border: '1px solid rgba(129,140,248,0.3)',
                          borderRadius: 16,
                          padding: 20,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <Languages size={14} color="#a78bfa" />
                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#a78bfa' }}>Terjemahan Indonesia</span>
                          </div>
                          <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.8, margin: 0 }}>
                            {translatedSummary}
                          </p>
                        </div>
                      )}

                      <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '12px 24px', background: '#e2e8f0', color: '#0f172a',
                            borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: 'none',
                            transition: 'all 0.2s', border: '1px solid transparent'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#fff' }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#e2e8f0' }}
                        >
                          <BookOpen size={16} /> Buka Sumber Asli
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, marginTop: 20 }}>
            <button 
              onClick={handleTranslate}
              className="news-card-btn"
              style={{
                padding: '6px 12px', background: 'rgba(129,140,248,0.1)', 
                border: '1px solid rgba(129,140,248,0.2)', borderRadius: 12,
                fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
              }}
            >
              <Languages size={14} />
              {isTranslating ? 'Menerjemahkan...' : translatedTitle ? 'Tampilkan Asli' : 'Terjemahkan'}
            </button>

            <button 
              onClick={shareToFeed}
              disabled={isSharing}
              className="news-card-btn"
              style={{ 
                padding: '6px 12px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', 
                borderRadius: 12, border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600
              }}
            >
              {isSharing ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
              Bagikan ke Feed
            </button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="explore-page">
      <style>{`
        .explore-page {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          padding: 80px 20px 40px;
          font-family: 'DM Sans', sans-serif;
        }
        .explore-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        .explore-header {
          margin-bottom: 32px;
        }
        .explore-title {
          font-size: 32px;
          font-weight: 800;
          font-family: 'Archivo Black', sans-serif;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #c4b5fd, #818cf8, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .explore-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .search-section {
          margin-bottom: 24px;
        }
        .search-container {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .search-wrapper {
          flex: 1;
          position: relative;
          min-width: 280px;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          width: 18px;
          height: 18px;
        }
        .search-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          color: var(--text-primary);
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }
        .search-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .clear-search {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
        }
        .clear-search:hover {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary);
        }
        .filter-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 24px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-button:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent);
        }
        .filter-button.active {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }
        .filter-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 20px;
          margin-top: 16px;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .filter-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .filter-select {
          padding: 10px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          cursor: pointer;
        }
        .filter-select:focus {
          border-color: var(--accent);
        }
        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }
        .clear-btn {
          padding: 8px 16px;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 30px;
          color: var(--text-muted);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-btn:hover {
          border-color: var(--danger);
          color: var(--danger);
        }
        .apply-btn {
          padding: 8px 24px;
          background: var(--accent);
          border: none;
          border-radius: 30px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .apply-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
        }
        .trending-section {
          margin-bottom: 32px;
        }
        .trending-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .trending-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .trending-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .trending-item:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .trending-hashtag {
          font-size: 14px;
          font-weight: 600;
          color: var(--accent);
        }
        .trending-count {
          font-size: 11px;
          color: var(--text-muted);
        }
        .explore-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .category-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .category-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .category-tab:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }
        .category-tab.active {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }
        .view-modes {
          display: flex;
          gap: 4px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          padding: 4px;
        }
        .view-mode-btn {
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 30px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-mode-btn.active {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .content-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .loading-more {
          display: flex;
          justify-content: center;
          padding: 40px 0;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(139,92,246,0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
        }
        .empty-emoji {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .empty-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .empty-sub {
          font-size: 14px;
          color: var(--text-muted);
        }
        .news-card {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .news-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: var(--accent);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(129,140,248,0.2);
        }
        .news-card-btn {
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .news-card-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.2);
        }
        .news-card-btn:active {
          transform: translateY(0) scale(0.95);
        }
        .news-card-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.1);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .news-card-btn:hover::after {
          opacity: 1;
        }
      `}</style>

      <div className="explore-container">
        {/* Header */}
        <div className="explore-header">
          <h1 className="explore-title">Cosmic Events & Discovery</h1>
          <p className="explore-subtitle">
            Discover upcoming celestial schedules, NASA archives, and community posts.
          </p>
        </div>


        {/* Search */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <form onSubmit={(e) => { e.preventDefault(); fetchExploreContent(true); }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Cari berita luar angkasa, fenomena alam, asteroid..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              {searchQuery && (
                <button className="clear-search" onClick={clearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading && contents.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" color="#818cf8" size={40} />
          </div>
        ) : contents.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔭</div>
            <h3 className="empty-title">Tidak ada berita yang ditemukan</h3>
            <p className="empty-sub">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="grid-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: '24px' }}>
            {contents.map((item: any, i) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div ref={observerRef} className="loading-more">
            {loadingMore && <div className="spinner" />}
          </div>
        )}
      </div>


    </div>
  )
}