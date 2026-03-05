'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    fetchPost();
    checkAuth();
  }, [postId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(username, avatar_url, full_name),
          likes(id, user_id),
          comments(id, content, created_at, user_id, profiles(username, avatar_url))
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);

      // Cek apakah user sudah like
      if (user) {
        const liked = data.likes?.some((l: any) => l.user_id === user.id);
        setIsLiked(!!liked);
      }

    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Postingan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Login dulu untuk like');
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        setIsLiked(false);
        toast.success('Like dihapus');
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
        setIsLiked(true);
        toast.success('Berhasil like! ❤️');
      }
    } catch (error) {
      toast.error('Gagal memproses like');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Login dulu untuk menyimpan');
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        setIsSaved(false);
        toast.success('Dihapus dari koleksi');
      } else {
        await supabase
          .from('bookmarks')
          .insert({ 
            post_id: postId, 
            user_id: user.id,
            bookmark_type: 'post'
          });
        setIsSaved(true);
        toast.success('Disimpan ke koleksi! 📌');
      }
    } catch (error) {
      toast.error('Gagal menyimpan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/20 border-t-purple-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Postingan tidak ditemukan</h1>
          <Link href="/explore" className="text-purple-400 hover:text-purple-300">
            Kembali ke Explore
          </Link>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: id
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        {/* Post card */}
        <div className="bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xl font-bold text-white">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  post.profiles?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{post.profiles?.username || 'Anonymous'}</h2>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock size={14} />
                  {timeAgo}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {post.title && (
              <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
            )}
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Image (if any) */}
          {post.image_url && (
            <div className="border-y border-white/10">
              <img
                src={post.image_url}
                alt={post.title || 'Post image'}
                className="w-full max-h-[500px] object-contain bg-black/50"
              />
            </div>
          )}

          {/* Actions */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  isLiked ? 'text-pink-500 bg-pink-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{post.likes?.length || 0}</span>
              </button>

              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  isSaved ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                <span>Simpan</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied! 📋');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}