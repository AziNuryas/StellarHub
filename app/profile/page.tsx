'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Bookmark, Clock,
  X, Loader2, MapPin, LinkIcon, CalendarDays,
  UserPlus, UserCheck, Camera, Save, LogOut,
  Star, Check, MoreHorizontal, Share2, Edit3,
  Grid3x3, List, ArrowLeft,
} from 'lucide-react';

/* ════════════════════════════
   TYPES
════════════════════════════ */
interface Profile {
  id: string; username: string; full_name: string|null;
  avatar_url: string|null; bio: string|null;
  location: string|null; website: string|null;
  created_at: string; updated_at: string; role: string|null;
}
interface Post {
  id: string; title: string|null; content: string|null;
  image_url?: string|null; created_at: string; user_id: string;
  category?: string|null; profiles: Profile;
  likes: {id:string;user_id:string}[]; comments: {id:string}[];
}
interface BookmarkItem {
  id: string; user_id: string; post_id?: string|null;
  apod_id?: string|null; bookmark_type: string; created_at: string;
  title?: string|null; image_url?: string|null;
}
interface FollowUser {
  id: string; username: string; avatar_url: string|null;
  full_name: string|null; bio: string|null;
}

/* ════════════════════════════
   HELPERS
════════════════════════════ */
function timeAgo(d:string) {
  const s=Math.floor((Date.now()-new Date(d).getTime())/1000);
  if(s<60)return 'just now';
  if(s<3600)return `${Math.floor(s/60)}m ago`;
  if(s<86400)return `${Math.floor(s/3600)}h ago`;
  if(s<604800)return `${Math.floor(s/86400)}d ago`;
  return new Date(d).toLocaleDateString('en',{month:'short',day:'numeric'});
}

const PALS=[['#7c3aed','#4f46e5'],['#0ea5e9','#06b6d4'],['#ec4899','#f43f5e'],['#10b981','#059669'],['#f59e0b','#f97316'],['#8b5cf6','#a855f7']];
const pal=(n='')=>PALS[(n.charCodeAt(0)||65)%PALS.length];

/* ════════════════════════════
   AVATAR
════════════════════════════ */
function Avatar({name='A',size=40,url,ring=false,className='',style:ext={}}:{name?:string;size?:number;url?:string|null;ring?:boolean;className?:string;style?:React.CSSProperties}) {
  const [err,setErr]=useState(false);
  const [c1,c2]=pal(name);
  const r=Math.round(size*.28);
  useEffect(()=>{setErr(false);},[url]);
  const base:React.CSSProperties={width:size,height:size,borderRadius:r,flexShrink:0,...ext};
  if(ring) base.boxShadow=`0 0 0 3px rgba(129,140,248,.45), 0 0 0 5px rgba(129,140,248,.12)`;
  if(url&&!err) return <img src={url} alt={name} onError={()=>setErr(true)} className={className} style={{...base,objectFit:'cover',display:'block'}}/>;
  return <div className={className} style={{...base,background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.4,fontWeight:800,color:'#fff',userSelect:'none',fontFamily:"'Archivo Black',sans-serif"}}>{name.charAt(0).toUpperCase()}</div>;
}

/* ════════════════════════════
   FOLLOW LIST MODAL
════════════════════════════ */
function FollowModal({open,onClose,type,profileId,meId}:{open:boolean;onClose:()=>void;type:'followers'|'following';profileId:string;meId:string|null}) {
  const supabase=createClient();
  const [users,setUsers]=useState<FollowUser[]>([]);
  const [loading,setLoading]=useState(true);
  const [fState,setFState]=useState<Record<string,boolean>>({});

  useEffect(()=>{if(open){setLoading(true);load();}}, [open,type]);

  const load=async()=>{
    try {
      let data:any[]=[];
      if(type==='followers'){
        const{data:rows}=await supabase.from('follows').select('follower_id, profiles!follows_follower_id_fkey(id,username,avatar_url,full_name,bio)').eq('following_id',profileId);
        data=(rows||[]).map(r=>r.profiles).filter(Boolean);
      } else {
        const{data:rows}=await supabase.from('follows').select('following_id, profiles!follows_following_id_fkey(id,username,avatar_url,full_name,bio)').eq('follower_id',profileId);
        data=(rows||[]).map(r=>r.profiles).filter(Boolean);
      }
      setUsers(data);
      if(meId){
        const checks:Record<string,boolean>={};
        await Promise.all(data.map(async u=>{
          if(u.id===meId)return;
          const{data:f}=await supabase.from('follows').select('id').eq('follower_id',meId).eq('following_id',u.id).maybeSingle();
          checks[u.id]=!!f;
        }));
        setFState(checks);
      }
    } finally { setLoading(false); }
  };

  const toggle=async(tid:string)=>{
    if(!meId){toast.error('Sign in first');return;}
    if(fState[tid]){
      await supabase.from('follows').delete().eq('follower_id',meId).eq('following_id',tid);
      setFState(p=>({...p,[tid]:false}));toast.success('Unfollowed');
    } else {
      await supabase.from('follows').insert({follower_id:meId,following_id:tid});
      setFState(p=>({...p,[tid]:true}));toast.success('Following! 🚀');
    }
  };

  if(!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title">{type==='followers'?'Followers':'Following'}</span>
          <button className="modal-x" onClick={onClose}><X style={{width:15,height:15}}/></button>
        </div>
        <div style={{maxHeight:'60vh',overflowY:'auto'}}>
          {loading?(
            <div style={{display:'flex',justifyContent:'center',padding:48}}><div className="spinner"/></div>
          ):users.length===0?(
            <div style={{textAlign:'center',padding:'48px 20px'}}>
              <div style={{fontSize:40,marginBottom:12}}>👤</div>
              <p style={{color:'var(--muted)',fontSize:14}}>{type==='followers'?'No followers yet':'Not following anyone yet'}</p>
            </div>
          ):users.map(u=>(
            <div key={u.id} className="flist-row">
              <a href={`/profile/${u.username}`} style={{display:'flex',alignItems:'center',gap:12,flex:1,textDecoration:'none',minWidth:0}}>
                <Avatar name={u.username} url={u.avatar_url} size={46}/>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--txt)',fontFamily:"'Archivo Black',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.full_name||u.username}</div>
                  <div style={{fontSize:12,color:'var(--accent)',marginTop:2}}>@{u.username}</div>
                  {u.bio&&<div style={{fontSize:12,color:'var(--muted)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.bio.slice(0,48)}{u.bio.length>48?'…':''}</div>}
                </div>
              </a>
              {meId&&u.id!==meId&&(
                <button onClick={()=>toggle(u.id)} className={`flist-btn${fState[u.id]?' on':''}`}>
                  {fState[u.id]?<><UserCheck style={{width:11,height:11}}/>Following</>:<><UserPlus style={{width:11,height:11}}/>Follow</>}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════
   EDIT MODAL — FIXED
════════════════════════════ */
function EditModal({open,onClose,profile,onSave}:{open:boolean;onClose:()=>void;profile:Profile;onSave:(d:Partial<Profile>)=>Promise<void>}) {
  const supabase=createClient();
  const [form,setForm]=useState({full_name:'',username:'',bio:'',location:'',website:''});
  const [avFile,setAvFile]=useState<File|null>(null);
  const [avPreview,setAvPreview]=useState<string|null>(null);
  const [avUrl,setAvUrl]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if(open&&profile){
      setForm({full_name:profile.full_name||'',username:profile.username||'',bio:profile.bio||'',location:profile.location||'',website:profile.website||''});
      setAvUrl(profile.avatar_url||null);
      setAvPreview(null);setAvFile(null);
    }
  },[open,profile?.id]);

  useEffect(()=>()=>{if(avPreview)URL.revokeObjectURL(avPreview);},[avPreview]);

  const pickFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    if(f.size>5*1024*1024){toast.error('Max 5MB');return;}
    if(!f.type.startsWith('image/')){toast.error('Image only');return;}
    setAvFile(f);setAvPreview(URL.createObjectURL(f));
  };

  const upload=async(f:File):Promise<string>=>{
    const ext=f.name.split('.').pop()?.toLowerCase()||'jpg';
    const path=`avatars/avatar-${profile.id}-${Date.now()}.${ext}`;
    const{error}=await supabase.storage.from('images').upload(path,f,{upsert:true});
    if(error)throw new Error(error.message);
    return supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
  };

  const save=async()=>{
    if(!form.username.trim()){toast.error('Username required');return;}
    setSaving(true);
    try{
      let finalAv=avUrl;
      if(avFile){toast.loading('Uploading…',{id:'av'});finalAv=await upload(avFile);toast.dismiss('av');}
      await onSave({full_name:form.full_name.trim()||null,username:form.username.trim(),bio:form.bio.trim()||null,location:form.location.trim()||null,website:form.website.trim()||null,avatar_url:finalAv});
      onClose();toast.success('Profile saved ✨');
    }catch(e:any){toast.error(e?.message||'Save failed');}
    finally{setSaving(false);}
  };

  if(!open) return null;
  const disp=avPreview||avUrl;
  const [c1,c2]=pal(form.username);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title">Edit Profile</span>
          <button className="modal-x" onClick={onClose}><X style={{width:15,height:15}}/></button>
        </div>
        <div className="modal-body">
          {/* Avatar picker */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24}}>
            <div style={{position:'relative',marginBottom:10}}>
              {/* avatar display */}
              <div style={{width:96,height:96,borderRadius:24,overflow:'hidden',border:'3px solid rgba(129,140,248,.4)',boxShadow:'0 4px 20px rgba(124,58,237,.3)',cursor:'pointer'}} onClick={()=>fileRef.current?.click()}>
                {disp
                  ? <img src={disp} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={()=>{setAvPreview(null);setAvUrl(null);}}/>
                  : <div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,fontWeight:800,color:'#fff',fontFamily:"'Archivo Black',sans-serif"}}>{(form.username||'U').charAt(0).toUpperCase()}</div>
                }
              </div>
              {/* camera button — ALWAYS visible, z-index high */}
              <button
                type="button"
                onClick={()=>fileRef.current?.click()}
                style={{
                  position:'absolute',bottom:-6,right:-6,
                  width:34,height:34,borderRadius:'50%',
                  background:'linear-gradient(135deg,#7c3aed,#0ea5e9)',
                  border:'2.5px solid rgba(6,8,16,1)',
                  cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:'#fff',
                  boxShadow:'0 2px 12px rgba(124,58,237,.6)',
                  zIndex:20,
                  outline:'none',
                }}
              >
                <Camera style={{width:15,height:15,pointerEvents:'none'}}/>
              </button>
            </div>
            <button type="button" onClick={()=>fileRef.current?.click()} style={{fontSize:12.5,color:'var(--accent)',background:'none',border:'none',cursor:'pointer',fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>
              Change Photo
            </button>
            <span style={{fontSize:11,color:'var(--muted)'}}>JPG, PNG, GIF, WEBP · Max 5MB</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={pickFile} style={{display:'none'}}/>
          </div>

          {/* fields */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <label className="field-lbl">Full Name</label>
              <input className="field-in" type="text" value={form.full_name} placeholder="Your name" maxLength={50} onChange={e=>setForm(v=>({...v,full_name:e.target.value}))}/>
            </div>
            <div>
              <label className="field-lbl">Username <span style={{color:'#ef4444'}}>*</span></label>
              <input className="field-in" type="text" value={form.username} placeholder="username" maxLength={30} onChange={e=>setForm(v=>({...v,username:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'')}))}/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label className="field-lbl">Bio</label>
            <textarea className="field-in field-ta" value={form.bio} rows={3} maxLength={160} placeholder="Tell your story…" onChange={e=>setForm(v=>({...v,bio:e.target.value}))}/>
            <div style={{textAlign:'right',fontSize:11,color:'var(--muted)',marginTop:4}}>{form.bio.length}/160</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              <label className="field-lbl">Location</label>
              <input className="field-in" type="text" value={form.location} placeholder="City, Country" maxLength={50} onChange={e=>setForm(v=>({...v,location:e.target.value}))}/>
            </div>
            <div>
              <label className="field-lbl">Website</label>
              <input className="field-in" type="text" value={form.website} placeholder="https://…" maxLength={100} onChange={e=>setForm(v=>({...v,website:e.target.value}))}/>
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn-sec" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-pri" onClick={save} disabled={saving}>
            {saving?<><div className="spinner" style={{width:14,height:14}}/>Saving…</>:<><Save style={{width:14,height:14}}/>Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════
   POST MINI CARD
════════════════════════════ */
function PostCard({post,meId}:{post:Post;meId?:string}) {
  const liked=post.likes?.some(l=>l.user_id===meId);
  const [imgErr,setImgErr]=useState(false);
  const isNASA=post.content?.includes('🌌');
  return (
    <a href={`/post/${post.id}`} className="mini-card">
      {post.image_url&&!imgErr&&(
        <div style={{height:160,overflow:'hidden',flexShrink:0}}>
          <img src={post.image_url} alt="" onError={()=>setImgErr(true)} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .5s'}}/>
        </div>
      )}
      <div style={{padding:'14px 16px',flex:1}}>
        {isNASA&&<span className="nasa-chip">🌌 NASA</span>}
        <p style={{fontSize:13.5,color:'var(--txt2)',lineHeight:1.6,margin:'0 0 10px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {post.content?.replace(/\*\*/g,'').replace(/🌌/g,'').slice(0,120)}
        </p>
        <div style={{display:'flex',gap:14,fontSize:12,color:'var(--muted)'}}>
          <span style={{display:'flex',alignItems:'center',gap:4}}>
            <Heart style={{width:12,height:12}} fill={liked?'#f472b6':'none'} stroke={liked?'#f472b6':'currentColor'}/>{post.likes?.length??0}
          </span>
          <span style={{display:'flex',alignItems:'center',gap:4}}>
            <MessageCircle style={{width:12,height:12}}/>{post.comments?.length??0}
          </span>
          <span style={{display:'flex',alignItems:'center',gap:4,marginLeft:'auto'}}>
            <Clock style={{width:10,height:10}}/>{timeAgo(post.created_at)}
          </span>
        </div>
      </div>
    </a>
  );
}

/* ════════════════════════════
   STAT CHIP — clickable
════════════════════════════ */
function Stat({val,lbl,onClick}:{val:number;lbl:string;onClick?:()=>void}) {
  return (
    <button className={`stat-chip${onClick?' stat-click':''}`} onClick={onClick}>
      <span className="stat-val">{val>=1000?`${(val/1000).toFixed(1)}k`:val}</span>
      <span className="stat-lbl">{lbl}</span>
    </button>
  );
}

/* ════════════════════════════
   MAIN PAGE
════════════════════════════ */
interface Props { params?:{username?:string} }

export default function ProfilePage({params}:Props) {
  const supabase=createClient();
  const [profile,setProfile]=useState<Profile|null>(null);
  const [me,setMe]=useState<any>(null);
  const [posts,setPosts]=useState<Post[]>([]);
  const [bookmarks,setBookmarks]=useState<BookmarkItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState<'posts'|'bookmarks'|'likes'>('posts');
  const [editOpen,setEditOpen]=useState(false);
  const [stats,setStats]=useState({posts:0,followers:0,following:0,likes:0});
  const [followModal,setFollowModal]=useState<{open:boolean;type:'followers'|'following'}>({open:false,type:'followers'});

  const isOwn=me?.id===profile?.id;

  useEffect(()=>{load();},[params?.username]);

  const load=async()=>{
    setLoading(true);
    try{
      const{data:{user}}=await supabase.auth.getUser();setMe(user);
      let q=supabase.from('profiles').select('*');
      if(params?.username) q=q.eq('username',params.username);
      else if(user) q=q.eq('id',user.id);
      else{window.location.href='/login';return;}
      const{data:prof,error}=await q.single();
      if(error)throw error;
      setProfile(prof);
      const{data:postsData}=await supabase.from('posts').select('*,profiles(id,username,avatar_url,full_name,bio,location,website,created_at,updated_at,role),likes(id,user_id),comments(id)').eq('user_id',prof.id).order('created_at',{ascending:false});
      setPosts(postsData||[]);
      if(user&&user.id===prof.id){
        const{data:bms}=await supabase.from('bookmarks').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
        setBookmarks(bms||[]);
      }
      const[{count:flrs},{count:fling}]=await Promise.all([
        supabase.from('follows').select('*',{count:'exact',head:true}).eq('following_id',prof.id),
        supabase.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',prof.id),
      ]);
      const totalLikes=(postsData||[]).reduce((s,p)=>s+(p.likes?.length??0),0);
      setStats({posts:postsData?.length??0,followers:flrs??0,following:fling??0,likes:totalLikes});
    }catch(e){console.error(e);toast.error('Failed to load');}
    finally{setLoading(false);}
  };

  const updateProfile=async(data:Partial<Profile>)=>{
    if(!profile)return;
    const{error}=await supabase.from('profiles').update({...data,updated_at:new Date().toISOString()}).eq('id',profile.id);
    if(error)throw error;
    setProfile(p=>({...p!,...data}));
  };

  const logout=async()=>{await supabase.auth.signOut();window.location.href='/';};

  /* ── follow / unfollow ── */
  const [following,setFollowing]=useState(false);
  useEffect(()=>{
    if(!me||!profile||isOwn)return;
    supabase.from('follows').select('id').eq('follower_id',me.id).eq('following_id',profile.id).maybeSingle()
      .then(({data})=>setFollowing(!!data));
  },[me?.id,profile?.id]);

  const toggleFollow=async()=>{
    if(!me||!profile)return;
    if(following){
      await supabase.from('follows').delete().eq('follower_id',me.id).eq('following_id',profile.id);
      setFollowing(false);setStats(s=>({...s,followers:s.followers-1}));toast.success('Unfollowed');
    }else{
      await supabase.from('follows').insert({follower_id:me.id,following_id:profile.id});
      setFollowing(true);setStats(s=>({...s,followers:s.followers+1}));toast.success('Following! 🚀');
    }
  };

  /* ── skeleton ── */
  if(loading) return (
    <div className="prof-page">
      <style>{STYLES}</style>
      <div className="sk" style={{height:220}}/>
      <div style={{maxWidth:920,margin:'0 auto',padding:'0 20px'}}>
        <div style={{display:'flex',gap:20,marginTop:-60,marginBottom:24}}>
          <div className="sk" style={{width:130,height:130,borderRadius:28,flexShrink:0}}/>
          <div style={{flex:1,paddingTop:16}}>
            <div className="sk" style={{width:'40%',height:26,borderRadius:8,marginBottom:12}}/>
            <div className="sk" style={{width:'60%',height:16,borderRadius:6,marginBottom:8}}/>
            <div className="sk" style={{width:'45%',height:16,borderRadius:6}}/>
          </div>
        </div>
      </div>
    </div>
  );

  if(!profile) return (
    <div className="prof-page" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <style>{STYLES}</style>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>👤</div>
        <h2 style={{fontSize:22,fontWeight:700,fontFamily:"'Archivo Black',sans-serif"}}>Profile not found</h2>
        <p style={{color:'var(--muted)',marginTop:8}}>This username doesn't exist</p>
        <a href="/feed" style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:20,color:'var(--accent)',textDecoration:'none',fontWeight:600}}><ArrowLeft style={{width:14,height:14}}/>Back to Feed</a>
      </div>
    </div>
  );

  const displayName=profile.full_name||profile.username;
  const joinDate=new Date(profile.created_at).toLocaleDateString('en',{month:'long',year:'numeric'});

  return (
    <div className="prof-page">
      <style>{STYLES}</style>

      {/* ── COVER ── */}
      <div className="cover">
       <div className="cover-grad"/>
<div className="cover-blob cover-blob-1"/>
<div className="cover-blob cover-blob-2"/>  
<div className="cover-blob cover-blob-3"/>
<div className="cover-stars"/>
<div className="cover-fade"/>
        {/* subtle orbit rings */}
        <div className="cover-ring" style={{width:280,height:280,top:'50%',right:'18%',transform:'translateY(-50%)',animationDuration:'18s'}}/>
        <div className="cover-ring" style={{width:160,height:160,top:'30%',right:'32%',transform:'translateY(-50%)',animationDuration:'12s',opacity:.4}}/>
      </div>

      <div className="prof-wrap">
        {/* ── HERO SECTION ── */}
        <div className="prof-hero">
          {/* Avatar with camera overlay — correct z-index stacking */}
          <div className="av-shell" style={{marginTop:-70}}>
            <Avatar name={displayName} size={136} url={profile.avatar_url} ring/>
            {isOwn&&(
              <button
                className="av-cam"
                onClick={()=>setEditOpen(true)}
                type="button"
                aria-label="Edit profile photo"
              >
                <Camera style={{width:16,height:16,pointerEvents:'none'}}/>
              </button>
            )}
          </div>

          {/* info */}
          <div className="prof-info">
            <div className="prof-toprow">
              <div>
                <h1 className="prof-name">{displayName}</h1>
                <span className="prof-handle">@{profile.username}</span>
                {profile.role&&profile.role!=='user'&&<span className="role-badge"><Star style={{width:9,height:9}}/>{profile.role}</span>}
              </div>

              {/* action buttons */}
              <div className="prof-actions">
                {isOwn?(
                  <>
                    {/* ← FIXED: plain button, no z-index conflict */}
                    <button
                      className="btn-edit"
                      onClick={()=>setEditOpen(true)}
                      type="button"
                    >
                      <Edit3 style={{width:14,height:14}}/> Edit Profile
                    </button>
                    <button className="btn-icon-sm" onClick={logout} title="Sign out"><LogOut style={{width:14,height:14}}/></button>
                    <button className="btn-icon-sm" onClick={()=>{navigator.clipboard?.writeText(location.href);toast.success('Link copied!');}} title="Share profile"><Share2 style={{width:14,height:14}}/></button>
                  </>
                ):(
                  <button className={`btn-follow${following?' on':''}`} onClick={toggleFollow}>
                    {following?<><UserCheck style={{width:15,height:15}}/>Following</>:<><UserPlus style={{width:15,height:15}}/>Follow</>}
                  </button>
                )}
              </div>
            </div>

            {profile.bio&&<p className="prof-bio">{profile.bio}</p>}

            <div className="prof-meta">
              {profile.location&&<span className="meta-chip"><MapPin style={{width:12,height:12}}/>{profile.location}</span>}
              {profile.website&&<a href={profile.website.startsWith('http')?profile.website:`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="meta-chip meta-link"><LinkIcon style={{width:12,height:12}}/>{profile.website.replace(/^https?:\/\//,'').split('/')[0]}</a>}
              <span className="meta-chip"><CalendarDays style={{width:12,height:12}}/>Joined {joinDate}</span>
            </div>

            {/* stats row */}
            <div className="stats-row">
              <Stat val={stats.posts} lbl="Posts" onClick={()=>setTab('posts')}/>
              <div className="stat-sep"/>
              <Stat val={stats.followers} lbl="Followers" onClick={()=>setFollowModal({open:true,type:'followers'})}/>
              <div className="stat-sep"/>
              <Stat val={stats.following} lbl="Following" onClick={()=>setFollowModal({open:true,type:'following'})}/>
              <div className="stat-sep"/>
              <Stat val={stats.likes} lbl="Likes"/>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="prof-tabs">
          {[
            {id:'posts',lb:'Posts',count:stats.posts},
            ...(isOwn?[{id:'bookmarks',lb:'Saved',count:bookmarks.length}]:[]),
            {id:'likes',lb:'Liked',count:stats.likes},
          ].map(({id,lb,count})=>(
            <button key={id} className={`ptab${tab===id?' on':''}`} onClick={()=>setTab(id as any)}>
              {lb}
              {count>0&&<span className="ptab-ct">{count>=1000?`${(count/1000).toFixed(1)}k`:count}</span>}
              {tab===id&&<div className="ptab-line"/>}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="prof-grid">
          {tab==='posts'&&(
            posts.length>0?posts.map(p=><PostCard key={p.id} post={p} meId={me?.id}/>):(
              <div className="prof-empty">
                <span style={{fontSize:44}}>📡</span>
                <h3>{isOwn?'Share your first discovery!':profile.username+' hasn\'t posted yet'}</h3>
                {isOwn&&<a href="/feed" className="empty-link">Go to Feed →</a>}
              </div>
            )
          )}
          {tab==='bookmarks'&&isOwn&&(
            bookmarks.length>0?bookmarks.map(b=>(
              <a key={b.id} href={b.bookmark_type==='post'&&b.post_id?`/post/${b.post_id}`:'/nasa'} className="mini-card">
                {b.image_url&&<div style={{height:150,overflow:'hidden'}}><img src={b.image_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}
                <div style={{padding:'14px 16px'}}>
                  <span style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.14em',fontWeight:700,color:b.bookmark_type==='apod'?'#a78bfa':'#38bdf8',fontFamily:"'Archivo Black',sans-serif",display:'block',marginBottom:6}}>{b.bookmark_type==='apod'?'🌌 NASA':'📝 Post'}</span>
                  <p style={{fontSize:13.5,fontWeight:700,color:'var(--txt)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'Archivo Black',sans-serif"}}>{b.title||'Saved item'}</p>
                  <span style={{fontSize:11,color:'var(--muted)',marginTop:6,display:'flex',alignItems:'center',gap:4}}><Clock style={{width:10,height:10}}/>{timeAgo(b.created_at)}</span>
                </div>
              </a>
            )):(
              <div className="prof-empty">
                <span style={{fontSize:44}}>🔖</span>
                <h3>No saved items yet</h3>
                <p>Save posts or NASA images to see them here</p>
              </div>
            )
          )}
          {tab==='likes'&&(
            <div className="prof-empty">
              <span style={{fontSize:44}}>❤️</span>
              <h3>Likes coming soon</h3>
              <p>Posts you've liked will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {profile&&<EditModal open={editOpen} onClose={()=>setEditOpen(false)} profile={profile} onSave={updateProfile}/>}
      {profile&&<FollowModal open={followModal.open} onClose={()=>setFollowModal(p=>({...p,open:false}))} type={followModal.type} profileId={profile.id} meId={me?.id||null}/>}
    </div>
  );
}

/* ════════════════════════════
   STYLES — complete redesign
════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

:root {
  --bg:    #060810;
  --card:  rgba(10,13,24,.85);
  --card2: rgba(14,17,30,.9);
  --accent:#818cf8;
  --txt:   rgba(226,232,240,.97);
  --txt2:  rgba(203,213,225,.74);
  --muted: rgba(100,116,139,.5);
  --border:rgba(255,255,255,.07);
  --border2:rgba(255,255,255,.04);
}
*,*::before,*::after{box-sizing:border-box;margin:0;}

/* smooth scroll */
html { scroll-behavior: smooth; }
* { scrollbar-width:thin; scrollbar-color:rgba(129,140,248,.15) transparent; }
*::-webkit-scrollbar{width:3px;}
*::-webkit-scrollbar-thumb{background:rgba(129,140,248,.15);border-radius:99px;}

.prof-page { min-height:100svh; background:var(--bg); padding-top:64px; font-family:'DM Sans',sans-serif; color:var(--txt); }

/* ── COVER ── */
.cover { height:240px; position:relative; overflow:hidden; }
.cover-grad { position:absolute; inset:0; background:linear-gradient(135deg,#1a0f3a 0%,#0d1b35 55%,#060c1a 100%); }
.cover-blob { position:absolute; border-radius:50%; filter:blur(75px); pointer-events:none; }
.cover-blob-1 { width:550px; height:550px; top:-200px; left:-120px; background:radial-gradient(circle,rgba(124,58,237,.2) 0%,transparent 70%); animation:coverBlob 15s ease-in-out infinite; }
.cover-blob-2 { width:420px; height:420px; top:-120px; right:-80px; background:radial-gradient(circle,rgba(14,165,233,.15) 0%,transparent 70%); animation:coverBlob 19s ease-in-out 7s infinite; }
.cover-blob-3 { width:240px; height:240px; bottom:-60px; left:45%; background:radial-gradient(circle,rgba(244,114,182,.1) 0%,transparent 70%); animation:coverBlob 24s ease-in-out 3s infinite; }
@keyframes coverBlob { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1) translate(20px,-15px)} }
.cover-fade { position:absolute; bottom:0; left:0; right:0; height:100px; background:linear-gradient(to bottom,transparent,#060810); }
.cover-stars { position:absolute; inset:0; background-image:radial-gradient(1px 1px at 8% 30%,rgba(255,255,255,.65),transparent),radial-gradient(1px 1px at 30% 18%,rgba(255,255,255,.5),transparent),radial-gradient(1.5px 1.5px at 65% 52%,rgba(167,139,250,.6),transparent),radial-gradient(1px 1px at 82% 22%,rgba(255,255,255,.55),transparent),radial-gradient(2px 2px at 50% 70%,rgba(56,189,248,.4),transparent),radial-gradient(1px 1px at 18% 78%,rgba(255,255,255,.45),transparent),radial-gradient(1px 1px at 88% 72%,rgba(255,255,255,.4),transparent),radial-gradient(1.5px 1.5px at 42% 40%,rgba(99,102,241,.45),transparent); animation:twinkle 5s ease-in-out infinite alternate; }
@keyframes twinkle{0%{opacity:.7}100%{opacity:1}}
.cover-ring { position:absolute; border-radius:50%; border:1px solid rgba(129,140,248,.12); animation:spin linear infinite; pointer-events:none; }
@keyframes spin{to{transform:translateY(-50%) rotate(360deg)}}

/* ── WRAP ── */
.prof-wrap { max-width:920px; margin:0 auto; padding:0 20px 80px; }

/* ── HERO ── */
.prof-hero { display:flex; gap:24px; align-items:flex-end; margin-bottom:28px; flex-wrap:wrap; }
@media(max-width:600px){ .prof-hero{flex-direction:column;align-items:flex-start;} }
.prof-info { flex:1; min-width:260px; padding-bottom:4px; }

/* ── AVATAR SHELL ── */
.av-shell {
  position: relative;
  flex-shrink: 0;
  /* ensure camera button isn't clipped */
  overflow: visible;
}
/* CAMERA BUTTON — always visible on own profile */
.av-cam {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #0ea5e9);
  border: 3px solid var(--bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 3px 14px rgba(124,58,237,.65);
  z-index: 10;
  outline: none;
  transition: transform .22s ease, box-shadow .22s ease;
}
.av-cam:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 18px rgba(124,58,237,.8);
}

.prof-toprow { display:flex; align-items:flex-start; justify-content:space-between; gap:12; flex-wrap:wrap; margin-bottom:10; }
.prof-name { font-size:28px; font-weight:700; color:var(--txt); font-family:'Archivo Black',sans-serif; letter-spacing:-.025em; line-height:1.1; }
.prof-handle { font-size:13.5px; color:var(--accent); font-weight:600; background:rgba(129,140,248,.1); padding:3px 10px; border-radius:20px; border:1px solid rgba(129,140,248,.2); display:inline-block; margin:4px 0; }
.role-badge { display:inline-flex; align-items:center; gap:5px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; padding:3px 10px; border-radius:20px; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.3); color:#c4b5fd; font-family:'Archivo Black',sans-serif; margin-left:8px; vertical-align:middle; }

.prof-bio { font-size:14.5px; color:var(--txt2); line-height:1.72; margin-bottom:12px; max-width:540px; }

.prof-meta { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
.meta-chip { display:inline-flex; align-items:center; gap:5px; font-size:12.5px; color:var(--muted); background:rgba(255,255,255,.04); padding:5px 12px; border-radius:30px; border:1px solid var(--border); text-decoration:none; transition:all .2s; }
.meta-link:hover { color:var(--accent); border-color:rgba(129,140,248,.3); background:rgba(129,140,248,.06); }

/* ── ACTION BUTTONS ── */
.prof-actions { display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; margin-top:4px; }
.btn-edit {
  display:inline-flex; align-items:center; gap:7px;
  padding:9px 20px; border-radius:50px;
  font-size:13.5px; font-weight:700;
  cursor:pointer; border:none;
  font-family:'Archivo Black',sans-serif;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.12);
  color:var(--txt);
  transition:all .22s;
  white-space:nowrap;
}
.btn-edit:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.18); transform:translateY(-1px); }
.btn-icon-sm { display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:50%; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); color:var(--muted); cursor:pointer; transition:all .2s; }
.btn-icon-sm:hover { color:var(--txt); background:rgba(255,255,255,.09); border-color:rgba(255,255,255,.16); }
.btn-follow { display:inline-flex; align-items:center; gap:7px; padding:9px 22px; border-radius:50px; font-size:13.5px; font-weight:700; cursor:pointer; font-family:'Archivo Black',sans-serif; transition:all .22s; white-space:nowrap; border:1.5px solid rgba(129,140,248,.4); background:rgba(129,140,248,.1); color:var(--accent); }
.btn-follow:hover:not(:disabled) { background:rgba(129,140,248,.2); transform:translateY(-1px); }
.btn-follow.on { background:rgba(52,211,153,.1); border-color:rgba(52,211,153,.35); color:#34d399; }
.btn-follow.on:hover { background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.3); color:#f87171; }

/* ── STATS ── */
.stats-row { display:flex; align-items:center; gap:0; flex-wrap:wrap; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:18px; padding:4px; overflow:hidden; }
.stat-chip { display:flex; flex-direction:column; align-items:center; padding:10px 22px; border-radius:14px; background:none; border:none; transition:background .2s; font-family:inherit; }
.stat-click { cursor:pointer; }
.stat-click:hover { background:rgba(255,255,255,.06); }
.stat-val { font-size:20px; font-weight:700; color:var(--txt); font-family:'Archivo Black',sans-serif; line-height:1.2; }
.stat-lbl { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-top:2px; }
.stat-sep { width:1px; height:36px; background:rgba(255,255,255,.06); flex-shrink:0; }

/* ── TABS ── */
.prof-tabs { display:flex; border-bottom:1px solid var(--border); margin-bottom:24px; }
.ptab { display:flex; align-items:center; gap:7px; padding:13px 20px; font-size:13.5px; font-weight:700; color:var(--muted); cursor:pointer; border:none; background:none; font-family:'Archivo Black',sans-serif; position:relative; transition:color .2s; }
.ptab:hover { color:var(--txt2); }
.ptab.on { color:var(--txt); }
.ptab-ct { display:inline-flex; align-items:center; justify-content:center; min-width:20px; height:20px; border-radius:6px; background:rgba(255,255,255,.07); font-size:10.5px; font-weight:700; padding:0 5px; font-family:'Archivo Black',sans-serif; }
.ptab.on .ptab-ct { background:rgba(129,140,248,.18); color:var(--accent); }
.ptab-line { position:absolute; bottom:-1px; left:8%; right:8%; height:2.5px; border-radius:2px; background:linear-gradient(90deg,#7c3aed,#0ea5e9); animation:slideIn .25s ease both; }
@keyframes slideIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}

/* ── GRID ── */
.prof-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }

.mini-card { background:var(--card); border:1px solid var(--border); border-radius:18px; overflow:hidden; text-decoration:none; display:flex; flex-direction:column; cursor:pointer; transition:all .28s cubic-bezier(.16,1,.3,1); backdrop-filter:blur(14px); animation:cardIn .4s cubic-bezier(.16,1,.3,1) both; }
.mini-card:hover { transform:translateY(-4px); border-color:rgba(129,140,248,.3); box-shadow:0 14px 30px rgba(0,0,0,.32); }
.mini-card:hover img { transform:scale(1.05); }
@keyframes cardIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.nasa-chip { display:inline-block; padding:2px 8px; border-radius:12px; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.28); font-size:10px; font-weight:700; color:#a78bfa; margin-bottom:6px; font-family:'Archivo Black',sans-serif; }

.prof-empty { grid-column:1/-1; text-align:center; padding:64px 24px; background:var(--card); border:1px solid var(--border); border-radius:20px; display:flex; flex-direction:column; align-items:center; gap:8px; }
.prof-empty h3 { font-size:18px; font-weight:700; color:var(--txt); font-family:'Archivo Black',sans-serif; }
.prof-empty p { font-size:14px; color:var(--muted); }
.empty-link { color:var(--accent); font-size:14px; margin-top:8px; text-decoration:none; font-weight:600; }

/* ── MODAL ── */
.modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.88); backdrop-filter:blur(12px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
.modal-box { background:rgba(8,10,20,.98); border:1px solid rgba(255,255,255,.1); border-radius:26px; max-width:480px; width:100%; max-height:92vh; overflow-y:auto; box-shadow:0 28px 90px rgba(0,0,0,.65); animation:modalIn .3s cubic-bezier(.16,1,.3,1) both; }
@keyframes modalIn{from{opacity:0;transform:scale(.93) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
.modal-hd { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid rgba(255,255,255,.07); position:sticky; top:0; background:rgba(8,10,20,.98); z-index:10; border-radius:26px 26px 0 0; }
.modal-title { font-size:17px; font-weight:700; color:var(--txt); font-family:'Archivo Black',sans-serif; }
.modal-x { width:32px; height:32px; border-radius:9px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:var(--muted); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.modal-x:hover { background:rgba(255,255,255,.09); color:var(--txt); }
.modal-body { padding:20px 22px; }
.modal-ft { display:flex; gap:10px; padding:14px 22px 20px; border-top:1px solid rgba(255,255,255,.07); }

/* field */
.field-lbl { display:block; font-size:12px; font-weight:600; color:rgba(203,213,225,.6); margin-bottom:5px; font-family:'DM Sans',sans-serif; }
.field-in { width:100%; padding:10px 13px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); border-radius:12px; color:var(--txt); font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s, background .2s; }
.field-in:focus { border-color:rgba(129,140,248,.45); background:rgba(255,255,255,.07); }
.field-ta { resize:none; }

/* buttons */
.btn-pri { flex:1; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px; border-radius:50px; font-size:14px; font-weight:700; cursor:pointer; border:none; background:linear-gradient(135deg,#7c3aed,#0ea5e9); color:#fff; font-family:'Archivo Black',sans-serif; transition:all .2s; }
.btn-pri:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 5px 16px rgba(124,58,237,.45); }
.btn-pri:disabled { opacity:.4; cursor:not-allowed; }
.btn-sec { flex:1; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px; border-radius:50px; font-size:14px; font-weight:600; cursor:pointer; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); color:var(--muted); font-family:'DM Sans',sans-serif; transition:all .2s; }
.btn-sec:hover:not(:disabled) { background:rgba(255,255,255,.09); color:var(--txt); }
.btn-sec:disabled { opacity:.4; cursor:not-allowed; }

/* follow list */
.flist-row { display:flex; align-items:center; gap:12px; padding:13px 22px; transition:background .15s; border-bottom:1px solid rgba(255,255,255,.04); }
.flist-row:hover { background:rgba(255,255,255,.025); }
.flist-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:700; flex-shrink:0; cursor:pointer; transition:all .2s; font-family:'Archivo Black',sans-serif; border:1px solid rgba(129,140,248,.28); background:rgba(129,140,248,.08); color:var(--accent); }
.flist-btn:hover { background:rgba(129,140,248,.18); }
.flist-btn.on { border-color:rgba(52,211,153,.28); background:rgba(52,211,153,.08); color:#34d399; }
.flist-btn.on:hover { background:rgba(239,68,68,.07); border-color:rgba(239,68,68,.28); color:#f87171; }

/* misc */
.sk { background:rgba(255,255,255,.055); animation:shimmer 1.8s ease-in-out infinite; border-radius:8px; display:block; }
@keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.85}}
.spinner { width:20px; height:20px; border-radius:50%; border:2.5px solid rgba(129,140,248,.15); border-top-color:rgba(129,140,248,.7); animation:spinA 1s linear infinite; flex-shrink:0; }
@keyframes spinA{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.01ms!important;}}
`;