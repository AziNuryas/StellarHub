'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Bell, Heart, MessageCircle, UserPlus,
  CheckCheck, Trash2, RefreshCw,
  ArrowLeft, X, Rocket,
} from 'lucide-react';

/* ══════════════════════════════════
   TYPES
══════════════════════════════════ */
interface Notif {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  post_id: string | null;
  comment_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: { username: string; avatar_url: string | null } | null;
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
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/* Bikin pesan notif yang simple & singkat */
function makeSimpleMessage(type: string, actorUsername: string): string {
  switch (type) {
    case 'like':    return `menyukai postinganmu`;
    case 'comment': return `mengomentari postinganmu`;
    case 'follow':  return `mengikutimu`;
    default:        return `berinteraksi denganmu`;
  }
}

/* ══════════════════════════════════
   NOTIF CONFIG
══════════════════════════════════ */
const CFG: Record<string, { icon: any; color: string; bg: string; emoji: string }> = {
  like:    { icon: Heart,         color: '#f472b6', bg: 'rgba(244,114,182,.15)', emoji: '❤️' },
  comment: { icon: MessageCircle, color: '#38bdf8', bg: 'rgba(56,189,248,.15)',  emoji: '💬' },
  follow:  { icon: UserPlus,      color: '#34d399', bg: 'rgba(52,211,153,.15)',  emoji: '🚀' },
  default: { icon: Bell,          color: '#818cf8', bg: 'rgba(129,140,248,.15)', emoji: '🔔' },
};
const cfg = (t: string) => CFG[t] ?? CFG.default;

/* ══════════════════════════════════
   AVATAR
══════════════════════════════════ */
const PALS = ['#7c3aed,#4f46e5','#0ea5e9,#06b6d4','#ec4899,#f43f5e','#10b981,#059669','#f59e0b,#f97316'];
function pal(n = '') { return PALS[(n.charCodeAt(0) || 65) % PALS.length]; }

function Av({ name = 'A', url, size = 40 }: { name?: string; url?: string | null; size?: number }) {
  const [err, setErr] = useState(false);
  const r = Math.round(size * 0.28);
  if (url && !err)
    return <img src={url} onError={() => setErr(true)} alt={name}
      style={{ width: size, height: size, borderRadius: r, objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0,
      background: `linear-gradient(135deg,${pal(name)})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 800, color: '#fff',
      fontFamily: "'Archivo Black',sans-serif",
    }}>{name.charAt(0).toUpperCase()}</div>
  );
}

/* ══════════════════════════════════
   SINGLE NOTIF ROW
══════════════════════════════════ */
function NotifRow({ n, onRead, onDelete }: {
  n: Notif;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const c = cfg(n.type);
  const Icon = c.icon;
  const uname = n.actor?.username || 'Seseorang';
  // Pesan simple: "username · aksi"
  const simpleMsg = makeSimpleMessage(n.type, uname);

  return (
    <div
      className={`nr ${n.is_read ? '' : 'nr-unread'}`}
      onClick={() => { if (!n.is_read) onRead(n.id); }}
    >
      {!n.is_read && <div className="nr-dot" />}

      {/* Icon tipe notif */}
      <div className="nr-icon" style={{ background: c.bg }}>
        <Icon style={{ width: 14, height: 14, color: c.color }} />
      </div>

      {/* Avatar actor */}
      <Av name={uname} url={n.actor?.avatar_url} size={40} />

      {/* Teks */}
      <div className="nr-body">
        <div className="nr-line">
          <span className="nr-name">{uname}</span>
          <span className="nr-action">{simpleMsg}</span>
        </div>
        <div className="nr-meta">
          <span className="nr-time">{timeAgo(n.created_at)}</span>
          {n.post_id && (
            <Link href={`/post/${n.post_id}`} className="nr-link"
              onClick={e => e.stopPropagation()}>
              Lihat →
            </Link>
          )}
        </div>
      </div>

      {/* Hapus */}
      <button className="nr-del" onClick={e => { e.stopPropagation(); onDelete(n.id); }}>
        <X style={{ width: 12, height: 12 }} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════
   EMPTY
══════════════════════════════════ */
function Empty({ filter }: { filter: string }) {
  const map: Record<string, [string, string]> = {
    all:     ['🔔', 'Belum ada notifikasi'],
    unread:  ['✅', 'Semua sudah dibaca!'],
    like:    ['❤️', 'Belum ada like'],
    comment: ['💬', 'Belum ada komentar'],
    follow:  ['🚀', 'Belum ada follower baru'],
  };
  const [icon, title] = map[filter] ?? map.all;
  return (
    <div className="nempty">
      <span style={{ fontSize: 44 }}>{icon}</span>
      <p className="nempty-title">{title}</p>
      <Link href="/feed" className="nempty-btn">
        <Rocket style={{ width: 13, height: 13 }} /> Ke Feed
      </Link>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN PAGE
══════════════════════════════════ */
export default function NotificationsPage() {
  const supabase = createClient();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'like' | 'comment' | 'follow'>('all');
  const [user, setUser] = useState<any>(null);

  /* ── fetch ── */
  const load = useCallback(async (uid: string, refresh = false) => {
    if (refresh) setRefreshing(true);
    const { data } = await supabase
      .from('notifications')
      .select('id,user_id,actor_id,type,post_id,comment_id,message,is_read,created_at,actor:profiles!notifications_actor_id_fkey(username,avatar_url)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setNotifs(data.map(item => ({
      ...item,
      actor: Array.isArray(item.actor) ? item.actor[0] ?? null : item.actor ?? null,
    })) as Notif[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  /* ── init + realtime ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser(user);
      load(user.id);

      const ch = supabase
        .channel(`npage-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, async (p) => {
          let n = p.new as Notif;
          if ((p.new as any).actor_id) {
            const { data: a } = await supabase.from('profiles')
              .select('username,avatar_url').eq('id', (p.new as any).actor_id).single();
            if (a) n = { ...n, actor: a } as Notif;
          }
          setNotifs(prev => [n, ...prev]);
        })
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (p) => {
          setNotifs(prev => prev.map(n => n.id === p.new.id ? { ...n, ...p.new as Notif } : n));
        })
        .on('postgres_changes', {
          event: 'DELETE', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (p) => {
          setNotifs(prev => prev.filter(n => n.id !== p.old.id));
        })
        .subscribe();

      return () => { supabase.removeChannel(ch); };
    });
  }, []);

  /* ── actions ── */
  const markRead = async (id: string) => {
    setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };
  const markAllRead = async () => {
    if (!user) return;
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    toast.success('Semua ditandai dibaca ✓');
  };
  const del = async (id: string) => {
    setNotifs(p => p.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
  };
  const delAll = async () => {
    if (!user) return;
    setNotifs([]);
    await supabase.from('notifications').delete().eq('user_id', user.id);
    toast.success('Semua notifikasi dihapus');
  };

  /* ── filter ── */
  const list = notifs.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });
  const unread = notifs.filter(n => !n.is_read).length;

  const TABS = [
    { id: 'all',     label: 'Semua',    emoji: '🔔' },
    { id: 'unread',  label: 'Belum',    emoji: '🔴', count: unread },
    { id: 'like',    label: 'Like',     emoji: '❤️', count: notifs.filter(n=>n.type==='like').length },
    { id: 'comment', label: 'Komentar', emoji: '💬', count: notifs.filter(n=>n.type==='comment').length },
    { id: 'follow',  label: 'Follow',   emoji: '🚀', count: notifs.filter(n=>n.type==='follow').length },
  ];

  /* ── group by date ── */
  const grouped: Record<string, Notif[]> = {};
  list.forEach(n => {
    const d = new Date(n.created_at);
    const now = new Date();
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const key = d.toDateString() === now.toDateString() ? 'Hari Ini'
      : d.toDateString() === yest.toDateString() ? 'Kemarin'
      : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });

  return (
    <div className="np">
      <style>{CSS}</style>

      <div className="np-wrap">

        {/* ── TOP BAR ── */}
        <div className="np-top">
          <Link href="/feed" className="np-back">
            <ArrowLeft style={{ width: 14, height: 14 }} /> Feed
          </Link>

          <div className="np-heading">
            <div className="np-bell-wrap">
              <Bell style={{ width: 18, height: 18, color: '#818cf8' }} />
              {unread > 0 && <span className="np-bell-badge">{unread > 9 ? '9+' : unread}</span>}
            </div>
            <div>
              <h1 className="np-title">Notifikasi</h1>
              <p className="np-sub">{unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}</p>
            </div>
          </div>

          <div className="np-acts">
            <button className="np-act" onClick={() => user && load(user.id, true)} disabled={refreshing}>
              <RefreshCw style={{ width: 13, height: 13, ...(refreshing ? { animation: 'spin 1s linear infinite' } : {}) }} />
            </button>
            {unread > 0 && (
              <button className="np-act np-act-blue" onClick={markAllRead}>
                <CheckCheck style={{ width: 13, height: 13 }} />
                <span className="np-act-lb">Baca Semua</span>
              </button>
            )}
            {notifs.length > 0 && (
              <button className="np-act np-act-red" onClick={delAll}>
                <Trash2 style={{ width: 13, height: 13 }} />
                <span className="np-act-lb">Hapus</span>
              </button>
            )}
          </div>
        </div>

        {/* ── STATS ── */}
        {!loading && notifs.length > 0 && (
          <div className="np-stats">
            {[
              { l: 'Total',   v: notifs.length, c: '#818cf8' },
              { l: 'Belum',   v: unread,        c: '#f472b6' },
              { l: 'Like',    v: notifs.filter(n=>n.type==='like').length,    c: '#f472b6' },
              { l: 'Komentar',v: notifs.filter(n=>n.type==='comment').length, c: '#38bdf8' },
              { l: 'Follow',  v: notifs.filter(n=>n.type==='follow').length,  c: '#34d399' },
            ].map(s => (
              <div key={s.l} className="np-stat">
                <span className="np-stat-v" style={{ color: s.c }}>{s.v}</span>
                <span className="np-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        <div className="np-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`np-tab ${filter === t.id ? 'on' : ''}`}
              onClick={() => setFilter(t.id as any)}>
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              {t.count != null && t.count > 0 && (
                <span className={`np-tab-ct ${t.id === 'unread' ? 'red' : ''}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── LIST ── */}
        {loading ? (
          <div className="np-skels">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="np-skel">
                <div className="sk" style={{ width:34,height:34,borderRadius:'50%',flexShrink:0 }}/>
                <div className="sk" style={{ width:40,height:40,borderRadius:12,flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div className="sk" style={{ width:'65%',height:12,borderRadius:6,marginBottom:8 }}/>
                  <div className="sk" style={{ width:'30%',height:10,borderRadius:6 }}/>
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <Empty filter={filter} />
        ) : (
          Object.entries(grouped).map(([label, items]) => (
            <div key={label}>
              <div className="np-group">{label}</div>
              {items.map(n => (
                <NotifRow key={n.id} n={n} onRead={markRead} onDelete={del} />
              ))}
            </div>
          ))
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════
   CSS
══════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600&display=swap');
:root{--bg:#060810;--card:rgba(10,13,24,.9);--acc:#818cf8;--txt:rgba(226,232,240,.97);--txt2:rgba(203,213,225,.74);--muted:rgba(100,116,139,.5);--bd:rgba(255,255,255,.07);}
*,*::before,*::after{box-sizing:border-box;margin:0;}
*{scrollbar-width:thin;scrollbar-color:rgba(129,140,248,.15) transparent;}
*::-webkit-scrollbar{width:3px;}*::-webkit-scrollbar-thumb{background:rgba(129,140,248,.15);border-radius:99px;}

.np{min-height:100svh;background:var(--bg);padding:80px 16px 60px;font-family:'DM Sans',sans-serif;color:var(--txt);}
.np-wrap{max-width:680px;margin:0 auto;}

/* TOP BAR */
.np-top{display:flex;align-items:center;gap:12px;margin-bottom:22px;flex-wrap:wrap;}
.np-back{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:11px;border:1px solid var(--bd);background:rgba(255,255,255,.04);color:var(--muted);text-decoration:none;font-size:12.5px;font-weight:600;transition:all .2s;flex-shrink:0;}
.np-back:hover{color:var(--txt);background:rgba(255,255,255,.07);}
.np-heading{display:flex;align-items:center;gap:12px;flex:1;}
.np-bell-wrap{position:relative;width:42px;height:42px;border-radius:13px;background:rgba(129,140,248,.1);border:1px solid rgba(129,140,248,.22);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.np-bell-badge{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid var(--bg);font-family:'Archivo Black',sans-serif;}
.np-title{font-size:24px;font-weight:700;color:var(--txt);font-family:'Archivo Black',sans-serif;letter-spacing:-.02em;line-height:1.1;}
.np-sub{font-size:12px;color:var(--muted);margin-top:3px;}
.np-acts{display:flex;gap:7px;margin-left:auto;flex-wrap:wrap;}
.np-act{display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:11px;font-size:12.5px;font-weight:600;cursor:pointer;border:1px solid var(--bd);background:rgba(255,255,255,.04);color:var(--muted);transition:all .2s;font-family:'DM Sans',sans-serif;}
.np-act:hover{background:rgba(255,255,255,.07);color:var(--txt);}
.np-act:disabled{opacity:.4;cursor:not-allowed;}
.np-act-blue{border-color:rgba(129,140,248,.28);background:rgba(129,140,248,.07);color:var(--acc);}
.np-act-blue:hover{background:rgba(129,140,248,.15);}
.np-act-red{border-color:rgba(239,68,68,.22);background:rgba(239,68,68,.05);color:rgba(248,113,113,.75);}
.np-act-red:hover{background:rgba(239,68,68,.1);color:#f87171;}
.np-act-lb{display:none;}
@media(min-width:480px){.np-act-lb{display:inline;}}

/* STATS */
.np-stats{display:flex;background:rgba(255,255,255,.03);border:1px solid var(--bd);border-radius:16px;padding:4px;margin-bottom:18px;overflow-x:auto;}
.np-stat{display:flex;flex-direction:column;align-items:center;padding:10px 14px;flex:1;min-width:60px;border-right:1px solid rgba(255,255,255,.05);}
.np-stat:last-child{border-right:none;}
.np-stat-v{font-size:20px;font-weight:800;font-family:'Archivo Black',sans-serif;line-height:1.2;}
.np-stat-l{font-size:9.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;white-space:nowrap;}

/* TABS */
.np-tabs{display:flex;gap:5px;overflow-x:auto;padding-bottom:14px;margin-bottom:6px;scrollbar-width:none;}
.np-tabs::-webkit-scrollbar{display:none;}
.np-tab{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:30px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);color:rgba(155,160,210,.55);font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s;font-family:'DM Sans',sans-serif;}
.np-tab:hover{background:rgba(255,255,255,.06);color:var(--txt2);}
.np-tab.on{background:rgba(129,140,248,.13);border-color:rgba(129,140,248,.32);color:var(--acc);}
.np-tab-ct{display:inline-flex;align-items:center;justify-content:center;min-width:17px;height:17px;border-radius:5px;background:rgba(255,255,255,.07);font-size:9.5px;font-weight:800;padding:0 3px;font-family:'Archivo Black',sans-serif;}
.np-tab-ct.red{background:rgba(244,114,182,.18);color:#f472b6;}

/* GROUP */
.np-group{font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;padding:16px 2px 8px;font-family:'Archivo Black',sans-serif;}

/* NOTIF ROW */
.nr{position:relative;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;border:1px solid var(--bd);background:rgba(10,13,24,.75);margin-bottom:7px;cursor:pointer;transition:all .2s;animation:nIn .3s cubic-bezier(.16,1,.3,1) both;}
@keyframes nIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.nr:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);}
.nr-unread{background:rgba(129,140,248,.045);border-color:rgba(129,140,248,.14);}
.nr-unread:hover{background:rgba(129,140,248,.08);}
.nr-dot{position:absolute;top:13px;left:-3px;width:6px;height:6px;border-radius:50%;background:var(--acc);box-shadow:0 0 7px rgba(129,140,248,.7);}
.nr-icon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.nr-body{flex:1;min-width:0;}
.nr-line{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-bottom:4px;}
.nr-name{font-size:13.5px;font-weight:700;color:var(--txt);font-family:'Archivo Black',sans-serif;white-space:nowrap;}
.nr-action{font-size:13px;color:var(--txt2);}
.nr-unread .nr-name{color:#fff;}
.nr-meta{display:flex;align-items:center;gap:8px;}
.nr-time{font-size:11px;color:var(--muted);}
.nr-link{font-size:11px;color:var(--acc);text-decoration:none;font-weight:600;transition:color .2s;}
.nr-link:hover{color:#a5b4fc;}
.nr-del{width:26px;height:26px;border-radius:7px;border:none;background:none;color:rgba(100,116,139,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;transition:all .18s;}
.nr:hover .nr-del{opacity:1;}
.nr-del:hover{background:rgba(239,68,68,.1);color:#f87171;}

/* EMPTY */
.nempty{text-align:center;padding:56px 24px;background:rgba(10,13,24,.7);border:1px solid var(--bd);border-radius:22px;display:flex;flex-direction:column;align-items:center;gap:10px;animation:nIn .4s ease both;}
.nempty-title{font-size:17px;font-weight:700;color:var(--txt);font-family:'Archivo Black',sans-serif;}
.nempty-btn{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:9px 20px;border-radius:50px;background:rgba(129,140,248,.1);border:1px solid rgba(129,140,248,.22);color:var(--acc);text-decoration:none;font-size:13px;font-weight:700;font-family:'Archivo Black',sans-serif;transition:all .2s;}
.nempty-btn:hover{background:rgba(129,140,248,.18);transform:translateY(-2px);}

/* SKELETON */
.np-skels{display:flex;flex-direction:column;gap:8px;}
.np-skel{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;border:1px solid var(--bd);background:rgba(10,13,24,.75);}
.sk{background:rgba(255,255,255,.055);animation:shimmer 1.8s ease-in-out infinite;border-radius:6px;display:block;}
@keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.85}}
@keyframes spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.01ms!important;}}
`;