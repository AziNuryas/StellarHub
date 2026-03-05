'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ExploreCard } from './components/ExploreCard'
import { ExploreDetailModal } from './components/ExploreDetailModal'
import { ExploreContent, TrendingHashtag, ContentSource } from './types'
import { 
  Search, TrendingUp, Clock, Flame, Filter, 
  X, Loader2, ChevronDown, Sparkles, Rocket,
  Grid, List, Eye, Heart, MessageCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function ExplorePage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [contents, setContents] = useState<ExploreContent[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedType, setSelectedType] = useState<ContentSource | 'all'>(searchParams.get('type') as any || 'all')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>(
    (searchParams.get('sort') as any) || 'latest'
  )
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>(
    (searchParams.get('time') as any) || 'week'
  )
  const [selectedContent, setSelectedContent] = useState<ExploreContent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  
  const observerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Categories untuk filter
  const categories = [
    { id: 'all', label: 'Semua', icon: '🌌' },
    { id: 'nasa_apod', label: 'NASA APOD', icon: '🚀' },
    { id: 'user_post', label: 'Postingan Komunitas', icon: '📝' },
  ]

  // Fetch explore content
  const fetchExploreContent = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }

      let query = supabase
        .from('explore_content_view')
        .select('*')

      // Filter by type
      if (selectedType !== 'all') {
        query = query.eq('source_type', selectedType)
      }

      // Filter by search query
      if (searchQuery) {
        const { data } = await supabase
          .rpc('search_explore', { search_query: searchQuery })
        
        if (data) {
          setContents(data as any)
          setLoading(false)
          setLoadingMore(false)
          return
        }
      }

      // Sorting
      switch (sortBy) {
        case 'latest':
          query = query.order('original_created_at', { ascending: false })
          break
        case 'popular':
          query = query.order('likes_count', { ascending: false })
          break
        case 'trending':
          query = query
            .gte('original_created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('likes_count', { ascending: false })
          break
      }

      // Pagination
      const pageSize = 20
      const from = (reset ? 0 : page) * pageSize
      const to = from + pageSize - 1
      
      const { data, error } = await query.range(from, to)

      if (error) throw error

      if (reset) {
        setContents(data || [])
      } else {
        setContents(prev => [...prev, ...(data || [])])
      }

      setHasMore((data?.length || 0) === pageSize)
      setPage(prev => reset ? 1 : prev + 1)

    } catch (error) {
      console.error('Error fetching explore content:', error)
      toast.error('Gagal memuat konten')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedType, searchQuery, sortBy, page])

  // Fetch trending hashtags
  const fetchTrendingHashtags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_trending_hashtags', { limit_count: 10 })

      if (error) throw error
      setTrendingHashtags(data || [])
    } catch (error) {
      console.error('Error fetching trending hashtags:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchExploreContent(true)
    fetchTrendingHashtags()
  }, [])

  // Refresh when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExploreContent(true)
      
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedType !== 'all') params.set('type', selectedType)
      if (sortBy !== 'latest') params.set('sort', sortBy)
      if (timeRange !== 'week') params.set('time', timeRange)
      
      router.push(`/explore?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedType, searchQuery, sortBy, timeRange])

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

  // Handle content click
  const handleContentClick = (content: ExploreContent) => {
    setSelectedContent(content)
    setModalOpen(true)
  }

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
          <h1 className="explore-title">Explore the Cosmos</h1>
          <p className="explore-subtitle">
            Discover amazing content from NASA and the StellarHub community
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
                  placeholder="Search NASA images, posts, hashtags..."
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
            <button
              className={`filter-button ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>Filter</span>
              <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="filter-panel">
              <div className="filter-grid">
                <div className="filter-group">
                  <span className="filter-label">Sort By</span>
                  <select
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="latest">Terbaru</option>
                    <option value="popular">Terpopuler</option>
                    <option value="trending">Trending Minggu Ini</option>
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Time Range</span>
                  <select
                    className="filter-select"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                  >
                    <option value="day">Hari Ini</option>
                    <option value="week">Minggu Ini</option>
                    <option value="month">Bulan Ini</option>
                    <option value="all">Semua Waktu</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button
                  className="clear-btn"
                  onClick={() => {
                    setSelectedType('all')
                    setSortBy('latest')
                    setTimeRange('week')
                    setSearchQuery('')
                  }}
                >
                  Reset Filter
                </button>
                <button
                  className="apply-btn"
                  onClick={() => {
                    setShowFilters(false)
                    fetchExploreContent(true)
                  }}
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trending Hashtags */}
        {trendingHashtags.length > 0 && !searchQuery && (
          <div className="trending-section">
            <div className="trending-title">
              <Flame size={18} color="#f97316" />
              <span>Trending Now</span>
            </div>
            <div className="trending-grid">
              {trendingHashtags.map((tag) => (
                <div
                  key={tag.hashtag}
                  className="trending-item"
                  onClick={() => handleTagClick(tag.hashtag)}
                >
                  <span className="trending-hashtag">#{tag.hashtag}</span>
                  <span className="trending-count">{tag.post_count} posts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="explore-toolbar">
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab ${selectedType === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedType(cat.id as any)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="view-modes">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-more">
            <div className="spinner" />
          </div>
        ) : contents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">🌌</div>
            <h3 className="empty-title">No results found</h3>
            <p className="empty-sub">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'content-grid' : 'content-list'}>
            {contents.map((content, index) => (
              <ExploreCard
                key={`${content.source_type}-${content.source_id}-${index}`}
                content={content}
                onClick={() => handleContentClick(content)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && !searchQuery && (
          <div ref={observerRef} className="loading-more">
            {loadingMore && <div className="spinner" />}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedContent && (
        <ExploreDetailModal
          content={selectedContent}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}