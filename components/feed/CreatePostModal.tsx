// components/feed/CreatePostModal.tsx
'use client'

import { useState } from 'react'
import { X, Camera, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/app/contexts/AuthContext'

interface CreatePostModalProps {
  onPostCreated: () => void
}

export default function CreatePostModal({ onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreatePost = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu')
      return
    }
    
    if (!content.trim()) {
      toast.error('Post tidak boleh kosong')
      return
    }
    
    try {
      setIsCreating(true)
      
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          image: image,
          source: 'web'
        })
      
      if (error) throw error
      
      toast.success('Post berhasil dibuat')
      setContent('')
      setImage(null)
      
      // Close modal
      const modal = document.getElementById('create-post-modal')
      if (modal instanceof HTMLDialogElement) {
        modal.close()
      }
      
      // Refresh posts
      onPostCreated()
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Gagal membuat post')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <dialog id="create-post-modal" className="modal">
      <div className="modal-box glass-effect max-w-2xl border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create Post</h3>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Apa yang ingin kamu bagikan tentang alam semesta?"
            className="w-full h-40 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            rows={6}
          />
          
          {image && (
            <div className="relative">
              <img src={image} alt="Preview" className="rounded-xl max-h-64 object-cover w-full" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black p-2 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex gap-2">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => {
                  // Untuk upload gambar
                  toast.info('Fitur upload gambar akan segera hadir')
                }}
              >
                <Camera className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <form method="dialog">
                <button className="px-6 py-2 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
              </form>
              <button
                onClick={handleCreatePost}
                disabled={isCreating || !content.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}