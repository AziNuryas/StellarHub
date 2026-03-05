'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Share2, Bookmark, Eye, Clock, User, Rocket, X, Download, ExternalLink, Calendar, Maximize2 } from 'lucide-react'
import { ExploreContent } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ExploreCardProps {
  content: ExploreContent
  onLike?: (id: string, type: string) => void
  onSave?: (id: string, type: string) => void
  onClick?: () => void
}

// Gambar NASA langsung dari API
const NASA_IMAGES = [
  'https://images-assets.nasa.gov/image/PIA12348/PIA12348~orig.jpg',
  'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000271/GSFC_20171208_Archive_e000271~orig.jpg',
  'https://images-assets.nasa.gov/image/PIA17563/PIA17563~orig.jpg',
  'https://images-assets.nasa.gov/image/hubble-observes-one-of-a-kind-star-nicknamed-nasty-1_22466134945_o/hubble-observes-one-of-a-kind-star-nicknamed-nasty-1_22466134945_o~orig.jpg',
]

// Gambar nebula keren
const NEBULA_IMAGES = [
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=2070&auto=format&fit=crop',
]

// Gambar planet
const PLANET_IMAGES = [
  'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614314107768-6018061b5b72?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1639479858802-1fbf29d4b9b5?q=80&w=2070&auto=format&fit=crop',
]

// Fungsi untuk mendapatkan gambar berdasarkan konten
function getContentImage(content: ExploreContent): string {
  const text = (content.title || content.content_text || '').toLowerCase()
  const hashtags = content.tags || []
  
  if (content.source_type === 'nasa_apod' || hashtags.includes('nasa') || hashtags.includes('apod')) {
    return NASA_IMAGES[Math.floor(Math.random() * NASA_IMAGES.length)]
  }
  
  if (text.includes('nebula') || hashtags.includes('nebula') || hashtags.includes('Nebula')) {
    return NEBULA_IMAGES[Math.floor(Math.random() * NEBULA_IMAGES.length)]
  }
  
  if (text.includes('planet') || text.includes('mars') || text.includes('jupiter') || 
      hashtags.includes('planet') || hashtags.includes('mars')) {
    return PLANET_IMAGES[Math.floor(Math.random() * PLANET_IMAGES.length)]
  }
  
  return NEBULA_IMAGES[Math.floor(Math.random() * NEBULA_IMAGES.length)]
}

export function ExploreCard({ content, onLike, onSave, onClick }: ExploreCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    setImageUrl(getContentImage(content))
    checkAuth()
  }, [content])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const getSourceIcon = () => {
    return content.source_type === 'nasa_apod' ? '🚀' : '📝'
  }

  const getSourceLabel = () => {
    return content.source_type === 'nasa_apod' ? 'NASA APOD' : 'Community Post'
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onClick?.()
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      toast.error('Login dulu untuk like')
      return
    }

    setIsLiked(!isLiked)
    
    if (content.source_type === 'nasa_apod') {
      await supabase
        .from('nasa_likes')
        .insert({ user_id: currentUser.id, nasa_id: content.source_id })
    } else {
      await supabase
        .from('likes')
        .insert({ user_id: currentUser.id, post_id: content.source_id })
    }

    onLike?.(content.source_id, content.source_type)
    toast.success(isLiked ? 'Like dihapus' : 'Berhasil like! ❤️')
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      toast.error('Login dulu untuk menyimpan')
      return
    }

    setIsSaved(!isSaved)

    if (content.source_type === 'nasa_apod') {
      await supabase
        .from('bookmarks')
        .insert({ 
          user_id: currentUser.id, 
          bookmark_type: 'apod',
          apod_id: content.source_id 
        })
    } else {
      await supabase
        .from('bookmarks')
        .insert({ 
          user_id: currentUser.id, 
          bookmark_type: 'post',
          post_id: content.source_id 
        })
    }

    onSave?.(content.source_id, content.source_type)
    toast.success(isSaved ? 'Dihapus dari koleksi' : 'Disimpan ke koleksi! 📌')
  }

  const timeAgo = formatDistanceToNow(new Date(content.original_created_at), {
    addSuffix: true,
    locale: id
  })

  const handleImageError = () => {
    setImageError(true)
    setImageUrl(NEBULA_IMAGES[Math.floor(Math.random() * NEBULA_IMAGES.length)])
  }

  return (
    <div 
      className="explore-card cursor-pointer"
      onClick={handleCardClick}
    >
      <style jsx>{`
        .explore-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .explore-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }
        .card-image {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: linear-gradient(45deg, #1a1a2e, #16213e);
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .explore-card:hover .card-image img {
          transform: scale(1.05);
        }
        .source-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 12px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .stats-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          padding: 6px 12px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          border-radius: 30px;
          font-size: 12px;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stats-badge span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .card-content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-description {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .author-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .author-avatar {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--accent), #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          overflow: hidden;
        }
        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
          margin-top: auto;
        }
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          padding: 6px 10px;
          border-radius: 8px;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .action-btn.liked {
          color: #f472b6;
        }
        .action-btn.saved {
          color: #fbbf24;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .tag {
          padding: 4px 10px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #a78bfa;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tag:hover {
          background: rgba(124,58,237,0.2);
          border-color: rgba(124,58,237,0.3);
        }
        .preview-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          border-radius: 30px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.3);
        }
      `}</style>

      <div className="card-image">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={content.title || 'Space image'}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-600 to-blue-600">
            {getSourceIcon()}
          </div>
        )}
        
        <div className="source-badge">
          <span>{getSourceIcon()}</span>
          <span>{getSourceLabel()}</span>
        </div>

        <div className="preview-badge">
          <Eye size={12} />
          <span>Klik untuk preview</span>
        </div>

        <div className="stats-badge">
          <span>
            <Heart size={12} fill="currentColor" />
            {content.likes_count}
          </span>
          <span>
            <MessageCircle size={12} />
            {content.comments_count}
          </span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{content.title || 'Untitled'}</h3>
        <p className="card-description">{content.description?.slice(0, 150)}</p>

        <div className="card-meta">
          <div className="author-info">
            {content.author_avatar ? (
              <img src={content.author_avatar} alt={content.author_name || ''} className="author-avatar" />
            ) : (
              <div className="author-avatar">
                {content.author_name?.charAt(0) || <User size={14} />}
              </div>
            )}
            <span>{content.author_name || (content.source_type === 'nasa_apod' ? 'NASA' : 'Anonymous')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{timeAgo}</span>
          </div>
        </div>

        {content.tags && content.tags.length > 0 && (
          <div className="tags">
            {content.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="action-bar">
          <div className="action-buttons">
            <button
              className={`action-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{content.likes_count + (isLiked ? 1 : 0)}</span>
            </button>
            <button className="action-btn">
              <MessageCircle size={16} />
              <span>{content.comments_count}</span>
            </button>
          </div>
          <button
            className={`action-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  )
}