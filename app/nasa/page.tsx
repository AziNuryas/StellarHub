'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  Languages, ChevronDown, ChevronUp
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
  gambarHd?: string
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
  copyright?: string
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
function formatTanggal(tanggal: string) {
  const date = new Date(tanggal)
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

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

/* ══════════════════════════════════════════════════════
   SKELETON LOADING
══════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="card-nasa skeleton">
      <div className="skeleton-image"></div>
      <div className="konten-card">
        <div className="skeleton-line" style={{ width: '80%', height: '20px' }}></div>
        <div className="skeleton-line" style={{ width: '60%', height: '16px' }}></div>
        <div className="skeleton-line" style={{ width: '100%', height: '40px' }}></div>
        <div className="skeleton-line" style={{ width: '50%', height: '32px' }}></div>
      </div>
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
  const [loading, setLoading] = useState(true)
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
  const [halaman, setHalaman] = useState(1)
  const [totalHalaman, setTotalHalaman] = useState(1)
  const [semuaData, setSemuaData] = useState<NasaItem[]>([])
  
  // State untuk terjemahan
  const [tampilkanAsli, setTampilkanAsli] = useState(false)
  const [deskripsiTerjemahan, setDeskripsiTerjemahan] = useState<Record<string, string>>({})
  
  // ============================
  // STATE UNTUK POSTING KE KOMUNITAS
  // ============================
  const [showPostModal, setShowPostModal] = useState(false)
  const [komentarPosting, setKomentarPosting] = useState('')
  const [sedangPosting, setSedangPosting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // ============================
  // KEYWORDS NASA LENGKAP
  // ============================
  const nasaKeywords = [
    'nebula', 'galaxy', 'black hole', 'star', 'supernova',
    'orion nebula', 'eagle nebula', 'crab nebula', 'ring nebula',
    'andromeda', 'milky way', 'whirlpool galaxy', 'sombrero galaxy',
    'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    'sun', 'aurora', 'comet', 'asteroid', 'meteor',
    'astronaut', 'iss', 'space station', 'hubble', 'james webb',
    'spacex', 'falcon', 'apollo', 'artemis', 'rocket',
    'solar flare', 'eclipse', 'constellation', 'star trail',
    'earth from space', 'northern lights', 'southern lights',
    'telescope', 'observatory', 'spacewalk', 'moon landing',
    'satellite', 'probe', 'rover', 'curiosity', 'perseverance',
    'cassini', 'voyager', 'new horizons', 'dragon', 'starship',
    'black hole m87', 'sagittarius a', 'trappist', 'proxima centauri'
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
    { id: 'aurora', nama: 'Aurora', icon: '🌌', jumlah: 0, warna: 'from-green-400 to-blue-500' },
    { id: 'comet', nama: 'Komet', icon: '☄️', jumlah: 0, warna: 'from-blue-400 to-cyan-400' },
    { id: 'astronaut', nama: 'Astronot', icon: '👨‍🚀', jumlah: 0, warna: 'from-blue-500 to-indigo-600' },
    { id: 'iss', nama: 'ISS', icon: '🛸', jumlah: 0, warna: 'from-blue-400 to-indigo-500' },
    { id: 'spacecraft', nama: 'Wahana', icon: '🚀', jumlah: 0, warna: 'from-red-500 to-pink-500' },
    { id: 'telescope', nama: 'Teleskop', icon: '🔭', jumlah: 0, warna: 'from-purple-600 to-indigo-600' },
    { id: 'eclipse', nama: 'Gerhana', icon: '🌑', jumlah: 0, warna: 'from-gray-700 to-yellow-800' },
    { id: 'supernova', nama: 'Supernova', icon: '💥', jumlah: 0, warna: 'from-orange-600 to-red-700' },
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
  // FUNGSI TERJEMAHAN SEDERHANA
  // ============================
  const terjemahkanTeks = (teks: string): string => {
    // Pattern umum dalam deskripsi NASA
    const pola: [RegExp, string][] = [
      [/This (long duration )?photograph/i, 'Foto ini'],
      [/looks out from a window on the cupola/i, 'diambil dari jendela cupola'],
      [/revealing Earth's atmospheric glow/i, 'memperlihatkan cahaya atmosfer Bumi'],
      [/underneath star trails/i, 'di bawah jejak bintang'],
      [/as the International Space Station orbited/i, 'saat Stasiun Luar Angkasa Internasional mengorbit'],
      [/miles above the Pacific Ocean/i, 'mil di atas Samudra Pasifik'],
      [/southeast of Hawaii/i, 'tenggara Hawaii'],
      [/at approximately/i, 'sekitar pukul'],
      [/local time/i, 'waktu setempat'],
      [/In the foreground/i, 'Di latar depan'],
      [/is the Kibo laboratory module/i, 'terlihat modul laboratorium Kibo'],
      [/Kibo's External Platform/i, 'Platform Eksternal Kibo'],
      [/that houses experiments exposed to the vacuum of space/i, 'yang menampung eksperimen yang terpapar ruang hampa udara'],
      [/a set of the space station's main solar arrays/i, 'serangkaian panel surya utama stasiun luar angkasa'],
      [/NASA's (Astronomy Picture of the Day )?/i, 'Gambar Astronomi NASA'],
      [/Image Credit:|Credit:/i, 'Kredit Gambar:'],
      [/Explanation:/i, 'Penjelasan:'],
      [/The image shows/i, 'Gambar ini menunjukkan'],
      [/captured by/i, 'diabadikan oleh'],
      [/taken on/i, 'diambil pada'],
      [/This image from/i, 'Gambar ini dari'],
      [/shows a detailed view of/i, 'menampilkan detail dari'],
      [/located approximately/i, 'terletak sekitar'],
      [/light-years away/i, 'tahun cahaya'],
      [/in the constellation/i, 'di rasi bintang'],
    ]
    
    let hasil = teks
    for (const [regex, ganti] of pola) {
      hasil = hasil.replace(regex, ganti)
    }
    
    // Terjemahan kata umum
    const kata: [RegExp, string][] = [
      [/\bimage\b/gi, 'gambar'],
      [/\bphoto\b/gi, 'foto'],
      [/\bpicture\b/gi, 'gambar'],
      [/\bphotograph\b/gi, 'foto'],
      [/\bstar\b/gi, 'bintang'],
      [/\bstars\b/gi, 'bintang-bintang'],
      [/\bgalaxy\b/gi, 'galaksi'],
      [/\bgalaxies\b/gi, 'galaksi'],
      [/\bnebula\b/gi, 'nebula'],
      [/\bnebulae\b/gi, 'nebula'],
      [/\bplanet\b/gi, 'planet'],
      [/\bplanets\b/gi, 'planet'],
      [/\bmoon\b/gi, 'bulan'],
      [/\bmoons\b/gi, 'bulan'],
      [/\bearth\b/gi, 'Bumi'],
      [/\bmars\b/gi, 'Mars'],
      [/\bjupiter\b/gi, 'Jupiter'],
      [/\bsaturn\b/gi, 'Saturnus'],
      [/\bspace\b/gi, 'luar angkasa'],
      [/\buniverse\b/gi, 'alam semesta'],
      [/\bcosmos\b/gi, 'kosmos'],
      [/\bobservation\b/gi, 'pengamatan'],
      [/\bobserved\b/gi, 'diamati'],
      [/\brevealed\b/gi, 'terungkap'],
      [/\breveals\b/gi, 'memperlihatkan'],
      [/\bshows\b/gi, 'menunjukkan'],
      [/\bdisplay\b/gi, 'menampilkan'],
      [/\bfeatures\b/gi, 'fitur'],
      [/\bregion\b/gi, 'wilayah'],
      [/\barea\b/gi, 'area'],
      [/\bcenter\b/gi, 'pusat'],
      [/\bcentral\b/gi, 'pusat'],
      [/\bnorthern\b/gi, 'utara'],
      [/\bsouthern\b/gi, 'selatan'],
      [/\beastern\b/gi, 'timur'],
      [/\bwestern\b/gi, 'barat'],
    ]
    
    for (const [regex, ganti] of kata) {
      hasil = hasil.replace(regex, ganti)
    }
    
    return hasil
  }

  const handleTerjemah = (item: NasaItem) => {
    if (!tampilkanAsli) {
      // Simpan deskripsi asli kalo belum ada
      if (!item.deskripsiAsli) {
        item.deskripsiAsli = item.deskripsi
      }
      
      // Terjemahkan deskripsi
      const terjemahan = terjemahkanTeks(item.deskripsiAsli)
      
      // Simpan di state terjemahan
      setDeskripsiTerjemahan(prev => ({
        ...prev,
        [item.id]: terjemahan
      }))
      
      // Update item yang dipilih
      setItemDipilih({
        ...item,
        deskripsi: terjemahan
      })
      setTampilkanAsli(true)
    } else {
      // Kembali ke deskripsi asli
      setItemDipilih({
        ...item,
        deskripsi: item.deskripsiAsli || item.deskripsi
      })
      setTampilkanAsli(false)
    }
  }

  // ============================
  // FETCH DATA NASA - URUTAN TERBARU
  // ============================
  const fetchDataNASA = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setHalaman(1)
        setSemuaData([])
      }

      const keywordsToFetch = reset 
        ? nasaKeywords.slice(0, 10) // Ambil 10 keyword pertama untuk initial load
        : nasaKeywords.slice(halaman * 5, (halaman + 1) * 5) // Ambil 5 keyword berikutnya

      const semuaItem: NasaItem[] = []
      
      await Promise.all(
        keywordsToFetch.map(async (keyword) => {
          try {
            // Fetch per halaman untuk mendapatkan data terbaru
            const response = await fetch(
              `https://images-api.nasa.gov/search?q=${encodeURIComponent(keyword)}&media_type=image&page=1&page_size=10&year_start=2020&year_end=2025`
            )
            
            if (!response.ok) return []
            
            const data = await response.json()
            
            return data.collection.items.map((item: any) => ({
              id: item.data[0].nasa_id,
              judul: item.data[0].title || 'Gambar NASA',
              deskripsi: item.data[0].description || 'Gambar menakjubkan dari luar angkasa',
              deskripsiAsli: item.data[0].description,
              gambar: item.links?.[0]?.href || '',
              gambarHd: item.links?.[0]?.href?.replace('~thumb', '~orig') || item.links?.[0]?.href,
              tanggal: item.data[0].date_created?.split('T')[0] || '',
              sumber: item.data[0].center || 'NASA',
              fotografer: item.data[0].photographer || item.data[0].secondary_creator || 'NASA',
              kataKunci: item.data[0].keywords || [keyword, 'space', 'nasa'],
              nasa_id: item.data[0].nasa_id,
              tipeMedia: item.data[0].media_type || 'gambar',
              suka: 0,
              dilihat: Math.floor(Math.random() * 5000) + 500,
              isDisukai: false,
              isDisimpan: false,
              kategori: keyword,
              copyright: item.data[0].copyright
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

      // Hapus duplikat berdasarkan ID
      const uniqueItems = Array.from(
        new Map(semuaItem.map(item => [item.id, item])).values()
      )

      // Urutkan dari terbaru ke terlama berdasarkan tanggal
      uniqueItems.sort((a, b) => {
        const dateA = a.tanggal ? new Date(a.tanggal).getTime() : 0
        const dateB = b.tanggal ? new Date(b.tanggal).getTime() : 0
        return dateB - dateA
      })

      // Filter hanya yang memiliki gambar valid
      const validItems = uniqueItems.filter(item => item.gambar && item.gambar.includes('nasa.gov'))

      // Gabungkan dengan data yang sudah ada
      const combined = reset ? validItems : [...semuaData, ...validItems]
      
      // Hapus duplikat lagi dan urutkan
      const finalItems = Array.from(
        new Map(combined.map(item => [item.id, item])).values()
      ).sort((a, b) => {
        const dateA = a.tanggal ? new Date(a.tanggal).getTime() : 0
        const dateB = b.tanggal ? new Date(b.tanggal).getTime() : 0
        return dateB - dateA
      })

      // Cek likes dari database kalo user login
      if (user) {
        for (let item of finalItems) {
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

      setSemuaData(finalItems)
      
      // Filter berdasarkan kategori aktif
      let filtered = [...finalItems]
      if (kategoriAktif !== 'all') {
        filtered = filtered.filter(item => 
          item.kataKunci.some(k => 
            k.toLowerCase().includes(kategoriAktif.toLowerCase())
          ) || 
          item.judul.toLowerCase().includes(kategoriAktif.toLowerCase()) ||
          item.kategori?.toLowerCase().includes(kategoriAktif.toLowerCase())
        )
      }
      
      // Urutkan berdasarkan pilihan
      if (urutan === 'terbaru') {
        filtered.sort((a, b) => {
          const dateA = a.tanggal ? new Date(a.tanggal).getTime() : 0
          const dateB = b.tanggal ? new Date(b.tanggal).getTime() : 0
          return dateB - dateA
        })
      } else {
        filtered.sort((a, b) => {
          const dateA = a.tanggal ? new Date(a.tanggal).getTime() : 0
          const dateB = b.tanggal ? new Date(b.tanggal).getTime() : 0
          return dateA - dateB
        })
      }

      setItems(finalItems)
      setItemsTerfilter(filtered)
      setHalaman(prev => reset ? 2 : prev + 1)
      
      // Update statistik
      setStatistik({
        totalItem: finalItems.length,
        totalSuka: finalItems.reduce((sum, item) => sum + item.suka, 0),
        totalDilihat: finalItems.reduce((sum, item) => sum + item.dilihat, 0),
      })

    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat data NASA')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [halaman, user, kategoriAktif, urutan])

  // Initial fetch
  useEffect(() => {
    fetchDataNASA(true)
  }, [])

  // Filter & sort ketika kategori atau urutan berubah
  useEffect(() => {
    if (semuaData.length === 0) return
    
    let filtered = [...semuaData]
    
    if (kategoriAktif !== 'all') {
      filtered = filtered.filter(item => 
        item.kataKunci.some(k => 
          k.toLowerCase().includes(kategoriAktif.toLowerCase())
        ) || 
        item.judul.toLowerCase().includes(kategoriAktif.toLowerCase()) ||
        item.kategori?.toLowerCase().includes(kategoriAktif.toLowerCase())
      )
    }
    
    if (urutan === 'terbaru') {
      filtered.sort((a, b) => {
        const dateA = a.tanggal ? new Date(a.tanggal).getTime() : 0
        const dateB = b.tanggal ? new Date(b.tanggal).getTime() : 0
        return dateB - dateA
      })
    } else {
      filtered.sort((a, b) => {
        const dateA = a.tanggal ? new Date(a.tanggal).getTime() : 0
        const dateB = b.tanggal ? new Date(b.tanggal).getTime() : 0
        return dateA - dateB
      })
    }
    
    setItemsTerfilter(filtered)
    
    // Update kategori count
    kategoriList.forEach(kat => {
      if (kat.id !== 'all') {
        const count = filtered.filter(item => 
          item.kataKunci.some(k => k.toLowerCase().includes(kat.id.toLowerCase()))
        ).length
        kat.jumlah = count
      } else {
        kat.jumlah = filtered.length
      }
    })
    
  }, [semuaData, kategoriAktif, urutan])

  // ============================
  // INFINITE SCROLL
  // ============================
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && items.length > 0) {
          setLoadingMore(true)
          fetchDataNASA()
        }
      },
      { threshold: 0.5 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, loadingMore, items.length])

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
    const shareData = {
      title: item.judul,
      text: `Lihat gambar NASA ini: ${item.judul}`,
      url: item.gambarHd || item.gambar
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(item.gambarHd || item.gambar)
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
      
      const tanggalFormat = formatTanggal(itemDipilih.tanggal)
      const komenUser = komentarPosting ? `\n\nKomentar saya:\n${komentarPosting}` : ''
      
      const kategoriHashtag = itemDipilih.kategori 
        ? `#${itemDipilih.kategori.replace(/\s+/g, '')}` 
        : '#NASA'
      
      const keywordsHashtags = itemDipilih.kataKunci
        .slice(0, 5)
        .map(k => `#${k.replace(/\s+/g, '')}`)
        .join(' ')
      
      const kontenLengkap = `**${itemDipilih.judul}**\n\n📅 Tanggal: ${tanggalFormat}\n📸 Sumber: ${itemDipilih.sumber}\n🏷️ ${kategoriHashtag}\n\n${itemDipilih.deskripsi}${komenUser}\n\n${keywordsHashtags} #LuarAngkasa #Astronomi`

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: `NASA: ${itemDipilih.judul}`,
            content: kontenLengkap,
            image_url: itemDipilih.gambarHd || itemDipilih.gambar,
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
          cursor: pointer;
        }
        
        .sort-select option {
          background: #1a1a2e;
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
          transition: all 0.2s;
        }
        
        .tombol-refresh:hover {
          background: rgba(124,58,237,0.2);
          border-color: rgba(124,58,237,0.3);
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
          transition: all 0.2s;
        }
        
        .search-input:focus {
          border-color: #7c3aed;
          background: rgba(124,58,237,0.05);
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
          scrollbar-width: thin;
          scrollbar-color: #7c3aed rgba(255,255,255,0.1);
        }
        
        .kategori-scroll::-webkit-scrollbar {
          height: 4px;
        }
        
        .kategori-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        
        .kategori-scroll::-webkit-scrollbar-thumb {
          background: #7c3aed;
          border-radius: 10px;
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
          transition: all 0.2s;
        }
        
        .kategori-btn:hover {
          background: rgba(124,58,237,0.2);
          border-color: rgba(124,58,237,0.3);
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
          animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
          background: linear-gradient(45deg, #1a1a2e, #16213e);
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
          backdrop-filter: blur(4px);
        }
        
        .konten-card {
          padding: 16px;
        }
        
        .judul-card {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
          transition: all 0.2s;
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
          transition: all 0.2s;
        }
        
        .card-list:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(124,58,237,0.3);
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
        
        .skeleton-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin: 8px 0;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
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
          animation: fadeIn 0.2s ease;
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
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: rgba(20,20,30,0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px 24px 0 0;
          z-index: 10;
        }
        
        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: white;
          font-family: 'Archivo Black', sans-serif;
        }
        
        .modal-body {
          padding: 24px;
        }
        
        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: rgba(239,68,68,0.2);
          border-color: rgba(239,68,68,0.3);
          color: #ef4444;
        }
        
        .modal-image {
          width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 16px;
          margin-bottom: 24px;
          background: rgba(0,0,0,0.2);
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .info-item {
          background: rgba(255,255,255,0.05);
          padding: 16px;
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
          color: white;
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
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .deskripsi-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: white;
          font-family: 'Archivo Black', sans-serif;
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
          transition: all 0.2s;
        }
        
        .tombol-bahasa:hover {
          background: rgba(124,58,237,0.3);
        }
        
        .badge-asli {
          background: rgba(16,185,129,0.2);
          border-color: rgba(16,185,129,0.3);
          color: #10b981;
        }
        
        .deskripsi-box p {
          color: rgba(255,255,255,0.8);
          line-height: 1.8;
          font-size: 14px;
          white-space: pre-wrap;
        }
        
        .kata-kunci {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        
        .keyword {
          padding: 6px 14px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 30px;
          font-size: 12px;
          color: #a78bfa;
          transition: all 0.2s;
        }
        
        .keyword:hover {
          background: rgba(124,58,237,0.2);
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
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124,58,237,0.3);
        }
        
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: rgba(255,255,255,0.15);
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        @media (max-width: 768px) {
          .grid-nasa {
            grid-template-columns: 1fr;
          }
          
          .statistik {
            flex-direction: column;
            gap: 8px;
          }
          
          .modal-image {
            max-height: 250px;
          }
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="judul-utama">Galeri NASA</h1>
          <p className="subjudul">
            Menampilkan {statistik.totalItem} gambar dari berbagai kategori, diurutkan dari yang terbaru
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
              <option value="terbaru">📅 Terbaru</option>
              <option value="terlama">📅 Terlama</option>
            </select>
            
            <button
              onClick={() => fetchDataNASA(true)}
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
              placeholder="Cari gambar NASA..."
              value={kataKunci}
              onChange={(e) => {
                setKataKunci(e.target.value)
                if (e.target.value.length > 2) {
                  const filtered = semuaData.filter(item =>
                    item.judul.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    item.deskripsi.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    item.kataKunci.some(k => k.toLowerCase().includes(e.target.value.toLowerCase()))
                  )
                  setItemsTerfilter(filtered)
                } else {
                  let filtered = [...semuaData]
                  if (kategoriAktif !== 'all') {
                    filtered = filtered.filter(item => 
                      item.kataKunci.some(k => k.toLowerCase().includes(kategoriAktif.toLowerCase()))
                    )
                  }
                  if (urutan === 'terbaru') {
                    filtered.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                  } else {
                    filtered.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
                  }
                  setItemsTerfilter(filtered)
                }
              }}
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
                {kat.icon} {kat.nama} {kat.jumlah > 0 && `(${kat.jumlah})`}
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
          <div className="grid-nasa">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : itemsTerfilter.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌌</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              Tidak ada gambar
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Coba kata kunci yang berbeda atau pilih kategori lain
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
                    src={item.gambar || 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop'}
                    alt={item.judul}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop'
                    }}
                  />
                  <div className="badge-container">
                    <span className="badge">
                      {new Date(item.tanggal).getFullYear()}
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
                      {formatTanggal(item.tanggal)}
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
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                    <img
                      src={item.gambar || 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop'}
                      alt={item.judul}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '250px' }}>
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
                        {formatTanggal(item.tanggal)}
                      </span>
                      <span>{item.sumber}</span>
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
                <span>Memuat lebih banyak gambar...</span>
              </>
            ) : (
              <button
                onClick={() => {
                  setLoadingMore(true)
                  fetchDataNASA()
                }}
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
                <h2>{itemDipilih.judul}</h2>
                <button className="close-btn" onClick={() => setItemDipilih(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <img
                  src={itemDipilih.gambarHd || itemDipilih.gambar}
                  alt={itemDipilih.judul}
                  className="modal-image"
                />
                
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Tanggal</div>
                    <div className="info-value">{formatTanggal(itemDipilih.tanggal)}</div>
                  </div>
                  {itemDipilih.fotografer && (
                    <div className="info-item">
                      <div className="info-label">Fotografer</div>
                      <div className="info-value">{itemDipilih.fotografer}</div>
                    </div>
                  )}
                  <div className="info-item">
                    <div className="info-label">Sumber</div>
                    <div className="info-value">{itemDipilih.sumber || 'NASA'}</div>
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
                    <h3>Deskripsi</h3>
                    <button
                      className={`tombol-bahasa ${tampilkanAsli ? 'badge-asli' : ''}`}
                      onClick={() => handleTerjemah(itemDipilih)}
                    >
                      <Languages size={14} />
                      {tampilkanAsli ? 'Tampilkan Terjemahan' : 'Lihat Teks Asli'}
                    </button>
                  </div>
                  <p>{itemDipilih.deskripsi}</p>
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
                    href={itemDipilih.gambarHd || itemDipilih.gambar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <ExternalLink size={16} />
                    Buka Gambar HD
                  </a>
                  <button
                    onClick={() => handleDownload(itemDipilih.gambarHd || itemDipilih.gambar, itemDipilih.judul)}
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
                <h3>Buat Postingan</h3>
                <button className="close-btn" onClick={() => setShowPostModal(false)}>
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
                  <div><strong style={{ color: '#0ea5e9' }}>Tanggal:</strong> {formatTanggal(itemDipilih.tanggal)}</div>
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
                  <span style={{ fontSize: '11px' }}>{formatTanggal(itemDipilih.tanggal)} • {itemDipilih.sumber}</span><br/>
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