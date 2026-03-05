'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, Heart, Bookmark, Share2, Download, ExternalLink, 
  Calendar, User, Globe, Clock, MessageCircle, Eye, 
  Maximize2, Send, Users, Loader2, AlertCircle,
  Image as ImageIcon
} from 'lucide-react'
import { ExploreContent } from '../types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface ExploreDetailModalProps {
  content: ExploreContent
  isOpen: boolean
  onClose: () => void
  onLike?: (id: string, type: string) => void
  onSave?: (id: string, type: string) => void
}

// Gambar fallback yang pasti muncul
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=2070&auto=format&fit=crop',
]

export function ExploreDetailModal({ content, isOpen, onClose, onLike, onSave }: ExploreDetailModalProps) {
  const supabase = createClient()
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')
  
  // State untuk share ke postingan
  const [showPostModal, setShowPostModal] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)

  // Set gambar saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (content.image_url) {
        setCurrentImageUrl(content.image_url)
      } else {
        setCurrentImageUrl(FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)])
      }
      setImageError(false)
      setImageLoaded(false)
    }
  }, [isOpen, content])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      checkAuth()
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  useEffect(() => {
    if (content) {
      setIsLiked(content.isLiked || false)
    }
  }, [content])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Login dulu untuk menyukai')
      return
    }

    setLoading(true)
    try {
      if (isLiked) {
        if (content.source_type === 'nasa_apod') {
          await supabase
            .from('nasa_likes')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('nasa_id', content.source_id)
        } else {
          await supabase
            .from('likes')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('post_id', content.source_id)
        }
        setIsLiked(false)
        toast.success('Suka dihapus')
      } else {
        if (content.source_type === 'nasa_apod') {
          await supabase
            .from('nasa_likes')
            .insert({ user_id: currentUser.id, nasa_id: content.source_id })
        } else {
          await supabase
            .from('likes')
            .insert({ user_id: currentUser.id, post_id: content.source_id })
        }
        setIsLiked(true)
        toast.success('Berhasil disukai! ❤️')
      }
      onLike?.(content.source_id, content.source_type)
    } catch (error) {
      toast.error('Gagal memproses suka')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Login dulu untuk menyimpan')
      return
    }

    setLoading(true)
    try {
      if (isSaved) {
        if (content.source_type === 'nasa_apod') {
          await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('apod_id', content.source_id)
        } else {
          await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('post_id', content.source_id)
        }
        setIsSaved(false)
        toast.success('Dihapus dari koleksi')
      } else {
        if (content.source_type === 'nasa_apod') {
          await supabase
            .from('bookmarks')
            .insert({ 
              user_id: currentUser.id, 
              bookmark_type: 'apod',
              apod_id: content.source_id,
              title: content.title,
              image_url: currentImageUrl,
              apod_date: content.original_created_at,
              apod_explanation: content.description
            })
        } else {
          await supabase
            .from('bookmarks')
            .insert({ 
              user_id: currentUser.id, 
              bookmark_type: 'post',
              post_id: content.source_id,
              title: content.title,
              image_url: currentImageUrl
            })
        }
        setIsSaved(true)
        toast.success('Disimpan ke koleksi! 📌')
      }
      onSave?.(content.source_id, content.source_type)
    } catch (error) {
      toast.error('Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = content.source_type === 'nasa_apod'
      ? `${window.location.origin}/nasa?date=${content.source_id}`
      : `${window.location.origin}/post/${content.source_id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title || 'StellarHub',
          text: content.description || 'Lihat konten ini di StellarHub',
          url: url
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link disalin! 📋')
    }
  }

  const handleDownload = async () => {
    if (!currentImageUrl) {
      toast.error('Tidak ada gambar untuk diunduh')
      return
    }

    try {
      const response = await fetch(currentImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${content.title?.replace(/\s+/g, '-') || 'stellarhub'}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Gambar diunduh! ⬇️')
    } catch (error) {
      toast.error('Gagal mengunduh gambar')
    }
  }

  // Handle share ke postingan
  const handleShareToPost = async () => {
    if (!currentUser) {
      toast.error('Login dulu untuk posting!')
      return
    }

    setPosting(true)
    try {
      // Format tanggal Indonesia
      const dateObj = new Date(content.original_created_at)
      const formattedDate = dateObj.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      // Gabungkan deskripsi dengan komen user
      const userComment = postContent ? `\n\n**Komentar saya:**\n${postContent}` : ''
      
      const fullContent = `🌌 **${content.title || 'Gambar NASA'}**\n\n📅 **Tanggal:** ${formattedDate}\n📸 **Sumber:** ${content.author_name || 'NASA'}\n🏷️ **Kategori:** ${content.source_type === 'nasa_apod' ? '#NASA' : '#Komunitas'}\n\n📝 **Deskripsi:**\n${content.description || ''}${userComment}\n\n${content.tags?.map(t => `#${t}`).join(' ') || '#RuangAngkasa #Astronomi'}`

      // Simpan ke tabel posts
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: currentUser.id,
            title: `Jelajah: ${content.title || 'Gambar'}`,
            content: fullContent,
            image_url: currentImageUrl,
            category: 'explore'
          }
        ])
      
      if (error) throw error
      
      setShowPostModal(false)
      setPostContent('')
      toast.success('Berhasil diposting ke feed! 🚀')
      
    } catch (error) {
      console.error('Error posting:', error)
      toast.error('Gagal memposting. Coba lagi!')
    } finally {
      setPosting(false)
    }
  }

  const handleImageError = () => {
    console.log('Gambar error, pakai cadangan')
    setImageError(false)
    setCurrentImageUrl(FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)])
  }

  const timeAgo = formatDistanceToNow(new Date(content.original_created_at), {
    addSuffix: true,
    locale: id
  })

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[1000]" onClick={onClose}>
        <style>{`
          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            animation: fadeIn 0.2s ease;
          }
          .modal-container {
            position: fixed;
            inset: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            animation: scaleIn 0.3s ease;
          }
          .modal-content {
            max-width: 1000px;
            width: 100%;
            max-height: 90vh;
            background: rgba(18,18,24,0.98);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 32px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          }
          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            background: rgba(18,18,24,0.98);
          }
          .modal-header h2 {
            font-size: 20px;
            font-weight: 700;
            color: white;
            margin: 0;
            font-family: 'Archivo Black', sans-serif;
          }
          .modal-body {
            flex: 1;
            overflow-y: auto;
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
            min-height: 300px;
            max-height: 400px;
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 24px;
            background: linear-gradient(45deg, #1a1a2e, #16213e);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            max-height: 400px;
          }
          .image-fallback {
            width: 100%;
            height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #7c3aed, #0ea5e9);
            color: white;
            font-size: 64px;
          }
          .image-loader {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.5);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(124,58,237,0.3);
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }
          .info-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 16px;
          }
          .info-label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: rgba(255,255,255,0.5);
            font-size: 12px;
            margin-bottom: 8px;
          }
          .info-value {
            color: white;
            font-size: 14px;
            font-weight: 500;
          }
          .description-box {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .description-box h3 {
            font-size: 16px;
            font-weight: 700;
            color: white;
            margin-bottom: 12px;
            font-family: 'Archivo Black', sans-serif;
          }
          .description-box p {
            color: rgba(255,255,255,0.8);
            line-height: 1.8;
            font-size: 14px;
            white-space: pre-wrap;
          }
          .keywords {
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
            font-weight: 600;
            color: #a78bfa;
          }
          .action-buttons {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 24px;
          }
          .modal-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }
          .modal-btn-primary {
            background: linear-gradient(135deg, #7c3aed, #0ea5e9);
            color: white;
          }
          .modal-btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(124,58,237,0.3);
          }
          .modal-btn-secondary {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
          }
          .modal-btn-secondary:hover {
            background: rgba(255,255,255,0.1);
          }
          .modal-btn.liked {
            background: #f472b6;
          }
          .modal-btn.saved {
            background: #fbbf24;
          }
          .modal-btn.post-btn {
            background: rgba(16,185,129,0.1);
            border: 1px solid rgba(16,185,129,0.3);
            color: #10b981;
          }
          .modal-btn.post-btn:hover {
            background: rgba(16,185,129,0.2);
          }
          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
          }
          
          /* Post Modal */
          .post-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 1100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .post-modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.9);
            backdrop-filter: blur(16px);
          }
          .post-modal-content {
            position: relative;
            z-index: 10;
            max-width: 500px;
            width: 100%;
            background: rgba(18,18,24,0.98);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 32px;
            overflow: hidden;
          }
          .post-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .post-modal-body {
            padding: 24px;
          }
          .post-preview-image {
            width: 100%;
            height: 160px;
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 16px;
          }
          .post-preview-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .post-info {
            background: rgba(255,255,255,0.03);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            font-size: 13px;
            color: rgba(255,255,255,0.7);
          }
          .post-info div {
            margin-bottom: 4px;
          }
          .post-textarea {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 14px;
            color: white;
            font-size: 14px;
            resize: none;
            outline: none;
            margin-bottom: 16px;
          }
          .post-textarea:focus {
            border-color: #8b5cf6;
          }
          .post-preview {
            background: rgba(255,255,255,0.03);
            border: 1px dashed rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            font-size: 13px;
            color: rgba(255,255,255,0.6);
          }
          .post-preview strong {
            color: #8b5cf6;
          }
          .post-actions {
            display: flex;
            gap: 12px;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div className="modal-backdrop" />
        
        <div className="modal-container">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{content.title || 'Detail Konten'}</h2>
              <button className="close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Image dengan fallback yang pasti muncul */}
              <div className="modal-image">
                {!imageLoaded && (
                  <div className="image-loader">
                    <div className="spinner" />
                  </div>
                )}
                <img
                  src={currentImageUrl}
                  alt={content.title || 'Gambar luar angkasa'}
                  onLoad={() => setImageLoaded(true)}
                  onError={handleImageError}
                  style={{ display: imageLoaded ? 'block' : 'none' }}
                />
                {!imageLoaded && (
                  <div className="image-fallback">
                    <ImageIcon size={64} />
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">
                    <Calendar size={14} />
                    <span>Tanggal</span>
                  </div>
                  <div className="info-value">
                    {new Date(content.original_created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <User size={14} />
                    <span>Penulis</span>
                  </div>
                  <div className="info-value">
                    {content.author_name || (content.source_type === 'nasa_apod' ? 'NASA' : 'Anonim')}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <Globe size={14} />
                    <span>Sumber</span>
                  </div>
                  <div className="info-value">
                    {content.source_type === 'nasa_apod' ? 'NASA APOD' : 'Postingan Komunitas'}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <Clock size={14} />
                    <span>Diposting</span>
                  </div>
                  <div className="info-value">
                    {timeAgo}
                  </div>
                </div>
              </div>

              {/* Description */}
              {content.description && (
                <div className="description-box">
                  <h3>Deskripsi</h3>
                  <p>{content.description}</p>
                </div>
              )}

              {/* Keywords */}
              {content.tags && content.tags.length > 0 && (
                <div className="keywords">
                  {content.tags.map((tag, i) => (
                    <span key={i} className="keyword">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className={`modal-btn ${isLiked ? 'liked' : 'modal-btn-secondary'}`}
                  onClick={handleLike}
                  disabled={loading}
                >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                  {isLiked ? 'Disukai' : 'Suka'} ({content.likes_count + (isLiked ? 1 : 0)})
                </button>

                <button
                  className={`modal-btn ${isSaved ? 'saved' : 'modal-btn-secondary'}`}
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Tersimpan' : 'Simpan'}
                </button>

                <button
                  className="modal-btn modal-btn-secondary"
                  onClick={handleShare}
                >
                  <Share2 size={18} />
                  Bagikan
                </button>

                {currentImageUrl && (
                  <button
                    className="modal-btn modal-btn-secondary"
                    onClick={handleDownload}
                  >
                    <Download size={18} />
                    Unduh
                  </button>
                )}

                <button
                  className="modal-btn post-btn"
                  onClick={() => setShowPostModal(true)}
                >
                  <Users size={18} />
                  Posting ke Feed
                </button>

                <a
                  href={content.source_type === 'nasa_apod'
                    ? `/nasa?date=${content.source_id}`
                    : `/post/${content.source_id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-btn modal-btn-primary"
                  style={{ marginLeft: 'auto' }}
                >
                  <ExternalLink size={18} />
                  Buka Halaman
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="post-modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="post-modal-backdrop" />
          <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="post-modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Posting ke Feed</h3>
              <button className="close-btn" onClick={() => setShowPostModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="post-modal-body">
              {/* Preview Gambar */}
              <div className="post-preview-image">
                <img 
                  src={currentImageUrl} 
                  alt={content.title || ''}
                />
              </div>

              {/* Info */}
              <div className="post-info">
                <div><strong style={{ color: '#8b5cf6' }}>Judul:</strong> {content.title || 'Gambar NASA'}</div>
                <div><strong style={{ color: '#0ea5e9' }}>Tanggal:</strong> {new Date(content.original_created_at).toLocaleDateString('id-ID')}</div>
                <div><strong style={{ color: '#10b981' }}>Sumber:</strong> {content.author_name || 'NASA'}</div>
              </div>

              {/* Preview Deskripsi */}
              <div style={{ 
                background: 'rgba(124,58,237,0.1)', 
                borderLeft: '3px solid #8b5cf6',
                padding: 12,
                borderRadius: '0 12px 12px 0',
                marginBottom: 16,
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)'
              }}>
                <strong>📝 Deskripsi:</strong> {content.description?.substring(0, 120)}...
              </div>

              {/* Input Komentar */}
              <textarea
                className="post-textarea"
                placeholder="Tulis komentarmu tentang gambar ini... (opsional)"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={3}
              />

              {/* Preview Postingan */}
              <div className="post-preview">
                <strong>📋 Preview postingan:</strong><br/>
                <span style={{ color: '#8b5cf6' }}>{content.title}</span><br/>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                  {new Date(content.original_created_at).toLocaleDateString('id-ID')} • {content.author_name || 'NASA'}
                </span><br/>
                <span>{content.description?.substring(0, 80)}...</span>
                {postContent && (
                  <>
                    <br/>
                    <span style={{ color: '#0ea5e9' }}>💬 {postContent}</span>
                  </>
                )}
              </div>

              {/* Tombol */}
              <div className="post-actions">
                <button
                  className="modal-btn modal-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowPostModal(false)}
                >
                  Batal
                </button>
                <button
                  className="modal-btn modal-btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleShareToPost}
                  disabled={posting}
                >
                  {posting ? (
                    <><Loader2 size={16} className="animate-spin" /> Posting...</>
                  ) : (
                    <><Send size={16} /> Posting</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}