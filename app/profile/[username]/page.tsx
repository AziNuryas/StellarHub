'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart, MessageCircle, Clock, MapPin, LinkIcon, CalendarDays,
  UserPlus, UserCheck, Share2, ArrowLeft, Star, Grid3x3, Rows3,
  Bookmark, MoreHorizontal, X,
} from 'lucide-react';

/* ══════════════════════════════════
   TYPES
══════════════════════════════════ */
interface Profile {
  id: string; username: string; full_name: string | null;
  avatar_url: string | null; bio: string | null;
  location: string | null; website: string | null;
  created_at: string; role: string | null;
}
interface Post {
  id: string; content: string | null; image_url?: string | null;
  created_at: string; user_id: string; category?: string | null;
  likes: { id: string; user_id: string }[];
  comments: { id: string }[];
}
interface FollowUser {
  id: string; username: string; avatar_url: string | null;
  full_name: string | null; bio: string | null;
}

/* ══════════════════════════════════
   HELPERS
══════════════════════════════════ */
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'baru saja';
  if (s < 3600) return `${Math.floor(s / 60)}m lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`;
  if (s < 604800) return `${Math.floor(s / 86400)}h lalu`;
  return new Date(d).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
}

const PALS = [
  ['#7c3aed', '#4f46e5'], ['#0ea5e9', '#06b6d4'], ['#ec4899', '#f43f5e'],
  ['#10b981', '#059669'], ['#f59e0b', '#f97316'], ['#8b5cf6', '#a855f7'],
];
const pal = (n = '') => PALS[(n.charCodeAt(0) || 65) % PALS.length];

/* ══════════════════════════════════
   AVATAR
══════════════════════════════════ */
function Av({ name = 'A', url, size = 40, ring = false }: {
  name?: string; url?: string | null; size?: number; ring?: boolean;
}) {
  const [err, setErr] = useState(false);
  const [c1, c2] = pal(name);
  const r = Math.round(size * 0.26);
  const ringStyle = ring ? { boxShadow: '0 0 0 3px rgba(129,140,248,.5), 0 0 0 6px rgba(129,140,248,.1)' } : {};
  if (url && !err)
    return <img src={url} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: r, objectFit: 'cover', flexShrink: 0, ...ringStyle }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0,
      background: `linear-gradient(135deg,${c1},${c2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 800, color: '#fff',
      fontFamily: "'Archivo Black',sans-serif", userSelect: 'none', ...ringStyle,
    }}>{name.charAt(0).toUpperCase()}</div>
  );
}

/* ══════════════════════════════════
   FOLLOW MODAL
══════════════════════════════════ */
function FollowModal({ open, onClose, type, profileId, meId }: {
  open: boolean; onClose: () => void;
  type: 'followers' | 'following'; profileId: string; meId: string | null;
}) {
  const supabase = createClient();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [fState, setFState] = useState<Record<string, boolean>>({});

  useEffect(() => { if (open) { setLoading(true); load(); } }, [open, type]);

  const load = async () => {
    try {
      let data: any[] = [];
      if (type === 'followers') {
        const { data: rows } = await supabase.from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(id,username,avatar_url,full_name,bio)')
          .eq('following_id', profileId);
        data = (rows || []).map(r => r.profiles).filter(Boolean);
      } else {
        const { data: rows } = await supabase.from('follows')
          .select('following_id, profiles!follows_following_id_fkey(id,username,avatar_url,full_name,bio)')
          .eq('follower_id', profileId);
        data = (rows || []).map(r => r.profiles).filter(Boolean);
      }
      setUsers(data);
      if (meId) {
        const checks: Record<string, boolean> = {};
        await Promise.all(data.map(async u => {
          if (u.id === meId) return;
          const { data: f } = await supabase.from('follows').select('id')
            .eq('follower_id', meId).eq('following_id', u.id).maybeSingle();
          checks[u.id] = !!f;
        }));
        setFState(checks);
      }
    } finally { setLoading(false); }
  };

  const toggle = async (tid: string) => {
    if (!meId) { toast.error('Login dulu'); return; }
    if (fState[tid]) {
      await supabase.from('follows').delete().eq('follower_id', meId).eq('following_id', tid);
      setFState(p => ({ ...p, [tid]: false }));
    } else {
      await supabase.from('follows').insert({ follower_id: meId, following_id: tid });
      setFState(p => ({ ...p, [tid]: true }));
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: 'rgba(8,11,22,.98)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, width: '100%', maxWidth: 420, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', fontFamily: "'Archivo Black',sans-serif" }}>
            {type === 'followers' ? 'Followers' : 'Following'}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(100,116,139,.6)' }}>
            <X style={{ width: 13, height: 13 }} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(129,140,248,.2)', borderTopColor: '#818cf8', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(100,116,139,.5)', fontSize: 14 }}>
              {type === 'followers' ? 'Belum ada followers' : 'Belum mengikuti siapapun'}
            </div>
          ) : users.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.04)', transition: 'background .15s' }}>
              <Link href={`/profile/${u.username}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, textDecoration: 'none', minWidth: 0 }} onClick={onClose}>
                <Av name={u.username} url={u.avatar_url} size={44} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', fontFamily: "'Archivo Black',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.full_name || u.username}
                  </div>
                  <div style={{ fontSize: 12, color: '#818cf8', marginTop: 2 }}>@{u.username}</div>
                </div>
              </Link>
              {meId && u.id !== meId && (
                <button onClick={() => toggle(u.id)}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Archivo Black',sans-serif", transition: 'all .2s', border: fState[u.id] ? '1px solid rgba(52,211,153,.3)' : '1px solid rgba(129,140,248,.3)', background: fState[u.id] ? 'rgba(52,211,153,.08)' : 'rgba(129,140,248,.08)', color: fState[u.id] ? '#34d399' : '#818cf8' }}>
                  {fState[u.id] ? <><UserCheck style={{ width: 11, height: 11 }} />Following</> : <><UserPlus style={{ width: 11, height: 11 }} />Follow</>}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════
   POST CARD — grid & list mode
══════════════════════════════════ */
function PostCard({ post, meId, view }: { post: Post; meId?: string; view: 'grid' | 'list' }) {
  const liked = post.likes?.some(l => l.user_id === meId);
  const [imgErr, setImgErr] = useState(false);
  const isNASA = post.content?.includes('🌌');

  if (view === 'grid') return (
    <Link href={`/post/${post.id}`} style={{ display: 'block', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)', background: 'rgba(10,13,24,.85)', textDecoration: 'none', transition: 'all .25s', position: 'relative' }}
      className="pcard-grid">
      {post.image_url && !imgErr ? (
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={post.image_url} alt="" onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }} className="pcard-img" />
        </div>
      ) : (
        <div style={{ height: 120, background: 'linear-gradient(135deg,rgba(124,58,237,.1),rgba(14,165,233,.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
          {isNASA ? '🌌' : '📝'}
        </div>
      )}
      <div style={{ padding: '12px 14px' }}>
        {isNASA && <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: '#a78bfa', background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.22)', padding: '2px 7px', borderRadius: 6, display: 'inline-block', marginBottom: 6, fontFamily: "'Archivo Black',sans-serif" }}>NASA</span>}
        <p style={{ fontSize: 13, color: 'rgba(203,213,225,.75)', lineHeight: 1.55, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.content?.replace(/\*\*/g, '').replace(/🌌/g, '').slice(0, 100)}
        </p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(100,116,139,.55)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Heart style={{ width: 11, height: 11 }} fill={liked ? '#f472b6' : 'none'} stroke={liked ? '#f472b6' : 'currentColor'} />
            {post.likes?.length ?? 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageCircle style={{ width: 11, height: 11 }} />{post.comments?.length ?? 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <Clock style={{ width: 10, height: 10 }} />{timeAgo(post.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );

  // LIST VIEW
  return (
    <Link href={`/post/${post.id}`} style={{ display: 'flex', gap: 14, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)', background: 'rgba(10,13,24,.85)', textDecoration: 'none', padding: '14px 16px', transition: 'all .25s', alignItems: 'flex-start' }}
      className="pcard-list">
      {post.image_url && !imgErr && (
        <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <img src={post.image_url} alt="" onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isNASA && <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: '#a78bfa', marginBottom: 6, display: 'inline-block', fontFamily: "'Archivo Black',sans-serif" }}>🌌 NASA</span>}
        <p style={{ fontSize: 14, color: 'rgba(203,213,225,.85)', lineHeight: 1.6, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.content?.replace(/\*\*/g, '').replace(/🌌/g, '')}
        </p>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'rgba(100,116,139,.55)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Heart style={{ width: 11, height: 11 }} fill={liked ? '#f472b6' : 'none'} stroke={liked ? '#f472b6' : 'currentColor'} />
            {post.likes?.length ?? 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageCircle style={{ width: 11, height: 11 }} />{post.comments?.length ?? 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock style={{ width: 10, height: 10 }} />{timeAgo(post.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════
   MAIN PAGE
══════════════════════════════════ */
export default function UserProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [me, setMe] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, likes: 0 });
  const [followModal, setFollowModal] = useState<{ open: boolean; type: 'followers' | 'following' }>({ open: false, type: 'followers' });
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const isOwn = me?.id === profile?.id;

  useEffect(() => { load(); }, [params.username]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user);

      const { data: prof, error } = await supabase.from('profiles')
        .select('*').eq('username', params.username).single();
      if (error || !prof) { setProfile(null); return; }
      setProfile(prof);

      // Redirect to own profile page if viewing yourself
      if (user && user.id === prof.id) {
        router.replace('/profile');
        return;
      }

      // Load posts
      const { data: postsData } = await supabase.from('posts')
        .select('id,content,image_url,created_at,user_id,category,likes(id,user_id),comments(id)')
        .eq('user_id', prof.id).order('created_at', { ascending: false });
      setPosts(postsData || []);

      // Load stats
      const [{ count: flrs }, { count: fling }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', prof.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', prof.id),
      ]);
      const totalLikes = (postsData || []).reduce((s, p) => s + (p.likes?.length ?? 0), 0);
      setStats({ posts: postsData?.length ?? 0, followers: flrs ?? 0, following: fling ?? 0, likes: totalLikes });

      // Check if following
      if (user) {
        const { data: f } = await supabase.from('follows').select('id')
          .eq('follower_id', user.id).eq('following_id', prof.id).maybeSingle();
        setFollowing(!!f);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!me) { toast.error('Login dulu'); router.push('/login'); return; }
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (following) {
        await supabase.from('follows').delete().eq('follower_id', me.id).eq('following_id', profile.id);
        setFollowing(false);
        setStats(s => ({ ...s, followers: s.followers - 1 }));
        toast.success('Unfollow berhasil');
      } else {
        await supabase.from('follows').insert({ follower_id: me.id, following_id: profile.id });
        setFollowing(true);
        setStats(s => ({ ...s, followers: s.followers + 1 }));
        toast.success('Mengikuti ' + profile.username);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  /* ── SKELETON ── */
  if (loading) return (
    <div style={{ minHeight: '100svh', background: '#060810', paddingTop: 64 }}>
      <style>{CSS}</style>
      <div style={{ height: 260, background: 'linear-gradient(135deg,rgba(124,58,237,.15),rgba(14,165,233,.1))' }} className="sk" />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 20, marginTop: -60, marginBottom: 24 }}>
          <div className="sk" style={{ width: 120, height: 120, borderRadius: 24, flexShrink: 0 }} />
          <div style={{ flex: 1, paddingTop: 20 }}>
            <div className="sk" style={{ width: '35%', height: 24, borderRadius: 8, marginBottom: 10 }} />
            <div className="sk" style={{ width: '50%', height: 15, borderRadius: 6, marginBottom: 8 }} />
            <div className="sk" style={{ width: '40%', height: 15, borderRadius: 6 }} />
          </div>
        </div>
      </div>
    </div>
  );

  /* ── NOT FOUND ── */
  if (!profile) return (
    <div style={{ minHeight: '100svh', background: '#060810', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 64 }}>
      <style>{CSS}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>👤</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', fontFamily: "'Archivo Black',sans-serif", marginBottom: 8 }}>User tidak ditemukan</h2>
        <p style={{ color: 'rgba(100,116,139,.6)', marginBottom: 20 }}>@{params.username} tidak ada</p>
        <Link href="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#818cf8', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Kembali ke Feed
        </Link>
      </div>
    </div>
  );

  const displayName = profile.full_name || profile.username;
  const joinDate = new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="up-root">
      <style>{CSS}</style>

      {/* ══ ANIMATED COVER ══ */}
      <div className="up-cover">
        <div className="up-cover-bg" />
        {/* Nebula blobs */}
        <div className="up-blob up-blob-1" />
        <div className="up-blob up-blob-2" />
        <div className="up-blob up-blob-3" />
        {/* Star field */}
        <div className="up-stars" />
        {/* Orbit rings */}
        <div className="up-ring" style={{ width: 300, height: 300, top: '50%', right: '12%', animationDuration: '22s' }} />
        <div className="up-ring" style={{ width: 180, height: 180, top: '30%', right: '28%', animationDuration: '15s', opacity: .35 }} />
        <div className="up-ring" style={{ width: 90, height: 90, top: '60%', right: '20%', animationDuration: '10s', opacity: .25 }} />
        {/* Gradient overlay bottom */}
        <div className="up-cover-fade" />
      </div>

      <div className="up-wrap">

        {/* ══ BACK BUTTON ══ */}
        <button onClick={() => router.back()} className="up-back">
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Kembali
        </button>

        {/* ══ HERO ══ */}
        <div className="up-hero">
          {/* Avatar */}
          <div style={{ marginTop: -64, flexShrink: 0, position: 'relative' }}>
            <Av name={displayName} url={profile.avatar_url} size={128} ring />
            {/* Online indicator */}
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: '#10b981', border: '3px solid #060810', boxShadow: '0 0 10px rgba(16,185,129,.6)' }} />
          </div>

          {/* Info */}
          <div className="up-info">
            <div className="up-toprow">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 className="up-name">{displayName}</h1>
                  {profile.role && profile.role !== 'user' && (
                    <span className="up-role"><Star style={{ width: 9, height: 9 }} />{profile.role}</span>
                  )}
                </div>
                <span className="up-handle">@{profile.username}</span>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!isOwn && (
                  <button className={`up-follow-btn${following ? ' on' : ''}`} onClick={toggleFollow} disabled={followLoading}>
                    {followLoading ? (
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
                    ) : following ? (
                      <><UserCheck style={{ width: 15, height: 15 }} />Mengikuti</>
                    ) : (
                      <><UserPlus style={{ width: 15, height: 15 }} />Ikuti</>
                    )}
                  </button>
                )}
                <button className="up-icon-btn" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link disalin!'); }} title="Share profil">
                  <Share2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {profile.bio && <p className="up-bio">{profile.bio}</p>}

            {/* Meta chips */}
            <div className="up-meta">
              {profile.location && <span className="up-chip"><MapPin style={{ width: 11, height: 11 }} />{profile.location}</span>}
              {profile.website && (
                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank" rel="noopener noreferrer" className="up-chip up-chip-link">
                  <LinkIcon style={{ width: 11, height: 11 }} />
                  {profile.website.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              )}
              <span className="up-chip"><CalendarDays style={{ width: 11, height: 11 }} />Bergabung {joinDate}</span>
            </div>

            {/* Stats */}
            <div className="up-stats">
              {[
                { val: stats.posts, lbl: 'Postingan', onClick: undefined },
                { val: stats.followers, lbl: 'Followers', onClick: () => setFollowModal({ open: true, type: 'followers' }) },
                { val: stats.following, lbl: 'Following', onClick: () => setFollowModal({ open: true, type: 'following' }) },
                { val: stats.likes, lbl: 'Likes', onClick: undefined },
              ].map((s, i) => (
                <button key={i} className={`up-stat${s.onClick ? ' clickable' : ''}`} onClick={s.onClick}>
                  <span className="up-stat-v">{s.val >= 1000 ? `${(s.val / 1000).toFixed(1)}k` : s.val}</span>
                  <span className="up-stat-l">{s.lbl}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ POSTS HEADER ══ */}
        <div className="up-posts-hd">
          <h2 className="up-posts-title">
            Postingan
            <span className="up-posts-count">{stats.posts}</span>
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`up-view-btn${view === 'grid' ? ' on' : ''}`} onClick={() => setView('grid')}>
              <Grid3x3 style={{ width: 14, height: 14 }} />
            </button>
            <button className={`up-view-btn${view === 'list' ? ' on' : ''}`} onClick={() => setView('list')}>
              <Rows3 style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* ══ POSTS GRID/LIST ══ */}
        {posts.length === 0 ? (
          <div className="up-empty">
            <span style={{ fontSize: 48 }}>📡</span>
            <h3>Belum ada postingan</h3>
            <p>@{profile.username} belum membagikan apapun</p>
          </div>
        ) : (
          <div className={view === 'grid' ? 'up-grid' : 'up-list'}>
            {posts.map(p => <PostCard key={p.id} post={p} meId={me?.id} view={view} />)}
          </div>
        )}
      </div>

      {/* FOLLOW MODAL */}
      {profile && (
        <FollowModal open={followModal.open} onClose={() => setFollowModal(p => ({ ...p, open: false }))}
          type={followModal.type} profileId={profile.id} meId={me?.id || null} />
      )}
    </div>
  );
}

/* ══════════════════════════════════
   CSS
══════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600&display=swap');

.up-root { min-height:100svh; background:#060810; padding-top:64px; font-family:'DM Sans',sans-serif; color:rgba(226,232,240,.97); }

/* ══ COVER ══ */
.up-cover { height:280px; position:relative; overflow:hidden; }
.up-cover-bg { position:absolute; inset:0; background:linear-gradient(135deg,#0d0720 0%,#0a1628 60%,#060810 100%); }
.up-blob { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; }
.up-blob-1 { width:500px; height:500px; top:-180px; left:-100px; background:radial-gradient(circle,rgba(124,58,237,.22) 0%,transparent 70%); animation:blobFloat 14s ease-in-out infinite; }
.up-blob-2 { width:400px; height:400px; top:-100px; right:-80px; background:radial-gradient(circle,rgba(14,165,233,.16) 0%,transparent 70%); animation:blobFloat 18s ease-in-out 6s infinite; }
.up-blob-3 { width:250px; height:250px; bottom:-60px; left:40%; background:radial-gradient(circle,rgba(244,114,182,.1) 0%,transparent 70%); animation:blobFloat 22s ease-in-out 3s infinite; }
@keyframes blobFloat { 0%,100%{transform:scale(1) translate(0,0)} 33%{transform:scale(1.08) translate(20px,-15px)} 66%{transform:scale(.94) translate(-15px,10px)} }
.up-stars { position:absolute; inset:0; background-image:radial-gradient(1.5px 1.5px at 8% 25%,rgba(255,255,255,.7),transparent),radial-gradient(1px 1px at 22% 60%,rgba(255,255,255,.5),transparent),radial-gradient(2px 2px at 40% 15%,rgba(167,139,250,.65),transparent),radial-gradient(1px 1px at 55% 72%,rgba(255,255,255,.55),transparent),radial-gradient(1.5px 1.5px at 68% 35%,rgba(56,189,248,.5),transparent),radial-gradient(1px 1px at 80% 55%,rgba(255,255,255,.45),transparent),radial-gradient(2px 2px at 92% 20%,rgba(255,255,255,.6),transparent),radial-gradient(1px 1px at 15% 80%,rgba(129,140,248,.5),transparent),radial-gradient(1.5px 1.5px at 48% 48%,rgba(255,255,255,.35),transparent),radial-gradient(1px 1px at 75% 82%,rgba(255,255,255,.4),transparent); animation:twinkle 6s ease-in-out infinite alternate; }
@keyframes twinkle{0%{opacity:.65}100%{opacity:1}}
.up-ring { position:absolute; border-radius:50%; border:1px solid rgba(129,140,248,.1); transform:translateY(-50%); animation:orbitSpin linear infinite; pointer-events:none; }
@keyframes orbitSpin{to{transform:translateY(-50%) rotate(360deg)}}
.up-cover-fade { position:absolute; bottom:0; left:0; right:0; height:120px; background:linear-gradient(to bottom,transparent,#060810); }

/* ══ WRAP ══ */
.up-wrap { max-width:860px; margin:0 auto; padding:0 20px 80px; }

/* ══ BACK ══ */
.up-back { display:inline-flex; align-items:center; gap:7px; padding:8px 16px; border-radius:12px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:rgba(100,116,139,.6); cursor:pointer; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; margin-bottom:0; transition:all .2s; position:relative; z-index:1; }
.up-back:hover { color:rgba(226,232,240,.9); background:rgba(255,255,255,.07); }

/* ══ HERO ══ */
.up-hero { display:flex; gap:24px; align-items:flex-end; margin-bottom:32px; flex-wrap:wrap; }
@media(max-width:580px){ .up-hero{flex-direction:column;align-items:flex-start;} }
.up-info { flex:1; min-width:240px; padding-bottom:2px; }
.up-toprow { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:10px; }
.up-name { font-size:26px; font-weight:700; color:rgba(226,232,240,.97); font-family:'Archivo Black',sans-serif; letter-spacing:-.02em; line-height:1.1; }
.up-role { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; padding:3px 9px; border-radius:20px; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.3); color:#c4b5fd; font-family:'Archivo Black',sans-serif; }
.up-handle { font-size:13px; color:#818cf8; font-weight:600; background:rgba(129,140,248,.09); padding:3px 10px; border-radius:20px; border:1px solid rgba(129,140,248,.18); display:inline-block; margin:6px 0 10px; }
.up-bio { font-size:14px; color:rgba(203,213,225,.75); line-height:1.7; margin-bottom:12px; max-width:520px; }

/* ══ META ══ */
.up-meta { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:18px; }
.up-chip { display:inline-flex; align-items:center; gap:5px; font-size:12px; color:rgba(100,116,139,.6); background:rgba(255,255,255,.04); padding:5px 11px; border-radius:30px; border:1px solid rgba(255,255,255,.07); text-decoration:none; transition:all .2s; }
.up-chip-link:hover { color:#818cf8; border-color:rgba(129,140,248,.28); background:rgba(129,140,248,.06); }

/* ══ ACTION BUTTONS ══ */
.up-follow-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 22px; border-radius:50px; font-size:13.5px; font-weight:700; cursor:pointer; font-family:'Archivo Black',sans-serif; transition:all .22s; white-space:nowrap; border:1.5px solid rgba(129,140,248,.4); background:rgba(129,140,248,.1); color:#818cf8; }
.up-follow-btn:hover:not(:disabled) { background:rgba(129,140,248,.2); transform:translateY(-1px); box-shadow:0 6px 20px rgba(129,140,248,.25); }
.up-follow-btn.on { border-color:rgba(52,211,153,.35); background:rgba(52,211,153,.1); color:#34d399; }
.up-follow-btn.on:hover { background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.28); color:#f87171; }
.up-follow-btn:disabled { opacity:.5; cursor:not-allowed; }
.up-icon-btn { display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:50%; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); color:rgba(100,116,139,.6); cursor:pointer; transition:all .2s; }
.up-icon-btn:hover { color:rgba(226,232,240,.9); background:rgba(255,255,255,.09); border-color:rgba(255,255,255,.15); }

/* ══ STATS ══ */
.up-stats { display:flex; align-items:center; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:4px; overflow:hidden; flex-wrap:wrap; }
.up-stat { display:flex; flex-direction:column; align-items:center; padding:10px 20px; border-radius:14px; background:none; border:none; font-family:inherit; transition:background .2s; }
.up-stat.clickable { cursor:pointer; }
.up-stat.clickable:hover { background:rgba(255,255,255,.06); }
.up-stat-v { font-size:20px; font-weight:700; color:rgba(226,232,240,.97); font-family:'Archivo Black',sans-serif; line-height:1.2; }
.up-stat-l { font-size:10.5px; color:rgba(100,116,139,.55); text-transform:uppercase; letter-spacing:.08em; margin-top:2px; }

/* ══ POSTS HEADER ══ */
.up-posts-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,.07); }
.up-posts-title { font-size:16px; font-weight:700; color:rgba(226,232,240,.9); font-family:'Archivo Black',sans-serif; display:flex; align-items:center; gap:10px; }
.up-posts-count { font-size:12px; background:rgba(129,140,248,.12); border:1px solid rgba(129,140,248,.2); color:#818cf8; padding:3px 9px; border-radius:20px; font-family:'Archivo Black',sans-serif; }
.up-view-btn { display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:9px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:rgba(100,116,139,.5); cursor:pointer; transition:all .2s; }
.up-view-btn:hover { color:rgba(226,232,240,.8); background:rgba(255,255,255,.07); }
.up-view-btn.on { background:rgba(129,140,248,.12); border-color:rgba(129,140,248,.28); color:#818cf8; }

/* ══ GRID/LIST ══ */
.up-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:14px; }
.up-list { display:flex; flex-direction:column; gap:10px; }

/* ══ CARD HOVER ══ */
.pcard-grid { transition:all .28s cubic-bezier(.16,1,.3,1) !important; }
.pcard-grid:hover { transform:translateY(-4px) !important; border-color:rgba(129,140,248,.3) !important; box-shadow:0 16px 32px rgba(0,0,0,.35) !important; }
.pcard-grid:hover .pcard-img { transform:scale(1.06) !important; }
.pcard-list:hover { border-color:rgba(129,140,248,.25) !important; background:rgba(14,17,30,.9) !important; transform:translateX(3px) !important; }

/* ══ EMPTY ══ */
.up-empty { text-align:center; padding:64px 24px; background:rgba(10,13,24,.85); border:1px solid rgba(255,255,255,.07); border-radius:20px; display:flex; flex-direction:column; align-items:center; gap:8px; }
.up-empty h3 { font-size:18px; font-weight:700; color:rgba(226,232,240,.9); font-family:'Archivo Black',sans-serif; }
.up-empty p { font-size:14px; color:rgba(100,116,139,.55); }

/* ══ SKELETON ══ */
.sk { background:rgba(255,255,255,.055); animation:shimmer 1.8s ease-in-out infinite; display:block; }
@keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.85}}
@keyframes spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.01ms!important;}}
`;