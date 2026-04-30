'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { Users, Search, MapPin, Loader2, Link as LinkIcon, Star, ArrowRight } from 'lucide-react'

/* ════════════════════════════════
   TYPES
════════════════════════════════ */
interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  role: string | null
  created_at: string
}

/* ════════════════════════════════
   AVATAR HELPER
════════════════════════════════ */
const PALS=[['#7c3aed','#4f46e5'],['#0ea5e9','#06b6d4'],['#ec4899','#f43f5e'],['#10b981','#059669'],['#f59e0b','#f97316'],['#8b5cf6','#a855f7']]
const pal=(n='')=>PALS[(n.charCodeAt(0)||65)%PALS.length]

function Avatar({name='A',size=40,url}:{name?:string;size?:number;url?:string|null}) {
  const [err,setErr]=useState(false)
  const [c1,c2]=pal(name)
  const r=Math.round(size*.28)
  useEffect(()=>{setErr(false)},[url])
  const base:React.CSSProperties={width:size,height:size,borderRadius:r,flexShrink:0}
  
  if(url&&!err) return <img src={url} alt={name} onError={()=>setErr(true)} style={{...base,objectFit:'cover',display:'block'}}/>
  return <div style={{...base,background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.4,fontWeight:800,color:'#fff',userSelect:'none',fontFamily:"'Archivo Black',sans-serif"}}>{name.charAt(0).toUpperCase()}</div>
}

/* ════════════════════════════════
   COMMUNITY PAGE
════════════════════════════════ */
export default function CommunityPage() {
  const [supabase] = useState(() => createClient())
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .abortSignal(AbortSignal.timeout(8000))
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        setUsers(data || [])
      } catch (e: any) {
        console.error(e)
        toast.error('Gagal memuat komunitas')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (u.bio && u.bio.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ minHeight: '100svh', padding: '80px 16px', fontFamily: 'var(--font-dm-sans)', color: 'var(--text)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 99, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', marginBottom: 16 }}>
            <Users size={12} color="#38bdf8" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>StellarHub Explorers</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, fontFamily: 'var(--font-archivo)', marginBottom: 12 }}>
            Community
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
            Meet fellow astronauts, astronomers, and space enthusiasts across the galaxy.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto 40px' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            placeholder="Search by username, name, or bio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '16px 16px 16px 48px', 
              background: 'var(--bg-surface)', border: '1px solid var(--border)', 
              borderRadius: 20, color: 'var(--text)', fontSize: 15,
              outline: 'none', transition: 'border-color 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ height: 180, background: 'var(--bg-surface)', borderRadius: 20 }} className="skeleton" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌌</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No explorers found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try a different search term.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredUsers.map(u => (
              <Link 
                key={u.id} 
                href={`/profile?username=${u.username}`} 
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'linear-gradient(145deg, rgba(11,14,26,0.8), rgba(6,8,16,0.9))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 24,
                  padding: '24px 22px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
                className="community-card"
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(129,140,248,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
                }}
                >
                  <div style={{
                    position: 'absolute', top: 0, right: 0, width: 120, height: 120,
                    background: 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)',
                    borderRadius: '50%', transform: 'translate(30%, -30%)', pointerEvents: 'none'
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar name={u.username} url={u.avatar_url} size={64} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: '#10b981', border: '3px solid #0b0e1a' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-archivo)' }}>
                          {u.full_name || u.username}
                        </h3>
                        {u.role === 'admin' && (
                          <div style={{ padding: '2px 8px', background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.2))', color: '#f97316', borderRadius: 8, fontSize: 9, fontWeight: 800, letterSpacing: '0.05em' }}>ADMIN</div>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>@{u.username}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 20, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {u.bio || "This explorer is floating in space..."}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {u.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        <MapPin size={13} color="#818cf8" /> {u.location}
                      </div>
                    )}
                    {u.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        <LinkIcon size={13} color="#38bdf8" /> {u.website.replace(/^https?:\/\//, '').slice(0,20)}{u.website.length>28?'...':''}
                      </div>
                    )}
                    {!u.location && !u.website && (
                       <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(100,116,139,0.5)', fontWeight: 600 }}>
                         <Star size={13} /> Deep Space
                       </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
