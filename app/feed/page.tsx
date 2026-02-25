'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Share2, Bookmark, Send,
  Image as ImageIcon, X, TrendingUp, Zap, Clock,
  Sparkles, MoreHorizontal, Loader2, Globe,
  User, Check, AtSign, Hash,
  ChevronDown, Repeat2, BarChart2,
  Flame, Link2, Flag, ArrowUp,
  UserPlus, UserCheck, Download, ZoomIn,
  ChevronLeft, ChevronRight, Maximize2,
} from 'lucide-react';

/* ════════════════════════════════════════════
   TYPES
════════════════════════════════════════════ */
interface Comment {
  id: string; content: string; created_at: string;
  user_id: string; post_id: string;
  profiles: { username: string; avatar_url: string | null };
}
interface Post {
  id: string; title: string | null; content: string | null;
  image_url?: string | null; created_at: string; user_id: string;
  category?: string | null;
  profiles: { username: string; avatar_url: string | null };
  likes: { id: string; user_id: string }[];
  comments: Comment[];
}

/* ════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════ */
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  if (s < 604800) return `${Math.floor(s/86400)}d`;
  return new Date(d).toLocaleDateString('en',{month:'short',day:'numeric'});
}

const PALETTES = [
  ['#7c3aed','#4f46e5'],['#0ea5e9','#06b6d4'],['#ec4899','#f43f5e'],
  ['#10b981','#059669'],['#f59e0b','#f97316'],['#8b5cf6','#a855f7'],
];
const pal = (n='') => PALETTES[(n.charCodeAt(0)||65)%PALETTES.length];

function Avatar({name='A',size=40,url,verified=false}:{name?:string;size?:number;url?:string|null;verified?:boolean}) {
  const [err,setErr] = useState(false);
  const [c1,c2] = pal(name);
  useEffect(()=>{setErr(false)},[url]);
  return (
    <div style={{position:'relative',flexShrink:0,width:size,height:size}}>
      {url&&!err
        ? <img src={url} alt={name} onError={()=>setErr(true)} style={{width:size,height:size,borderRadius:Math.round(size*.3),objectFit:'cover',display:'block'}}/>
        : <div style={{width:size,height:size,borderRadius:Math.round(size*.3),background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.4,fontWeight:800,color:'#fff',userSelect:'none',fontFamily:"'Archivo Black',sans-serif"}}>{name.charAt(0).toUpperCase()}</div>
      }
      {verified&&<div style={{position:'absolute',bottom:-2,right:-2,width:size*.38,height:size*.38,borderRadius:'50%',background:'linear-gradient(135deg,#0ea5e9,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid var(--bg)'}}><Check style={{width:size*.18,height:size*.18,color:'#fff',strokeWidth:3}}/></div>}
    </div>
  );
}

/* ════════════════════════════════════════════
   IMAGE LIGHTBOX — the core feature
════════════════════════════════════════════ */
function Lightbox({src, title, onClose}: {src:string; title?:string; onClose:()=>void}) {
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [drag, setDrag] = useState<{x:number;y:number}|null>(null);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // keyboard
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key==='Escape') onClose();
      if (e.key==='z'||e.key==='Z') setZoom(v=>!v);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'),{href:url,download:`stellarhub-${Date.now()}.jpg`}).click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch { toast.error('Download failed'); }
  };

  return (
    <div
      className="lb-root"
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}
      onTouchStart={e => setDrag({x:e.touches[0].clientX,y:e.touches[0].clientY})}
      onTouchEnd={e => {
        if (!drag) return;
        const dy = drag.y - e.changedTouches[0].clientY;
        if (dy > 80) onClose();
        setDrag(null);
      }}
    >
      {/* backdrop blur canvas */}
      <div className="lb-backdrop"/>

      {/* top bar */}
      <div className="lb-bar">
        <div className="lb-bar-left">
          {title && <span className="lb-title">{title}</span>}
        </div>
        <div className="lb-bar-right">
          <button className="lb-pill" onClick={()=>setZoom(v=>!v)}>
            <ZoomIn style={{width:13,height:13}}/> {zoom ? 'Zoom Out' : 'Zoom In'}
          </button>
          <button className="lb-pill" onClick={handleDownload}>
            <Download style={{width:13,height:13}}/> Save
          </button>
          <a className="lb-pill" href={src} target="_blank" rel="noopener noreferrer">
            <Maximize2 style={{width:13,height:13}}/> Original
          </a>
          <button className="lb-close-btn" onClick={onClose}>
            <X style={{width:16,height:16}}/>
          </button>
        </div>
      </div>

      {/* image stage */}
      <div className="lb-stage">
        {!loaded && (
          <div className="lb-loader">
            <div className="lb-spinner"/>
            <span>Loading…</span>
          </div>
        )}
        <div
          className={`lb-img-wrap ${zoom?'zoomed':''}`}
          style={{opacity: loaded ? 1 : 0}}
          onClick={() => setZoom(v=>!v)}
        >
          <img
            src={src} alt={title||'Image'}
            className="lb-img"
            onLoad={()=>setLoaded(true)}
            draggable={false}
          />
        </div>
      </div>

      {/* swipe hint on mobile */}
      <div className="lb-hint">Swipe down to close · Press Z to zoom</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   CONTENT RENDERER
════════════════════════════════════════════ */
function renderContent(text: string|null) {
  if (!text) return null;
  const isNASA = text.includes('🌌') && text.includes('Deskripsi NASA:');
  if (isNASA) {
    const lines = text.split('\n');
    const titleLine = lines.find(l=>l.includes('**')&&!l.includes('Deskripsi'));
    const title = titleLine?.replace(/\*\*/g,'').replace('🌌','').trim()||'';
    const descIdx = lines.findIndex(l=>l.includes('Deskripsi NASA:'));
    const cmtIdx  = lines.findIndex(l=>l.includes('Komentar saya:'));
    let desc='', cmt='';
    if(descIdx!==-1) for(let i=descIdx+1;i<lines.length;i++){if(lines[i].includes('Komentar')||lines[i].startsWith('#'))break;desc+=lines[i]+' ';}
    if(cmtIdx !==-1) for(let i=cmtIdx+1; i<lines.length;i++){if(lines[i].startsWith('#'))break;cmt+=lines[i]+' ';}
    const tags = lines.filter(l=>l.trim().startsWith('#')).join(' ');
    return (
      <div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
          <span style={{fontSize:17}}>🌌</span>
          <span style={{fontSize:14.5,fontWeight:700,color:'var(--accent)',fontFamily:"'Archivo Black',sans-serif"}}>{title}</span>
          <span className="nasa-badge">NASA</span>
        </div>
        {desc&&<div style={{background:'linear-gradient(135deg,rgba(124,58,237,.08),rgba(14,165,233,.05))',borderLeft:'3px solid rgba(124,58,237,.5)',padding:'10px 14px',borderRadius:'0 10px 10px 0',marginBottom:10}}><p style={{margin:0,color:'var(--txt2)',fontSize:13.5,lineHeight:1.65}}>{desc.trim()}</p></div>}
        {cmt&&<p style={{color:'var(--txt2)',fontSize:14.5,lineHeight:1.75,marginBottom:8}}>{cmt.trim()}</p>}
        {tags&&<div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>{tags.split(/\s+/).filter(h=>h.startsWith('#')).map((t,i)=><span key={i} style={{color:'var(--accent)',fontSize:13,fontWeight:600,cursor:'pointer'}}>{t}</span>)}</div>}
      </div>
    );
  }
  return (
    <p style={{margin:0,color:'var(--txt2)',fontSize:15,lineHeight:1.82}}>
      {text.split(/(\s+)/).map((w,i)=>{
        if(w.startsWith('#')) return <span key={i} style={{color:'var(--accent)',fontWeight:600,cursor:'pointer'}}>{w}</span>;
        if(w.startsWith('@')) return <span key={i} style={{color:'#38bdf8',fontWeight:600,cursor:'pointer'}}>{w}</span>;
        return w;
      })}
    </p>
  );
}

/* ════════════════════════════════════════════
   INLINE FOLLOW BUTTON
════════════════════════════════════════════ */
function FollowBtn({me,target}:{me:string|null;target:string}) {
  const supabase = createClient();
  const [following, setFollowing] = useState<boolean|null>(null);
  useEffect(()=>{
    if(!me||me===target) return;
    supabase.from('follows').select('id').eq('follower_id',me).eq('following_id',target).maybeSingle()
      .then(({data})=>setFollowing(!!data));
  },[me,target]);
  if(!me||me===target||following===null) return null;
  const toggle=async(e:React.MouseEvent)=>{
    e.preventDefault();e.stopPropagation();
    if(following){
      await supabase.from('follows').delete().eq('follower_id',me).eq('following_id',target);
      setFollowing(false); toast.success('Unfollowed');
    }else{
      await supabase.from('follows').insert({follower_id:me,following_id:target});
      setFollowing(true); toast.success('Following 🚀');
    }
  };
  return (
    <button onClick={toggle} className={`ifollow ${following?'on':''}`}>
      {following?<><UserCheck style={{width:11,height:11}}/>Following</>:<><UserPlus style={{width:11,height:11}}/>Follow</>}
    </button>
  );
}

/* ════════════════════════════════════════════
   POST CARD
════════════════════════════════════════════ */
function PostCard({post,me,onLike,onComment,onDelete,openLightbox}:{
  post:Post; me:any;
  onLike:(id:string)=>void;
  onComment:(id:string,text:string)=>Promise<void>;
  onDelete?:(id:string)=>void;
  openLightbox:(url:string,title?:string)=>void;
}) {
  const [showCmt,setShowCmt] = useState(false);
  const [cmtText,setCmtText] = useState('');
  const [busy,setBusy] = useState(false);
  const [saved,setSaved] = useState(false);
  const [imgErr,setImgErr] = useState(false);
  const [imgOk,setImgOk] = useState(false);
  const [menu,setMenu] = useState(false);
  const [repost,setRepost] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef  = useRef<HTMLDivElement>(null);

  const liked = post.likes?.some(l=>l.user_id===me?.id)??false;
  const likeN = post.likes?.length??0;
  const cmtN  = post.comments?.length??0;
  const isOwn = me?.id===post.user_id;
  const isNASA= post.content?.includes('🌌')&&post.content?.includes('Deskripsi NASA:');
  const uname = post.profiles?.username||'Anonymous';

  useEffect(()=>{
    const fn=(e:MouseEvent)=>{if(menuRef.current&&!menuRef.current.contains(e.target as Node))setMenu(false);};
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);

  const sendCmt=async()=>{
    const t=cmtText.trim();if(!t||busy)return;
    setBusy(true);await onComment(post.id,t);setCmtText('');setBusy(false);
  };

  return (
    <article className="pcard">
      {/* ── header ── */}
      <div className="pcard-head">
        <a href={`/profile/${uname}`} className="pcard-author">
          <Avatar name={uname} url={post.profiles?.avatar_url} size={46} verified={isNASA}/>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <span className="pcard-name">{uname}</span>
              {isNASA&&<span className="nasa-badge">NASA</span>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5,marginTop:3}}>
              <Clock style={{width:10,height:10,color:'var(--muted)'}}/> 
              <span style={{fontSize:11.5,color:'var(--muted)'}}>{timeAgo(post.created_at)}</span>
              <span style={{color:'var(--muted)',fontSize:9}}>·</span>
              <Globe style={{width:10,height:10,color:'var(--muted)'}}/>
            </div>
          </div>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <FollowBtn me={me?.id||null} target={post.user_id}/>
          <div ref={menuRef} style={{position:'relative'}}>
            <button className="icon-btn" onClick={()=>setMenu(v=>!v)}><MoreHorizontal style={{width:16,height:16}}/></button>
            {menu&&(
              <div className="pmenu">
                {[
                  {ic:Link2,lb:'Copy Link',fn:()=>{navigator.clipboard?.writeText(location.origin+'/post/'+post.id);toast.success('Copied!');setMenu(false);}},
                  {ic:Bookmark,lb:'Save',fn:()=>{toast.success('Saved ✨');setMenu(false);}},
                  {ic:Flag,lb:'Report',fn:()=>{toast('Reported',{icon:'🚩'});setMenu(false);}},
                  ...(isOwn?[{ic:X,lb:'Delete',fn:()=>{onDelete?.(post.id);setMenu(false);}}]:[]),
                ].map(({ic:Ic,lb,fn})=>(
                  <button key={lb} onClick={fn} className="pmenu-item"><Ic style={{width:13,height:13}}/>{lb}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── content ── */}
      {post.content&&<div style={{padding:'0 20px 16px'}}>{renderContent(post.content)}</div>}

      {/* ── IMAGE — click to open lightbox ── */}
      {post.image_url&&!imgErr&&(
        <div
          className="pcard-img-shell"
          onClick={()=>{ if(imgOk) openLightbox(post.image_url!, post.title||uname); }}
          title="Click to enlarge"
        >
          {!imgOk&&<div className="sk" style={{width:'100%',paddingTop:'52%'}}/>}
          <img
            src={post.image_url} alt="post"
            className="pcard-img"
            style={{display:imgOk?'block':'none'}}
            onLoad={()=>setImgOk(true)}
            onError={()=>setImgErr(true)}
          />
          {imgOk&&(
            <div className="pcard-img-overlay">
              <div className="pcard-zoom-pill">
                <ZoomIn style={{width:14,height:14}}/> Click to expand
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── reaction strip ── */}
      {(likeN>0||cmtN>0)&&(
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'7px 20px',borderTop:'1px solid var(--border2)'}}>
          {likeN>0&&<div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{display:'flex'}}>{['#f472b6','#fb7185','#f43f5e'].slice(0,Math.min(3,likeN)).map((c,i)=>(
              <div key={i} style={{width:17,height:17,borderRadius:'50%',background:c,border:'2px solid var(--card)',marginLeft:i>0?-5:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Heart style={{width:7,height:7,color:'#fff'}} fill="#fff" strokeWidth={0}/>
              </div>
            ))}</div>
            <span style={{fontSize:12,color:'var(--muted)'}}>{likeN.toLocaleString()}</span>
          </div>}
          {cmtN>0&&<button onClick={()=>setShowCmt(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,color:'var(--muted)',padding:0,marginLeft:'auto'}}>
            {cmtN} {cmtN===1?'comment':'comments'}
          </button>}
        </div>
      )}

      {/* ── actions ── */}
      <div className="pcard-actions">
        <button className={`abt${liked?' abt-liked':''}`} onClick={()=>onLike(post.id)}>
          <Heart style={{width:17,height:17}} fill={liked?'currentColor':'none'} strokeWidth={liked?0:1.8}/> Like
        </button>
        <button className="abt abt-cmt" onClick={()=>{setShowCmt(v=>!v);setTimeout(()=>inputRef.current?.focus(),80);}}>
          <MessageCircle style={{width:17,height:17}} strokeWidth={1.8}/> Comment
        </button>
        <button className={`abt abt-rp${repost?' on':''}`} onClick={()=>{setRepost(v=>!v);toast.success(repost?'Removed':'Reposted 🔁');}}>
          <Repeat2 style={{width:17,height:17}} strokeWidth={1.8}/> {repost?'Reposted':'Repost'}
        </button>
        <button className="abt abt-sh" onClick={()=>{
          if(navigator.share)navigator.share({title:post.title||'',url:location.href});
          else{navigator.clipboard?.writeText(location.href+'#'+post.id);toast.success('Link copied!');}
        }}>
          <Share2 style={{width:17,height:17}} strokeWidth={1.8}/> Share
        </button>
        <div style={{flex:1}}/>
        <button className={`save-btn${saved?' saved':''}`} onClick={()=>{
          if(!me){toast.error('Sign in to save');return;}
          setSaved(v=>!v);toast.success(saved?'Removed':'Saved ✨');
        }}>
          <Bookmark style={{width:17,height:17}} fill={saved?'currentColor':'none'} strokeWidth={saved?0:1.8}/>
        </button>
      </div>

      {/* ── comments ── */}
      {showCmt&&(
        <div style={{borderTop:'1px solid var(--border2)',padding:'4px 20px 16px'}}>
          {post.comments?.slice(-5).map(c=>(
            <div key={c.id} style={{display:'flex',gap:10,padding:'11px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
              <Avatar name={c.profiles?.username||'A'} url={c.profiles?.avatar_url} size={32}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'baseline',gap:7,marginBottom:4}}>
                  <span style={{fontSize:13.5,fontWeight:700,color:'var(--txt)',fontFamily:"'Archivo Black',sans-serif"}}>{c.profiles?.username||'Explorer'}</span>
                  <span style={{fontSize:11,color:'var(--muted)'}}>{timeAgo(c.created_at)}</span>
                </div>
                <p style={{fontSize:13.5,color:'var(--txt2)',lineHeight:1.62,margin:0,wordBreak:'break-word'}}>{c.content}</p>
              </div>
            </div>
          ))}
          {me?(
            <div style={{display:'flex',gap:10,alignItems:'center',paddingTop:12}}>
              <Avatar name={me?.user_metadata?.username||me?.email||'A'} size={34}/>
              <div className="cmt-wrap">
                <input ref={inputRef} value={cmtText} onChange={e=>setCmtText(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendCmt();}}}
                  placeholder="Write a comment…" className="cmt-input"/>
                <button onClick={sendCmt} disabled={!cmtText.trim()||busy} className="cmt-send" style={{opacity:cmtText.trim()?1:.3}}>
                  {busy?<Loader2 style={{width:13,height:13,animation:'spin 1s linear infinite'}}/>:<Send style={{width:13,height:13}}/>}
                </button>
              </div>
            </div>
          ):(
            <p style={{fontSize:13,color:'var(--muted)',textAlign:'center',paddingTop:14}}>
              <a href="/login" style={{color:'var(--accent)'}}>Sign in</a> to comment
            </p>
          )}
        </div>
      )}
    </article>
  );
}

/* ════════════════════════════════════════════
   COMPOSE BOX
════════════════════════════════════════════ */
function ComposeBox({user,onPost}:{user:any;onPost:(c:string,iu:string,f:File|null)=>Promise<void>}) {
  const [content,setContent]=useState('');
  const [imgUrl,setImgUrl]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [prev,setPrev]=useState('');
  const [busy,setBusy]=useState(false);
  const [showUrl,setShowUrl]=useState(false);
  const [focused,setFocused]=useState(false);
  const ta=useRef<HTMLTextAreaElement>(null);
  const fi=useRef<HTMLInputElement>(null);
  useEffect(()=>{const el=ta.current;if(!el)return;el.style.height='auto';el.style.height=Math.min(el.scrollHeight,280)+'px';},[content]);
  const clrImg=()=>{setFile(null);setPrev('');setImgUrl('');if(fi.current)fi.current.value='';};
  const pickFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    if(f.size>8*1024*1024){toast.error('Max 8MB');return;}
    setFile(f);setPrev(URL.createObjectURL(f));setImgUrl('');setShowUrl(false);
  };
  const submit=async()=>{
    if((!content.trim()&&!file&&!imgUrl)||busy)return;
    setBusy(true);await onPost(content.trim(),imgUrl,file);
    setContent('');clrImg();setBusy(false);setFocused(false);
  };
  const can=!!user&&!busy&&(!!content.trim()||!!file||!!imgUrl);
  const uname=user?.user_metadata?.username||user?.email?.split('@')[0]||'You';
  return (
    <div className={`compose${focused?' focused':''}`}>
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        <Avatar name={uname} size={44}/>
        <div style={{flex:1,minWidth:0}}>
          {focused&&<button className="aud-pill"><Globe style={{width:11,height:11}}/> Everyone <ChevronDown style={{width:10,height:10}}/></button>}
          <textarea ref={ta} className="compose-ta"
            placeholder={user?"Share your cosmic discovery…":"Sign in to post…"}
            value={content} onChange={e=>setContent(e.target.value)}
            onFocus={()=>setFocused(true)} disabled={!user} maxLength={2000} rows={focused?3:2}/>
          {prev&&(
            <div className="compose-prev">
              <img src={prev} alt="Preview"/>
              <button className="compose-rm" onClick={clrImg}><X style={{width:11,height:11}}/></button>
            </div>
          )}
          {showUrl&&!prev&&(
            <input className="compose-url" placeholder="Paste image URL…" value={imgUrl} onChange={e=>setImgUrl(e.target.value)}/>
          )}
          <div className="compose-foot">
            <div style={{display:'flex',gap:2}}>
              {[
                {Ic:ImageIcon,lb:'Photo',fn:()=>fi.current?.click(),on:!!prev},
                {Ic:Globe,lb:'URL',fn:()=>{if(!prev)setShowUrl(v=>!v);},on:showUrl},
                {Ic:Hash,lb:'Tag',fn:()=>{setContent(c=>c+' #');ta.current?.focus();},on:false},
                {Ic:AtSign,lb:'Mention',fn:()=>{setContent(c=>c+' @');ta.current?.focus();},on:false},
              ].map(({Ic,lb,fn,on})=>(
                <button key={lb} className={`ctool${on?' on':''}`} onClick={fn} disabled={!user} title={lb}>
                  <Ic style={{width:14,height:14}}/><span className="ctool-lb">{lb}</span>
                </button>
              ))}
              <input ref={fi} type="file" accept="image/*" style={{display:'none'}} onChange={pickFile}/>
            </div>
            <button className="compose-submit" onClick={submit} disabled={!can}>
              {busy?<><Loader2 style={{width:13,height:13,animation:'spin 1s linear infinite'}}/>Posting…</>:<><Sparkles style={{width:13,height:13}}/>Post</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════ */
function Sidebar({user}:{user:any}) {
  const [flw,setFlw]=useState<Record<string,boolean>>({});
  return (
    <aside>
      <div className="scard" style={{padding:0,overflow:'hidden'}}>
        <div className="nasa-card">
          <div className="nasa-stars"/>
          <div style={{position:'relative',zIndex:1,padding:'22px 20px 18px'}}>
            <div style={{fontSize:30,marginBottom:9}}>🔭</div>
            <p style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.22em',fontWeight:700,color:'rgba(56,189,248,.75)',marginBottom:5,fontFamily:"'Archivo Black',sans-serif"}}>NASA · APOD</p>
            <p style={{fontSize:14,fontWeight:700,color:'var(--txt)',lineHeight:1.4,fontFamily:"'Archivo Black',sans-serif",marginBottom:14}}>Astronomy Picture of the Day</p>
            <a href="/nasa" className="nasa-btn"><Zap style={{width:11,height:11}}/> Explore Gallery</a>
          </div>
        </div>
      </div>
      <div className="scard">
        <p className="stitle"><Flame style={{width:11,height:11,color:'#f97316'}}/>Trending</p>
        {[['#MarsRover','4.2k',true],['#APOD','3.1k',true],['#JamesWebb','2.8k',false],['#DeepSpace','2.1k',false],['#ISS','1.4k',false]].map(([t,c,h],i)=>(
          <div key={String(t)} className="trend-row">
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:10,fontWeight:700,color:'rgba(100,116,139,.4)',width:14,textAlign:'right',fontFamily:"'Archivo Black',sans-serif"}}>{i+1}</span>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <span style={{fontSize:13,fontWeight:700,color:'rgba(196,181,253,.9)',fontFamily:"'Archivo Black',sans-serif"}}>{t}</span>
                  {h&&<Flame style={{width:10,height:10,color:'#f97316'}}/>}
                </div>
                <span style={{fontSize:11,color:'var(--muted)'}}>{c} posts</span>
              </div>
            </div>
            <BarChart2 style={{width:13,height:13,color:'var(--muted)',opacity:.3}}/>
          </div>
        ))}
      </div>
      <div className="scard">
        <p className="stitle"><Sparkles style={{width:11,height:11,color:'var(--accent)'}}/>Who to Follow</p>
        {[{n:'NebulaMaster',s:'12.4k followers'},{n:'StargazerX',s:'8.9k followers'},{n:'CassiniPro',s:'5.2k followers'}].map(u=>(
          <div key={u.n} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
            <Avatar name={u.n} size={36}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--txt)',fontFamily:"'Archivo Black',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.n}</div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{u.s}</div>
            </div>
            <button className={`sflw${flw[u.n]?' on':''}`} onClick={()=>setFlw(v=>({...v,[u.n]:!v[u.n]}))}>
              {flw[u.n]?<><Check style={{width:9,height:9}}/>Following</>:<>+ Follow</>}
            </button>
          </div>
        ))}
      </div>
      {user&&(
        <div className="scard" style={{display:'flex',alignItems:'center',gap:12}}>
          <Avatar name={user?.user_metadata?.username||user?.email||'U'} size={40}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--txt)',fontFamily:"'Archivo Black',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.user_metadata?.username||user?.email?.split('@')[0]}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>Your profile</div>
          </div>
          <a href="/profile" className="view-btn">View</a>
        </div>
      )}
      <p style={{fontSize:10,color:'rgba(100,116,139,.22)',lineHeight:1.6,padding:'0 2px'}}>StellarHub · Privacy · Terms<br/>© 2025 StellarHub</p>
    </aside>
  );
}

/* ════════════════════════════════════════════
   TABS
════════════════════════════════════════════ */
function Tabs({tab,set}:{tab:string;set:(t:string)=>void}) {
  return (
    <div className="tabs">
      {[{id:'latest',lb:'For You',Ic:Sparkles},{id:'following',lb:'Following',Ic:User},{id:'trending',lb:'Trending',Ic:TrendingUp}].map(({id,lb,Ic})=>(
        <button key={id} className={`tab${tab===id?' on':''}`} onClick={()=>set(id)}>
          <Ic style={{width:12,height:12}}/>{lb}
          {tab===id&&<div className="tab-line"/>}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   GLOBAL STYLES
════════════════════════════════════════════ */
const CSS = `
/* smooth scroll & custom scrollbar — applied globally */
html { scroll-behavior: smooth; }
body { overflow-x: hidden; }
* { scrollbar-width: thin; scrollbar-color: rgba(129,140,248,.18) transparent; }
*::-webkit-scrollbar { width: 3px; height: 3px; }
*::-webkit-scrollbar-thumb { background: rgba(129,140,248,.18); border-radius: 99px; }
*::-webkit-scrollbar-track { background: transparent; }

@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

:root {
  --bg:    #060810;
  --card:  rgba(11,14,26,.88);
  --accent:#818cf8;
  --txt:   rgba(226,232,240,.96);
  --txt2:  rgba(203,213,225,.75);
  --muted: rgba(100,116,139,.5);
  --border:rgba(255,255,255,.07);
  --border2:rgba(255,255,255,.04);
}
*, *::before, *::after { box-sizing:border-box; margin:0; }

/* ── PAGE ── */
.feed-page { min-height:100svh; padding:80px 16px 90px; font-family:'DM Sans',sans-serif; color:var(--txt); }
.feed-grid { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr; gap:24px; align-items:start; }
@media(min-width:900px){ .feed-grid { grid-template-columns:1fr 298px; } }

/* ── POST CARD ── */
.pcard {
  background:var(--card);
  border:1px solid var(--border);
  border-radius:24px;
  backdrop-filter:blur(20px);
  overflow:hidden;
  margin-bottom:12px;
  transition:border-color .3s, box-shadow .3s, transform .28s cubic-bezier(.16,1,.3,1);
  animation:slideUp .5s cubic-bezier(.16,1,.3,1) both;
}
.pcard:hover { border-color:rgba(129,140,248,.2); box-shadow:0 14px 50px rgba(0,0,0,.32); transform:translateY(-2px); }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.pcard:nth-child(1){animation-delay:.04s}
.pcard:nth-child(2){animation-delay:.09s}
.pcard:nth-child(3){animation-delay:.15s}
.pcard:nth-child(n+4){animation-delay:.2s}

.pcard-head { display:flex; align-items:flex-start; justify-content:space-between; padding:18px 20px 14px; gap:10; }
.pcard-author { display:flex; align-items:center; gap:12px; text-decoration:none; flex:1; min-width:0; }
.pcard-name { font-size:15px; font-weight:700; color:var(--txt); font-family:'Archivo Black',sans-serif; }

/* ── POST IMAGE SHELL ── */
.pcard-img-shell {
  position:relative;
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  overflow:hidden;
  cursor:zoom-in;
  background:rgba(0,0,0,.3);
  line-height:0;
}
.pcard-img {
  width:100%; max-height:520px; object-fit:cover; display:block;
  transition:transform .55s cubic-bezier(.16,1,.3,1);
}
.pcard-img-shell:hover .pcard-img { transform:scale(1.03); }

.pcard-img-overlay {
  position:absolute; inset:0;
  background:linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 50%);
  opacity:0;
  transition:opacity .28s ease;
  display:flex; align-items:flex-end; justify-content:flex-end;
  padding:14px;
}
.pcard-img-shell:hover .pcard-img-overlay { opacity:1; }
.pcard-zoom-pill {
  display:flex; align-items:center; gap:6px;
  padding:6px 14px; border-radius:20px;
  background:rgba(0,0,0,.65); backdrop-filter:blur(12px);
  color:rgba(255,255,255,.9); font-size:12px; font-weight:600;
  border:1px solid rgba(255,255,255,.15);
  font-family:'DM Sans',sans-serif;
  transform:translateY(8px);
  transition:transform .28s ease;
}
.pcard-img-shell:hover .pcard-zoom-pill { transform:translateY(0); }

/* ── LIGHTBOX ── */
.lb-root {
  position:fixed; inset:0; z-index:9999;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:64px 20px 48px;
  animation:lbFadeIn .2s ease both;
}
@keyframes lbFadeIn { from{opacity:0} to{opacity:1} }

.lb-backdrop {
  position:absolute; inset:0;
  background:rgba(2,3,8,.97);
  backdrop-filter:blur(28px) saturate(1.4);
  -webkit-backdrop-filter:blur(28px) saturate(1.4);
}

.lb-bar {
  position:fixed; top:0; left:0; right:0; height:58px; z-index:10;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 16px;
  background:rgba(2,3,8,.75);
  backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.06);
}
.lb-bar-left { display:flex; align-items:center; gap:10; }
.lb-bar-right { display:flex; align-items:center; gap:6; }
.lb-title {
  font-size:13px; font-weight:700; color:rgba(226,232,240,.8);
  font-family:'Archivo Black',sans-serif;
  max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.lb-pill {
  display:inline-flex; align-items:center; gap:6px;
  padding:6px 13px; border-radius:20px;
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.09);
  color:rgba(200,205,230,.7); font-size:12px; font-weight:600;
  cursor:pointer; text-decoration:none;
  font-family:'DM Sans',sans-serif;
  transition:all .2s;
}
.lb-pill:hover { background:rgba(129,140,248,.15); border-color:rgba(129,140,248,.3); color:#818cf8; }
.lb-close-btn {
  width:34px; height:34px; border-radius:50%;
  background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
  color:rgba(255,255,255,.65); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:all .2s; margin-left:4px;
}
.lb-close-btn:hover { background:rgba(239,68,68,.2); border-color:rgba(239,68,68,.35); color:#f87171; transform:scale(1.1); }

.lb-stage {
  position:relative; z-index:1;
  display:flex; align-items:center; justify-content:center;
  width:100%; max-width:1200px;
  flex:1;
}
.lb-img-wrap {
  position:relative;
  cursor:zoom-in;
  transition:transform .4s cubic-bezier(.16,1,.3,1);
  border-radius:16px; overflow:hidden;
  box-shadow:0 32px 90px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.06);
  animation:lbImgIn .3s cubic-bezier(.16,1,.3,1) both;
}
@keyframes lbImgIn { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
.lb-img-wrap.zoomed { transform:scale(1.6); cursor:zoom-out; }
.lb-img {
  max-width:100%; max-height:calc(100vh - 160px);
  object-fit:contain; display:block;
  user-select:none; -webkit-user-drag:none;
}
.lb-loader {
  display:flex; flex-direction:column; align-items:center; gap:12;
  color:rgba(129,140,248,.6); font-size:13px; font-family:'DM Sans',sans-serif;
}
.lb-spinner {
  width:32px; height:32px; border-radius:50%;
  border:3px solid rgba(129,140,248,.15);
  border-top-color:rgba(129,140,248,.7);
  animation:spin 1s linear infinite;
}
.lb-hint {
  position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
  font-size:11px; color:rgba(100,116,139,.4);
  font-family:'DM Sans',sans-serif; white-space:nowrap; z-index:5;
}

/* ── ACTIONS ── */
.pcard-actions { display:flex; align-items:center; padding:4px 10px 6px; gap:2px; border-top:1px solid var(--border2); }
.abt { display:inline-flex; align-items:center; gap:6px; padding:8px 12px; border-radius:12px; font-size:13px; font-weight:600; color:var(--muted); cursor:pointer; border:none; background:none; font-family:'DM Sans',sans-serif; transition:all .2s; }
.abt:hover { background:rgba(255,255,255,.05); color:var(--txt2); }
.abt-liked { color:#f472b6!important; }
.abt-liked svg { animation:hpop .35s ease both; }
.abt-liked:hover { background:rgba(244,114,182,.08)!important; }
.abt-cmt:hover  { color:#38bdf8; background:rgba(56,189,248,.08)!important; }
.abt-rp.on { color:#34d399; }
.abt-rp:hover { color:#34d399; background:rgba(52,211,153,.08)!important; }
.abt-sh:hover { color:var(--accent); background:rgba(129,140,248,.08)!important; }
@keyframes hpop { 0%{transform:scale(1)} 40%{transform:scale(1.55)} 70%{transform:scale(.88)} 100%{transform:scale(1)} }
.save-btn { width:34px; height:34px; border-radius:10px; border:none; background:none; cursor:pointer; color:var(--muted); display:flex; align-items:center; justify-content:center; transition:all .2s; }
.save-btn:hover { background:rgba(251,191,36,.08); color:#fbbf24; }
.save-btn.saved { color:#fbbf24; }
.icon-btn { width:32px; height:32px; border-radius:9px; border:none; background:none; cursor:pointer; color:rgba(100,116,139,.4); display:flex; align-items:center; justify-content:center; transition:all .2s; }
.icon-btn:hover { background:rgba(255,255,255,.06); color:var(--txt); }

/* ── INLINE FOLLOW ── */
.ifollow { display:inline-flex; align-items:center; gap:5px; padding:5px 13px; border-radius:20px; font-size:11.5px; font-weight:700; cursor:pointer; transition:all .2s; font-family:'Archivo Black',sans-serif; border:1px solid rgba(129,140,248,.28); background:rgba(129,140,248,.07); color:var(--accent); flex-shrink:0; }
.ifollow:hover { background:rgba(129,140,248,.18); transform:scale(1.04); }
.ifollow.on { border-color:rgba(52,211,153,.28); background:rgba(52,211,153,.07); color:#34d399; }
.ifollow.on:hover { background:rgba(239,68,68,.07); border-color:rgba(239,68,68,.28); color:#f87171; }

/* ── POST MENU ── */
.pmenu { position:absolute; top:38px; right:0; min-width:175px; z-index:50; background:rgba(6,8,16,.98); border:1px solid rgba(255,255,255,.09); border-radius:16px; padding:6px; box-shadow:0 16px 60px rgba(0,0,0,.7); backdrop-filter:blur(24px); animation:menuIn .2s cubic-bezier(.16,1,.3,1) both; }
@keyframes menuIn { from{opacity:0;transform:translateY(-6px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
.pmenu-item { display:flex; align-items:center; gap:9px; width:100%; padding:8px 11px; border-radius:9px; border:none; background:none; cursor:pointer; font-size:13px; font-weight:500; color:rgba(148,163,184,.8); font-family:'DM Sans',sans-serif; text-align:left; transition:background .15s, color .15s; }
.pmenu-item:hover { background:rgba(255,255,255,.05); color:var(--txt); }

/* ── COMMENTS ── */
.cmt-wrap { flex:1; display:flex; align-items:center; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:50px; padding:2px 4px 2px 14px; transition:border-color .2s; }
.cmt-wrap:focus-within { border-color:rgba(129,140,248,.35); }
.cmt-input { flex:1; background:none; border:none; outline:none; color:var(--txt2); font-size:13.5px; font-family:'DM Sans',sans-serif; padding:9px 0; }
.cmt-input::placeholder { color:rgba(100,116,139,.38); }
.cmt-send { width:30px; height:30px; border-radius:50%; border:none; background:linear-gradient(135deg,#7c3aed,#0ea5e9); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform .2s, opacity .2s; flex-shrink:0; }
.cmt-send:hover:not(:disabled) { transform:scale(1.1); }

/* ── COMPOSE ── */
.compose { background:var(--card); border:1px solid var(--border); border-radius:24px; padding:18px 20px; margin-bottom:14px; backdrop-filter:blur(20px); transition:border-color .3s, box-shadow .3s; }
.compose.focused { border-color:rgba(129,140,248,.3); box-shadow:0 0 0 4px rgba(129,140,248,.04), 0 8px 32px rgba(0,0,0,.2); }
.compose-ta { width:100%; background:none; border:none; outline:none; resize:none; color:var(--txt2); font-size:15px; font-family:'DM Sans',sans-serif; line-height:1.75; min-height:52px; max-height:280px; overflow-y:auto; padding:0; }
.compose-ta::placeholder { color:rgba(100,116,139,.35); }
.compose-prev { position:relative; margin-top:12px; border-radius:14px; overflow:hidden; border:1px solid var(--border); max-height:280px; }
.compose-prev img { width:100%; max-height:280px; object-fit:cover; display:block; }
.compose-rm { position:absolute; top:8px; right:8px; width:26px; height:26px; border-radius:50%; background:rgba(0,0,0,.72); border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .2s; }
.compose-rm:hover { background:rgba(220,38,38,.85); }
.compose-url { width:100%; margin-top:10px; padding:9px 13px; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:10px; color:var(--txt2); font-size:13.5px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s; }
.compose-url:focus { border-color:rgba(129,140,248,.35); }
.compose-foot { display:flex; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px solid var(--border2); margin-top:12px; gap:8px; flex-wrap:wrap; }
.ctool { display:flex; align-items:center; gap:5px; padding:6px 9px; border-radius:8px; font-size:12.5px; font-weight:600; color:var(--muted); cursor:pointer; border:none; background:none; font-family:'DM Sans',sans-serif; transition:all .18s; }
.ctool:hover:not(:disabled) { background:rgba(255,255,255,.05); color:var(--txt2); }
.ctool:disabled { opacity:.25; cursor:not-allowed; }
.ctool.on { color:var(--accent); }
.ctool-lb { display:none; }
@media(min-width:480px){ .ctool-lb { display:inline; } }
.aud-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; border:1px solid rgba(129,140,248,.28); background:rgba(129,140,248,.07); font-size:11.5px; font-weight:700; color:var(--accent); cursor:pointer; margin-bottom:8px; font-family:'Archivo Black',sans-serif; }
.compose-submit { display:inline-flex; align-items:center; gap:7px; padding:9px 22px; border-radius:50px; font-size:13.5px; font-weight:700; color:#fff; cursor:pointer; border:none; background:linear-gradient(135deg,#7c3aed,#0ea5e9); font-family:'Archivo Black',sans-serif; transition:transform .2s, box-shadow .25s, opacity .2s; white-space:nowrap; }
.compose-submit:hover:not(:disabled) { transform:translateY(-1px) scale(1.04); box-shadow:0 6px 22px rgba(124,58,237,.45); }
.compose-submit:disabled { opacity:.3; cursor:not-allowed; transform:none; }

/* ── TABS ── */
.tabs { display:flex; border-bottom:1px solid var(--border); margin-bottom:16px; }
.tab { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:13px 8px; font-size:13.5px; font-weight:700; color:var(--muted); cursor:pointer; border:none; background:none; font-family:'Archivo Black',sans-serif; position:relative; transition:color .2s; }
.tab:hover { color:var(--txt2); }
.tab.on { color:var(--txt); }
.tab-line { position:absolute; bottom:-1px; left:12%; right:12%; height:2px; border-radius:2px; background:linear-gradient(90deg,#7c3aed,#0ea5e9); animation:slideIn .25s ease both; }
@keyframes slideIn { from{transform:scaleX(0)} to{transform:scaleX(1)} }

/* ── SIDEBAR ── */
.scard { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:17px; backdrop-filter:blur(16px); margin-bottom:14px; }
.stitle { display:flex; align-items:center; gap:7px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.18em; color:rgba(100,116,139,.4); margin-bottom:13px; font-family:'Archivo Black',sans-serif; }
.trend-row { display:flex; align-items:center; justify-content:space-between; padding:8px 6px; border-radius:11px; cursor:pointer; transition:background .18s; }
.trend-row:hover { background:rgba(255,255,255,.04); }
.sflw { display:inline-flex; align-items:center; gap:4px; padding:4px 11px; border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; transition:all .2s; white-space:nowrap; flex-shrink:0; border:1px solid rgba(129,140,248,.28); background:rgba(129,140,248,.06); color:var(--accent); font-family:'Archivo Black',sans-serif; }
.sflw:hover { background:rgba(129,140,248,.15); }
.sflw.on { border-color:rgba(52,211,153,.28); background:rgba(52,211,153,.07); color:#34d399; }
.view-btn { display:inline-flex; align-items:center; gap:4px; padding:5px 12px; border-radius:20px; border:1px solid var(--border); background:rgba(255,255,255,.04); font-size:11.5px; font-weight:700; color:var(--muted); text-decoration:none; transition:all .2s; font-family:'Archivo Black',sans-serif; }
.view-btn:hover { color:var(--txt); background:rgba(255,255,255,.07); }
.nasa-card { position:relative; overflow:hidden; min-height:158px; background:linear-gradient(135deg,rgba(124,58,237,.22),rgba(14,165,233,.1),rgba(5,8,16,.97)); }
.nasa-stars { position:absolute; inset:0; background-image:radial-gradient(1px 1px at 15% 25%,rgba(255,255,255,.7),transparent),radial-gradient(1px 1px at 55% 15%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 80% 60%,rgba(255,255,255,.55),transparent),radial-gradient(2px 2px at 50% 45%,rgba(167,139,250,.45),transparent); }
.nasa-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:10px; background:rgba(14,165,233,.12); border:1px solid rgba(14,165,233,.28); font-size:12px; font-weight:700; color:#38bdf8; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all .2s; }
.nasa-btn:hover { background:rgba(14,165,233,.22); }

/* ── MISC ── */
.nasa-badge { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; padding:2px 7px; border-radius:20px; background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(14,165,233,.2)); border:1px solid rgba(124,58,237,.3); color:#a78bfa; font-family:'Archivo Black',sans-serif; }
.sk { background:rgba(255,255,255,.05); animation:shimmer 1.8s ease-in-out infinite; border-radius:6px; display:block; }
@keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:.85} }
.new-bar { display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 20px; border-radius:50px; background:linear-gradient(135deg,#7c3aed,#0ea5e9); font-size:13px; font-weight:700; color:#fff; cursor:pointer; font-family:'Archivo Black',sans-serif; margin:0 auto 16px; width:fit-content; box-shadow:0 4px 18px rgba(124,58,237,.45); animation:bounceIn .45s cubic-bezier(.16,1,.3,1) both; transition:transform .2s; }
.new-bar:hover { transform:translateY(-2px); }
@keyframes bounceIn { from{opacity:0;transform:translateY(-18px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }
.scroll-top { position:fixed; bottom:90px; right:18px; width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#7c3aed,#0ea5e9); border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 20px rgba(124,58,237,.55); z-index:100; animation:fadeUp .3s ease; transition:transform .2s; }
.scroll-top:hover { transform:scale(1.1) translateY(-2px); }
@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.empty { text-align:center; padding:60px 24px; background:var(--card); border:1px solid var(--border); border-radius:24px; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes spin { to{transform:rotate(360deg)} }
@media(prefers-reduced-motion:reduce){ *{animation:none!important;transition-duration:.01ms!important;} }
`;

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function FeedPage() {
  const supabase = createClient();
  const [posts,setPosts]     = useState<Post[]>([]);
  const [loading,setLoading] = useState(true);
  const [user,setUser]       = useState<any>(null);
  const [tab,setTab]         = useState('latest');
  const [scrollTop,setScrollTop] = useState(false);
  const [newCount,setNewCount]   = useState(0);
  const [lightbox,setLightbox]   = useState<{url:string;title?:string}|null>(null);

  useEffect(()=>{
    fetchUser(); fetchPosts();
    const fn=()=>setScrollTop(window.scrollY>500);
    window.addEventListener('scroll',fn,{passive:true});
    return()=>window.removeEventListener('scroll',fn);
  },[]);

  useEffect(()=>{
    if(!loading){const t=setTimeout(()=>setNewCount(2),20000);return()=>clearTimeout(t);}
  },[loading]);

  const fetchUser=async()=>{
    const {data:{user}}=await supabase.auth.getUser();setUser(user);
  };
  const fetchPosts=async()=>{
    try{
      const{data,error}=await supabase.from('posts').select(`*,profiles(username,avatar_url),likes(id,user_id),comments(id,content,created_at,user_id,post_id,profiles(username,avatar_url))`).order('created_at',{ascending:false}).limit(50);
      if(error)throw error;
      setPosts(data||[]);
    }catch{toast.error('Failed to load posts');}
    finally{setLoading(false);}
  };

  const handlePost=async(content:string,imageUrl:string,imgFile:File|null)=>{
    if(!user){toast.error('Sign in first');return;}
    try{
      let img=imageUrl||'';
      if(imgFile){
        const ext=imgFile.name.split('.').pop()||'jpg';
        const path=`posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const{error:upErr}=await supabase.storage.from('images').upload(path,imgFile,{upsert:false});
        if(upErr)throw upErr;
        img=supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
      }
      const{error}=await supabase.from('posts').insert({content,user_id:user.id,title:content.slice(0,80)||'Post',image_url:img||null});
      if(error)throw error;
      toast.success('Posted! 🚀'); fetchPosts();
    }catch(e:any){toast.error(e?.message||'Failed to post');}
  };

  const handleLike=async(postId:string)=>{
    if(!user){toast.error('Sign in to like');return;}
    setPosts(prev=>prev.map(p=>{
      if(p.id!==postId)return p;
      const already=p.likes.some(l=>l.user_id===user.id);
      return{...p,likes:already?p.likes.filter(l=>l.user_id!==user.id):[...p.likes,{id:'opt',user_id:user.id}]};
    }));
    try{
      const{data:ex}=await supabase.from('likes').select('id').eq('post_id',postId).eq('user_id',user.id).single();
      if(ex)await supabase.from('likes').delete().eq('id',ex.id);
      else await supabase.from('likes').insert({post_id:postId,user_id:user.id});
      fetchPosts();
    }catch{fetchPosts();}
  };

  const handleComment=async(postId:string,text:string)=>{
    if(!user){toast.error('Sign in to comment');return;}
    const opt:Comment={id:'opt-'+Date.now(),content:text,created_at:new Date().toISOString(),user_id:user.id,post_id:postId,profiles:{username:user.user_metadata?.username||user.email?.split('@')[0]||'You',avatar_url:null}};
    setPosts(prev=>prev.map(p=>p.id!==postId?p:{...p,comments:[...(p.comments||[]),opt]}));
    try{
      const{error}=await supabase.from('comments').insert({post_id:postId,user_id:user.id,content:text});
      if(error)throw error; fetchPosts();
    }catch{toast.error('Failed');fetchPosts();}
  };

  const handleDelete=async(postId:string)=>{
    if(!user)return;
    try{
      await supabase.from('posts').delete().eq('id',postId).eq('user_id',user.id);
      setPosts(prev=>prev.filter(p=>p.id!==postId));toast.success('Deleted');
    }catch{toast.error('Failed');}
  };

  const visible=tab==='trending'
    ?[...posts].sort((a,b)=>((b.likes?.length??0)+(b.comments?.length??0))-((a.likes?.length??0)+(a.comments?.length??0)))
    :posts;

  return (
    <div className="feed-page">
      <style>{CSS}</style>

      <div className="feed-grid">
        <div>
          <ComposeBox user={user} onPost={handlePost}/>
          {newCount>0&&(
            <div className="new-bar" onClick={()=>{setNewCount(0);window.scrollTo({top:0,behavior:'smooth'});fetchPosts();}}>
              <ArrowUp style={{width:13,height:13}}/> {newCount} new posts
            </div>
          )}
          <Tabs tab={tab} set={setTab}/>

          {loading?(
            <>{[0,1,2].map(i=>(
              <div key={i} className="pcard" style={{padding:'20px 22px',marginBottom:12}}>
                <div style={{display:'flex',gap:12,marginBottom:14}}>
                  <div className="sk" style={{width:44,height:44,borderRadius:13,flexShrink:0}}/>
                  <div style={{flex:1}}><div className="sk" style={{width:'32%',height:11,borderRadius:6,marginBottom:8}}/><div className="sk" style={{width:'18%',height:9,borderRadius:6}}/></div>
                </div>
                <div className="sk" style={{width:'100%',height:13,borderRadius:6,marginBottom:8}}/>
                <div className="sk" style={{width:'72%',height:13,borderRadius:6,marginBottom:8}}/>
                <div className="sk" style={{width:'45%',height:13,borderRadius:6}}/>
              </div>
            ))}</>
          ):visible.length===0?(
            <div className="empty">
              <span style={{fontSize:50,marginBottom:16,display:'block',animation:'float 3s ease-in-out infinite'}}>🌌</span>
              <h3 style={{fontSize:'1.35rem',fontWeight:700,color:'var(--txt)',fontFamily:"'Archivo Black',sans-serif",marginBottom:8}}>The cosmos awaits</h3>
              <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.65}}>Be the first to share a discovery!</p>
            </div>
          ):(
            visible.map(p=>(
              <PostCard key={p.id} post={p} me={user}
                onLike={handleLike} onComment={handleComment} onDelete={handleDelete}
                openLightbox={(url,title)=>setLightbox({url,title})}
              />
            ))
          )}
        </div>
        <Sidebar user={user}/>
      </div>

      {scrollTop&&(
        <button className="scroll-top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top">
          <ArrowUp style={{width:17,height:17}}/>
        </button>
      )}

      {/* LIGHTBOX */}
      {lightbox&&(
        <Lightbox src={lightbox.url} title={lightbox.title} onClose={()=>setLightbox(null)}/>
      )}
    </div>
  );
}