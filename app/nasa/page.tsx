'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Heart, Bookmark, Download, Share2, Search, Filter,
  RefreshCw, X, Eye, Calendar, User, Globe, Camera,
  Zap, Star, TrendingUp, Clock, MapPin, ExternalLink,
  Maximize2, Info, ChevronRight, ChevronLeft, Play,
  Volume2, VolumeX, Grid, List, Image as ImageIcon,
  Video, FileText, Settings, AlertCircle, Check,
  Users, BookOpen, Compass, Satellite, Rocket,
  Telescope, Cloud, Wind, Thermometer, Navigation,
  MessageCircle, Send, Loader2, Sparkles, MoreHorizontal
} from 'lucide-react'

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
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
  likeId?: string
  category?: string // Kategori asal (nebula, galaxy, etc)
}

interface Category {
  id: string
  name: string
  icon: string
  count: number
  color: string
}

/* ══════════════════════════════════════════════════════
   HELPER COMPONENTS
══════════════════════════════════════════════════════ */
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const day = Math.floor(h / 24)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${day}d ago`
}

const AV_GRADS = [
  'linear-gradient(135deg,#7c3aed,#4f46e5)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
]
const avGrad = (s = '') => AV_GRADS[(s.charCodeAt(0) || 65) % AV_GRADS.length]

function Avatar({ name = 'A', size = 40 }: { name?: string; size?: number }) {
  const r = Math.round(size * 0.28)
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: avGrad(name), flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: '#fff', userSelect: 'none',
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function renderText(text: string) {
  return text.split(/(\s+)/).map((w, i) =>
    w.startsWith('#') || w.startsWith('@')
      ? <span key={i} style={{ color: '#818cf8', fontWeight: 500 }}>{w}</span>
      : w
  )
}

/* ══════════════════════════════════════════════════════
   SKELETON LOADING
══════════════════════════════════════════════════════ */
function SkeletonGrid() {
  return (
    <div className="fd-grid">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="fd-card-nasa" style={{ height: '320px' }}>
          <div className="fd-img-container" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="fd-content">
            <div style={{ height: '20px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div style={{ height: '16px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '12px' }}></div>
            <div style={{ height: '32px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   NASA PAGE
══════════════════════════════════════════════════════ */
export default function NasaPage() {
  const supabase = createClient()
  
  // ============================
  // STATE MANAGEMENT
  // ============================
  const [items, setItems] = useState<NasaItem[]>([])
  const [filteredItems, setFilteredItems] = useState<NasaItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NasaItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [stats, setStats] = useState({
    totalItems: 0,
    totalLikes: 0,
    totalViews: 0,
  })
  const observerRef = useRef<HTMLDivElement>(null)
  const [usedKeywords, setUsedKeywords] = useState<string[]>([])
  
  // ============================
  // STATE UNTUK POSTING KE KOMUNITAS
  // ============================
  const [showPostModal, setShowPostModal] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ============================
  // ALL NASA KEYWORDS
  // ============================
  const nasaKeywords = [
    // Deep Space Objects
    'nebula', 'galaxy', 'black hole', 'star', 'supernova',
    'quasar', 'pulsar', 'globular cluster', 'open cluster',
    'orion nebula', 'eagle nebula', 'crab nebula', 'ring nebula',
    'helix nebula', 'tarantula nebula', 'horsehead nebula',
    'andromeda galaxy', 'milky way', 'whirlpool galaxy',
    'sombrero galaxy', 'cartwheel galaxy', 'antennae galaxies',
    
    // Solar System
    'sun', 'mercury', 'venus', 'earth', 'moon', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    'asteroid', 'comet', 'meteor', 'kuiper belt', 'oort cloud',
    
    // Planets Details
    'mars rover', 'curiosity', 'perseverance', 'opportunity',
    'jupiter spots', 'saturn rings', 'io', 'europa', 'titan',
    'enceladus', 'triton', 'ceres', 'vesta',
    
    // Space Missions
    'apollo', 'artemis', 'iss', 'space station', 'space shuttle',
    'hubble', 'james webb', 'chandra', 'spitzer', 'fermi',
    'voyager', 'pioneer', 'new horizons', 'cassini', 'galileo',
    'juno', 'dragon', 'starship', 'orion spacecraft',
    
    // Astronauts & People
    'astronaut', 'spacewalk', 'moon landing', 'space suit',
    'neil armstrong', 'buzz aldrin', 'sally ride', 'john glenn',
    
    // Earth Observations
    'earth from space', 'aurora', 'northern lights', 'southern lights',
    'hurricane from space', 'clouds', 'ocean', 'continent',
    'night lights', 'city lights', 'earth limb', 'atmosphere',
    
    // Space Phenomena
    'solar flare', 'coronal mass ejection', 'sunspot',
    'aurora borealis', 'aurora australis', 'eclipse',
    'solar eclipse', 'lunar eclipse', 'transit', 'occultation',
    'gamma ray burst', 'cosmic ray', 'dark matter',
    
    // Telescopes & Instruments
    'telescope', 'observatory', 'radio telescope',
    'keck', 'vlt', 'gemini', 'subaru', 'alma',
    'spitzer', 'planck', 'herschel', 'xmm-newton',
    
    // Launch Vehicles
    'rocket', 'falcon', 'atlas', 'delta', 'ariane',
    'soyuz', 'proton', 'long march', 'launch',
    'lift off', 'countdown', 'launch pad',
    
    // Space Technology
    'satellite', 'probe', 'lander', 'rover', 'drone',
    'helicopter', 'ingenuity', 'solar panel', 'antenna',
    'thruster', 'engine', 'fuel tank', 'fairing',
    
    // Astrophotography
    'deep field', 'wide field', 'long exposure',
    'star trail', 'night sky', 'constellation',
    'zodiacal light', 'milky way core', 'star cluster',
    
    // Add more specific ones
    'black hole m87', 'sagittarius a*', 'cygnus x-1',
    'trappist-1', 'proxima centauri', 'betelgeuse',
    'rigel', 'sirius', 'vega', 'polaris',
    'orion constellation', 'ursa major', 'cassiopeia',
    'pleiades', 'hyades', 'beehive cluster'
  ]

  // ============================
  // CATEGORIES BUAT FILTER
  // ============================
  const categories: Category[] = [
    { id: 'all', name: 'Semua', icon: '🌌', count: 0, color: 'from-purple-500 to-blue-500' },
    { id: 'nebula', name: 'Nebula', icon: '✨', count: 0, color: 'from-pink-500 to-purple-500' },
    { id: 'galaxy', name: 'Galaksi', icon: '🌀', count: 0, color: 'from-blue-500 to-cyan-500' },
    { id: 'black hole', name: 'Black Hole', icon: '⚫', count: 0, color: 'from-gray-800 to-black' },
    { id: 'planet', name: 'Planet', icon: '🪐', count: 0, color: 'from-yellow-500 to-orange-500' },
    { id: 'moon', name: 'Bulan', icon: '🌙', count: 0, color: 'from-gray-400 to-gray-600' },
    { id: 'mars', name: 'Mars', icon: '🔴', count: 0, color: 'from-red-600 to-orange-500' },
    { id: 'jupiter', name: 'Jupiter', icon: '🪐', count: 0, color: 'from-orange-400 to-yellow-400' },
    { id: 'saturn', name: 'Saturn', icon: '🪐', count: 0, color: 'from-yellow-600 to-amber-400' },
    { id: 'star', name: 'Bintang', icon: '⭐', count: 0, color: 'from-yellow-400 to-red-500' },
    { id: 'sun', name: 'Matahari', icon: '☀️', count: 0, color: 'from-yellow-500 to-red-600' },
    { id: 'comet', name: 'Komet', icon: '☄️', count: 0, color: 'from-blue-400 to-cyan-400' },
    { id: 'astronaut', name: 'Astronot', icon: '👨‍🚀', count: 0, color: 'from-blue-500 to-indigo-600' },
    { id: 'spacecraft', name: 'Wahana', icon: '🚀', count: 0, color: 'from-red-500 to-pink-500' },
    { id: 'satellite', name: 'Satelit', icon: '🛰️', count: 0, color: 'from-gray-500 to-slate-600' },
    { id: 'iss', name: 'ISS', icon: '🛸', count: 0, color: 'from-blue-400 to-indigo-500' },
    { id: 'telescope', name: 'Teleskop', icon: '🔭', count: 0, color: 'from-purple-600 to-indigo-600' },
    { id: 'aurora', name: 'Aurora', icon: '🌌', count: 0, color: 'from-green-400 to-blue-500' },
    { id: 'eclipse', name: 'Gerhana', icon: '🌑', count: 0, color: 'from-gray-700 to-yellow-800' },
    { id: 'supernova', name: 'Supernova', icon: '💥', count: 0, color: 'from-orange-600 to-red-700' },
  ]

  // ============================
  // CEK USER (REALTIME)
  // ============================
  useEffect(() => {
    setAuthLoading(true)
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ============================
  // FETCH DATA NASA - MULTI KEYWORD
  // ============================
  const fetchNasaData = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setUsedKeywords([])
      } else {
        setLoadingMore(true)
      }

      // Pilih keyword yang belum pernah di-fetch
      let keywordsToFetch: string[] = []
      
      if (reset) {
        // Ambil 8 keyword random untuk initial load
        keywordsToFetch = nasaKeywords
          .sort(() => 0.5 - Math.random())
          .slice(0, 8)
        setUsedKeywords(keywordsToFetch)
      } else {
        // Ambil 4 keyword baru yang belum dipakai
        const remainingKeywords = nasaKeywords.filter(k => !usedKeywords.includes(k))
        if (remainingKeywords.length === 0) {
          // Kalo udah habis, loop lagi dari awal
          keywordsToFetch = nasaKeywords
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)
        } else {
          keywordsToFetch = remainingKeywords
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)
        }
        setUsedKeywords(prev => [...prev, ...keywordsToFetch])
      }

      // Tambah keyword dari query kalo ada
      if (query && !keywordsToFetch.includes(query)) {
        keywordsToFetch.push(query)
      }

      console.log('Fetching keywords:', keywordsToFetch)
      
      const allItems: NasaItem[] = []
      
      // Fetch semua keyword secara parallel
      await Promise.all(
        keywordsToFetch.map(async (keyword) => {
          try {
            const response = await fetch(
              `https://images-api.nasa.gov/search?q=${encodeURIComponent(keyword)}&media_type=image&page=1&page_size=15`
            )
            
            if (!response.ok) return []
            
            const data = await response.json()
            
            return data.collection.items.map((item: any) => ({
              id: item.data[0].nasa_id,
              title: item.data[0].title || 'Gambar NASA',
              description: item.data[0].description || 'Gambar menakjubkan dari luar angkasa.',
              image: item.links?.[0]?.href || 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06',
              date: item.data[0].date_created?.split('T')[0] || new Date().toISOString().split('T')[0],
              source: item.data[0].center || 'NASA',
              photographer: item.data[0].photographer || 'NASA',
              keywords: item.data[0].keywords || [keyword, 'space', 'nasa'],
              nasa_id: item.data[0].nasa_id,
              media_type: item.data[0].media_type || 'image',
              likes: 0,
              views: Math.floor(Math.random() * 5000) + 1000,
              isLiked: false,
              isBookmarked: false,
              category: keyword
            }))
          } catch (error) {
            console.error(`Error fetching ${keyword}:`, error)
            return []
          }
        })
      ).then(results => {
        results.forEach(items => {
          allItems.push(...items)
        })
      })

      // Hapus duplikat berdasarkan ID
      const uniqueItems = Array.from(
        new Map(allItems.map(item => [item.id, item])).values()
      )

      // Urutin dari terbaru ke terlama
      uniqueItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Kalo user login, cek likes dari database
      if (user) {
        for (let item of uniqueItems) {
          const { data: likeData } = await supabase
            .from('nasa_likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('nasa_id', item.id)
            .maybeSingle()
          
          const { count } = await supabase
            .from('nasa_likes')
            .select('*', { count: 'exact', head: true })
            .eq('nasa_id', item.id)
          
          item.isLiked = !!likeData
          item.likeId = likeData?.id
          item.likes = count || 0
        }
      }

      if (reset) {
        setItems(uniqueItems)
        setFilteredItems(uniqueItems)
      } else {
        // Gabung dengan items lama, hapus duplikat, urutin lagi
        const combined = [...items, ...uniqueItems]
        const uniqueCombined = Array.from(
          new Map(combined.map(item => [item.id, item])).values()
        )
        uniqueCombined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        setItems(uniqueCombined)
        setFilteredItems(uniqueCombined)
      }

      // Update stats
      updateStats(reset ? uniqueItems : items)
      
      toast.success(`${uniqueItems.length} gambar dari berbagai kategori berhasil dimuat!`)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat data NASA. Coba lagi nanti!')
      
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
  // FETCH LIKES (update setelah like)
  // ============================
  const fetchLikesForItem = async (itemId: string) => {
    if (!user) return
    
    const { count } = await supabase
      .from('nasa_likes')
      .select('*', { count: 'exact', head: true })
      .eq('nasa_id', itemId)
    
    const { data: likeData } = await supabase
      .from('nasa_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('nasa_id', itemId)
      .maybeSingle()
    
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, likes: count || 0, isLiked: !!likeData, likeId: likeData?.id }
        : item
    ))
    
    setFilteredItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, likes: count || 0, isLiked: !!likeData, likeId: likeData?.id }
        : item
    ))
  }

  // ============================
  // FALLBACK DATA (kalo API error)
  // ============================
  const generateFallbackData = (): NasaItem[] => {
    const categories = [
      { name: 'Nebula Orion', keyword: 'nebula', icon: '✨' },
      { name: 'Galaksi Andromeda', keyword: 'galaxy', icon: '🌀' },
      { name: 'Black Hole M87', keyword: 'black hole', icon: '⚫' },
      { name: 'Planet Jupiter', keyword: 'jupiter', icon: '🪐' },
      { name: 'Cincin Saturnus', keyword: 'saturn', icon: '🪐' },
      { name: 'Mars', keyword: 'mars', icon: '🔴' },
      { name: 'Bulan Purnama', keyword: 'moon', icon: '🌙' },
      { name: 'Matahari', keyword: 'sun', icon: '☀️' },
      { name: 'Aurora Borealis', keyword: 'aurora', icon: '🌌' },
      { name: 'ISS', keyword: 'iss', icon: '🛸' },
      { name: 'Astronot', keyword: 'astronaut', icon: '👨‍🚀' },
      { name: 'Roket Falcon', keyword: 'rocket', icon: '🚀' },
    ]

    return categories.map((cat, index) => ({
      id: `fallback-${index}`,
      title: cat.name,
      description: `Gambar menakjubkan dari ${cat.name}. Menampilkan keindahan alam semesta yang luas dan penuh misteri.`,
      image: `https://images.unsplash.com/photo-${[
        '1462331940025-496dfbfc7564',
        '1446776653964-20c1d3a81b06',
        '1502134249126-9f3755a50d78',
        '1464802686167-b939a6910659',
        '1614313913007-2b4ae8ce32d6'
      ][index % 5]}?q=80&w=2070&auto=format&fit=crop`,
      date: new Date(Date.now() - index * 86400000 * 7).toISOString().split('T')[0],
      source: 'NASA',
      photographer: 'NASA',
      keywords: [cat.keyword, 'space', 'nasa', 'astronomy'],
      nasa_id: `nasa-${index}`,
      media_type: 'image',
      likes: Math.floor(Math.random() * 150) + 20,
      views: Math.floor(Math.random() * 1000) + 200,
      isLiked: false,
      isBookmarked: false,
      category: cat.keyword
    }))
  }

  // ============================
  // UPDATE STATS
  // ============================
  const updateStats = (itemsList: NasaItem[]) => {
    setStats({
      totalItems: itemsList.length,
      totalLikes: itemsList.reduce((sum, item) => sum + item.likes, 0),
      totalViews: itemsList.reduce((sum, item) => sum + item.views, 0),
    })
  }

  // ============================
  // LIKE ASLI (pakai database)
  // ============================
  const handleLike = async (id: string) => {
    if (!user) {
      toast.error('Login dulu untuk like!')
      return
    }

    const item = items.find(i => i.id === id)
    if (!item) return

    try {
      if (item.isLiked) {
        // Unlike
        if (item.likeId) {
          await supabase
            .from('nasa_likes')
            .delete()
            .eq('id', item.likeId)
        }
        
        // Update UI
        setItems(prev => prev.map(i => 
          i.id === id 
            ? { ...i, isLiked: false, likes: i.likes - 1, likeId: undefined }
            : i
        ))
        setFilteredItems(prev => prev.map(i => 
          i.id === id 
            ? { ...i, isLiked: false, likes: i.likes - 1, likeId: undefined }
            : i
        ))
        
        toast.success('Like dihapus')
      } else {
        // Like
        const { data, error } = await supabase
          .from('nasa_likes')
          .insert([
            {
              user_id: user.id,
              nasa_id: item.id,
              nasa_title: item.title,
              nasa_image: item.image
            }
          ])
          .select()
        
        if (error) throw error
        
        // Update UI
        setItems(prev => prev.map(i => 
          i.id === id 
            ? { ...i, isLiked: true, likes: i.likes + 1, likeId: data[0].id }
            : i
        ))
        setFilteredItems(prev => prev.map(i => 
          i.id === id 
            ? { ...i, isLiked: true, likes: i.likes + 1, likeId: data[0].id }
            : i
        ))
        
        toast.success('Gambar disukai! ❤️')
      }
    } catch (error) {
      console.error('Error liking:', error)
      toast.error('Gagal like. Coba lagi!')
    }
  }

  // ============================
  // BOOKMARK
  // ============================
  const handleBookmark = async (id: string) => {
    if (!user) {
      toast.error('Login dulu untuk bookmark!')
      return
    }

    const item = items.find(i => i.id === id)
    if (!item) return

    // Update UI dulu
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

    try {
      if (!item.isBookmarked) {
        // Add bookmark
        await supabase
          .from('bookmarks')
          .insert([
            {
              user_id: user.id,
              title: item.title,
              image_url: item.image,
              bookmark_type: 'apod',
              apod_date: item.date,
              apod_explanation: item.description
            }
          ])
        toast.success('Gambar disimpan! 📌')
      } else {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('title', item.title)
        toast.success('Bookmark dihapus')
      }
    } catch (error) {
      console.error('Error bookmark:', error)
      toast.error('Gagal menyimpan')
    }
  }

  // ============================
  // SHARE
  // ============================
  const handleShare = async (item: NasaItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Lihat gambar NASA ini: ${item.title}\n\n${item.description.substring(0, 100)}...`,
          url: item.image
        })
      } catch (error) {
        console.log('Sharing cancelled')
      }
    } else {
      navigator.clipboard.writeText(item.image)
      toast.success('Link disalin ke clipboard! 📋')
    }
  }

  // ============================
  // DOWNLOAD
  // ============================
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
      
      toast.success('Gambar berhasil diunduh! ⬇️')
    } catch (error) {
      toast.error('Gagal mengunduh gambar')
    }
  }

  // ============================
  // SHARE KE POSTINGAN (dengan deskripsi NASA + komen user)
  // ============================
  const handleShareToPost = async () => {
    if (!user) {
      toast.error('Silakan login dulu untuk posting!')
      return
    }

    if (!selectedItem) return

    try {
      setPosting(true)
      
      // Format tanggal
      const dateObj = new Date(selectedItem.date)
      const formattedDate = dateObj.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      // Gabungkan deskripsi NASA dengan komen user
      const nasaDescription = selectedItem.description
      const userComment = postContent ? `\n\n**Komentar saya:**\n${postContent}` : ''
      
      // Kategori hashtags
      const categoryHashtags = selectedItem.category 
        ? `#${selectedItem.category.replace(/\s+/g, '')}` 
        : '#NASA'
      
      const keywordsHashtags = selectedItem.keywords
        .slice(0, 5)
        .map(k => `#${k.replace(/\s+/g, '')}`)
        .join(' ')
      
      const fullContent = `🌌 **${selectedItem.title}**\n\n📅 **Tanggal:** ${formattedDate}\n📸 **Sumber:** ${selectedItem.source}\n🏷️ **Kategori:** ${categoryHashtags}\n\n📝 **Deskripsi NASA:**\n${nasaDescription}${userComment}\n\n${keywordsHashtags} #Space #Astronomy`

      // Simpan ke tabel posts
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: `NASA: ${selectedItem.title}`,
            content: fullContent,
            image_url: selectedItem.image,
            category: 'nasa'
          }
        ])
      
      if (error) throw error
      
      // Juga simpan ke bookmarks otomatis
      await supabase
        .from('bookmarks')
        .insert([
          {
            user_id: user.id,
            title: selectedItem.title,
            image_url: selectedItem.image,
            bookmark_type: 'apod',
            apod_date: selectedItem.date,
            apod_explanation: selectedItem.description
          }
        ])
      
      setShowPostModal(false)
      setPostContent('')
      toast.success('Berhasil diposting ke komunitas! 🚀')
      
    } catch (error) {
      console.error('Error posting:', error)
      toast.error('Gagal memposting. Coba lagi!')
    } finally {
      setPosting(false)
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
        item.title.toLowerCase().includes(activeCategory.toLowerCase()) ||
        item.category?.toLowerCase().includes(activeCategory.toLowerCase())
      )
    }
    
    // Sort by date
    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    
    setFilteredItems(filtered)
    
  }, [items, activeCategory, sortOrder])

  // ============================
  // INFINITE SCROLL
  // ============================
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && items.length > 0) {
          fetchNasaData()
        }
      },
      { threshold: 1.0 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, loadingMore, items.length])

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
    <div className="fd-root">
      <style>{`
        .fd-root {
          min-height: 100svh;
          padding: 30px 16px 80px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
          color: #f0f0ff;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
        }
        .fd-wrap {
          max-width: 1280px;
          margin: 0 auto;
        }
        .fd-card {
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: border-color 0.25s;
        }
        .fd-card:hover { border-color: rgba(255,255,255,0.12); }
        
        .fd-header {
          margin-bottom: 24px;
        }
        
        .fd-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        
        .fd-search {
          width: 100%;
          padding: 14px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          color: white;
          font-size: 16px;
          outline: none;
          transition: all 0.2s;
        }
        .fd-search:focus {
          border-color: #7c3aed;
          background: rgba(255,255,255,0.08);
        }
        
        .fd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        
        .fd-card-nasa {
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
        }
        .fd-card-nasa:hover {
          transform: translateY(-4px);
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }
        
        .fd-img-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .fd-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .fd-card-nasa:hover .fd-img {
          transform: scale(1.05);
        }
        
        .fd-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .fd-badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(124,58,237,0.3);
          border: 1px solid rgba(124,58,237,0.5);
          border-radius: 20px;
          font-size: 11px;
          color: white;
          backdrop-filter: blur(4px);
        }
        
        .fd-content {
          padding: 16px;
        }
        
        .fd-title-sm {
          font-size: 16px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-bottom: 6px;
          line-height: 1.4;
        }
        
        .fd-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .fd-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 12px;
        }
        
        .fd-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 12px;
        }
        
        .fd-act {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .fd-act:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .fd-act.liked { color: #f472b6; }
        
        .fd-tabs {
          display: flex;
          gap: 4px;
          padding: 5px;
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 15px;
          margin-bottom: 20px;
        }
        .fd-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(155,160,210,0.6);
          cursor: pointer;
          border: none;
          background: none;
          transition: all 0.2s;
        }
        .fd-tab.active {
          background: rgba(124,58,237,0.18);
          border: 1px solid rgba(124,58,237,0.28);
          color: rgba(210,205,255,0.95);
        }
        .fd-tab:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(210,215,255,0.8);
        }
        
        .fd-sort-select {
          padding: 8px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: white;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }
        .fd-sort-select option {
          background: #1a1a2e;
        }
        
        .fd-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .fd-modal-content {
          max-width: 1000px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          background: rgba(20,20,30,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          backdrop-filter: blur(20px);
        }
        
        .fd-modal-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: rgba(20,20,30,0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px 24px 0 0;
        }
        
        .fd-modal-body {
          padding: 24px;
        }
        
        .fd-post-modal {
          max-width: 500px;
          width: 100%;
          background: rgba(20,20,30,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
        }
        
        .fd-ta {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px;
          color: white;
          font-size: 14px;
          resize: none;
          outline: none;
        }
        .fd-ta:focus {
          border-color: #7c3aed;
        }
        
        .fd-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .fd-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          color: white;
        }
        .fd-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.4);
        }
        .fd-btn-secondary {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .fd-btn-secondary:hover {
          background: rgba(255,255,255,0.15);
        }
        .fd-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .fd-loading {
          display: flex;
          justify-content: center;
          padding: 40px;
        }
        
        .fd-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(124,58,237,0.3);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .fd-categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 8px 0 16px;
          margin-bottom: 16px;
          scrollbar-width: thin;
          scrollbar-color: #7c3aed rgba(255,255,255,0.1);
        }
        .fd-categories::-webkit-scrollbar {
          height: 4px;
        }
        .fd-categories::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .fd-categories::-webkit-scrollbar-thumb {
          background: #7c3aed;
          border-radius: 10px;
        }
        
        .fd-cat-btn {
          padding: 8px 16px;
          border-radius: 30px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }
        .fd-cat-btn:hover {
          background: rgba(124,58,237,0.2);
          border-color: rgba(124,58,237,0.4);
        }
        .fd-cat-btn.active {
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          border-color: transparent;
          color: white;
        }
        
        .nasa-description-preview {
          background: rgba(124,58,237,0.1);
          border-left: 3px solid #7c3aed;
          padding: 10px;
          margin-bottom: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          border-radius: 0 8px 8px 0;
        }
        
        .category-chip {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(14,165,233,0.2);
          border: 1px solid rgba(14,165,233,0.4);
          border-radius: 12px;
          font-size: 10px;
          color: #7dd3fc;
          margin-right: 4px;
        }
      `}</style>

      <div className="fd-wrap">
        {/* Header */}
        <div className="fd-header">
          <h1 className="fd-title">NASA Image Gallery</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
            Menampilkan {stats.totalItems} gambar dari berbagai kategori: Nebula, Black Hole, Galaxy, Planet, Astronaut, dan masih banyak lagi!
          </p>
          
          {/* Tabs + Sort */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="fd-tabs" style={{ flex: 1, minWidth: '200px' }}>
              <button 
                className={`fd-tab ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid style={{width:13,height:13}}/> Grid
              </button>
              <button 
                className={`fd-tab ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List style={{width:13,height:13}}/> List
              </button>
            </div>
            
            <select
              className="fd-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">📅 Terbaru</option>
              <option value="oldest">📅 Terlama</option>
            </select>
            
            <button
              onClick={() => fetchNasaData(true)}
              className="fd-btn fd-btn-secondary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Refresh
            </button>
          </div>
          
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: 'rgba(255,255,255,0.4)'
            }} />
            <input
              type="text"
              className="fd-search"
              placeholder="Cari gambar NASA: nebula, black hole, galaxy, mars, astronaut..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchNasaData(true)}
              style={{ paddingLeft: '42px' }}
            />
          </div>
          
          {/* Categories */}
          <div className="fd-categories">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`fd-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>
              {stats.totalItems.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total Gambar</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9' }}>
              {stats.totalLikes.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total Suka</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.totalViews.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total Dilihat</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonGrid />
        ) : filteredItems.length === 0 ? (
          <div className="fd-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌌</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              Tidak ada gambar ditemukan
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Coba kata kunci yang berbeda atau pilih kategori lain
            </p>
            <button
              onClick={() => {
                setQuery('')
                setActiveCategory('all')
                fetchNasaData(true)
              }}
              className="fd-btn fd-btn-primary"
              style={{ marginTop: '16px' }}
            >
              Tampilkan Semua
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="fd-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="fd-card-nasa"
                onClick={() => setSelectedItem(item)}
              >
                <div className="fd-img-container">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="fd-img"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop'
                    }}
                  />
                  <div className="fd-overlay">
                    <span className="fd-badge">
                      {item.media_type === 'image' ? '📷' : '🎥'}
                    </span>
                    {item.category && (
                      <span className="fd-badge" style={{ background: 'rgba(14,165,233,0.3)' }}>
                        #{item.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="fd-content">
                  <h3 className="fd-title-sm">{item.title}</h3>
                  <div className="fd-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar style={{ width: '12px', height: '12px' }} />
                      {item.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye style={{ width: '12px', height: '12px' }} />
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                  <p className="fd-desc">{item.description.substring(0, 100)}...</p>
                  <div className="fd-actions">
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className={`fd-act ${item.isLiked ? 'liked' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
                      >
                        <Heart style={{ width: '15px', height: '15px' }} fill={item.isLiked ? 'currentColor' : 'none'} />
                        {item.likes}
                      </button>
                      <button
                        className="fd-act"
                        onClick={(e) => { e.stopPropagation(); handleBookmark(item.id); }}
                      >
                        <Bookmark style={{ width: '15px', height: '15px' }} fill={item.isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <button
                      className="fd-act"
                      onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                    >
                      <Share2 style={{ width: '15px', height: '15px' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="fd-card"
                style={{ padding: '16px', cursor: 'pointer' }}
                onClick={() => setSelectedItem(item)}
              >
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="category-chip">#{item.category}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        {item.date}
                      </span>
                      <span>{item.source}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye style={{ width: '12px', height: '12px' }} />
                        {item.views.toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
                      {item.description.substring(0, 150)}...
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className={`fd-act ${item.isLiked ? 'liked' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
                      >
                        <Heart style={{ width: '16px', height: '16px' }} fill={item.isLiked ? 'currentColor' : 'none'} />
                        {item.likes}
                      </button>
                      <button
                        className="fd-act"
                        onClick={(e) => { e.stopPropagation(); handleBookmark(item.id); }}
                      >
                        <Bookmark style={{ width: '16px', height: '16px' }} fill={item.isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className="fd-act"
                        onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                      >
                        <Share2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredItems.length > 0 && (
          <div ref={observerRef} style={{ textAlign: 'center', padding: '30px 0' }}>
            {loadingMore ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="fd-spinner" style={{ width: '24px', height: '24px' }}></div>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Memuat lebih banyak gambar...</span>
              </div>
            ) : (
              <button
                onClick={() => fetchNasaData()}
                className="fd-btn fd-btn-primary"
                style={{ padding: '12px 30px' }}
              >
                Muat Lebih Banyak
              </button>
            )}
          </div>
        )}

        {/* Modal Detail */}
        {selectedItem && (
          <div className="fd-modal" onClick={() => setSelectedItem(null)}>
            <div className="fd-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="fd-modal-header">
                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedItem.title}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              
              <div className="fd-modal-body">
                <div style={{ marginBottom: '20px' }}>
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '12px' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Tanggal</div>
                    <div style={{ fontSize: '14px' }}>{selectedItem.date}</div>
                  </div>
                  {selectedItem.photographer && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Fotografer</div>
                      <div style={{ fontSize: '14px' }}>{selectedItem.photographer}</div>
                    </div>
                  )}
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Sumber</div>
                    <div style={{ fontSize: '14px' }}>{selectedItem.source}</div>
                  </div>
                  {selectedItem.category && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Kategori</div>
                      <div style={{ fontSize: '14px' }}>#{selectedItem.category}</div>
                    </div>
                  )}
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Deskripsi NASA</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                    {selectedItem.description}
                  </p>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Kata Kunci</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedItem.keywords.slice(0, 15).map((kw, i) => (
                      <span key={i} style={{
                        padding: '4px 12px',
                        background: 'rgba(124,58,237,0.2)',
                        border: '1px solid rgba(124,58,237,0.3)',
                        borderRadius: '20px',
                        fontSize: '12px'
                      }}>
                        #{kw.replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  <a
                    href={selectedItem.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fd-btn fd-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ExternalLink style={{ width: '16px', height: '16px' }} />
                    Buka Gambar
                  </a>
                  <button
                    onClick={() => handleDownload(selectedItem.image, selectedItem.title)}
                    className="fd-btn fd-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Download style={{ width: '16px', height: '16px' }} />
                    Unduh
                  </button>
                  <button
                    onClick={() => handleShare(selectedItem)}
                    className="fd-btn fd-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Share2 style={{ width: '16px', height: '16px' }} />
                    Bagikan
                  </button>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="fd-btn fd-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Users style={{ width: '16px', height: '16px' }} />
                    Posting ke Komunitas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Posting */}
        {showPostModal && selectedItem && (
          <div className="fd-modal" onClick={() => setShowPostModal(false)}>
            <div className="fd-post-modal" onClick={(e) => e.stopPropagation()}>
              <div className="fd-modal-header">
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Buat Postingan</h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                  <X style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
              
              <div style={{ padding: '20px' }}>
                {/* Preview Gambar */}
                <div style={{
                  marginBottom: '16px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                </div>
                
                {/* Info Gambar */}
                <div style={{ marginBottom: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <div><strong style={{ color: '#7c3aed' }}>Judul:</strong> {selectedItem.title}</div>
                  <div><strong style={{ color: '#0ea5e9' }}>Tanggal:</strong> {selectedItem.date}</div>
                  <div><strong style={{ color: '#10b981' }}>Kategori:</strong> #{selectedItem.category || 'NASA'}</div>
                </div>
                
                {/* Preview Deskripsi NASA */}
                <div className="nasa-description-preview">
                  <strong>📝 Deskripsi NASA:</strong> {selectedItem.description.substring(0, 120)}...
                </div>
                
                {/* Konten (bisa diisi user) */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    Tambah komentarmu (opsional)
                  </label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Tulis cerita atau komentarmu tentang gambar ini..."
                    className="fd-ta"
                    rows={3}
                  />
                </div>
                
                {/* Preview hasil postingan */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                  <strong>📋 Preview postingan:</strong><br/>
                  <span style={{ color: '#7c3aed' }}>{selectedItem.title}</span><br/>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{selectedItem.date} • {selectedItem.source}</span><br/>
                  <span>{selectedItem.description.substring(0, 80)}...{postContent && <><br/><span style={{ color: '#0ea5e9' }}>Komentar: {postContent}</span></>}</span>
                </div>
                
                {/* Info login */}
                {!user && !authLoading && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '8px',
                    color: '#f59e0b',
                    fontSize: '13px'
                  }}>
                    ⚠️ Kamu harus login untuk bisa posting ke komunitas
                  </div>
                )}
                
                {authLoading && (
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div className="fd-spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
                  </div>
                )}
                
                {/* Tombol */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setShowPostModal(false)}
                    className="fd-btn fd-btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleShareToPost}
                    disabled={posting || !user || authLoading}
                    className="fd-btn fd-btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {posting ? (
                      <>
                        <div className="fd-spinner" style={{ width: '16px', height: '16px' }}></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Send style={{ width: '16px', height: '16px' }} />
                        Posting
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}