'use client'

import { useState } from 'react'
import { Image as ImageIcon, Tag, Globe, X, Smile } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [imageUrl, setImageUrl] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle post submission
    console.log({ content, tags, privacy, imageUrl })
    setContent('')
    setTags([])
    setImageUrl('')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Simulate upload
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-500"></div>
          Buat Postingan Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/avatar.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500">
                SH
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Apa yang ingin Anda bagikan? Ceritakan pengamatan astronomi Anda..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] bg-gray-800 border-gray-700 text-white placeholder-gray-500 resize-none"
              />
              
              {imageUrl && (
                <div className="mt-4 relative">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setImageUrl('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className="flex items-center gap-1 bg-purple-900/30 text-purple-300"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gambar
                </Button>
              </label>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => document.getElementById('tag-input')?.focus()}
              >
                <Tag className="h-4 w-4 mr-2" />
                Tag
              </Button>
              
              <div className="flex items-center gap-2">
                <input
                  id="tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Tambahkan tag"
                  className="bg-gray-800 border border-gray-700 text-white px-3 py-1 rounded text-sm w-32"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddTag}
                  className="border-gray-700"
                >
                  Tambah
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Globe className="h-4 w-4 mr-2" />
                    {privacy === 'public' ? 'Publik' : 'Privat'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-gray-800 bg-gray-900">
                  <DropdownMenuItem onClick={() => setPrivacy('public')}>
                    🌍 Publik - Semua orang
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPrivacy('private')}>
                    🔒 Privat - Hanya pengikut
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                type="submit"
                disabled={!content.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Posting
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}