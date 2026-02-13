'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Heart, Bookmark, Download, Share2, Search, Filter,
  RefreshCw, X, Eye, Calendar, User, Globe, Camera,
  Zap, Star, TrendingUp, Clock, MapPin, ExternalLink,
  Maximize2, Info, ChevronRight, ChevronLeft, Play,
  Volume2, VolumeX, Grid, List, Image as ImageIcon,
  Video, FileText, Settings, AlertCircle, Check,
  Users, BookOpen, Compass, Satellite, Rocket,
  Telescope, Cloud, Wind, Thermometer, Navigation
} from 'lucide-react'

interface NasaItem {
  id: string
  title: string
  description: string
  image: string
  date: string
  source: string
  photographer?: string
  keywords: string[]
  nasa_id: string
  media_type: 'image' | 'video' | 'audio'
  likes: number
  views: number
  isLiked: boolean
  isBookmarked: boolean
}

interface Category {
  id: string
  name: string
  icon: string
  count: number
  color: string
}

export default function NasaPage() {
  // ============================
  // STATE MANAGEMENT
  // ============================
  const [items, setItems] = useState<NasaItem[]>([])
  const [filteredItems, setFilteredItems] = useState<NasaItem[]>([])
  const [query, setQuery] = useState('nebula')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NasaItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalItems: 0,
    totalLikes: 0,
    totalViews: 0,
    todayItems: 0
  })
  const observerRef = useRef<HTMLDivElement>(null)

  // ============================
  // KATEGORI & TOPIK
  // ============================
  const categories: Category[] = [
    { id: 'all', name: 'Semua', icon: '🌌', count: 0, color: 'from-purple-500 to-blue-500' },
    { id: 'nebula', name: 'Nebula', icon: '✨', count: 0, color: 'from-pink-500 to-purple-500' },
    { id: 'galaxy', name: 'Galaksi', icon: '🌀', count: 0, color: 'from-blue-500 to-cyan-500' },
    { id: 'planet', name: 'Planet', icon: '🪐', count: 0, color: 'from-yellow-500 to-orange-500' },
    { id: 'star', name: 'Bintang', icon: '⭐', count: 0, color: 'from-yellow-400 to-red-500' },
    { id: 'blackhole', name: 'Lubang Hitam', icon: '⚫', count: 0, color: 'from-gray-800 to-black' },
    { id: 'solarsystem', name: 'Tata Surya', icon: '☀️', count: 0, color: 'from-orange-500 to-yellow-500' },
    { id: 'spacecraft', name: 'Wahana Antariksa', icon: '🚀', count: 0, color: 'from-red-500 to-pink-500' },
    { id: 'earth', name: 'Bumi', icon: '🌍', count: 0, color: 'from-green-500 to-blue-500' },
    { id: 'moon', name: 'Bulan', icon: '🌙', count: 0, color: 'from-gray-400 to-gray-600' },
    { id: 'mars', name: 'Mars', icon: '🔴', count: 0, color: 'from-red-600 to-orange-500' },
    { id: 'jupiter', name: 'Jupiter', icon: '🪐', count: 0, color: 'from-orange-400 to-yellow-400' }
  ]

  const trendingTopics = [
    { name: 'James Webb', count: 245, icon: '🔭' },
    { name: 'Black Hole', count: 189, icon: '⚫' },
    { name: 'Exoplanet', count: 156, icon: '🪐' },
    { name: 'Aurora', count: 132, icon: '🌌' },
    { name: 'ISS', count: 98, icon: '🛰️' },
    { name: 'Supernova', count: 87, icon: '💥' }
  ]

  // ============================
  // FETCH DATA NASA
  // ============================
  const fetchNasaData = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(1)
      } else {
        setLoadingMore(true)
      }

      const searchTerm = query || 'space'
      const response = await fetch(
        `https://images-api.nasa.gov/search?q=${searchTerm}&media_type=image&page=${reset ? 1 : page}&page_size=20`
      )

      if (!response.ok) throw new Error('Gagal mengambil data dari NASA')

      const data = await response.json()
      
      const newItems: NasaItem[] = data.collection.items.map((item: any) => ({
        id: item.data[0].nasa_id,
        title: item.data[0].title || 'Gambar NASA',
        description: item.data[0].description?.substring(0, 150) + '...' || 'Gambar menakjubkan dari luar angkasa.',
        image: item.links?.[0]?.href || 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06',
        date: item.data[0].date_created?.split('T')[0] || new Date().toISOString().split('T')[0],
        source: item.data[0].center || 'NASA',
        photographer: item.data[0].photographer || 'NASA',
        keywords: item.data[0].keywords || ['space', 'nasa'],
        nasa_id: item.data[0].nasa_id,
        media_type: item.data[0].media_type || 'image',
        likes: Math.floor(Math.random() * 1000) + 100,
        views: Math.floor(Math.random() * 5000) + 1000,
        isLiked: false,
        isBookmarked: false
      }))

      if (reset) {
        setItems(newItems)
        setFilteredItems(newItems)
        setPage(2)
      } else {
        setItems(prev => [...prev, ...newItems])
        setFilteredItems(prev => [...prev, ...newItems])
        setPage(prev => prev + 1)
      }

      // Update stats
      updateStats(reset ? newItems : [...items, ...newItems])
      
      showNotification(`${newItems.length} gambar NASA berhasil dimuat!`)

    } catch (error) {
      console.error('Error:', error)
      showNotification('Gagal memuat data NASA. Coba lagi nanti!', 'error')
      
      // Fallback data jika API gagal
      if (reset) {
        const fallbackData = generateFallbackData()
        setItems(fallbackData)
        setFilteredItems(fallbackData)
        updateStats(fallbackData)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // ============================
  // HELPER FUNCTIONS
  // ============================
  const generateFallbackData = (): NasaItem[] => {
    const fallbackImages = [
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564',
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06',
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78',
      'https://images.unsplash.com/photo-1464802686167-b939a6910659',
      'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3',
      'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51',
      'https://images.unsplash.com/photo-1541873676-a18131494184',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564',
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06'
    ]

    return fallbackImages.map((img, index) => ({
      id: `fallback-${index}`,
      title: ['Nebula Orion', 'Galaksi Andromeda', 'Planet Jupiter', 'Eclipse Matahari', 'Bulan Purnama'][index % 5],
      description: 'Gambar luar angkasa yang menakjubkan dari NASA. Menampilkan keindahan alam semesta yang luas.',
      image: `${img}?q=80&w=2070&auto=format&fit=crop`,
      date: new Date(Date.now() - index * 86400000).toISOString().split('T')[0],
      source: 'NASA',
      photographer: 'Fotografer NASA',
      keywords: ['space', 'nasa', 'astronomy'],
      nasa_id: `nasa-${index}`,
      media_type: 'image',
      likes: Math.floor(Math.random() * 1000) + 100,
      views: Math.floor(Math.random() * 5000) + 1000,
      isLiked: false,
      isBookmarked: false
    }))
  }

  const updateStats = (itemsList: NasaItem[]) => {
    const today = new Date().toISOString().split('T')[0]
    const todayItems = itemsList.filter(item => item.date === today).length
    
    setStats({
      totalItems: itemsList.length,
      totalLikes: itemsList.reduce((sum, item) => sum + item.likes, 0),
      totalViews: itemsList.reduce((sum, item) => sum + item.views, 0),
      todayItems
    })
  }

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  // ============================
  // ACTIONS
  // ============================
  const handleLike = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ))
    
    setFilteredItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ))

    showNotification('Gambar ditambahkan ke favorit! ✨')
  }

  const handleBookmark = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isBookmarked: !item.isBookmarked }
        : item
    ))
    
    setFilteredItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isBookmarked: !item.isBookmarked }
        : item
    ))

    showNotification('Gambar disimpan! 📌')
  }

  const handleShare = async (item: NasaItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Lihat gambar NASA ini: ${item.title}`,
          url: item.image
        })
      } catch (error) {
        console.log('Sharing cancelled')
      }
    } else {
      navigator.clipboard.writeText(item.image)
      showNotification('Link disalin ke clipboard! 📋')
    }
  }

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/\s+/g, '-')}-nasa.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      showNotification('Gambar berhasil diunduh! ⬇️')
    } catch (error) {
      showNotification('Gagal mengunduh gambar', 'error')
    }
  }

  // ============================
  // FILTER & SORT
  // ============================
  useEffect(() => {
    let filtered = [...items]
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.keywords.some(keyword => 
          keyword.toLowerCase().includes(activeCategory.toLowerCase())
        ) || 
        item.title.toLowerCase().includes(activeCategory.toLowerCase())
      )
    }
    
    // Sort items
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes)
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views)
    }
    
    setFilteredItems(filtered)
    
    // Update category counts
    categories.forEach(cat => {
      const count = items.filter(item => 
        item.keywords.some(keyword => 
          keyword.toLowerCase().includes(cat.id.toLowerCase())
        )
      ).length
      // Update count logic here
    })
    
  }, [items, activeCategory, sortBy])

  // ============================
  // INFINITE SCROLL
  // ============================
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore) {
          fetchNasaData()
        }
      },
      { threshold: 1.0 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, loadingMore])

  // ============================
  // INITIAL FETCH
  // ============================
  useEffect(() => {
    fetchNasaData(true)
  }, [])

  // ============================
  // RENDER UI
  // ============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar-black via-stellar-dark to-stellar-black text-white">
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-xl shadow-xl">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>{notification}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header dengan Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          
          {/* Header Utama */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center">
                  <Satellite className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    NASA Image Gallery
                  </h1>
                  <p className="text-gray-300 mt-1">Jelajahi keindahan alam semesta melalui koleksi gambar NASA</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-xl">
                  <ImageIcon className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Gambar</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-xl">
                  <Heart className="h-5 w-5 text-red-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Suka</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-xl">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Dilihat</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => fetchNasaData(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-blue-600 rounded-xl hover:from-red-700 hover:to-blue-700 transition-all flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh Data
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl ${viewMode === 'grid' ? 'bg-purple-600/30 text-white' : 'bg-gray-900/50 text-gray-400 hover:text-white'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl ${viewMode === 'list' ? 'bg-purple-600/30 text-white' : 'bg-gray-900/50 text-gray-400 hover:text-white'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchNasaData(true)}
                placeholder="Cari gambar NASA: nebula, galaxy, mars, black hole..."
                className="w-full pl-12 pr-4 py-4 bg-gray-900/70 border border-gray-700 rounded-2xl text-lg placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Kategori Populer</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <Filter className="h-5 w-5" />
                Filter & Sort
              </button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-2">Urutkan Berdasarkan</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                    >
                      <option value="recent">Terbaru</option>
                      <option value="popular">Paling Populer</option>
                      <option value="views">Paling Banyak Dilihat</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">Tipe Media</label>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-600/30 rounded-lg">Gambar</button>
                      <button className="px-4 py-2 bg-gray-800/50 rounded-lg">Video</button>
                      <button className="px-4 py-2 bg-gray-800/50 rounded-lg">Audio</button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">Tahun</label>
                    <select className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
                      <option>Semua Tahun</option>
                      <option>2024</option>
                      <option>2023</option>
                      <option>2022</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Trending Topics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Topik Trending</h2>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map(topic => (
                <button
                  key={topic.name}
                  onClick={() => {
                    setQuery(topic.name)
                    fetchNasaData(true)
                  }}
                  className="px-4 py-2 bg-gray-900/50 hover:bg-gray-800/70 rounded-xl flex items-center gap-2 transition-all"
                >
                  <span>{topic.icon}</span>
                  <span>#{topic.name}</span>
                  <span className="text-xs text-gray-400">{topic.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Results Info */}
        <div className="mb-6 p-4 bg-gray-900/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">
                Menampilkan <span className="text-white font-bold">{filteredItems.length}</span> gambar NASA
                {activeCategory !== 'all' && (
                  <span> dalam kategori <span className="text-purple-400">{activeCategory}</span></span>
                )}
              </p>
              <p className="text-gray-500 text-sm mt-1">Data langsung dari NASA Image Library</p>
            </div>
            <div className="text-sm text-gray-400">
              Halaman {page - 1} • {loadingMore ? 'Memuat lebih banyak...' : 'Siap'}
            </div>
          </div>
        </div>
        
        {/* Content Grid/List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Memuat gambar dari NASA...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Telescope className="h-20 w-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">Tidak ada gambar ditemukan</h3>
            <p className="text-gray-500 mb-6">Coba kata kunci yang berbeda atau pilih kategori lain</p>
            <button
              onClick={() => {
                setQuery('space')
                setActiveCategory('all')
                fetchNasaData(true)
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Tampilkan Semua Gambar
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-gray-900/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-800/50 hover:border-purple-500/30"
              >
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Image Overlay Info */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs">
                      {item.media_type === 'image' ? '📷 Gambar' : '🎥 Video'}
                    </span>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(item.id)
                      }}
                      className={`p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors ${
                        item.isLiked ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItem(item)
                      }}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* View Count */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm">
                    <Eye className="h-4 w-4" />
                    <span>{item.views.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{item.date}</span>
                    </div>
                    {item.photographer && (
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <User className="h-4 w-4" />
                        <span className="truncate max-w-[80px]">{item.photographer}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.keywords.slice(0, 3).map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg">
                        #{keyword}
                      </span>
                    ))}
                    {item.keywords.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-lg">
                        +{item.keywords.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(item.id)
                        }}
                        className={`flex items-center gap-1 ${
                          item.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${item.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{item.likes.toLocaleString()}</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookmark(item.id)
                        }}
                        className={`p-2 ${item.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                      >
                        <Bookmark className={`h-5 w-5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(item)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-400"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(item.image, item.title)
                        }}
                        className="p-2 text-gray-400 hover:text-green-400"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900/50 rounded-2xl overflow-hidden hover:bg-gray-800/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 md:h-48 h-40 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{item.views.toLocaleString()} views</span>
                          </div>
                          {item.source && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              <span>{item.source}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLike(item.id)}
                          className={`p-2 rounded-lg ${item.isLiked ? 'text-red-400 bg-red-500/10' : 'text-gray-400 hover:text-red-400'}`}
                        >
                          <Heart className={`h-5 w-5 ${item.isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleBookmark(item.id)}
                          className={`p-2 rounded-lg ${item.isBookmarked ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 hover:text-yellow-400'}`}
                        >
                          <Bookmark className={`h-5 w-5 ${item.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {item.keywords.slice(0, 4).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm"
                        >
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => handleDownload(item.image, item.title)}
                          className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Load More Observer */}
        {!loading && filteredItems.length > 0 && (
          <div ref={observerRef} className="py-8 text-center">
            {loadingMore ? (
              <div className="inline-flex items-center gap-2 text-gray-400">
                <div className="h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                Memuat lebih banyak gambar...
              </div>
            ) : (
              <button
                onClick={() => fetchNasaData()}
                className="px-8 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl hover:from-purple-600/30 hover:to-blue-600/30 transition-all"
              >
                Muat Lebih Banyak
              </button>
            )}
          </div>
        )}
        
        {/* Modal Detail */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-full hover:bg-gray-800"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="relative h-[60vh] rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <button
                      onClick={() => handleLike(selectedItem.id)}
                      className={`p-3 rounded-full bg-black/70 hover:bg-black/90 ${
                        selectedItem.isLiked ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      <Heart className={`h-6 w-6 ${selectedItem.isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleBookmark(selectedItem.id)}
                      className={`p-3 rounded-full bg-black/70 hover:bg-black/90 ${
                        selectedItem.isBookmarked ? 'text-yellow-400' : 'text-white'
                      }`}
                    >
                      <Bookmark className={`h-6 w-6 ${selectedItem.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDownload(selectedItem.image, selectedItem.title)}
                      className="p-3 rounded-full bg-black/70 hover:bg-black/90 text-white"
                    >
                      <Download className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-800/30 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Tanggal</p>
                        <p className="font-medium">{selectedItem.date}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedItem.photographer && (
                    <div className="bg-gray-800/30 p-4 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-400">Fotografer</p>
                          <p className="font-medium">{selectedItem.photographer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-800/30 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Sumber</p>
                        <p className="font-medium">{selectedItem.source}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 p-6 rounded-xl mb-6">
                  <h3 className="text-xl font-semibold mb-4">Deskripsi</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedItem.description}</p>
                </div>
                
                {/* Keywords */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Kata Kunci</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 rounded-xl border border-purple-500/30">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-800">
                  <a
                    href={selectedItem.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Buka di Tab Baru
                  </a>
                  <button
                    onClick={() => handleDownload(selectedItem.image, selectedItem.title)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Unduh Gambar HD
                  </button>
                  <button
                    onClick={() => handleShare(selectedItem)}
                    className="px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="h-5 w-5" />
                    Bagikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="text-center text-gray-500">
            <p className="mb-2">🌌 Data gambar disediakan oleh NASA Image and Video Library API</p>
            <p className="text-sm">Gunakan untuk tujuan edukasi dan eksplorasi alam semesta</p>
          </div>
        </div>
      </div>
    </div>
  )
}