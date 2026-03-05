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
  MessageCircle, Send, Loader2, Sparkles, MoreHorizontal,
  Languages
} from 'lucide-react'

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface NasaItem {
  id: string
  judul: string
  deskripsi: string
  deskripsiAsli?: string
  gambar: string
  tanggal: string
  sumber: string
  fotografer?: string
  kataKunci: string[]
  nasa_id: string
  tipeMedia: 'gambar' | 'video' | 'audio'
  suka: number
  dilihat: number
  isDisukai: boolean
  isDisimpan: boolean
  likeId?: string
  kategori?: string
  bahasaAsli?: 'en' | 'id'
}

interface Kategori {
  id: string
  nama: string
  icon: string
  jumlah: number
  warna: string
}

/* ══════════════════════════════════════════════════════
   HELPER FUNCTIONS
══════════════════════════════════════════════════════ */
function waktuLalu(tanggal: string) {
  const selisih = Date.now() - new Date(tanggal).getTime()
  const menit = Math.floor(selisih / 60000)
  const jam = Math.floor(menit / 60)
  const hari = Math.floor(jam / 24)
  
  if (menit < 1) return 'baru saja'
  if (menit < 60) return `${menit} menit lalu`
  if (jam < 24) return `${jam} jam lalu`
  return `${hari} hari lalu`
}

// Fungsi untuk menerjemahkan deskripsi NASA
async function terjemahkanDeskripsi(teks: string): Promise<string> {
  // Ini bisa diimplementasikan dengan API terjemahan
  // Sementara pake aturan sederhana dulu
  const terjemahan: Record<string, string> = {
    'This long duration photograph looks out from a window on the cupola revealing Earth\'s atmospheric glow underneath star trails': 'Foto durasi panjang ini diambil dari jendela cupola yang memperlihatkan cahaya atmosfer Bumi di bawah jejak bintang',
    'as the International Space Station orbited 258 miles above the Pacific Ocean southeast of Hawaii at approximately 8:15 p.m. local time': 'saat Stasiun Luar Angkasa Internasional mengorbit 258 mil di atas Samudra Pasifik tenggara Hawaii sekitar pukul 20:15 waktu setempat',
    'In the foreground, is the Kibo laboratory module': 'Di latar depan, terlihat modul laboratorium Kibo',
    'and Kibo\'s External Platform that houses experiments exposed to the vacuum of space': 'dan Platform Eksternal Kibo yang menampung eksperimen yang terpapar ruang hampa udara',
    'and a set of the space station\'s main solar arrays': 'dan serangkaian panel surya utama stasiun luar angkasa',
  }
  
  let hasil = teks
  Object.entries(terjemahan).forEach(([en, id]) => {
    hasil = hasil.replace(en, id)
  })
  
  return hasil
}

const GRADIEN_AVATAR = [
  'linear-gradient(135deg,#7c3aed,#4f46e5)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
]

function Avatar({ nama = 'A', ukuran = 40 }: { nama?: string; ukuran?: number }) {
  const radius = Math.round(ukuran * 0.28)
  const indexGradien = (nama.charCodeAt(0) || 65) % GRADIEN_AVATAR.length
  
  return (
    <div style={{
      width: ukuran, height: ukuran, borderRadius: radius,
      background: GRADIEN_AVATAR[indexGradien],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: ukuran * 0.4, fontWeight: 700, color: '#fff'
    }}>
      {nama.charAt(0).toUpperCase()}
    </div>
  )
}

function TampilkanTeks(teks: string) {
  if (!teks) return null
  
  return (
    <div>
      {teks.split(/(\s+)/).map((kata, i) => {
        if (kata.startsWith('#')) {
          return <span key={i} style={{ color: '#818cf8', fontWeight: 500 }}>{kata}</span>
        }
        if (kata.startsWith('@')) {
          return <span key={i} style={{ color: '#38bdf8', fontWeight: 500 }}>{kata}</span>
        }
        return kata
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SKELETON LOADING
══════════════════════════════════════════════════════ */
function SkeletonGrid() {
  return (
    <div className="grid-nasa">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="card-nasa skeleton" style={{ height: '320px' }}>
          <div className="gambar-container" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
          <div className="konten-card">
            <div className="skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-line" style={{ width: '60%' }}></div>
            <div className="skeleton-line" style={{ width: '100%' }}></div>
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
  const [itemsTerfilter, setItemsTerfilter] = useState<NasaItem[]>([])
  const [kataKunci, setKataKunci] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [itemDipilih, setItemDipilih] = useState<NasaItem | null>(null)
  const [modeTampilan, setModeTampilan] = useState<'grid' | 'list'>('grid')
  const [kategoriAktif, setKategoriAktif] = useState('all')
  const [urutan, setUrutan] = useState<'terbaru' | 'terlama'>('terbaru')
  const [statistik, setStatistik] = useState({
    totalItem: 0,
    totalSuka: 0,
    totalDilihat: 0,
  })
  const observerRef = useRef<HTMLDivElement>(null)
  const [keywordTerpakai, setKeywordTerpakai] = useState<string[]>([])
  
  // State untuk terjemahan
  const [tampilkanAsli, setTampilkanAsli] = useState(false)
  const [sedangMenerjemahkan, setSedangMenerjemahkan] = useState(false)
  
  // ============================
  // STATE UNTUK POSTING KE KOMUNITAS
  // ============================
  const [showPostModal, setShowPostModal] = useState(false)
  const [komentarPosting, setKomentarPosting] = useState('')
  const [sedangPosting, setSedangPosting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // ============================
  // KEYWORDS NASA
  // ============================
  const nasaKeywords = [
    'nebula', 'galaxy', 'black hole', 'star', 'supernova',
    'orion nebula', 'andromeda', 'milky way', 'moon', 'mars',
    'jupiter', 'saturn', 'earth', 'sun', 'aurora',
    'astronaut', 'iss', 'hubble', 'james webb', 'rocket',
    'spacex', 'apollo', 'artemis', 'space station', 'telescope',
    'solar flare', 'eclipse', 'comet', 'asteroid', 'constellation'
  ]

  // ============================
  // KATEGORI UNTUK FILTER
  // ============================
  const kategoriList: Kategori[] = [
    { id: 'all', nama: 'Semua', icon: '🌌', jumlah: 0, warna: 'from-purple-500 to-blue-500' },
    { id: 'nebula', nama: 'Nebula', icon: '✨', jumlah: 0, warna: 'from-pink-500 to-purple-500' },
    { id: 'galaxy', nama: 'Galaksi', icon: '🌀', jumlah: 0, warna: 'from-blue-500 to-cyan-500' },
    { id: 'black hole', nama: 'Lubang Hitam', icon: '⚫', jumlah: 0, warna: 'from-gray-800 to-black' },
    { id: 'planet', nama: 'Planet', icon: '🪐', jumlah: 0, warna: 'from-yellow-500 to-orange-500' },
    { id: 'moon', nama: 'Bulan', icon: '🌙', jumlah: 0, warna: 'from-gray-400 to-gray-600' },
    { id: 'mars', nama: 'Mars', icon: '🔴', jumlah: 0, warna: 'from-red-600 to-orange-500' },
    { id: 'jupiter', nama: 'Jupiter', icon: '🪐', jumlah: 0, warna: 'from-orange-400 to-yellow-400' },
    { id: 'saturn', nama: 'Saturnus', icon: '🪐', jumlah: 0, warna: 'from-yellow-600 to-amber-400' },
    { id: 'star', nama: 'Bintang', icon: '⭐', jumlah: 0, warna: 'from-yellow-400 to-red-500' },
    { id: 'sun', nama: 'Matahari', icon: '☀️', jumlah: 0, warna: 'from-yellow-500 to-red-600' },
    { id: 'astronaut', nama: 'Astronot', icon: '👨‍🚀', jumlah: 0, warna: 'from-blue-500 to-indigo-600' },
    { id: 'iss', nama: 'ISS', icon: '🛸', jumlah: 0, warna: 'from-blue-400 to-indigo-500' },
    { id: 'aurora', nama: 'Aurora', icon: '🌌', jumlah: 0, warna: 'from-green-400 to-blue-500' },
  ]

  // ============================
  // CEK USER
  // ============================
  useEffect(() => {
    setLoadingAuth(true)
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoadingAuth(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ============================
  // FUNGSI TERJEMAHAN
  // ============================
  const handleTerjemah = async (item: NasaItem) => {
    if (tampilkanAsli) {
      // Balik ke bahasa Indonesia
      setItemDipilih({
        ...item,
        deskripsi: item.deskripsiAsli || item.deskripsi
      })
      setTampilkanAsli(false)
    } else {
      // Tampilkan bahasa Inggris asli
      setSedangMenerjemahkan(true)
      try {
        // Simpan deskripsi asli kalo belum ada
        if (!item.deskripsiAsli) {
          item.deskripsiAsli = item.deskripsi
        }
        
        // Tampilkan teks asli (dari API NASA)
        setItemDipilih({
          ...item,
          deskripsi: item.deskripsiAsli
        })
        setTampilkanAsli(true)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Gagal memuat teks asli')
      } finally {
        setSedangMenerjemahkan(false)
      }
    }
  }

  // ============================
  // FETCH DATA NASA
  // ============================
  const fetchNasaData = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setKeywordTerpakai([])
      } else {
        setLoadingMore(true)
      }

      let keywordsToFetch: string[] = []
      
      if (reset) {
        keywordsToFetch = nasaKeywords
          .sort(() => 0.5 - Math.random())
          .slice(0, 8)
        setKeywordTerpakai(keywordsToFetch)
      } else {
        const remainingKeywords = nasaKeywords.filter(k => !keywordTerpakai.includes(k))
        if (remainingKeywords.length === 0) {
          keywordsToFetch = nasaKeywords
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)
        } else {
          keywordsToFetch = remainingKeywords
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)
        }
        setKeywordTerpakai(prev => [...prev, ...keywordsToFetch])
      }

      if (kataKunci && !keywordsToFetch.includes(kataKunci)) {
        keywordsToFetch.push(kataKunci)
      }

      const semuaItem: NasaItem[] = []
      
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
              judul: item.data[0].title || 'Gambar NASA',
              deskripsi: item.data[0].description || 'Gambar menakjubkan dari luar angkasa',
              deskripsiAsli: item.data[0].description,
              gambar: item.links?.[0]?.href || 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06',
              tanggal: item.data[0].date_created?.split('T')[0] || new Date().toISOString().split('T')[0],
              sumber: item.data[0].center || 'NASA',
              fotografer: item.data[0].photographer || 'NASA',
              kataKunci: item.data[0].keywords || [keyword, 'space', 'nasa'],
              nasa_id: item.data[0].nasa_id,
              tipeMedia: item.data[0].media_type || 'gambar',
              suka: 0,
              dilihat: Math.floor(Math.random() * 5000) + 1000,
              isDisukai: false,
              isDisimpan: false,
              kategori: keyword,
              bahasaAsli: 'en'
            }))
          } catch (error) {
            console.error(`Error fetching ${keyword}:`, error)
            return []
          }
        })
      ).then(results => {
        results.forEach(items => {
          semuaItem.push(...items)
        })
      })

      const uniqueItems = Array.from(
        new Map(semuaItem.map(item => [item.id, item])).values()
      )

      uniqueItems.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())

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
          
          item.isDisukai = !!likeData
          item.likeId = likeData?.id
          item.suka = count || 0
        }
      }

      if (reset) {
        setItems(uniqueItems)
        setItemsTerfilter(uniqueItems)
      } else {
        const combined = [...items, ...uniqueItems]
        const uniqueCombined = Array.from(
          new Map(combined.map(item => [item.id, item])).values()
        )
        uniqueCombined.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
        
        setItems(uniqueCombined)
        setItemsTerfilter(uniqueCombined)
      }

      updateStats(reset ? uniqueItems : items)
      
      toast.success(`${uniqueItems.length} gambar berhasil dimuat`)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat data NASA')
      
      if (reset) {
        const fallbackData = generateFallbackData()
        setItems(fallbackData)
        setItemsTerfilter(fallbackData)
        updateStats(fallbackData)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // ============================
  // FALLBACK DATA
  // ============================
  const generateFallbackData = (): NasaItem[] => {
    const data = [
      {
        judul: "Earth's atmospheric glow underneath star trails",
        deskripsi: "Foto durasi panjang ini diambil dari jendela cupola yang memperlihatkan cahaya atmosfer Bumi di bawah jejak bintang saat Stasiun Luar Angkasa Internasional mengorbit 258 mil di atas Samudra Pasifik tenggara Hawaii sekitar pukul 20:15 waktu setempat. Di latar depan, terlihat modul laboratorium Kibo dan Platform Eksternal Kibo yang menampung eksperimen yang terpapar ruang hampa udara, serta serangkaian panel surya utama stasiun luar angkasa.",
        deskripsiAsli: "This long duration photograph looks out from a window on the cupola revealing Earth's atmospheric glow underneath star trails as the International Space Station orbited 258 miles above the Pacific Ocean southeast of Hawaii at approximately 8:15 p.m. local time. In the foreground, is the Kibo laboratory module (left), and Kibo's External Platform (center) that houses experiments exposed to the vacuum of space, and a set of the space station's main solar arrays (right).",
        tanggal: "2025-04-02",
        sumber: "JSC",
        fotografer: "NASA",
        kataKunci: ["startrail", "space", "nasa"],
        kategori: "star trail"
      }
    ]

    return data.map((item, index) => ({
      id: `fallback-${index}`,
      judul: item.judul,
      deskripsi: item.deskripsi,
      deskripsiAsli: item.deskripsiAsli,
      gambar: `https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop`,
      tanggal: item.tanggal,
      sumber: item.sumber,
      fotografer: item.fotografer,
      kataKunci: item.kataKunci,
      nasa_id: `nasa-${index}`,
      tipeMedia: 'gambar',
      suka: 45,
      dilihat: 1234,
      isDisukai: false,
      isDisimpan: false,
      kategori: item.kategori
    }))
  }

  // ============================
  // UPDATE STATISTIK
  // ============================
  const updateStats = (itemsList: NasaItem[]) => {
    setStatistik({
      totalItem: itemsList.length,
      totalSuka: itemsList.reduce((sum, item) => sum + item.suka, 0),
      totalDilihat: itemsList.reduce((sum, item) => sum + item.dilihat, 0),
    })
  }

  // ============================
  // LIKE
  // ============================
  const handleLike = async (id: string) => {
    if (!user) {
      toast.error('Login dulu untuk menyukai')
      return
    }

    const item = items.find(i => i.id === id)
    if (!item) return

    try {
      if (item.isDisukai) {
        if (item.likeId) {
          await supabase
            .from('nasa_likes')
            .delete()
            .eq('id', item.likeId)
        }
        
        setItems(prev => prev.map(i => 
          i.id === id 
            ? { ...i, isDisukai: false, suka: i.suka - 1, likeId: undefined }
            : i
        ))
        setItemsTerfilter(prev => prev.map(i => 
          i.id === id 
            ? { ...i, isDisukai: false, suka: i.suka - 1, likeId: undefined }
            : i
        ))
        
        toast.success('Suka dihapus')
      } else {
        const { data, error } = await supabase
          .from('nasa_likes')
          .insert([
            {
              user_id: user.id,
              nasa_id: item.id,
              nasa_title: item.judul,
              nasa_image: item.gambar
            }
          ])
          .select()
        
        if (error) throw error
        
        setItems(prev => prev.map(i => 
          i.id === id 
            ? { ...i, isDisukai: true, suka: i.suka + 1, likeId: data[0].id }
            : i
        ))
        setItemsTerfilter(prev => prev.map(i => 
          i.id === id 
            ? { ...i, isDisukai: true, suka: i.suka + 1, likeId: data[0].id }
            : i
        ))
        
        toast.success('Gambar disukai')
      }
    } catch (error) {
      console.error('Error liking:', error)
      toast.error('Gagal menyukai')
    }
  }

  // ============================
  // BOOKMARK
  // ============================
  const handleBookmark = async (id: string) => {
    if (!user) {
      toast.error('Login dulu untuk menyimpan')
      return
    }

    const item = items.find(i => i.id === id)
    if (!item) return

    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isDisimpan: !item.isDisimpan }
        : item
    ))
    
    setItemsTerfilter(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isDisimpan: !item.isDisimpan }
        : item
    ))

    try {
      if (!item.isDisimpan) {
        await supabase
          .from('bookmarks')
          .insert([
            {
              user_id: user.id,
              title: item.judul,
              image_url: item.gambar,
              bookmark_type: 'apod',
              apod_date: item.tanggal,
              apod_explanation: item.deskripsi
            }
          ])
        toast.success('Gambar disimpan')
      } else {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('title', item.judul)
        toast.success('Dihapus dari simpanan')
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
          title: item.judul,
          text: `Lihat gambar NASA ini: ${item.judul}`,
          url: item.gambar
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(item.gambar)
      toast.success('Link disalin')
    }
  }

  // ============================
  // DOWNLOAD
  // ============================
  const handleDownload = async (gambarUrl: string, judul: string) => {
    try {
      const response = await fetch(gambarUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${judul.replace(/\s+/g, '-')}-nasa.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Gambar diunduh')
    } catch (error) {
      toast.error('Gagal mengunduh gambar')
    }
  }

  // ============================
  // POSTING KE KOMUNITAS
  // ============================
  const handleShareToPost = async () => {
    if (!user) {
      toast.error('Login dulu untuk posting')
      return
    }

    if (!itemDipilih) return

    try {
      setSedangPosting(true)
      
      const tanggalObj = new Date(itemDipilih.tanggal)
      const tanggalFormat = tanggalObj.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      const deskripsiNASA = itemDipilih.deskripsi
      const komenUser = komentarPosting ? `\n\nKomentar saya:\n${komentarPosting}` : ''
      
      const kategoriHashtag = itemDipilih.kategori 
        ? `#${itemDipilih.kategori.replace(/\s+/g, '')}` 
        : '#NASA'
      
      const keywordsHashtags = itemDipilih.kataKunci
        .slice(0, 5)
        .map(k => `#${k.replace(/\s+/g, '')}`)
        .join(' ')
      
      const kontenLengkap = `${itemDipilih.judul}\n\nTanggal: ${tanggalFormat}\nSumber: ${itemDipilih.sumber}\nKategori: ${kategoriHashtag}\n\n${deskripsiNASA}${komenUser}\n\n${keywordsHashtags} #LuarAngkasa #Astronomi`

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: `NASA: ${itemDipilih.judul}`,
            content: kontenLengkap,
            image_url: itemDipilih.gambar,
            category: 'nasa'
          }
        ])
      
      if (error) throw error
      
      await supabase
        .from('bookmarks')
        .insert([
          {
            user_id: user.id,
            title: itemDipilih.judul,
            image_url: itemDipilih.gambar,
            bookmark_type: 'apod',
            apod_date: itemDipilih.tanggal,
            apod_explanation: itemDipilih.deskripsi
          }
        ])
      
      setShowPostModal(false)
      setKomentarPosting('')
      toast.success('Berhasil diposting ke komunitas')
      
    } catch (error) {
      console.error('Error posting:', error)
      toast.error('Gagal memposting')
    } finally {
      setSedangPosting(false)
    }
  }

  // ============================
  // FILTER & SORT
  // ============================
  useEffect(() => {
    let filtered = [...items]
    
    if (kategoriAktif !== 'all') {
      filtered = filtered.filter(item => 
        item.kataKunci.some(keyword => 
          keyword.toLowerCase().includes(kategoriAktif.toLowerCase())
        ) || 
        item.judul.toLowerCase().includes(kategoriAktif.toLowerCase()) ||
        item.kategori?.toLowerCase().includes(kategoriAktif.toLowerCase())
      )
    }
    
    if (urutan === 'terbaru') {
      filtered.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    } else {
      filtered.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    }
    
    setItemsTerfilter(filtered)
    
  }, [items, kategoriAktif, urutan])

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
    <div className="halaman-nasa">
      <style>{`
        .halaman-nasa {
          min-height: 100vh;
          padding: 80px 16px 40px;
          font-family: 'DM Sans', sans-serif;
          color: #f0f0ff;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
        }
        
        .container {
          max-width: 1280px;
          margin: 0 auto;
        }
        
        .header {
          margin-bottom: 32px;
        }
        
        .judul-utama {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 8px;
          font-family: 'Archivo Black', sans-serif;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .subjudul {
          color: rgba(203,213,225,0.6);
          margin-bottom: 20px;
          font-size: 15px;
        }
        
        .toolbar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .tab-tampilan {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }
        
        .tab-tampilan button {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(160,165,215,0.7);
          cursor: pointer;
          border: none;
          background: none;
        }
        
        .tab-tampilan button.aktif {
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.3);
          color: white;
        }
        
        .sort-select {
          padding: 8px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: white;
          font-size: 13px;
          outline: none;
        }
        
        .tombol-refresh {
          padding: 8px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: white;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .search-wrapper {
          position: relative;
          margin-bottom: 16px;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 30px;
          color: white;
          font-size: 15px;
          outline: none;
        }
        
        .search-input:focus {
          border-color: #7c3aed;
        }
        
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.4);
        }
        
        .kategori-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 8px 0 16px;
          margin-bottom: 16px;
        }
        
        .kategori-btn {
          padding: 8px 16px;
          border-radius: 30px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          white-space: nowrap;
          cursor: pointer;
        }
        
        .kategori-btn.aktif {
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          border-color: transparent;
          color: white;
        }
        
        .statistik {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .stat-item {
          flex: 1;
          text-align: center;
        }
        
        .stat-angka {
          font-size: 20px;
          font-weight: 700;
          color: #7c3aed;
        }
        
        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }
        
        .grid-nasa {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        
        .card-nasa {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .card-nasa:hover {
          transform: translateY(-4px);
          border-color: rgba(124,58,237,0.4);
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }
        
        .gambar-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        
        .gambar-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        
        .card-nasa:hover .gambar-container img {
          transform: scale(1.05);
        }
        
        .badge-container {
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
        
        .badge {
          padding: 4px 10px;
          background: rgba(124,58,237,0.3);
          border: 1px solid rgba(124,58,237,0.5);
          border-radius: 20px;
          font-size: 11px;
          color: white;
        }
        
        .konten-card {
          padding: 16px;
        }
        
        .judul-card {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 8px;
        }
        
        .meta-card {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 12px;
        }
        
        .deskripsi-card {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .aksi-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 12px;
        }
        
        .tombol-aksi {
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
        }
        
        .tombol-aksi:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        
        .tombol-aksi.disukai {
          color: #f472b6;
        }
        
        .list-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .card-list {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
        }
        
        .loading-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 30px 0;
          color: rgba(255,255,255,0.6);
        }
        
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(124,58,237,0.3);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .skeleton-line {
          height: 16px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .modal-content {
          max-width: 1000px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          background: rgba(20,20,30,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          backdrop-filter: blur(20px);
        }
        
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: rgba(20,20,30,0.95);
          border-radius: 24px 24px 0 0;
        }
        
        .modal-body {
          padding: 24px;
        }
        
        .modal-image {
          width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .info-item {
          background: rgba(255,255,255,0.05);
          padding: 12px;
          border-radius: 12px;
        }
        
        .info-label {
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 500;
        }
        
        .deskripsi-box {
          background: rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 24px;
        }
        
        .deskripsi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .tombol-bahasa {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 20px;
          font-size: 12px;
          color: #a78bfa;
          cursor: pointer;
        }
        
        .tombol-bahasa:hover {
          background: rgba(124,58,237,0.3);
        }
        
        .kata-kunci {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        
        .keyword {
          padding: 4px 12px;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 20px;
          font-size: 12px;
          color: #a78bfa;
        }
        
        .tombol-aksi-modal {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 20px;
        }
        
        .btn {
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          color: white;
        }
        
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .badge-asli {
          background: rgba(16,185,129,0.2);
          border-color: rgba(16,185,129,0.3);
          color: #10b981;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="judul-utama">Galeri NASA</h1>
          <p className="subjudul">
            Menampilkan {statistik.totalItem} gambar dari berbagai kategori
          </p>
          
          {/* Toolbar */}
          <div className="toolbar">
            <div className="tab-tampilan">
              <button 
                className={modeTampilan === 'grid' ? 'aktif' : ''}
                onClick={() => setModeTampilan('grid')}
              >
                <Grid size={13} /> Grid
              </button>
              <button 
                className={modeTampilan === 'list' ? 'aktif' : ''}
                onClick={() => setModeTampilan('list')}
              >
                <List size={13} /> List
              </button>
            </div>
            
            <select
              className="sort-select"
              value={urutan}
              onChange={(e) => setUrutan(e.target.value as 'terbaru' | 'terlama')}
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
            </select>
            
            <button
              onClick={() => fetchNasaData(true)}
              className="tombol-refresh"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
          
          {/* Search */}
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Cari gambar NASA"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchNasaData(true)}
            />
          </div>
          
          {/* Categories */}
          <div className="kategori-scroll">
            {kategoriList.map(kat => (
              <button
                key={kat.id}
                className={`kategori-btn ${kategoriAktif === kat.id ? 'aktif' : ''}`}
                onClick={() => setKategoriAktif(kat.id)}
              >
                {kat.icon} {kat.nama}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="statistik">
          <div className="stat-item">
            <div className="stat-angka">{statistik.totalItem.toLocaleString()}</div>
            <div className="stat-label">Total Gambar</div>
          </div>
          <div className="stat-item">
            <div className="stat-angka">{statistik.totalSuka.toLocaleString()}</div>
            <div className="stat-label">Total Suka</div>
          </div>
          <div className="stat-item">
            <div className="stat-angka">{statistik.totalDilihat.toLocaleString()}</div>
            <div className="stat-label">Total Dilihat</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonGrid />
        ) : itemsTerfilter.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌌</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              Tidak ada gambar
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Coba kata kunci yang berbeda
            </p>
          </div>
        ) : modeTampilan === 'grid' ? (
          <div className="grid-nasa">
            {itemsTerfilter.map((item) => (
              <div
                key={item.id}
                className="card-nasa"
                onClick={() => {
                  setTampilkanAsli(false)
                  setItemDipilih(item)
                }}
              >
                <div className="gambar-container">
                  <img
                    src={item.gambar}
                    alt={item.judul}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop'
                    }}
                  />
                  <div className="badge-container">
                    <span className="badge">
                      {item.tipeMedia === 'gambar' ? '📷' : '🎥'}
                    </span>
                    {item.kategori && (
                      <span className="badge" style={{ background: 'rgba(14,165,233,0.3)' }}>
                        #{item.kategori}
                      </span>
                    )}
                  </div>
                </div>
                <div className="konten-card">
                  <h3 className="judul-card">{item.judul}</h3>
                  <div className="meta-card">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {item.tanggal}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={12} />
                      {item.dilihat.toLocaleString()}
                    </span>
                  </div>
                  <p className="deskripsi-card">{item.deskripsi.substring(0, 100)}...</p>
                  <div className="aksi-card">
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className={`tombol-aksi ${item.isDisukai ? 'disukai' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
                      >
                        <Heart size={15} fill={item.isDisukai ? 'currentColor' : 'none'} />
                        {item.suka}
                      </button>
                      <button
                        className="tombol-aksi"
                        onClick={(e) => { e.stopPropagation(); handleBookmark(item.id); }}
                      >
                        <Bookmark size={15} fill={item.isDisimpan ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <button
                      className="tombol-aksi"
                      onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="list-view">
            {itemsTerfilter.map((item) => (
              <div
                key={item.id}
                className="card-list"
                onClick={() => {
                  setTampilkanAsli(false)
                  setItemDipilih(item)
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                    <img
                      src={item.gambar}
                      alt={item.judul}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {item.judul}
                      </h3>
                      {item.kategori && (
                        <span style={{
                          padding: '2px 8px',
                          background: 'rgba(14,165,233,0.2)',
                          borderRadius: '12px',
                          fontSize: '10px',
                          color: '#7dd3fc'
                        }}>
                          #{item.kategori}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {item.tanggal}
                      </span>
                      <span>{item.sumber}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={12} />
                        {item.dilihat.toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
                      {item.deskripsi.substring(0, 150)}...
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className={`tombol-aksi ${item.isDisukai ? 'disukai' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
                      >
                        <Heart size={16} fill={item.isDisukai ? 'currentColor' : 'none'} />
                        {item.suka}
                      </button>
                      <button
                        className="tombol-aksi"
                        onClick={(e) => { e.stopPropagation(); handleBookmark(item.id); }}
                      >
                        <Bookmark size={16} fill={item.isDisimpan ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className="tombol-aksi"
                        onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && itemsTerfilter.length > 0 && (
          <div ref={observerRef} className="loading-more">
            {loadingMore ? (
              <>
                <div className="spinner"></div>
                <span>Memuat lebih banyak...</span>
              </>
            ) : (
              <button
                onClick={() => fetchNasaData()}
                className="btn btn-primary"
                style={{ padding: '12px 30px' }}
              >
                Muat Lebih Banyak
              </button>
            )}
          </div>
        )}

        {/* Modal Detail */}
        {itemDipilih && (
          <div className="modal" onClick={() => setItemDipilih(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{itemDipilih.judul}</h2>
                <button
                  onClick={() => setItemDipilih(null)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <img
                  src={itemDipilih.gambar}
                  alt={itemDipilih.judul}
                  className="modal-image"
                />
                
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Tanggal</div>
                    <div className="info-value">{itemDipilih.tanggal}</div>
                  </div>
                  {itemDipilih.fotografer && (
                    <div className="info-item">
                      <div className="info-label">Fotografer</div>
                      <div className="info-value">{itemDipilih.fotografer}</div>
                    </div>
                  )}
                  <div className="info-item">
                    <div className="info-label">Sumber</div>
                    <div className="info-value">{itemDipilih.sumber}</div>
                  </div>
                  {itemDipilih.kategori && (
                    <div className="info-item">
                      <div className="info-label">Kategori</div>
                      <div className="info-value">#{itemDipilih.kategori}</div>
                    </div>
                  )}
                </div>
                
                <div className="deskripsi-box">
                  <div className="deskripsi-header">
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Deskripsi</h3>
                    {itemDipilih.deskripsiAsli && (
                      <button
                        className={`tombol-bahasa ${tampilkanAsli ? 'badge-asli' : ''}`}
                        onClick={() => handleTerjemah(itemDipilih)}
                        disabled={sedangMenerjemahkan}
                      >
                        <Languages size={14} />
                        {sedangMenerjemahkan ? 'Memuat...' : (tampilkanAsli ? 'Tampilkan Terjemahan' : 'Lihat Teks Asli')}
                      </button>
                    )}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {itemDipilih.deskripsi}
                  </p>
                </div>
                
                <div className="kata-kunci">
                  {itemDipilih.kataKunci.slice(0, 15).map((kw, i) => (
                    <span key={i} className="keyword">
                      #{kw.replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
                
                <div className="tombol-aksi-modal">
                  <a
                    href={itemDipilih.gambar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <ExternalLink size={16} />
                    Buka Gambar
                  </a>
                  <button
                    onClick={() => handleDownload(itemDipilih.gambar, itemDipilih.judul)}
                    className="btn btn-primary"
                  >
                    <Download size={16} />
                    Unduh
                  </button>
                  <button
                    onClick={() => handleShare(itemDipilih)}
                    className="btn btn-secondary"
                  >
                    <Share2 size={16} />
                    Bagikan
                  </button>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="btn btn-secondary"
                  >
                    <Users size={16} />
                    Posting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Posting */}
        {showPostModal && itemDipilih && (
          <div className="modal" onClick={() => setShowPostModal(false)}>
            <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Buat Postingan</h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div style={{ padding: '20px' }}>
                <div style={{
                  marginBottom: '16px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img
                    src={itemDipilih.gambar}
                    alt={itemDipilih.judul}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <div><strong style={{ color: '#7c3aed' }}>Judul:</strong> {itemDipilih.judul}</div>
                  <div><strong style={{ color: '#0ea5e9' }}>Tanggal:</strong> {itemDipilih.tanggal}</div>
                  <div><strong style={{ color: '#10b981' }}>Kategori:</strong> #{itemDipilih.kategori || 'NASA'}</div>
                </div>
                
                <div style={{
                  background: 'rgba(124,58,237,0.1)',
                  borderLeft: '3px solid #7c3aed',
                  padding: '12px',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  <strong>Deskripsi:</strong> {itemDipilih.deskripsi.substring(0, 120)}...
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    Tambah komentar (opsional)
                  </label>
                  <textarea
                    value={komentarPosting}
                    onChange={(e) => setKomentarPosting(e.target.value)}
                    placeholder="Tulis komentarmu tentang gambar ini..."
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '14px',
                      resize: 'none',
                      outline: 'none'
                    }}
                    rows={3}
                  />
                </div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                  <strong>Preview postingan:</strong><br/>
                  <span style={{ color: '#7c3aed' }}>{itemDipilih.judul}</span><br/>
                  <span style={{ fontSize: '11px' }}>{itemDipilih.tanggal} • {itemDipilih.sumber}</span><br/>
                  <span>{itemDipilih.deskripsi.substring(0, 80)}...{komentarPosting && <><br/><span style={{ color: '#0ea5e9' }}>Komentar: {komentarPosting}</span></>}</span>
                </div>
                
                {!user && !loadingAuth && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '8px',
                    color: '#f59e0b',
                    fontSize: '13px'
                  }}>
                    Kamu harus login untuk posting
                  </div>
                )}
                
                {loadingAuth && (
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div className="spinner"></div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setShowPostModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleShareToPost}
                    disabled={sedangPosting || !user || loadingAuth}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {sedangPosting ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
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