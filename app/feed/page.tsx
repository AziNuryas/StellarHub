'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Share2, Bookmark, Send,
  Image as ImageIcon, X, TrendingUp, Zap, Clock,
  Sparkles, MoreHorizontal, Loader2, Globe,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles: { username: string; avatar_url: string };
}
interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  profiles: { username: string; avatar_url: string };
  likes: { id: string; user_id: string }[];
  comments: Comment[];
}

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${day}d ago`;
}

const AV_GRADS = [
  'linear-gradient(135deg,#7c3aed,#4f46e5)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
];
const avGrad = (s = '') => AV_GRADS[(s.charCodeAt(0) || 65) % AV_GRADS.length];

function Av({ name = 'A', size = 40 }: { name?: string; size?: number }) {
  const r = Math.round(size * 0.28);
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: avGrad(name), flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: '#fff', userSelect: 'none',
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function renderText(text: string) {
  return text.split(/(\s+)/).map((w, i) =>
    w.startsWith('#') || w.startsWith('@')
      ? <span key={i} style={{ color: '#818cf8', fontWeight: 500 }}>{w}</span>
      : w
  );
}

/* ══════════════════════════════════════════════════════
   SKELETON
══════════════════════════════════════════════════════ */
function Skeleton() {
  return (
    <div className="fd-card" style={{ padding: '20px 22px' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ marginBottom: i < 2 ? 28 : 0 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
            <div className="sk" style={{ width:42,height:42,borderRadius:12 }} />
            <div style={{flex:1}}>
              <div className="sk" style={{ width:'35%',height:11,borderRadius:5,marginBottom:8 }} />
              <div className="sk" style={{ width:'20%',height:9,borderRadius:5 }} />
            </div>
          </div>
          <div className="sk" style={{ width:'100%',height:13,borderRadius:5,marginBottom:8 }} />
          <div className="sk" style={{ width:'68%',height:13,borderRadius:5 }} />
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMMENT ROW
══════════════════════════════════════════════════════ */
function CommentRow({ c }: { c: Comment }) {
  return (
    <div style={{ display:'flex', gap:10, padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <Av name={c.profiles?.username || 'A'} size={30} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
          <span style={{ fontSize:13, fontWeight:600, color:'rgba(220,225,255,0.9)' }}>
            {c.profiles?.username || 'Explorer'}
          </span>
          <span style={{ fontSize:11, color:'rgba(120,125,170,0.5)' }}>
            {timeAgo(c.created_at)}
          </span>
        </div>
        <p style={{ fontSize:13.5, color:'rgba(190,195,238,0.78)', lineHeight:1.62, margin:0, wordBreak:'break-word' }}>
          {renderText(c.content)}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   POST CARD
══════════════════════════════════════════════════════ */
function PostCard({
  post, currentUser, onLike, onComment,
}: {
  post: Post;
  currentUser: any;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => Promise<void>;
}) {
  const [showComments, setShowComments] = useState(false);
  const [cmtText, setCmtText]           = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [saved, setSaved]               = useState(false);
  const [imgErr, setImgErr]             = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLiked   = post.likes?.some(l => l.user_id === currentUser?.id) ?? false;
  const likeCount = post.likes?.length ?? 0;
  const cmtCount  = post.comments?.length ?? 0;

  const openComments = () => {
    setShowComments(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const submitCmt = async () => {
    const t = cmtText.trim();
    if (!t || submitting) return;
    setSubmitting(true);
    await onComment(post.id, t);
    setCmtText('');
    setSubmitting(false);
  };

  return (
    <article className="fd-card" style={{ marginBottom:12, overflow:'hidden' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <Av name={post.profiles?.username || 'A'} size={42} />
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'rgba(225,230,255,0.95)', letterSpacing:'-0.01em' }}>
              {post.profiles?.username || 'Anonymous Explorer'}
            </div>
            <div style={{ fontSize:11.5, color:'rgba(120,125,170,0.52)', marginTop:2, display:'flex', alignItems:'center', gap:5 }}>
              <Clock style={{ width:10,height:10 }} />
              {timeAgo(post.created_at)}
              <Globe style={{ width:9,height:9,marginLeft:2 }} />
            </div>
          </div>
        </div>
        <button className="fd-icon-btn">
          <MoreHorizontal style={{ width:16,height:16 }} />
        </button>
      </div>

      {/* ── Content ── */}
      {post.content && (
        <div style={{ padding:'0 20px 14px', fontSize:14.5, lineHeight:1.72, color:'rgba(200,205,242,0.82)', wordBreak:'break-word' }}>
          {renderText(post.content)}
        </div>
      )}

      {/* ── Image ── */}
      {post.image_url && !imgErr && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <img
            src={post.image_url}
            alt="Post"
            onError={() => setImgErr(true)}
            style={{ width:'100%', maxHeight:440, objectFit:'cover', display:'block' }}
          />
        </div>
      )}

      {/* ── Like/comment count ── */}
      {(likeCount > 0 || cmtCount > 0) && (
        <div style={{
          padding:'8px 20px',
          fontSize:12.5, color:'rgba(120,125,170,0.55)',
          display:'flex', gap:14,
          borderTop: !post.image_url || imgErr ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}>
          {likeCount > 0 && (
            <span>{likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}</span>
          )}
          {cmtCount > 0 && (
            <button
              onClick={() => setShowComments(v => !v)}
              style={{ background:'none',border:'none',cursor:'pointer',color:'rgba(120,125,170,0.55)',fontSize:12.5,padding:0 }}
            >
              {cmtCount.toLocaleString()} {cmtCount === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      )}

      {/* ── Action bar ── */}
      <div className="act-bar">
        <button
          className={`fd-act like${isLiked ? ' liked' : ''}`}
          onClick={() => onLike(post.id)}
        >
          <Heart style={{ width:17,height:17 }} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
          Like
        </button>
        <button className="fd-act comment" onClick={openComments}>
          <MessageCircle style={{ width:17,height:17 }} />
          Comment
        </button>
        <button className="fd-act share">
          <Share2 style={{ width:17,height:17 }} />
          Share
        </button>
        <div style={{ flex:1 }} />
        <button
          className={`fd-act save${saved ? ' saved' : ''}`}
          onClick={() => { setSaved(v => !v); toast.success(saved ? 'Removed from saved' : 'Saved!'); }}
        >
          <Bookmark style={{ width:17,height:17 }} fill={saved ? 'currentColor' : 'none'} strokeWidth={saved ? 0 : 2} />
        </button>
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.055)', padding:'4px 20px 16px' }}>
          {post.comments?.length > 0 && (
            <div>
              {post.comments.map(c => <CommentRow key={c.id} c={c} />)}
            </div>
          )}
          {currentUser ? (
            <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:14 }}>
              <Av name={currentUser?.user_metadata?.username || currentUser?.email || 'A'} size={32} />
              <div style={{
                flex:1, display:'flex', alignItems:'center',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.09)',
                borderRadius:40, padding:'0 6px 0 16px',
                transition:'border-color 0.2s',
              }}>
                <input
                  ref={inputRef}
                  value={cmtText}
                  onChange={e => setCmtText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitCmt(); } }}
                  placeholder="Write a comment… (Enter to send)"
                  style={{
                    flex:1, background:'none', border:'none', outline:'none',
                    color:'rgba(210,215,248,0.85)', fontSize:13.5, fontFamily:'inherit',
                    padding:'10px 0',
                  }}
                />
                <button
                  onClick={submitCmt}
                  disabled={!cmtText.trim() || submitting}
                  style={{
                    background:'none', border:'none', cursor:'pointer', padding:'6px 10px',
                    color: cmtText.trim() ? '#818cf8' : 'rgba(120,125,175,0.3)',
                    display:'flex', alignItems:'center', flexShrink:0,
                    transition:'color 0.2s',
                  }}
                >
                  {submitting
                    ? <Loader2 style={{ width:15,height:15,animation:'spin 1s linear infinite' }} />
                    : <Send style={{ width:15,height:15 }} />
                  }
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize:13, color:'rgba(120,125,170,0.5)', textAlign:'center', padding:'14px 0 0' }}>
              Login to leave a comment
            </p>
          )}
        </div>
      )}
    </article>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function FeedPage() {
  const supabase = createClient();
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [content,   setContent]   = useState('');
  const [imageUrl,  setImageUrl]  = useState('');
  const [imgFile,   setImgFile]   = useState<File | null>(null);
  const [imgPrev,   setImgPrev]   = useState('');
  const [user,      setUser]      = useState<any>(null);
  const [sending,   setSending]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrl,   setShowUrl]   = useState(false);
  const [tab,       setTab]       = useState<'latest'|'trending'>('latest');
  const taRef   = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchUser(); fetchPosts(); }, []);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 280) + 'px';
  }, [content]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(username, avatar_url),
          likes(id, user_id),
          comments(
            id, content, created_at, user_id, post_id,
            profiles(username, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('Max image size is 8 MB'); return; }
    setImgFile(file);
    setImgPrev(URL.createObjectURL(file));
    setImageUrl('');
    setShowUrl(false);
  };

  const clearImage = () => {
    setImgFile(null);
    setImgPrev('');
    setImageUrl('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext  = file.name.split('.').pop() || 'jpg';
    const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCreatePost = async () => {
    if (!content.trim() && !imgFile && !imageUrl) {
      toast.error('Write something or add an image');
      return;
    }
    if (!user) { toast.error('Please login first'); return; }
    setSending(true);
    try {
      let finalImg = imageUrl || '';
      if (imgFile) {
        setUploading(true);
        finalImg = await uploadImage(imgFile);
        setUploading(false);
      }
      const { error } = await supabase.from('posts').insert({
        content:   content.trim(),
        user_id:   user.id,
        title:     content.trim().slice(0, 80) || 'Post',
        image_url: finalImg || null,
      });
      if (error) throw error;
      toast.success('Post shared! 🚀');
      setContent('');
      clearImage();
      fetchPosts();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to post');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  /* optimistic like */
  const handleLike = async (postId: string) => {
    if (!user) { toast.error('Login to like posts'); return; }
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const already = p.likes.some(l => l.user_id === user.id);
      return {
        ...p,
        likes: already
          ? p.likes.filter(l => l.user_id !== user.id)
          : [...p.likes, { id: 'opt', user_id: user.id }],
      };
    }));
    try {
      const { data: ex } = await supabase
        .from('likes').select('id')
        .eq('post_id', postId).eq('user_id', user.id).single();
      if (ex) await supabase.from('likes').delete().eq('id', ex.id);
      else    await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      fetchPosts();
    } catch { fetchPosts(); }
  };

  /* comment with optimistic update */
  const handleComment = async (postId: string, text: string) => {
    if (!user) { toast.error('Login to comment'); return; }
    const optimistic: Comment = {
      id: 'opt-' + Date.now(),
      content: text,
      created_at: new Date().toISOString(),
      user_id: user.id,
      post_id: postId,
      profiles: {
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'You',
        avatar_url: '',
      },
    };
    setPosts(prev => prev.map(p =>
      p.id !== postId ? p : { ...p, comments: [...(p.comments || []), optimistic] }
    ));
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId, user_id: user.id, content: text,
      });
      if (error) throw error;
      fetchPosts();
    } catch {
      toast.error('Failed to comment');
      fetchPosts();
    }
  };

  const canPost = !!user && !sending && (!!content.trim() || !!imgFile || !!imageUrl);

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div className="fd-root">
      <style>{`
        .fd-root {
          min-height: 100svh;
          padding: 80px 16px 80px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
          color: #f0f0ff;
        }
        .fd-wrap {
          max-width: 1060px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (min-width: 900px) {
          .fd-wrap { grid-template-columns: 1fr 285px; }
        }

        /* glass */
        .fd-card {
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: border-color 0.25s;
        }
        .fd-card:hover { border-color: rgba(255,255,255,0.12); }

        /* tab bar */
        .fd-tabs {
          display: flex; gap: 4px; padding: 5px;
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 15px; margin-bottom: 14px;
          backdrop-filter: blur(14px);
        }
        .fd-tab {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 9px; border-radius: 10px;
          font-size: 13.5px; font-weight: 600; letter-spacing: -0.01em;
          color: rgba(155,160,210,0.6);
          cursor: pointer; border: none; background: none;
          font-family: inherit;
          transition: all 0.22s;
        }
        .fd-tab.active {
          background: rgba(124,58,237,0.18);
          border: 1px solid rgba(124,58,237,0.28);
          color: rgba(210,205,255,0.95);
        }
        .fd-tab:not(.active):hover {
          background: rgba(255,255,255,0.05);
          color: rgba(210,215,255,0.8);
        }

        /* compose */
        .fd-compose { padding: 18px 20px; margin-bottom: 14px; }

        .fd-ta {
          width: 100%; background: transparent;
          border: none; outline: none; resize: none;
          color: rgba(220,225,255,0.88);
          font-size: 15px; font-family: inherit; line-height: 1.65;
          min-height: 52px; max-height: 280px; overflow-y: auto;
          padding: 0;
        }
        .fd-ta::placeholder { color: rgba(125,130,180,0.45); }

        .img-prev {
          position: relative; margin-top: 14px;
          border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08); max-height: 320px;
        }
        .img-prev img { width: 100%; max-height: 320px; object-fit: cover; display: block; }
        .img-prev-rm {
          position: absolute; top: 8px; right: 8px;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(0,0,0,0.72); border: none; color: #fff;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .img-prev-rm:hover { background: rgba(220,38,38,0.85); }

        .url-in {
          width: 100%; margin-top: 10px; padding: 9px 13px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 10px;
          color: rgba(215,220,255,0.85); font-size: 13.5px; font-family: inherit;
          outline: none; transition: border-color 0.2s;
        }
        .url-in:focus { border-color: rgba(124,58,237,0.45); }
        .url-in::placeholder { color: rgba(115,120,170,0.42); }

        .compose-sep { height: 1px; background: rgba(255,255,255,0.065); margin: 14px 0; }
        .compose-bot {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 8px;
        }
        .compose-tools { display: flex; gap: 2px; }
        .c-tool {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 11px; border-radius: 9px;
          font-size: 13px; font-weight: 500; font-family: inherit;
          color: rgba(145,150,200,0.65);
          cursor: pointer; border: none; background: none;
          transition: background 0.18s, color 0.18s;
        }
        .c-tool:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: rgba(200,205,250,0.88); }
        .c-tool:disabled { opacity: 0.35; cursor: not-allowed; }
        .c-tool.active { color: #818cf8; }

        .post-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 22px; border-radius: 12px;
          font-size: 13.5px; font-weight: 700; font-family: inherit;
          color: #fff; cursor: pointer; border: none;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          transition: transform 0.2s, box-shadow 0.25s, opacity 0.2s;
        }
        .post-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.04);
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
        }
        .post-btn:disabled { opacity: 0.42; cursor: not-allowed; transform: none; }

        /* action bar */
        .act-bar {
          display: flex; align-items: center; padding: 5px 10px;
          border-top: 1px solid rgba(255,255,255,0.055); gap: 2px;
        }
        .fd-act {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 13px; border-radius: 10px;
          font-size: 13px; font-weight: 500; font-family: inherit;
          color: rgba(140,145,195,0.7);
          cursor: pointer; border: none; background: none;
          transition: all 0.2s;
        }
        .fd-act:hover        { background: rgba(255,255,255,0.05); }
        .fd-act.like:hover   { color: #f472b6; background: rgba(244,114,182,0.08); }
        .fd-act.liked        { color: #f472b6; }
        .fd-act.liked:hover  { background: rgba(244,114,182,0.1); }
        .fd-act.comment:hover{ color: #38bdf8; background: rgba(56,189,248,0.08); }
        .fd-act.share:hover  { color: #34d399; background: rgba(52,211,153,0.08); }
        .fd-act.save:hover   { color: #fbbf24; background: rgba(251,191,36,0.08); }
        .fd-act.saved        { color: #fbbf24; }

        @keyframes heartPop {
          0%{transform:scale(1)} 45%{transform:scale(1.5)} 70%{transform:scale(0.9)} 100%{transform:scale(1)}
        }
        .liked svg { animation: heartPop 0.35s ease both; }

        /* icon btn */
        .fd-icon-btn {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(140,145,195,0.4);
          cursor: pointer; border: none; background: none;
          transition: background 0.2s, color 0.2s;
        }
        .fd-icon-btn:hover { background: rgba(255,255,255,0.06); color: rgba(210,215,255,0.8); }

        /* skeleton */
        .sk { background: rgba(255,255,255,0.06); animation: sk-sh 1.7s ease-in-out infinite; }
        @keyframes sk-sh { 0%,100%{opacity:.45} 50%{opacity:.9} }

        /* card entrance */
        article.fd-card { animation: cardIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes cardIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        article.fd-card:nth-child(1){animation-delay:.04s}
        article.fd-card:nth-child(2){animation-delay:.09s}
        article.fd-card:nth-child(3){animation-delay:.14s}
        article.fd-card:nth-child(4){animation-delay:.19s}
        article.fd-card:nth-child(n+5){animation-delay:.24s}

        @keyframes spin { to{transform:rotate(360deg)} }

        /* sidebar */
        .fd-sidebar { display: flex; flex-direction: column; gap: 14px; }
        .side-card {
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 18px;
          backdrop-filter: blur(14px);
        }
        .side-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.16em; color: rgba(140,145,195,0.5);
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .side-tl { flex:1; height:1px; background:rgba(255,255,255,0.06); }

        .trend-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 10px; border-radius: 11px;
          cursor: pointer; text-decoration: none;
          transition: background 0.18s;
        }
        .trend-item:hover { background: rgba(255,255,255,0.05); }
        .trend-tag  { font-size: 14px; font-weight: 600; color: rgba(196,181,253,0.88); }
        .trend-n    { font-size: 11px; font-weight: 700; color: rgba(115,120,165,0.4); width:18px; }
        .trend-cnt  { font-size: 11px; color: rgba(120,125,170,0.5); }

        .fl-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
        .fl-info { flex:1; min-width:0; }
        .fl-name { font-size: 13.5px; font-weight: 600; color: rgba(215,220,255,0.9); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .fl-sub  { font-size: 11.5px; color: rgba(120,125,170,0.5); margin-top:2px; }
        .fl-btn  {
          padding: 5px 13px; border-radius: 8px; font-size: 12px; font-weight: 600;
          color: rgba(196,181,253,0.88); border: 1px solid rgba(124,58,237,0.3);
          background: rgba(124,58,237,0.09); cursor: pointer; white-space: nowrap;
          font-family: inherit; transition: all 0.2s;
        }
        .fl-btn:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.5); }

        .live-dot {
          width:7px; height:7px; border-radius:50%;
          background:#10b981; box-shadow:0 0 8px #10b981;
          display:inline-block; flex-shrink:0;
          animation: lp 2s ease-in-out infinite;
        }
        @keyframes lp { 0%,100%{box-shadow:0 0 6px rgba(16,185,129,.7)} 50%{box-shadow:0 0 14px rgba(16,185,129,.9),0 0 24px rgba(16,185,129,.3)} }

        .act-row {
          display: flex; align-items: flex-start; gap: 10px; padding: 9px 0;
          border-bottom: 1px solid rgba(255,255,255,0.045);
          font-size: 12.5px; color: rgba(170,175,220,0.72); line-height: 1.5;
        }
        .act-row:last-child { border-bottom:none; }
        .act-hl   { color: rgba(196,181,253,0.9); font-weight:600; }
        .act-time { font-size:10.5px; color:rgba(115,120,165,0.5); flex-shrink:0; margin-left:auto; padding-top:2px; }

        .empty-state { text-align:center; padding:56px 24px; }
        .empty-emoji { font-size:48px; margin-bottom:18px; animation:floatY 3s ease-in-out infinite; }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .empty-title { font-size:1.4rem; font-weight:700; color:rgba(215,220,255,0.88); margin-bottom:8px; }
        .empty-sub   { font-size:14px; color:rgba(125,130,180,0.6); line-height:1.65; }

        @media (prefers-reduced-motion: reduce) {
          article.fd-card,.empty-emoji,.live-dot,.sk{animation:none!important}
        }
      `}</style>

      <div className="fd-wrap">
        {/* ══ FEED COLUMN ════════════════════════════════ */}
        <div>
          {/* Tab */}
          <div className="fd-tabs">
            <button className={`fd-tab${tab==='latest'?' active':''}`} onClick={()=>setTab('latest')}>
              <Clock style={{width:13,height:13}}/> Latest
            </button>
            <button className={`fd-tab${tab==='trending'?' active':''}`} onClick={()=>setTab('trending')}>
              <TrendingUp style={{width:13,height:13}}/> Trending
            </button>
          </div>

          {/* Compose */}
          <div className="fd-card fd-compose">
            <div style={{display:'flex',gap:12}}>
              <Av name={user?.user_metadata?.username || user?.email || 'A'} size={42} />
              <div style={{flex:1,minWidth:0}}>
                <textarea
                  ref={taRef}
                  className="fd-ta"
                  placeholder={user ? "What's happening in the cosmos?" : 'Login to share your observations…'}
                  value={content}
                  onChange={e=>setContent(e.target.value)}
                  disabled={!user}
                  maxLength={2000}
                  rows={1}
                />

                {/* File preview */}
                {imgPrev && (
                  <div className="img-prev">
                    <img src={imgPrev} alt="Preview" />
                    <button className="img-prev-rm" onClick={clearImage}>
                      <X style={{width:12,height:12}}/>
                    </button>
                  </div>
                )}

                {/* URL input */}
                {showUrl && !imgPrev && (
                  <input
                    className="url-in"
                    placeholder="Paste image URL (https://…)"
                    value={imageUrl}
                    onChange={e=>setImageUrl(e.target.value)}
                  />
                )}

                <div className="compose-sep"/>
                <div className="compose-bot">
                  <div className="compose-tools">
                    <button
                      className={`c-tool${imgPrev?' active':''}`}
                      onClick={()=>fileRef.current?.click()}
                      disabled={!user}
                      title="Upload photo"
                    >
                      <ImageIcon style={{width:15,height:15}}/> Photo
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFilePick}/>
                    <button
                      className={`c-tool${showUrl?' active':''}`}
                      onClick={()=>{if(!imgPrev) setShowUrl(v=>!v);}}
                      disabled={!user||!!imgPrev}
                      title="Add image URL"
                    >
                      <Globe style={{width:14,height:14}}/> URL
                    </button>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {content.length > 1800 && (
                      <span style={{fontSize:11,fontWeight:600,color:content.length>1950?'#ef4444':'#f97316'}}>
                        {2000-content.length}
                      </span>
                    )}
                    <button className="post-btn" onClick={handleCreatePost} disabled={!canPost}>
                      {uploading
                        ? <><Loader2 style={{width:13,height:13,animation:'spin 1s linear infinite'}}/>Uploading…</>
                        : sending
                        ? <><Loader2 style={{width:13,height:13,animation:'spin 1s linear infinite'}}/>Posting…</>
                        : <><Send style={{width:13,height:13}}/>Post</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {loading ? <Skeleton/> :
           posts.length===0 ? (
            <div className="fd-card empty-state">
              <div className="empty-emoji">🌌</div>
              <h3 className="empty-title">The cosmos awaits</h3>
              <p className="empty-sub">No posts yet — be the first to share an astronomical discovery!</p>
            </div>
          ) : posts.map(p=>(
            <PostCard key={p.id} post={p} currentUser={user} onLike={handleLike} onComment={handleComment}/>
          ))}
        </div>

        {/* ══ SIDEBAR ════════════════════════════════════ */}
        <aside className="fd-sidebar">
          {/* NASA widget */}
          <div className="side-card" style={{padding:0,overflow:'hidden'}}>
            <div style={{
              height:108,background:'linear-gradient(135deg,rgba(124,58,237,.28),rgba(14,165,233,.18))',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:42,
              borderBottom:'1px solid rgba(255,255,255,.07)',
            }}>🔭</div>
            <div style={{padding:'14px 16px'}}>
              <div style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'0.2em',fontWeight:700,color:'rgba(56,189,248,.8)',marginBottom:5}}>
                NASA · APOD Today
              </div>
              <div style={{fontSize:15,fontWeight:700,color:'rgba(225,230,255,.9)',marginBottom:10,lineHeight:1.3}}>
                Astronomy Picture of the Day
              </div>
              <a href="/nasa" style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:12,fontWeight:600,color:'rgba(56,189,248,.8)',textDecoration:'none'}}>
                <Zap style={{width:11,height:11}}/> View Today's Image
              </a>
            </div>
          </div>

          {/* Trending */}
          <div className="side-card">
            <div className="side-title">
              <TrendingUp style={{width:11,height:11}}/> Trending Topics <span className="side-tl"/>
            </div>
            {[
              {tag:'#MarsRover',  cnt:'4.2k'},
              {tag:'#APOD',       cnt:'3.1k'},
              {tag:'#DeepSpace',  cnt:'2.8k'},
              {tag:'#Astrophoto', cnt:'1.9k'},
              {tag:'#ISS',        cnt:'1.4k'},
            ].map((t,i)=>(
              <a key={t.tag} href="#" className="trend-item">
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span className="trend-n">{i+1}</span>
                  <span className="trend-tag">{t.tag}</span>
                </div>
                <span className="trend-cnt">{t.cnt} posts</span>
              </a>
            ))}
          </div>

          {/* Suggested */}
          <div className="side-card">
            <div className="side-title">
              <Sparkles style={{width:11,height:11}}/> Suggested <span className="side-tl"/>
            </div>
            {[
              {name:'Cassini_Fan',  sub:'12.4k followers'},
              {name:'NebulaHunter', sub:'8.9k followers' },
              {name:'StargazerX',   sub:'5.2k followers' },
            ].map(u=>(
              <div key={u.name} className="fl-item">
                <Av name={u.name} size={36}/>
                <div className="fl-info">
                  <div className="fl-name">{u.name}</div>
                  <div className="fl-sub">{u.sub}</div>
                </div>
                <button className="fl-btn">Follow</button>
              </div>
            ))}
          </div>

          {/* Live activity */}
          <div className="side-card">
            <div className="side-title">
              <span className="live-dot"/> Live Activity <span className="side-tl"/>
            </div>
            {[
              {av:'Orion',  name:'Orion_M',  txt:'posted a new APOD observation', time:'2m'},
              {av:'Galaxy', name:'GalaxyG',  txt:'liked your post',               time:'5m'},
              {av:'Nebula', name:'NebulaN',  txt:'started following you',         time:'11m'},
            ].map((a,i)=>(
              <div key={i} className="act-row">
                <Av name={a.av} size={28}/>
                <span style={{flex:1}}>
                  <span className="act-hl">{a.name}</span> {a.txt}
                </span>
                <span className="act-time">{a.time}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}