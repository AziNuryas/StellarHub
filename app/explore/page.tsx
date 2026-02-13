'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Filter, Heart, MessageCircle, Share2, Bookmark,
  Star, MapPin, Calendar, User, Eye, Clock, ExternalLink,
  TrendingUp, Compass, Satellite, Rocket, Globe, Camera,
  ChevronRight, ChevronLeft, Maximize2, Download, Info,
  Plus, X, Users, Zap, Image as ImageIcon, Video, Music,
  Award, Target, Navigation, Cloud, Wind, Thermometer,
  UserPlus, Mail, Phone, Map, Hash, Lock, Unlock,
  MoreVertical // Added missing import
} from 'lucide-react'

// Type definitions
interface SpaceMission {
  id: number
  name: string
  agency: string
  destination: string
  launchDate: string
  status: string
  description: string
  crew: number
  duration: string
  image: string
  isFollowing: boolean
}

interface AstroEvent {
  id: number
  name: string
  date: string
  location: string
  visibility: string
  duration: string
  importance: string
  image: string
}

interface CelestialObject {
  id: number
  name: string
  type: string
  distance: string
  magnitude: number
  season: string
  bestView: string
  image: string
  isBookmarked: boolean
}

interface ObservationPost {
  id: number
  user: {
    name: string
    avatar: string
    verified: boolean
    location: string
  }
  title: string
  content: string
  image: string
  date: string
  likes: number
  comments: number
  shares: number
  equipment: string[]
  tags: string[]
  isLiked: boolean
  isBookmarked: boolean
}

interface SpaceNews {
  id: number
  title: string
  source: string
  date: string
  excerpt: string
  category: string
  readTime: string
  image: string
}

interface ObservationSpot {
  id: number
  name: string
  location: string
  elevation: string
  bortleScale: number
  bestFor: string[]
  weather: string
  image: string
}

// Data arrays
const spaceMissions: SpaceMission[] = [
  {
    id: 1,
    name: 'Artemis III',
    agency: 'NASA',
    destination: 'Moon',
    launchDate: '2025',
    status: 'Upcoming',
    description: 'First crewed lunar landing mission since Apollo 17',
    crew: 4,
    duration: '30 days',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=1471&auto=format&fit=crop',
    isFollowing: false
  },
  {
    id: 2,
    name: 'James Webb',
    agency: 'NASA/ESA/CSA',
    destination: 'L2 Lagrange Point',
    launchDate: '2021',
    status: 'Active',
    description: 'Space telescope for infrared astronomy',
    crew: 0,
    duration: '10+ years',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop',
    isFollowing: true
  },
  {
    id: 3,
    name: 'Mars Sample Return',
    agency: 'NASA/ESA',
    destination: 'Mars',
    launchDate: '2028',
    status: 'Planned',
    description: 'Mission to return Martian soil samples to Earth',
    crew: 0,
    duration: '5 years',
    image: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?q=80&w=1374&auto=format&fit=crop',
    isFollowing: false
  },
  {
    id: 4,
    name: 'Europa Clipper',
    agency: 'NASA',
    destination: 'Jupiter\'s Moon Europa',
    launchDate: '2024',
    status: 'Upcoming',
    description: 'Investigate Europa\'s habitability',
    crew: 0,
    duration: '6 years',
    image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1470&auto=format&fit=crop',
    isFollowing: true
  }
]

const astroEvents: AstroEvent[] = [
  {
    id: 1,
    name: 'Total Solar Eclipse',
    date: 'April 8, 2024',
    location: 'North America',
    visibility: 'Total',
    duration: '4m 28s',
    importance: 'High',
    image: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1450&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Perseid Meteor Shower',
    date: 'August 12-13, 2024',
    location: 'Worldwide',
    visibility: 'Peak: 100 meteors/hr',
    duration: 'All night',
    importance: 'Medium',
    image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Lunar Eclipse',
    date: 'March 25, 2024',
    location: 'Americas, Europe, Africa',
    visibility: 'Penumbral',
    duration: '4h 18m',
    importance: 'Medium',
    image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1470&auto=format&fit=crop'
  }
]

const celestialObjects: CelestialObject[] = [
  {
    id: 1,
    name: 'Andromeda Galaxy',
    type: 'Spiral Galaxy',
    distance: '2.5M light-years',
    magnitude: 3.4,
    season: 'Autumn',
    bestView: 'Naked Eye',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop',
    isBookmarked: true
  },
  {
    id: 2,
    name: 'Orion Nebula',
    type: 'Diffuse Nebula',
    distance: '1,344 light-years',
    magnitude: 4.0,
    season: 'Winter',
    bestView: 'Binoculars',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=1471&auto=format&fit=crop',
    isBookmarked: false
  },
  {
    id: 3,
    name: 'Saturn',
    type: 'Planet',
    distance: '1.2B km',
    magnitude: 0.46,
    season: 'Summer',
    bestView: 'Telescope',
    image: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?q=80&w=1374&auto=format&fit=crop',
    isBookmarked: true
  },
  {
    id: 4,
    name: 'International Space Station',
    type: 'Space Station',
    distance: '408 km',
    magnitude: -5.9,
    season: 'All year',
    bestView: 'Naked Eye',
    image: 'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1436&auto=format&fit=crop',
    isBookmarked: false
  }
]

const observationPosts: ObservationPost[] = [
  {
    id: 1,
    user: {
      name: 'CosmicObserver',
      avatar: '👨‍🔬',
      verified: true,
      location: 'Mount Wilson Observatory'
    },
    title: 'Detailed Surface of Jupiter',
    content: 'Captured Jupiter with its Great Red Spot clearly visible. Used 12" telescope with planetary camera. Seeing conditions were excellent!',
    image: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?q=80&w=1374&auto=format&fit=crop',
    date: '2 hours ago',
    likes: 234,
    comments: 42,
    shares: 18,
    equipment: ['12" Dobsonian', 'ASI224MC', 'UV/IR Filter'],
    tags: ['jupiter', 'planetary', 'astrofoto'],
    isLiked: true,
    isBookmarked: false
  },
  {
    id: 2,
    user: {
      name: 'NebulaHunter',
      avatar: '🌌',
      verified: true,
      location: 'Death Valley'
    },
    title: 'North America Nebula in Ha',
    content: '10 hours of Hydrogen-alpha data on the North America Nebula. The details in the "Gulf of Mexico" region are stunning!',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop',
    date: '5 hours ago',
    likes: 521,
    comments: 89,
    shares: 45,
    equipment: ['80mm Refractor', 'ASI1600MM', 'Astrodon Ha Filter'],
    tags: ['nebula', 'deepsky', 'narrowband'],
    isLiked: false,
    isBookmarked: true
  },
  {
    id: 3,
    user: {
      name: 'MilkyWayFan',
      avatar: '✨',
      verified: false,
      location: 'Atacama Desert'
    },
    title: 'Milky Way Core Panorama',
    content: '6-panel mosaic of the Milky Way core region. Shot from one of the darkest places on Earth!',
    image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1470&auto=format&fit=crop',
    date: '1 day ago',
    likes: 187,
    comments: 31,
    shares: 12,
    equipment: ['24mm f/1.4', 'Full Spectrum Mod', 'Star Tracker'],
    tags: ['milkyway', 'landscape', 'panorama'],
    isLiked: true,
    isBookmarked: true
  }
]

const spaceNews: SpaceNews[] = [
  {
    id: 1,
    title: 'Water Found on Asteroid',
    source: 'NASA',
    date: '3 hours ago',
    excerpt: 'James Webb discovers water vapor on asteroid belt object',
    category: 'Discovery',
    readTime: '3 min',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'SpaceX Starship Test',
    source: 'SpaceX',
    date: '6 hours ago',
    excerpt: 'Successful third integrated flight test of Starship',
    category: 'Launch',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1436&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Black Hole Image Update',
    source: 'Event Horizon Telescope',
    date: '1 day ago',
    excerpt: 'New high-resolution image of M87 black hole reveals magnetic fields',
    category: 'Research',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=1471&auto=format&fit=crop'
  }
]

const observationSpots: ObservationSpot[] = [
  {
    id: 1,
    name: 'Mauna Kea Observatories',
    location: 'Hawaii, USA',
    elevation: '4,205m',
    bortleScale: 1,
    bestFor: ['Deep Sky', 'Planetary', 'Solar'],
    weather: 'Clear 300 nights/year',
    image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Atacama Desert',
    location: 'Chile',
    elevation: '2,400m',
    bortleScale: 1,
    bestFor: ['Infrared', 'Radio', 'Milky Way'],
    weather: 'Dry and clear',
    image: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=2078&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Siding Spring Observatory',
    location: 'Australia',
    elevation: '1,165m',
    bortleScale: 2,
    bestFor: ['Southern Sky', 'Galactic Center'],
    weather: 'Good seeing',
    image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=2070&auto=format&fit=crop'
  }
]

// Union type for filtered content
type ContentItem = 
  | (SpaceMission & { type: 'mission' })
  | (AstroEvent & { type: 'event' })
  | (CelestialObject & { type: 'object' })
  | (ObservationPost & { type: 'post' })
  | (SpaceNews & { type: 'news' })

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [stars, setStars] = useState<Array<{top: number, left: number, opacity: number, delay: number}>>([])
  const [likedPosts, setLikedPosts] = useState<number[]>([1, 3])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([2, 3])
  const [bookmarkedObjects, setBookmarkedObjects] = useState<number[]>([1, 3])
  const [followingMissions, setFollowingMissions] = useState<number[]>([2, 4])
  const [selectedPost, setSelectedPost] = useState<ObservationPost | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    objectType: 'all',
    magnitude: 'all',
    season: 'all'
  })

  // Generate stars only on client
  useEffect(() => {
    const generateStars = () => {
      const stars = []
      for (let i = 0; i < 15; i++) {
        stars.push({
          top: Math.random() * 100,
          left: Math.random() * 100,
          opacity: Math.random() * 0.5 + 0.3,
          delay: i * 0.15
        })
      }
      return stars
    }
    setStars(generateStars())
  }, [])

  const handleLikePost = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId))
    } else {
      setLikedPosts([...likedPosts, postId])
    }
  }

  const handleBookmarkPost = (postId: number) => {
    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(bookmarkedPosts.filter(id => id !== postId))
    } else {
      setBookmarkedPosts([...bookmarkedPosts, postId])
    }
  }

  const handleBookmarkObject = (objectId: number) => {
    if (bookmarkedObjects.includes(objectId)) {
      setBookmarkedObjects(bookmarkedObjects.filter(id => id !== objectId))
    } else {
      setBookmarkedObjects([...bookmarkedObjects, objectId])
    }
  }

  const handleFollowMission = (missionId: number) => {
    if (followingMissions.includes(missionId)) {
      setFollowingMissions(followingMissions.filter(id => id !== missionId))
    } else {
      setFollowingMissions([...followingMissions, missionId])
    }
  }

  const categories = [
    { id: 'all', label: 'All', icon: '🌌', count: 12 },
    { id: 'missions', label: 'Missions', icon: '🚀', count: 4 },
    { id: 'events', label: 'Events', icon: '📅', count: 3 },
    { id: 'objects', label: 'Objects', icon: '✨', count: 4 },
    { id: 'observations', label: 'Observations', icon: '🔭', count: 3 },
    { id: 'news', label: 'News', icon: '📰', count: 3 }
  ]

  const getFilteredContent = (): ContentItem[] => {
    let filtered: ContentItem[] = []
    
    if (activeCategory === 'all' || activeCategory === 'missions') {
      filtered = [...filtered, ...spaceMissions.map(m => ({...m, type: 'mission'}))]
    }
    if (activeCategory === 'all' || activeCategory === 'events') {
      filtered = [...filtered, ...astroEvents.map(e => ({...e, type: 'event'}))]
    }
    if (activeCategory === 'all' || activeCategory === 'objects') {
      filtered = [...filtered, ...celestialObjects.map(o => ({...o, type: 'object'}))]
    }
    if (activeCategory === 'all' || activeCategory === 'observations') {
      filtered = [...filtered, ...observationPosts.map(p => ({...p, type: 'post'}))]
    }
    if (activeCategory === 'all' || activeCategory === 'news') {
      filtered = [...filtered, ...spaceNews.map(n => ({...n, type: 'news'}))]
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        ('name' in item && item.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ('title' in item && item.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ('description' in item && item.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ('content' in item && item.content?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ('excerpt' in item && item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    return filtered
  }

  const filteredContent = getFilteredContent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar-black via-stellar-dark to-stellar-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-stellar-purple to-stellar-blue flex items-center justify-center">
                  <Compass className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Explore Cosmos</h1>
                  <p className="text-gray-400">Discover space missions, celestial events, and observations</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cosmos..."
                  className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-64"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg glass-effect hover:bg-gray-800/50 transition-colors"
              >
                <Filter className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-stellar-purple/20 to-stellar-blue/20 text-white border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
                }`}
              >
                <span>{category.icon}</span>
                {category.label}
                <span className="text-xs bg-gray-800 px-1.5 py-0.5 rounded-full">{category.count}</span>
              </button>
            ))}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 p-4 rounded-xl glass-effect border border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Object Type</label>
                  <select 
                    value={filters.objectType}
                    onChange={(e) => setFilters({...filters, objectType: e.target.value})}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="planet">Planets</option>
                    <option value="galaxy">Galaxies</option>
                    <option value="nebula">Nebulae</option>
                    <option value="star">Stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Magnitude</label>
                  <select 
                    value={filters.magnitude}
                    onChange={(e) => setFilters({...filters, magnitude: e.target.value})}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">All Magnitudes</option>
                    <option value="bright">Bright (&lt; 2)</option>
                    <option value="medium">Medium (2-5)</option>
                    <option value="dim">Dim (&gt; 5)</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Season</label>
                  <select 
                    value={filters.season}
                    onChange={(e) => setFilters({...filters, season: e.target.value})}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">All Seasons</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="autumn">Autumn</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Featured & Missions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Observations */}
            {(activeCategory === 'all' || activeCategory === 'observations') && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Camera className="h-6 w-6 text-purple-400" />
                    Featured Observations
                  </h2>
                  <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-6">
                  {observationPosts.map((post) => (
                    <div key={post.id} className="rounded-2xl glass-effect overflow-hidden hover:border-purple-500/30 transition-all duration-300 border border-gray-800/50">
                      {/* Post Header */}
                      <div className="p-6 border-b border-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-stellar-purple to-stellar-blue flex items-center justify-center text-xl">
                              {post.user.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-semibold">{post.user.name}</h3>
                                {post.user.verified && (
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <MapPin className="h-3 w-3" />
                                {post.user.location}
                                <span className="text-gray-500">•</span>
                                <Clock className="h-3 w-3" />
                                {post.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-gray-400 hover:text-white">
                              <Share2 className="h-5 w-5" />
                            </button>
                            <button className="text-gray-400 hover:text-white">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="p-6">
                        <h3 className="text-white font-bold text-xl mb-2">{post.title}</h3>
                        <p className="text-gray-300 mb-4">{post.content}</p>
                        
                        {/* Equipment */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.equipment.map((item, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-900/50 text-gray-300 rounded-lg text-sm">
                              {item}
                            </span>
                          ))}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {post.tags.map((tag, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-300 rounded-lg text-sm border border-purple-500/20">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Image */}
                        <div className="rounded-xl overflow-hidden mb-6">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-64 object-cover"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => handleLikePost(post.id)}
                              className={`flex items-center gap-2 ${likedPosts.includes(post.id) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                            >
                              <Heart className={`h-5 w-5 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400">
                              <MessageCircle className="h-5 w-5" />
                              <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-400 hover:text-green-400">
                              <Share2 className="h-5 w-5" />
                              <span>{post.shares}</span>
                            </button>
                          </div>
                          <button 
                            onClick={() => handleBookmarkPost(post.id)}
                            className={`p-2 rounded-lg ${bookmarkedPosts.includes(post.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                          >
                            <Bookmark className={`h-5 w-5 ${bookmarkedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Space Missions */}
            {(activeCategory === 'all' || activeCategory === 'missions') && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-red-400" />
                  Active Space Missions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {spaceMissions.map((mission) => (
                    <div key={mission.id} className="rounded-2xl glass-effect overflow-hidden hover:border-red-500/30 transition-all duration-300 border border-gray-800/50">
                      <div className="h-48 relative overflow-hidden">
                        <img 
                          src={mission.image} 
                          alt={mission.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute top-4 left-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            mission.status === 'Active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            mission.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {mission.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-bold text-lg mb-1">{mission.name}</h3>
                            <p className="text-gray-400 text-sm">{mission.agency}</p>
                          </div>
                          <button 
                            onClick={() => handleFollowMission(mission.id)}
                            className={`px-3 py-1 text-sm rounded-lg ${
                              followingMissions.includes(mission.id)
                                ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                                : 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                            }`}
                          >
                            {followingMissions.includes(mission.id) ? 'Following' : 'Follow'}
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">{mission.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-xs">Destination</p>
                            <p className="text-white font-medium">{mission.destination}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Launch Date</p>
                            <p className="text-white font-medium">{mission.launchDate}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Crew</p>
                            <p className="text-white font-medium">{mission.crew} astronauts</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Duration</p>
                            <p className="text-white font-medium">{mission.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Celestial Objects */}
            {(activeCategory === 'all' || activeCategory === 'objects') && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-400" />
                  Celestial Objects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {celestialObjects.map((object) => (
                    <div key={object.id} className="rounded-2xl glass-effect overflow-hidden hover:border-yellow-500/30 transition-all duration-300 border border-gray-800/50">
                      <div className="h-40 relative overflow-hidden">
                        <img 
                          src={object.image} 
                          alt={object.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-bold text-lg mb-1">{object.name}</h3>
                            <p className="text-gray-400 text-sm">{object.type}</p>
                          </div>
                          <button 
                            onClick={() => handleBookmarkObject(object.id)}
                            className={`p-2 rounded-lg ${bookmarkedObjects.includes(object.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                          >
                            <Bookmark className={`h-5 w-5 ${bookmarkedObjects.includes(object.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-xs">Distance</p>
                            <p className="text-white font-medium">{object.distance}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Magnitude</p>
                            <p className="text-white font-medium">{object.magnitude}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Best Season</p>
                            <p className="text-white font-medium">{object.season}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Best View</p>
                            <p className="text-white font-medium">{object.bestView}</p>
                          </div>
                        </div>
                        <button className="w-full py-2 bg-gray-900/50 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors text-sm">
                          View Observation Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Astronomical Events */}
            {(activeCategory === 'all' || activeCategory === 'events') && (
              <div className="rounded-2xl glass-effect p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-400" />
                  Upcoming Events
                </h3>
                <div className="space-y-4">
                  {astroEvents.map((event) => (
                    <div key={event.id} className="p-4 rounded-lg bg-gray-900/30 hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{event.name}</h4>
                          <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <span>{event.date}</span>
                            <span>•</span>
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                              {event.visibility}
                            </span>
                            <span className="text-gray-400 text-xs">{event.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-center text-gray-400 hover:text-white text-sm border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                  View Calendar
                </button>
              </div>
            )}

            {/* Space News */}
            {(activeCategory === 'all' || activeCategory === 'news') && (
              <div className="rounded-2xl glass-effect p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  Latest Space News
                </h3>
                <div className="space-y-4">
                  {spaceNews.map((news) => (
                    <div key={news.id} className="group cursor-pointer">
                      <div className="flex gap-3">
                        <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">{news.title}</h4>
                          <p className="text-gray-400 text-xs mb-2">{news.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">{news.source}</span>
                            <span className="text-gray-500 text-xs">{news.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observation Spots */}
            <div className="rounded-2xl glass-effect p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-400" />
                Top Observation Spots
              </h3>
              <div className="space-y-4">
                {observationSpots.map((spot) => (
                  <div key={spot.id} className="group">
                    <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                      <img 
                        src={spot.image} 
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-2 left-3">
                        <h4 className="text-white font-medium text-sm">{spot.name}</h4>
                        <p className="text-gray-300 text-xs">{spot.location}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-400">
                        <span>Elevation:</span>
                        <span className="text-white ml-1">{spot.elevation}</span>
                      </div>
                      <div className="text-gray-400">
                        <span>Bortle:</span>
                        <span className="text-white ml-1">{spot.bortleScale}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {spot.bestFor.map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-xs rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl glass-effect p-6">
              <h3 className="text-white font-semibold mb-4">Exploration Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Objects Tracked</div>
                  <div className="text-white font-semibold">1,248</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Active Missions</div>
                  <div className="text-green-400 font-semibold">24</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Upcoming Events</div>
                  <div className="text-blue-400 font-semibold">18</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Observations Today</div>
                  <div className="text-purple-400 font-semibold">342</div>
                </div>
              </div>
              <button className="w-full mt-4 py-2 bg-gradient-to-r from-stellar-purple to-stellar-blue rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm">
                Contribute Observation
              </button>
            </div>

            {/* Weather Conditions */}
            <div className="rounded-2xl glass-effect p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-cyan-400" />
                Space Weather
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Solar Flares</div>
                  <div className="text-yellow-400 font-medium">Low</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Geomagnetic Storm</div>
                  <div className="text-green-400 font-medium">Quiet</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Aurora Activity</div>
                  <div className="text-blue-400 font-medium">Minimal</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">ISS Visibility</div>
                  <div className="text-purple-400 font-medium">Tonight 8:45 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="mt-8 p-4 rounded-xl glass-effect border border-purple-500/20">
            <p className="text-gray-300">
              Found <span className="text-purple-400 font-semibold">{filteredContent.length}</span> results for "<span className="text-white font-medium">{searchQuery}</span>"
            </p>
          </div>
        )}
      </div>

      {/* Modal for detailed view */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{selectedPost.title}</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-full hover:bg-gray-800"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="p-6">
              {/* Modal content would go here */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}