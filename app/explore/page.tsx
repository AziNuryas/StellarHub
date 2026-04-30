'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Clock, ExternalLink, Calendar, Loader2, X, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
  
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
          <div className="grid-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {contents.map((item: any, i) => (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                key={item.id}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                    {item.image_url ? (
                       <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                       <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #1a1a2e, #16213e)', fontSize: 32 }}>📰</div>
                    )}
                    <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {item.news_site}
                    </div>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{item.summary}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                        <Clock size={12} /> {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <ExternalLink size={14} color="var(--text-muted)" />
                    </div>
                  </div>
                </div>
              </a>
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