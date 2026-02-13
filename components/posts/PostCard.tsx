'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  Heart, MessageSquare, Share2, MoreVertical, 
  Bookmark, Send, ExternalLink 
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PostCardProps {
  post: {
    id: string
    username: string
    avatar: string
    time: string
    content: string
    imageUrl?: string
    likes: number
    comments: number
    shares: number
    tags: string[]
    isLiked?: boolean
    isBookmarked?: boolean
  }
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setIsLiked(!isLiked)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-800">
              <AvatarImage src={post.avatar} alt={post.username} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-500">
                {post.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">{post.username}</h3>
                <Badge variant="outline" className="text-xs border-blue-700 text-blue-300">
                  Astronomer
                </Badge>
              </div>
              <p className="text-gray-400 text-sm">
                {format(new Date(post.time), 'dd MMM yyyy • HH:mm', { locale: id })}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-gray-800 bg-gray-900">
              <DropdownMenuItem onClick={handleBookmark}>
                <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? 'text-yellow-400' : ''}`} />
                {isBookmarked ? 'Hapus bookmark' : 'Simpan'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                Buka di tab baru
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-400">
                Laporkan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-300 mb-4 whitespace-pre-line">{post.content}</p>
        
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            />
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-purple-900/30 text-purple-300 hover:bg-purple-800/40 cursor-pointer"
            >
              #{tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${isLiked ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span>{post.shares}</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`${isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}