// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions
export const getPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (*),
      likes:likes(count),
      comments:comments(count),
      bookmarks:bookmarks(count)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createPost = async (userId: string, content: string, image?: string) => {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content,
      image,
      source: 'user'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const likePost = async (userId: string, postId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .insert({ user_id: userId, post_id: postId })
    .select()
    .single()
  
  if (error) {
    // Mungkin sudah dilike, coba unlike
    await supabase
      .from('likes')
      .delete()
      .match({ user_id: userId, post_id: postId })
    return null
  }
  
  return data
}

export const addComment = async (userId: string, postId: string, content: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: userId,
      post_id: postId,
      content
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const bookmarkPost = async (userId: string, postId: string) => {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, post_id: postId })
    .select()
    .single()
  
  if (error) {
    // Mungkin sudah dibookmark, coba unbookmark
    await supabase
      .from('bookmarks')
      .delete()
      .match({ user_id: userId, post_id: postId })
    return null
  }
  
  return data
}

export const getPostDetails = async (postId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (*),
      likes:likes(count),
      comments:comments(*, profiles:user_id (*)),
      bookmarks:bookmarks(count)
    `)
    .eq('id', postId)
    .single()
  
  if (error) throw error
  return data
}