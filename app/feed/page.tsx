'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Heart, MessageCircle, Share2, Bookmark, Send,
  Image as ImageIcon, X, TrendingUp, Zap, Clock,
  Sparkles, MoreHorizontal, Loader2, Globe,
  User, Check, AtSign, Hash, ChevronDown,
  Repeat2, BarChart2, Flame, Link2, Flag,
  ArrowUp, UserPlus, UserCheck, Download,
  ZoomIn, ChevronLeft, ChevronRight, Plus,
  Eye, Maximize2,
} from 'lucide-react';

/* ════════════════════════════════════════════
   TYPES
════════════════════════════════════════════ */
interface PostImage { id:string; post_id:string; url:string; order_index:number; }
interface Comment {
  id:string; content:string; created_at:string;
  user_id:string; post_id:string;
  profiles:{ username:string; avatar_url:string|null };
}
interface Post {
  id:string; title:string|null; content:string|null;
  image_url?:string|null; created_at:string; user_id:string; category?:string|null;
  profiles:{ username:string; avatar_url:string|null };
  likes:{ id:string; user_id:string }[];
  comments:Comment[];
  post_images?:PostImage[];
}

/* ════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════ */
function timeAgo(d:string) {
  const s=Math.floor((Date.now()-new Date(d).getTime())/1000);
  if(s<60) return 'just now';
  if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  if(s<604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(d).toLocaleDateString('en',{month:'short',day:'numeric'});
}
const PALETTES=[['#7c3aed','#4f46e5'],['#0ea5e9','#06b6d4'],['#ec4899','#f43f5e'],['#10b981','#059669'],['#f59e0b','#f97316'],['#8b5cf6','#a855f7']];
const pal=(n='')=>PALETTES[(n.charCodeAt(0)||65)%PALETTES.length];

function Avatar({name='A',size=40,url,verified=false}:{name?:string;size?:number;url?:string|null;verified?:boolean}) {
  const [err,setErr]=useState(false);
  const [c1,c2]=pal(name);
  useEffect(()=>{setErr(false)},[url]);
  return (
    <div style={{position:'relative',flexShrink:0,width:size,height:size}}>
      {url&&!err
        ?<img src={url} alt={name} onError={()=>setErr(true)} style={{width:size,height:size,borderRadius:Math.round(size*.3),objectFit:'cover',display:'block'}}/>
        :<div style={{width:size,height:size,borderRadius:Math.round(size*.3),background:`linear-gradient(135deg,${c1},${c2})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.4,fontWeight:800,color:'#fff',userSelect:'none',fontFamily:"'Archivo Black',sans-serif"}}>{name.charAt(0).toUpperCase()}</div>}
      {verified&&<div style={{position:'absolute',bottom:-2,right:-2,width:size*.38,height:size*.38,borderRadius:'50%',background:'linear-gradient(135deg,#0ea5e9,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid var(--bg)'}}><Check style={{width:size*.18,height:size*.18,color:'#fff',strokeWidth:3}}/></div>}
    </div>
  );
}

/* ════════════════════════════════════════════
   LIGHTBOX — tap anywhere (outside image) to close
   swipe down, browser back, keyboard ← →
════════════════════════════════════════════ */
function Lightbox({images,initialIndex=0,title,author,onClose}:{
  images:string[]; initialIndex?:number; title?:string; author?:string; onClose:()=>void;
}) {
  const [idx,setIdx]=useState(initialIndex);
  const [loaded,setLoaded]=useState(false);
  const [zoom,setZoom]=useState(false);
  const [zoomOrigin,setZoomOrigin]=useState('50% 50%');
  const [swipeY,setSwipeY]=useState(0);
  const [touchStart,setTouchStart]=useState<{x:number;y:number}|null>(null);
  const [exiting,setExiting]=useState(false);
  const imgRef=useRef<HTMLImageElement>(null);

  const close=useCallback(()=>{setExiting(true);setTimeout(onClose,200);},[onClose]);

  // lock scroll
  useEffect(()=>{document.body.style.overflow='hidden';return()=>{document.body.style.overflow='';};},[]);

  // reset on slide change
  useEffect(()=>{setLoaded(false);setZoom(false);setSwipeY(0);},[idx]);

  // keyboard
  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{
      if(e.key==='Escape'||e.key==='Backspace') close();
      if(e.key==='ArrowLeft') setIdx(i=>Math.max(0,i-1));
      if(e.key==='ArrowRight') setIdx(i=>Math.min(images.length-1,i+1));
      if(e.key==='z'||e.key==='Z') setZoom(v=>!v);
    };
    window.addEventListener('keydown',fn);
    return()=>window.removeEventListener('keydown',fn);
  },[close,images.length]);

  // browser back button
  useEffect(()=>{
    history.pushState({lb:true},'');
    const fn=()=>close();
    window.addEventListener('popstate',fn);
    return()=>{window.removeEventListener('popstate',fn);};
  },[close]);

  // touch handlers
  const onTS=(e:React.TouchEvent)=>{setTouchStart({x:e.touches[0].clientX,y:e.touches[0].clientY});};
  const onTM=(e:React.TouchEvent)=>{
    if(!touchStart||zoom) return;
    const dy=e.touches[0].clientY-touchStart.y;
    const dx=Math.abs(e.touches[0].clientX-touchStart.x);
    if(dy>0&&dy>dx){setSwipeY(dy);try{e.preventDefault();}catch{}}
  };
  const onTE=(e:React.TouchEvent)=>{
    if(!touchStart) return;
    const dy=e.changedTouches[0].clientY-touchStart.y;
    const dx=e.changedTouches[0].clientX-touchStart.x;
    if(dy>100&&Math.abs(dy)>Math.abs(dx)*2){close();return;}
    if(Math.abs(dx)>60&&Math.abs(dy)<50){
      if(dx<0)setIdx(i=>Math.min(images.length-1,i+1));
      else setIdx(i=>Math.max(0,i-1));
    }
    setSwipeY(0);setTouchStart(null);
  };

  const onImgMouseMove=(e:React.MouseEvent)=>{
    if(!zoom||!imgRef.current) return;
    const r=imgRef.current.getBoundingClientRect();
    setZoomOrigin(`${((e.clientX-r.left)/r.width)*100}% ${((e.clientY-r.top)/r.height)*100}%`);
  };

  const opacity=Math.max(0.1,1-swipeY/280);

  return (
    <div
      className={`lb-root${exiting?' lb-exit':''}`}
      style={{opacity}}
      onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
    >
      {/* ── clicking the dark backdrop closes ── */}
      <div className="lb-bg" onClick={close}/>

      {/* top bar */}
      <div className="lb-bar" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button className="lb-x" onClick={close}><X style={{width:16,height:16}}/></button>
          <div>
            {author&&<div style={{fontSize:13,fontWeight:700,color:'var(--txt)',fontFamily:"'Archivo Black',sans-serif",lineHeight:1.2}}>{author}</div>}
            {title&&<div style={{fontSize:11,color:'var(--muted)',marginTop:1,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</div>}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {images.length>1&&<span className="lb-cnt">{idx+1} / {images.length}</span>}
          <button className="lb-ib" onClick={()=>setZoom(v=>!v)} title="Zoom (Z)"><ZoomIn style={{width:15,height:15}}/></button>
          <button className="lb-ib" onClick={async()=>{
            try{const r=await fetch(images[idx]);const b=await r.blob();const u=URL.createObjectURL(b);Object.assign(document.createElement('a'),{href:u,download:`stellarhub-${Date.now()}.jpg`}).click();URL.revokeObjectURL(u);toast.success('Saved!');}
            catch{toast.error('Download failed');}
          }} title="Download"><Download style={{width:15,height:15}}/></button>
          <a className="lb-ib" href={images[idx]} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} title="Open original"><Maximize2 style={{width:15,height:15}}/></a>
        </div>
      </div>

      {/* image stage — transparent, clicks fall through to backdrop */}
      <div className="lb-stage" style={{transform:`translateY(${Math.max(0,swipeY)}px)`,transition:swipeY>0?'none':'transform .28s ease'}}>
        {/* prev arrow */}
        {images.length>1&&idx>0&&(
          <button className="lb-arr lb-arr-l" onClick={e=>{e.stopPropagation();setIdx(i=>i-1);}}>
            <ChevronLeft style={{width:22,height:22}}/>
          </button>
        )}

        <div
          className={`lb-img-box${zoom?' lb-zoomed':''}`}
          style={zoom?{transformOrigin:zoomOrigin}:{}}
          onClick={e=>e.stopPropagation()} // image area doesn't propagate to backdrop
          onMouseMove={onImgMouseMove}
        >
          {!loaded&&<div className="lb-spin-wrap"><div className="lb-spin"/></div>}
          <img
            ref={imgRef}
            src={images[idx]}
            alt={`Photo ${idx+1}`}
            className="lb-img"
            onLoad={()=>setLoaded(true)}
            draggable={false}
            style={{opacity:loaded?1:0,cursor:zoom?'zoom-out':'zoom-in'}}
            onClick={()=>setZoom(v=>!v)}
          />
        </div>

        {/* next arrow */}
        {images.length>1&&idx<images.length-1&&(
          <button className="lb-arr lb-arr-r" onClick={e=>{e.stopPropagation();setIdx(i=>i+1);}}>
            <ChevronRight style={{width:22,height:22}}/>
          </button>
        )}
      </div>

      {/* filmstrip */}
      {images.length>1&&(
        <div className="lb-strip" onClick={e=>e.stopPropagation()}>
          {images.map((url,i)=>(
            <button key={i} className={`lb-th${i===idx?' lb-th-a':''}`} onClick={()=>setIdx(i)}>
              <img src={url} alt="" draggable={false}/>
            </button>
          ))}
        </div>
      )}

      {/* hint */}
      <div className="lb-hint" style={{opacity:swipeY>30?0:0.5,bottom:images.length>1?82:16}}>
        {images.length>1?'← → navigate · ':''}tap outside or swipe ↓ to close
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   IMAGE CAROUSEL
════════════════════════════════════════════ */
function ImageCarousel({images,onOpen}:{images:string[];onOpen:(idx:number)=>void}) {
  const [cur,setCur]=useState(0);
  const [drag,setDrag]=useState(false);
  const [startX,setStartX]=useState(0);
  const [offsetX,setOffsetX]=useState(0);
  const dist=useRef(0);

  if(!images.length) return null;
  const go=(i:number)=>{setCur(Math.max(0,Math.min(images.length-1,i)));setOffsetX(0);};

  const mDown=(e:React.MouseEvent)=>{setStartX(e.clientX);setDrag(true);dist.current=0;};
  const mMove=(e:React.MouseEvent)=>{if(!drag)return;const d=e.clientX-startX;setOffsetX(d);dist.current=Math.abs(d);};
  const mUp=()=>{if(offsetX<-50)go(cur+1);else if(offsetX>50)go(cur-1);else setOffsetX(0);setDrag(false);};
  const tStart=(e:React.TouchEvent)=>{setStartX(e.touches[0].clientX);setDrag(true);dist.current=0;};
  const tMove=(e:React.TouchEvent)=>{if(!drag)return;const d=e.touches[0].clientX-startX;setOffsetX(d);dist.current=Math.abs(d);};
  const tEnd=()=>{if(offsetX<-50)go(cur+1);else if(offsetX>50)go(cur-1);else setOffsetX(0);setDrag(false);};

  if(images.length===1) return (
    <div className="cs-single" onClick={()=>onOpen(0)}>
      <img src={images[0]} alt="post" className="cs-single-img" draggable={false}/>
      <div className="cs-ov"><div className="cs-pill"><ZoomIn style={{width:13,height:13}}/>View</div></div>
    </div>
  );

  return (
    <div className="cs-root">
      <div className="cs-wrap" style={{cursor:drag?'grabbing':'grab'}}
        onMouseDown={mDown} onMouseMove={mMove} onMouseUp={mUp} onMouseLeave={()=>{if(drag){setOffsetX(0);setDrag(false);}}}
        onTouchStart={tStart} onTouchMove={tMove} onTouchEnd={tEnd}
      >
        <div className="cs-track" style={{transform:`translateX(calc(${-cur*100}% + ${offsetX}px))`,transition:drag?'none':'transform .38s cubic-bezier(.16,1,.3,1)'}}>
          {images.map((url,i)=>(
            <div key={i} className="cs-slide" onClick={()=>{if(dist.current<10)onOpen(i);}}>
              <img src={url} alt={`${i+1}`} className="cs-img" draggable={false}/>
              <div className="cs-ov"><div className="cs-pill"><ZoomIn style={{width:13,height:13}}/> View full</div></div>
            </div>
          ))}
        </div>
      </div>
      {cur>0&&<button className="cs-arr cs-l" onClick={e=>{e.stopPropagation();go(cur-1);}}><ChevronLeft style={{width:18,height:18}}/></button>}
      {cur<images.length-1&&<button className="cs-arr cs-r" onClick={e=>{e.stopPropagation();go(cur+1);}}><ChevronRight style={{width:18,height:18}}/></button>}
      <div className="cs-dots">{images.map((_,i)=><button key={i} className={`cs-dot${i===cur?' cs-dot-a':''}`} onClick={()=>go(i)}/>)}</div>
      <div className="cs-ctr">{cur+1}<span style={{opacity:.5}}> / {images.length}</span></div>
    </div>
  );
}

/* ════════════════════════════════════════════
   POST CONTENT (with "see more")
════════════════════════════════════════════ */
function PostContent({text}:{text:string|null}) {
  const [exp,setExp]=useState(false);
  if(!text) return null;
  const long=text.length>280;
  const show=long&&!exp?text.slice(0,280)+'…':text;
  return (
    <div>
      <p style={{margin:0,color:'var(--txt2)',fontSize:15,lineHeight:1.82}}>
        {show.split(/(\s+)/).map((w,i)=>{
          if(w.startsWith('#')) return <span key={i} className="tag-lnk">{w}</span>;
          if(w.startsWith('@')) return <span key={i} className="at-lnk">{w}</span>;
          return w;
        })}
      </p>
      {long&&<button className="see-more" onClick={()=>setExp(v=>!v)}>{exp?'Show less':'See more'}</button>}
    </div>
  );
}

/* ════════════════════════════════════════════
   FOLLOW BUTTON
════════════════════════════════════════════ */
function FollowBtn({me,target}:{me:string|null;target:string}) {
  const supabase=createClient();
  const [following,setFollowing]=useState<boolean|null>(null);
  useEffect(()=>{
    if(!me||me===target)return;
    supabase.from('follows').select('id').eq('follower_id',me).eq('following_id',target).maybeSingle()
      .then(({data})=>setFollowing(!!data));
  },[me,target]);
  if(!me||me===target||following===null) return null;
  const toggle=async(e:React.MouseEvent)=>{
    e.preventDefault();e.stopPropagation();
    if(following){await supabase.from('follows').delete().eq('follower_id',me).eq('following_id',target);setFollowing(false);toast.success('Unfollowed');}
    else{await supabase.from('follows').insert({follower_id:me,following_id:target});setFollowing(true);toast.success('Following! 🚀');}
  };
  return (
    <button onClick={toggle} className={`ifollow${following?' ifollow-on':''}`}>
      {following?<><UserCheck style={{width:11,height:11}}/>Following</>:<><UserPlus style={{width:11,height:11}}/>Follow</>}
    </button>
  );
}

/* ════════════════════════════════════════════
   POST CARD
════════════════════════════════════════════ */
function PostCard({post,me,onLike,onComment,onDelete,onBookmark,bookmarked}:{
  post:Post;me:any;
  onLike:(id:string)=>void;
  onComment:(id:string,text:string)=>Promise<void>;
  onDelete?:(id:string)=>void;
  onBookmark:(id:string)=>void;
  bookmarked:boolean;
}) {
  const [showCmt,setShowCmt]=useState(false);
  const [cmtText,setCmtText]=useState('');
  const [busy,setBusy]=useState(false);
  const [menu,setMenu]=useState(false);
  const [repost,setRepost]=useState(false);
  const [lbIdx,setLbIdx]=useState<number|null>(null);
  const [cmtPg,setCmtPg]=useState(1);
  const inputRef=useRef<HTMLInputElement>(null);
  const menuRef=useRef<HTMLDivElement>(null);

  const liked=post.likes?.some(l=>l.user_id===me?.id)??false;
  const likeN=post.likes?.length??0;
  const cmtN=post.comments?.length??0;
  const isOwn=me?.id===post.user_id;
  const isNASA=post.content?.includes('🌌')&&post.content?.includes('Deskripsi NASA:');
  const uname=post.profiles?.username||'Anonymous';

  const allImages:string[]=post.post_images&&post.post_images.length>0
    ?[...post.post_images].sort((a,b)=>a.order_index-b.order_index).map(i=>i.url)
    :post.image_url?[post.image_url]:[];

  const shownCmts=post.comments?.slice(-(cmtPg*5))||[];
  const moreCmts=(post.comments?.length||0)>cmtPg*5;

  useEffect(()=>{
    const fn=(e:MouseEvent)=>{if(menuRef.current&&!menuRef.current.contains(e.target as Node))setMenu(false);};
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);

  const sendCmt=async()=>{
    const t=cmtText.trim();if(!t||busy)return;
    setBusy(true);await onComment(post.id,t);setCmtText('');setBusy(false);
  };

  const share=async()=>{
    const url=`${location.origin}/post/${post.id}`;
    if(navigator.share){try{await navigator.share({title:post.title||'',url});return;}catch{}}
    await navigator.clipboard?.writeText(url);toast.success('Link copied! 🔗');
  };

  return (
    <>
    <article className="pcard">
      {/* header */}
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
              {allImages.length>1&&<><span style={{color:'var(--muted)',fontSize:9}}>·</span><span style={{fontSize:11,color:'var(--accent)',fontWeight:700}}>{allImages.length} photos</span></>}
            </div>
          </div>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <FollowBtn me={me?.id||null} target={post.user_id}/>
          <div ref={menuRef} style={{position:'relative'}}>
            <button className="icon-btn" onClick={()=>setMenu(v=>!v)}><MoreHorizontal style={{width:16,height:16}}/></button>
            {menu&&(
              <div className="pmenu">
                {([
                  {ic:Link2,lb:'Copy link',fn:()=>{navigator.clipboard?.writeText(`${location.origin}/post/${post.id}`);toast.success('Copied!');setMenu(false);}},
                  {ic:Bookmark,lb:bookmarked?'Unsave':'Save post',fn:()=>{onBookmark(post.id);setMenu(false);}},
                  {ic:Eye,lb:'View post',fn:()=>{location.href=`/post/${post.id}`;setMenu(false);}},
                  {ic:Flag,lb:'Report',fn:()=>{toast('Reported 🚩');setMenu(false);}},
                  ...(isOwn?[{ic:X,lb:'Delete',fn:()=>{onDelete?.(post.id);setMenu(false);},d:true}]:[]),
                ] as {ic:any;lb:string;fn:()=>void;d?:boolean}[]).map(({ic:Ic,lb,fn,d})=>(
                  <button key={lb} onClick={fn} className={`pmenu-item${d?' pmenu-del':''}`}><Ic style={{width:13,height:13}}/>{lb}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* content */}
      {post.content&&<div style={{padding:'0 20px 16px'}}><PostContent text={post.content}/></div>}

      {/* images */}
      {allImages.length>0&&<ImageCarousel images={allImages} onOpen={i=>setLbIdx(i)}/>}

      {/* reaction count bar */}
      {(likeN>0||cmtN>0)&&(
        <div className="react-bar">
          {likeN>0&&(
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{display:'flex'}}>
                {['#f472b6','#fb7185','#f43f5e'].slice(0,Math.min(3,likeN)).map((c,i)=>(
                  <div key={i} style={{width:17,height:17,borderRadius:'50%',background:c,border:'2px solid var(--card)',marginLeft:i>0?-5:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Heart style={{width:7,height:7,color:'#fff'}} fill="#fff" strokeWidth={0}/>
                  </div>
                ))}
              </div>
              <span style={{fontSize:12,color:'var(--muted)'}}>{likeN.toLocaleString()} likes</span>
            </div>
          )}
          {cmtN>0&&(
            <button onClick={()=>setShowCmt(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,color:'var(--muted)',padding:0,marginLeft:'auto'}}>
              {cmtN} comment{cmtN!==1?'s':''}
            </button>
          )}
        </div>
      )}

      {/* action buttons */}
      <div className="pcard-actions">
        <button className={`abt${liked?' abt-lk':''}`} onClick={()=>onLike(post.id)}>
          <Heart style={{width:18,height:18}} fill={liked?'currentColor':'none'} strokeWidth={liked?0:1.8}/>
          <span>{liked?'Liked':'Like'}</span>
        </button>
        <button className="abt abt-cm" onClick={()=>{setShowCmt(v=>!v);setTimeout(()=>inputRef.current?.focus(),80);}}>
          <MessageCircle style={{width:18,height:18}} strokeWidth={1.8}/>
          <span>Comment</span>
        </button>
        <button className={`abt${repost?' abt-rp':''}`} onClick={()=>{setRepost(v=>!v);toast.success(repost?'Removed':'Reposted 🔁');}}>
          <Repeat2 style={{width:18,height:18}} strokeWidth={1.8}/>
          <span>{repost?'Reposted':'Repost'}</span>
        </button>
        <button className="abt abt-sh" onClick={share}>
          <Share2 style={{width:18,height:18}} strokeWidth={1.8}/>
          <span>Share</span>
        </button>
        <div style={{flex:1}}/>
        <button className={`save-btn${bookmarked?' sv-on':''}`} onClick={()=>{if(!me){toast.error('Sign in to save');return;}onBookmark(post.id);}}>
          <Bookmark style={{width:18,height:18}} fill={bookmarked?'currentColor':'none'} strokeWidth={bookmarked?0:1.8}/>
        </button>
      </div>

      {/* comments panel */}
      {showCmt&&(
        <div className="cmt-panel">
          {moreCmts&&(
            <button className="load-more" onClick={()=>setCmtPg(v=>v+1)}>
              Load more ({(post.comments?.length||0)-cmtPg*5} remaining)
            </button>
          )}
          {shownCmts.map(c=>(
            <div key={c.id} className="cmt-row">
              <a href={`/profile/${c.profiles?.username}`} style={{textDecoration:'none',flexShrink:0}}>
                <Avatar name={c.profiles?.username||'A'} url={c.profiles?.avatar_url} size={32}/>
              </a>
              <div style={{flex:1,minWidth:0}}>
                <div className="cmt-bubble">
                  <span className="cmt-nm">{c.profiles?.username||'Explorer'}</span>
                  <p style={{fontSize:13.5,color:'var(--txt2)',lineHeight:1.62,margin:0,wordBreak:'break-word'}}>{c.content}</p>
                </div>
                <div style={{display:'flex',gap:12,marginTop:5,paddingLeft:2}}>
                  <span style={{fontSize:11,color:'var(--muted)'}}>{timeAgo(c.created_at)}</span>
                  <button style={{fontSize:11,color:'var(--muted)',background:'none',border:'none',cursor:'pointer',fontWeight:600,padding:0}}>Like</button>
                  <button style={{fontSize:11,color:'var(--muted)',background:'none',border:'none',cursor:'pointer',fontWeight:600,padding:0}}>Reply</button>
                </div>
              </div>
            </div>
          ))}
          {me?(
            <div className="cmt-ir">
              <Avatar name={me?.user_metadata?.username||me?.email||'A'} size={34}/>
              <div className="cmt-wrap">
                <input ref={inputRef} value={cmtText} onChange={e=>setCmtText(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendCmt();}}}
                  placeholder="Add a comment…" className="cmt-inp"/>
                {cmtText.trim()&&(
                  <button onClick={sendCmt} disabled={busy} className="cmt-snd">
                    {busy?<Loader2 style={{width:13,height:13,animation:'spin 1s linear infinite'}}/>:<Send style={{width:13,height:13}}/>}
                  </button>
                )}
              </div>
            </div>
          ):(
            <p style={{fontSize:13,color:'var(--muted)',textAlign:'center',paddingTop:10}}>
              <a href="/login" style={{color:'var(--accent)'}}>Sign in</a> to comment
            </p>
          )}
        </div>
      )}
    </article>

    {lbIdx!==null&&allImages.length>0&&(
      <Lightbox images={allImages} initialIndex={lbIdx} title={post.content?.slice(0,60)||''} author={uname} onClose={()=>setLbIdx(null)}/>
    )}
    </>
  );
}

/* ════════════════════════════════════════════
   COMPOSE BOX
════════════════════════════════════════════ */
function ComposeBox({user,onPost}:{user:any;onPost:(c:string,f:File[],u:string[])=>Promise<void>}) {
  const [content,setContent]=useState('');
  const [files,setFiles]=useState<File[]>([]);
  const [prevs,setPrevs]=useState<string[]>([]);
  const [imgUrl,setImgUrl]=useState('');
  const [busy,setBusy]=useState(false);
  const [showUrl,setShowUrl]=useState(false);
  const [focused,setFocused]=useState(false);
  const [dragOver,setDragOver]=useState(false);
  const ta=useRef<HTMLTextAreaElement>(null);
  const fi=useRef<HTMLInputElement>(null);
  useEffect(()=>{const el=ta.current;if(!el)return;el.style.height='auto';el.style.height=Math.min(el.scrollHeight,280)+'px';},[content]);

  const addFiles=(nf:File[])=>{
    const valid=nf.filter(f=>{if(!f.type.startsWith('image/')){toast.error(`${f.name} bukan gambar`);return false;}if(f.size>10*1024*1024){toast.error(`${f.name} max 10MB`);return false;}return true;});
    const combined=[...files,...valid].slice(0,10);
    setFiles(combined);setPrevs(combined.map(f=>URL.createObjectURL(f)));setShowUrl(false);
  };
  const rmFile=(i:number)=>{URL.revokeObjectURL(prevs[i]);setFiles(f=>f.filter((_,j)=>j!==i));setPrevs(p=>p.filter((_,j)=>j!==i));};
  const mvFile=(a:number,b:number)=>{const nf=[...files];const np=[...prevs];[nf[a],nf[b]]=[nf[b],nf[a]];[np[a],np[b]]=[np[b],np[a]];setFiles(nf);setPrevs(np);};
  const clr=()=>{prevs.forEach(URL.revokeObjectURL);setFiles([]);setPrevs([]);setImgUrl('');};
  const submit=async()=>{
    if((!content.trim()&&!files.length&&!imgUrl)||busy)return;
    setBusy(true);await onPost(content.trim(),files,imgUrl?[imgUrl]:[]);
    setContent('');clr();setBusy(false);setFocused(false);
  };
  const uname=user?.user_metadata?.username||user?.email?.split('@')[0]||'You';
  const can=!!user&&!busy&&(!!content.trim()||!!files.length||!!imgUrl);

  return (
    <div className={`compose${focused?' cfoc':''}${dragOver?' cdrag':''}`}
      onDragOver={e=>{e.preventDefault();setDragOver(true);}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={e=>{e.preventDefault();setDragOver(false);addFiles(Array.from(e.dataTransfer.files));}}>
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        <Avatar name={uname} size={44}/>
        <div style={{flex:1,minWidth:0}}>
          {focused&&<button className="aud-pill"><Globe style={{width:11,height:11}}/> Everyone <ChevronDown style={{width:10,height:10}}/></button>}
          <textarea ref={ta} className="cmp-ta"
            placeholder={dragOver?'Drop photos here! 📸':user?'Share your cosmic discovery…':'Sign in to post…'}
            value={content} onChange={e=>setContent(e.target.value)}
            onFocus={()=>setFocused(true)} disabled={!user} maxLength={2000} rows={focused?3:2}/>
          {prevs.length>0&&(
            <>
              <div className={`pgrid pg${Math.min(prevs.length,4)}`}>
                {prevs.map((p,i)=>(
                  <div key={i} className="pi">
                    <img src={p} alt=""/>
                    <button className="pi-rm" onClick={()=>rmFile(i)}><X style={{width:10,height:10}}/></button>
                    {i>0&&<button className="pi-mv pi-mv-l" onClick={()=>mvFile(i,i-1)}><ChevronLeft style={{width:9,height:9}}/></button>}
                    {i<prevs.length-1&&<button className="pi-mv pi-mv-r" onClick={()=>mvFile(i,i+1)}><ChevronRight style={{width:9,height:9}}/></button>}
                    <div className="pi-num">{i+1}</div>
                  </div>
                ))}
                {prevs.length<10&&<button className="pi-add" onClick={()=>fi.current?.click()}><Plus style={{width:18,height:18,color:'var(--muted)'}}/><span>Add</span></button>}
              </div>
              <div className="pgrid-meta">
                <span>{prevs.length} photo{prevs.length>1?'s':''} · drag to reorder</span>
                <button onClick={clr} className="pi-clr">Remove all</button>
              </div>
            </>
          )}
          {showUrl&&!prevs.length&&<input className="cmp-url" placeholder="Paste image URL…" value={imgUrl} onChange={e=>setImgUrl(e.target.value)}/>}
          <div className="cmp-foot">
            <div style={{display:'flex',gap:2}}>
              {[
                {Ic:ImageIcon,lb:prevs.length>0?`${prevs.length}/10`:'Photo',fn:()=>fi.current?.click(),on:prevs.length>0},
                {Ic:Globe,lb:'URL',fn:()=>{if(!prevs.length)setShowUrl(v=>!v);},on:showUrl},
                {Ic:Hash,lb:'Tag',fn:()=>{setContent(c=>c+' #');ta.current?.focus();},on:false},
                {Ic:AtSign,lb:'Mention',fn:()=>{setContent(c=>c+' @');ta.current?.focus();},on:false},
              ].map(({Ic,lb,fn,on})=>(
                <button key={lb} className={`ctool${on?' ct-on':''}`} onClick={fn} disabled={!user}>
                  <Ic style={{width:14,height:14}}/><span className="ct-lb">{lb}</span>
                </button>
              ))}
              <input ref={fi} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{addFiles(Array.from(e.target.files||[]));if(fi.current)fi.current.value='';}}/>
            </div>
            {content.length>0&&<span style={{fontSize:11,color:content.length>1800?'#f87171':'var(--muted)'}}>{content.length}/2000</span>}
            <button className="cmp-sub" onClick={submit} disabled={!can}>
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
        <p className="stitle"><Flame style={{width:11,height:11,color:'#f97316'}}/>Trending Now</p>
        {[['#MarsRover','4.2k',true],['#APOD','3.1k',true],['#JamesWebb','2.8k',false],['#DeepSpace','2.1k',false],['#ISS','1.4k',false]].map(([t,c,h],i)=>(
          <div key={String(t)} className="trend-row">
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:10,fontWeight:700,color:'rgba(100,116,139,.3)',width:14,textAlign:'right',fontFamily:"'Archivo Black',sans-serif"}}>{i+1}</span>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <span style={{fontSize:13,fontWeight:700,color:'rgba(196,181,253,.9)',fontFamily:"'Archivo Black',sans-serif"}}>{t}</span>
                  {h&&<Flame style={{width:10,height:10,color:'#f97316'}}/>}
                </div>
                <span style={{fontSize:11,color:'var(--muted)'}}>{c} posts</span>
              </div>
            </div>
            <BarChart2 style={{width:13,height:13,color:'var(--muted)',opacity:.25}}/>
          </div>
        ))}
      </div>
      <div className="scard">
        <p className="stitle"><Sparkles style={{width:11,height:11,color:'var(--accent)'}}/>Suggested</p>
        {[{n:'NebulaMaster',s:'12.4k followers'},{n:'StargazerX',s:'8.9k followers'},{n:'CassiniPro',s:'5.2k followers'}].map(u=>(
          <div key={u.n} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
            <Avatar name={u.n} size={36}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--txt)',fontFamily:"'Archivo Black',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.n}</div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{u.s}</div>
            </div>
            <button className={`sflw${flw[u.n]?' sflw-on':''}`} onClick={()=>setFlw(v=>({...v,[u.n]:!v[u.n]}))}>
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
            <a href="/profile" style={{fontSize:11,color:'var(--accent)',textDecoration:'none',marginTop:1,display:'block'}}>View profile →</a>
          </div>
        </div>
      )}
      <p style={{fontSize:10,color:'rgba(100,116,139,.18)',lineHeight:1.7,padding:'0 2px'}}>StellarHub · Privacy · Terms<br/>© 2025 StellarHub</p>
    </aside>
  );
}

function Tabs({tab,set}:{tab:string;set:(t:string)=>void}) {
  return (
    <div className="tabs">
      {[{id:'latest',lb:'For You',Ic:Sparkles},{id:'following',lb:'Following',Ic:User},{id:'trending',lb:'Trending',Ic:TrendingUp}].map(({id,lb,Ic})=>(
        <button key={id} className={`tab${tab===id?' tab-on':''}`} onClick={()=>set(id)}>
          <Ic style={{width:12,height:12}}/>{lb}
          {tab===id&&<div className="tab-line"/>}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   STYLES
════════════════════════════════════════════ */
const CSS=`
html{scroll-behavior:smooth}body{overflow-x:hidden}
*{scrollbar-width:thin;scrollbar-color:rgba(129,140,248,.15) transparent}
*::-webkit-scrollbar{width:3px;height:3px}*::-webkit-scrollbar-thumb{background:rgba(129,140,248,.15);border-radius:99px}
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
:root{--bg:#060810;--card:rgba(11,14,26,.9);--accent:#818cf8;--txt:rgba(226,232,240,.96);--txt2:rgba(203,213,225,.75);--muted:rgba(100,116,139,.5);--border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.04)}
*,*::before,*::after{box-sizing:border-box;margin:0}

.feed-page{min-height:100svh;padding:80px 16px 90px;font-family:'DM Sans',sans-serif;color:var(--txt)}
.feed-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr;gap:24px;align-items:start}
@media(min-width:900px){.feed-grid{grid-template-columns:1fr 298px}}

.pcard{background:var(--card);border:1px solid var(--border);border-radius:24px;backdrop-filter:blur(20px);overflow:hidden;margin-bottom:12px;transition:border-color .3s,box-shadow .3s,transform .28s cubic-bezier(.16,1,.3,1);animation:slideUp .5s cubic-bezier(.16,1,.3,1) both}
.pcard:hover{border-color:rgba(129,140,248,.22);box-shadow:0 16px 56px rgba(0,0,0,.35);transform:translateY(-2px)}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.pcard:nth-child(1){animation-delay:.04s}.pcard:nth-child(2){animation-delay:.09s}.pcard:nth-child(3){animation-delay:.14s}.pcard:nth-child(n+4){animation-delay:.18s}
.pcard-head{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 20px 14px;gap:10px}
.pcard-author{display:flex;align-items:center;gap:12px;text-decoration:none;flex:1;min-width:0}
.pcard-name{font-size:15px;font-weight:700;color:var(--txt);font-family:'Archivo Black',sans-serif}

/* single image */
.cs-single{position:relative;border-top:1px solid var(--border);border-bottom:1px solid var(--border);overflow:hidden;cursor:pointer;line-height:0}
.cs-single-img{width:100%;max-height:520px;object-fit:cover;display:block;transition:transform .5s cubic-bezier(.16,1,.3,1)}
.cs-single:hover .cs-single-img{transform:scale(1.025)}
.cs-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 55%);opacity:0;transition:opacity .25s;display:flex;align-items:flex-end;justify-content:flex-end;padding:14px}
.cs-single:hover .cs-ov,.cs-slide:hover .cs-ov{opacity:1}
.cs-pill{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);color:rgba(255,255,255,.9);font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,.15);transform:translateY(8px);transition:transform .25s}
.cs-single:hover .cs-pill,.cs-slide:hover .cs-pill{transform:translateY(0)}

/* carousel */
.cs-root{position:relative;border-top:1px solid var(--border);border-bottom:1px solid var(--border);overflow:hidden;background:rgba(0,0,0,.25);user-select:none;touch-action:pan-y}
.cs-wrap{overflow:hidden}
.cs-track{display:flex;will-change:transform}
.cs-slide{flex:0 0 100%;position:relative;line-height:0;overflow:hidden}
.cs-img{width:100%;max-height:520px;object-fit:cover;display:block;pointer-events:none;transition:transform .4s cubic-bezier(.16,1,.3,1)}
.cs-slide:hover .cs-img{transform:scale(1.02)}
.cs-arr{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,.72);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.18);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:10}
.cs-arr:hover{background:rgba(129,140,248,.4);border-color:rgba(129,140,248,.5);transform:translateY(-50%) scale(1.1)}
.cs-l{left:12px}.cs-r{right:12px}
.cs-dots{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:10}
.cs-dot{width:6px;height:6px;border-radius:3px;border:none;cursor:pointer;background:rgba(255,255,255,.35);transition:all .25s;padding:0}
.cs-dot-a{width:18px;background:#fff}
.cs-ctr{position:absolute;top:12px;right:12px;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:4px 11px;font-size:12px;font-weight:700;color:#fff;font-family:'Archivo Black',sans-serif;z-index:10}

/* ── LIGHTBOX ── */
.lb-root{
  position:fixed;inset:0;z-index:9999;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:58px 0 0;
  animation:lbFi .22s ease both;
}
.lb-exit{animation:lbFo .2s ease both !important}
@keyframes lbFi{from{opacity:0}to{opacity:1}}
@keyframes lbFo{from{opacity:1}to{opacity:0}}

/* BACKDROP — this is the click target */
.lb-bg{
  position:absolute;inset:0;
  background:rgba(2,4,12,.97);
  backdrop-filter:blur(32px) saturate(1.3);
  cursor:pointer; /* cursor shows it's clickable */
}
/* visual hint on hover */
.lb-bg:hover::after{
  content:'Click anywhere to close';
  position:absolute;bottom:50%;left:50%;transform:translate(-50%,50%);
  font-size:13px;color:rgba(100,116,139,.3);
  font-family:'DM Sans',sans-serif;pointer-events:none;
}

.lb-bar{
  position:fixed;top:0;left:0;right:0;height:58px;z-index:20;
  display:flex;align-items:center;justify-content:space-between;padding:0 16px;
  background:linear-gradient(to bottom,rgba(2,4,12,.96),transparent);
  backdrop-filter:blur(20px);
}
.lb-x{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.75);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.lb-x:hover{background:rgba(239,68,68,.25);border-color:rgba(239,68,68,.4);color:#f87171;transform:scale(1.1) rotate(90deg)}
.lb-cnt{padding:3px 11px;border-radius:20px;background:rgba(129,140,248,.15);border:1px solid rgba(129,140,248,.25);font-size:12px;font-weight:700;color:var(--accent);font-family:'Archivo Black',sans-serif}
.lb-ib{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);color:rgba(200,210,230,.65);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;text-decoration:none}
.lb-ib:hover{background:rgba(129,140,248,.15);border-color:rgba(129,140,248,.3);color:#818cf8}

/* stage — pointer-events:none so clicks fall to .lb-bg */
.lb-stage{
  position:relative;z-index:1;
  display:flex;align-items:center;justify-content:center;
  width:100%;max-width:1280px;flex:1;
  padding:20px 70px;
  pointer-events:none;
}
@media(max-width:700px){.lb-stage{padding:16px 8px}}

/* image box — pointer-events back on */
.lb-img-box{
  pointer-events:all;
  position:relative;
  border-radius:14px;overflow:hidden;
  box-shadow:0 40px 100px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.06);
  animation:lbIi .3s cubic-bezier(.16,1,.3,1) both;
  transition:transform .38s cubic-bezier(.16,1,.3,1);
  max-width:100%;
}
@keyframes lbIi{from{opacity:0;transform:scale(.93) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
.lb-img-box.lb-zoomed{transform:scale(1.85)}
.lb-img{max-width:100%;max-height:calc(100vh - 200px);object-fit:contain;display:block;user-select:none;-webkit-user-drag:none;transition:opacity .25s}
.lb-spin-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.lb-spin{width:36px;height:36px;border-radius:50%;border:3px solid rgba(129,140,248,.15);border-top-color:rgba(129,140,248,.7);animation:spin 1s linear infinite}

/* nav arrows (pointer-events:all so they work) */
.lb-arr{
  pointer-events:all;
  position:absolute;top:50%;transform:translateY(-50%);
  width:50px;height:50px;border-radius:50%;
  background:rgba(0,0,0,.75);backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.85);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .22s;z-index:5;
}
.lb-arr:hover{background:rgba(129,140,248,.3);border-color:rgba(129,140,248,.5);color:#fff;transform:translateY(-50%) scale(1.1)}
.lb-arr-l{left:8px}.lb-arr-r{right:8px}

/* filmstrip */
.lb-strip{
  position:fixed;bottom:0;left:0;right:0;z-index:20;
  display:flex;align-items:center;gap:6px;
  padding:10px 16px 12px;
  background:linear-gradient(to top,rgba(2,4,12,.97),transparent);
  backdrop-filter:blur(20px);
  overflow-x:auto;overflow-y:hidden;
  pointer-events:all;
}
.lb-th{position:relative;flex-shrink:0;width:56px;height:56px;border-radius:10px;overflow:hidden;border:2px solid transparent;cursor:pointer;transition:all .22s;opacity:.45;padding:0;background:none}
.lb-th:hover{opacity:.8;transform:scale(1.05)}
.lb-th-a{opacity:1 !important;border-color:var(--accent) !important;box-shadow:0 0 0 3px rgba(129,140,248,.25)}
.lb-th img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}

.lb-hint{position:fixed;z-index:15;left:50%;transform:translateX(-50%);font-size:11px;color:rgba(100,116,139,.4);font-family:'DM Sans',sans-serif;white-space:nowrap;pointer-events:none;transition:opacity .3s}

/* reactions */
.react-bar{display:flex;align-items:center;gap:12px;padding:7px 20px;border-top:1px solid var(--border2)}
.pcard-actions{display:flex;align-items:center;padding:4px 10px 6px;gap:2px;border-top:1px solid var(--border2)}
.abt{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border-radius:12px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;border:none;background:none;font-family:'DM Sans',sans-serif;transition:all .2s}
.abt:hover{background:rgba(255,255,255,.05);color:var(--txt2)}
.abt-lk{color:#f472b6 !important}.abt-lk svg{animation:hpop .36s ease both}.abt-lk:hover{background:rgba(244,114,182,.08) !important}
.abt-cm:hover{color:#38bdf8;background:rgba(56,189,248,.08) !important}
.abt-rp{color:#34d399 !important}.abt-rp:hover{background:rgba(52,211,153,.08) !important}
.abt-sh:hover{color:var(--accent);background:rgba(129,140,248,.08) !important}
@keyframes hpop{0%{transform:scale(1)}40%{transform:scale(1.55)}70%{transform:scale(.88)}100%{transform:scale(1)}}
.save-btn{width:34px;height:34px;border-radius:10px;border:none;background:none;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center;transition:all .2s}
.save-btn:hover{background:rgba(251,191,36,.08);color:#fbbf24}.sv-on{color:#fbbf24 !important}
.icon-btn{width:32px;height:32px;border-radius:9px;border:none;background:none;cursor:pointer;color:rgba(100,116,139,.4);display:flex;align-items:center;justify-content:center;transition:all .2s}
.icon-btn:hover{background:rgba(255,255,255,.06);color:var(--txt)}
.ifollow{display:inline-flex;align-items:center;gap:5px;padding:5px 13px;border-radius:20px;font-size:11.5px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Archivo Black',sans-serif;border:1px solid rgba(129,140,248,.28);background:rgba(129,140,248,.07);color:var(--accent);flex-shrink:0}
.ifollow:hover{background:rgba(129,140,248,.18);transform:scale(1.04)}
.ifollow-on{border-color:rgba(52,211,153,.28) !important;background:rgba(52,211,153,.07) !important;color:#34d399 !important}
.ifollow-on:hover{background:rgba(239,68,68,.07) !important;border-color:rgba(239,68,68,.28) !important;color:#f87171 !important}
.pmenu{position:absolute;top:38px;right:0;min-width:185px;z-index:50;background:rgba(5,7,18,.99);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:6px;box-shadow:0 20px 70px rgba(0,0,0,.8);backdrop-filter:blur(28px);animation:mIn .2s cubic-bezier(.16,1,.3,1) both}
@keyframes mIn{from{opacity:0;transform:translateY(-6px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.pmenu-item{display:flex;align-items:center;gap:9px;width:100%;padding:9px 12px;border-radius:10px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:500;color:rgba(148,163,184,.85);font-family:'DM Sans',sans-serif;text-align:left;transition:background .15s,color .15s}
.pmenu-item:hover{background:rgba(255,255,255,.05);color:var(--txt)}
.pmenu-del{color:rgba(248,113,113,.7) !important}.pmenu-del:hover{background:rgba(239,68,68,.08) !important;color:#f87171 !important}
.cmt-panel{border-top:1px solid var(--border2);padding:8px 20px 16px}
.cmt-row{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.03)}
.cmt-bubble{background:rgba(255,255,255,.04);border-radius:0 14px 14px 14px;padding:9px 13px}
.cmt-nm{font-size:12.5px;font-weight:700;color:var(--txt);font-family:'Archivo Black',sans-serif;display:block;margin-bottom:3px}
.cmt-ir{display:flex;gap:10px;align-items:center;padding-top:12px}
.cmt-wrap{flex:1;display:flex;align-items:center;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:50px;padding:2px 4px 2px 14px;transition:border-color .2s}
.cmt-wrap:focus-within{border-color:rgba(129,140,248,.35)}
.cmt-inp{flex:1;background:none;border:none;outline:none;color:var(--txt2);font-size:13.5px;font-family:'DM Sans',sans-serif;padding:9px 0}
.cmt-inp::placeholder{color:rgba(100,116,139,.38)}
.cmt-snd{width:30px;height:30px;border-radius:50%;border:none;background:linear-gradient(135deg,#7c3aed,#0ea5e9);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s;flex-shrink:0}
.cmt-snd:hover:not(:disabled){transform:scale(1.1)}
.load-more{width:100%;padding:8px;background:none;border:none;color:var(--accent);font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-bottom:8px}
.load-more:hover{text-decoration:underline}
.tag-lnk{color:var(--accent);font-weight:600;cursor:pointer}.tag-lnk:hover{text-decoration:underline}
.at-lnk{color:#38bdf8;font-weight:600;cursor:pointer}.at-lnk:hover{text-decoration:underline}
.see-more{background:none;border:none;color:var(--accent);font-size:14px;font-weight:600;cursor:pointer;padding:4px 0 0;font-family:'DM Sans',sans-serif}
.nasa-badge{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:2px 7px;border-radius:20px;background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(14,165,233,.2));border:1px solid rgba(124,58,237,.3);color:#a78bfa;font-family:'Archivo Black',sans-serif}

/* compose */
.compose{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:18px 20px;margin-bottom:14px;backdrop-filter:blur(20px);transition:border-color .3s,box-shadow .3s}
.cfoc{border-color:rgba(129,140,248,.3);box-shadow:0 0 0 4px rgba(129,140,248,.04),0 8px 32px rgba(0,0,0,.2)}
.cdrag{border-color:rgba(129,140,248,.6);box-shadow:0 0 0 4px rgba(129,140,248,.1);background:rgba(129,140,248,.04)}
.cmp-ta{width:100%;background:none;border:none;outline:none;resize:none;color:var(--txt2);font-size:15px;font-family:'DM Sans',sans-serif;line-height:1.75;min-height:52px;max-height:280px;overflow-y:auto;padding:0}
.cmp-ta::placeholder{color:rgba(100,116,139,.35)}
.pgrid{display:grid;gap:6px;margin-top:12px;border-radius:14px;overflow:hidden}
.pg1{grid-template-columns:1fr}.pg2{grid-template-columns:1fr 1fr}.pg3{grid-template-columns:1fr 1fr}.pg3 .pi:first-child{grid-column:1/-1}.pg4{grid-template-columns:1fr 1fr}
.pi{position:relative;overflow:hidden;border-radius:10px;aspect-ratio:4/3;background:rgba(0,0,0,.3)}.pi img{width:100%;height:100%;object-fit:cover;display:block}
.pi-add{display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:10px;aspect-ratio:4/3;background:rgba(255,255,255,.03);border:2px dashed rgba(255,255,255,.1);cursor:pointer;transition:all .2s;gap:4px;font-size:11px;color:var(--muted);font-family:'DM Sans',sans-serif}
.pi-add:hover{background:rgba(129,140,248,.06);border-color:rgba(129,140,248,.3)}
.pi-rm{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.78);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;transition:background .2s}
.pi-rm:hover{background:rgba(220,38,38,.9)}
.pi-mv{position:absolute;bottom:6px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.65);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;opacity:.7;transition:all .2s}
.pi-mv:hover{opacity:1;background:rgba(129,140,248,.65)}.pi-mv-l{left:6px}.pi-mv-r{right:6px}
.pi-num{position:absolute;top:6px;left:6px;width:20px;height:20px;border-radius:50%;background:rgba(129,140,248,.8);color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;font-family:'Archivo Black',sans-serif}
.pgrid-meta{display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 0;border-top:1px solid var(--border2);font-size:11.5px;color:var(--muted)}
.pi-clr{margin-left:auto;font-size:12px;color:rgba(239,68,68,.6);background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif}.pi-clr:hover{color:#f87171}
.cmp-url{width:100%;margin-top:10px;padding:9px 13px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;color:var(--txt2);font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
.cmp-url:focus{border-color:rgba(129,140,248,.35)}
.cmp-foot{display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border2);margin-top:12px;gap:8px;flex-wrap:wrap}
.ctool{display:flex;align-items:center;gap:5px;padding:6px 9px;border-radius:8px;font-size:12.5px;font-weight:600;color:var(--muted);cursor:pointer;border:none;background:none;font-family:'DM Sans',sans-serif;transition:all .18s}
.ctool:hover:not(:disabled){background:rgba(255,255,255,.05);color:var(--txt2)}.ctool:disabled{opacity:.25;cursor:not-allowed}
.ct-on{color:var(--accent) !important}.ct-lb{display:none}@media(min-width:480px){.ct-lb{display:inline}}
.aud-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;border:1px solid rgba(129,140,248,.28);background:rgba(129,140,248,.07);font-size:11.5px;font-weight:700;color:var(--accent);cursor:pointer;margin-bottom:8px;font-family:'Archivo Black',sans-serif}
.cmp-sub{display:inline-flex;align-items:center;gap:7px;padding:9px 22px;border-radius:50px;font-size:13.5px;font-weight:700;color:#fff;cursor:pointer;border:none;background:linear-gradient(135deg,#7c3aed,#0ea5e9);font-family:'Archivo Black',sans-serif;transition:transform .2s,box-shadow .25s,opacity .2s;white-space:nowrap}
.cmp-sub:hover:not(:disabled){transform:translateY(-1px) scale(1.04);box-shadow:0 6px 22px rgba(124,58,237,.45)}.cmp-sub:disabled{opacity:.3;cursor:not-allowed;transform:none}
.tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:16px}
.tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:13px 8px;font-size:13.5px;font-weight:700;color:var(--muted);cursor:pointer;border:none;background:none;font-family:'Archivo Black',sans-serif;position:relative;transition:color .2s}
.tab:hover{color:var(--txt2)}.tab-on{color:var(--txt)}
.tab-line{position:absolute;bottom:-1px;left:12%;right:12%;height:2px;border-radius:2px;background:linear-gradient(90deg,#7c3aed,#0ea5e9);animation:sIn .25s ease both}
@keyframes sIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.scard{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:17px;backdrop-filter:blur(16px);margin-bottom:14px}
.stitle{display:flex;align-items:center;gap:7px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:rgba(100,116,139,.4);margin-bottom:13px;font-family:'Archivo Black',sans-serif}
.trend-row{display:flex;align-items:center;justify-content:space-between;padding:8px 6px;border-radius:11px;cursor:pointer;transition:background .18s}
.trend-row:hover{background:rgba(255,255,255,.04)}
.sflw{display:inline-flex;align-items:center;gap:4px;padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;border:1px solid rgba(129,140,248,.28);background:rgba(129,140,248,.06);color:var(--accent);font-family:'Archivo Black',sans-serif}
.sflw:hover{background:rgba(129,140,248,.15)}.sflw-on{border-color:rgba(52,211,153,.28) !important;background:rgba(52,211,153,.07) !important;color:#34d399 !important}
.nasa-card{position:relative;overflow:hidden;min-height:158px;background:linear-gradient(135deg,rgba(124,58,237,.22),rgba(14,165,233,.1),rgba(5,8,16,.97))}
.nasa-stars{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 15% 25%,rgba(255,255,255,.7),transparent),radial-gradient(1px 1px at 55% 15%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 80% 60%,rgba(255,255,255,.55),transparent),radial-gradient(2px 2px at 50% 45%,rgba(167,139,250,.45),transparent)}
.nasa-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.28);font-size:12px;font-weight:700;color:#38bdf8;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all .2s}
.nasa-btn:hover{background:rgba(14,165,233,.22)}
.sk{background:rgba(255,255,255,.05);animation:shim 1.8s ease-in-out infinite;border-radius:6px;display:block}
@keyframes shim{0%,100%{opacity:.4}50%{opacity:.85}}
.new-bar{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 20px;border-radius:50px;background:linear-gradient(135deg,#7c3aed,#0ea5e9);font-size:13px;font-weight:700;color:#fff;cursor:pointer;font-family:'Archivo Black',sans-serif;margin:0 auto 16px;width:fit-content;box-shadow:0 4px 18px rgba(124,58,237,.45);animation:bIn .45s cubic-bezier(.16,1,.3,1) both;transition:transform .2s}
.new-bar:hover{transform:translateY(-2px)}
@keyframes bIn{from{opacity:0;transform:translateY(-18px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}
.scroll-top{position:fixed;bottom:90px;right:18px;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#0ea5e9);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(124,58,237,.55);z-index:100;animation:fUp .3s ease;transition:transform .2s}
.scroll-top:hover{transform:scale(1.1) translateY(-2px)}
@keyframes fUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.empty{text-align:center;padding:60px 24px;background:var(--card);border:1px solid var(--border);border-radius:24px}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){*{animation:none !important;transition-duration:.01ms !important}}
`;

/* ════════════════════════════════════════════
   MAIN
════════════════════════════════════════════ */
export default function FeedPage() {
  const supabase=createClient();
  const [posts,setPosts]=useState<Post[]>([]);
  const [loading,setLoading]=useState(true);
  const [user,setUser]=useState<any>(null);
  const [tab,setTab]=useState('latest');
  const [scrollTop,setScrollTop]=useState(false);
  const [newCount,setNewCount]=useState(0);
  const [bookmarks,setBookmarks]=useState<Set<string>>(new Set());

  useEffect(()=>{
    fetchUser();fetchPosts();
    const fn=()=>setScrollTop(window.scrollY>500);
    window.addEventListener('scroll',fn,{passive:true});
    return()=>window.removeEventListener('scroll',fn);
  },[]);
  useEffect(()=>{if(!loading){const t=setTimeout(()=>setNewCount(2),20000);return()=>clearTimeout(t);}},[loading]);

  const fetchUser=async()=>{
    const{data:{user}}=await supabase.auth.getUser();setUser(user);
    if(user){const{data}=await supabase.from('bookmarks').select('post_id').eq('user_id',user.id).not('post_id','is',null);if(data)setBookmarks(new Set(data.map((b:any)=>b.post_id)));}
  };
  const fetchPosts=async()=>{
    try{
      const{data,error}=await supabase.from('posts')
        .select(`*,profiles(username,avatar_url),likes(id,user_id),comments(id,content,created_at,user_id,post_id,profiles(username,avatar_url)),post_images(id,url,order_index)`)
        .order('created_at',{ascending:false}).limit(50);
      if(error)throw error;setPosts(data||[]);
    }catch{toast.error('Failed to load posts');}
    finally{setLoading(false);}
  };

  const handlePost=async(content:string,imgFiles:File[],imageUrls:string[])=>{
    if(!user){toast.error('Sign in first');return;}
    try{
      const{data:pd,error:pe}=await supabase.from('posts').insert({content,user_id:user.id,title:content.slice(0,80)||'Post',image_url:null}).select().single();
      if(pe)throw pe;
      const urls:string[]=[];
      for(const f of imgFiles){
        const ext=f.name.split('.').pop()||'jpg';
        const path=`posts/${pd.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const{error:ue}=await supabase.storage.from('images').upload(path,f,{upsert:false});
        if(ue){toast.error(`Upload failed: ${f.name}`);continue;}
        urls.push(supabase.storage.from('images').getPublicUrl(path).data.publicUrl);
      }
      urls.push(...imageUrls.filter(Boolean));
      if(urls.length>0){
        if(urls.length===1)await supabase.from('posts').update({image_url:urls[0]}).eq('id',pd.id);
        await supabase.from('post_images').insert(urls.map((url,i)=>({post_id:pd.id,url,order_index:i})));
      }
      toast.success('Posted! 🚀');fetchPosts();
    }catch(e:any){toast.error(e?.message||'Failed');}
  };

  const handleLike=async(postId:string)=>{
    if(!user){toast.error('Sign in to like');return;}
    setPosts(prev=>prev.map(p=>{if(p.id!==postId)return p;const a=p.likes.some(l=>l.user_id===user.id);return{...p,likes:a?p.likes.filter(l=>l.user_id!==user.id):[...p.likes,{id:'opt',user_id:user.id}]};}));
    try{const{data:ex}=await supabase.from('likes').select('id').eq('post_id',postId).eq('user_id',user.id).single();if(ex)await supabase.from('likes').delete().eq('id',ex.id);else await supabase.from('likes').insert({post_id:postId,user_id:user.id});fetchPosts();}catch{fetchPosts();}
  };

  const handleComment=async(postId:string,text:string)=>{
    if(!user){toast.error('Sign in to comment');return;}
    const opt:Comment={id:'opt-'+Date.now(),content:text,created_at:new Date().toISOString(),user_id:user.id,post_id:postId,profiles:{username:user.user_metadata?.username||user.email?.split('@')[0]||'You',avatar_url:null}};
    setPosts(prev=>prev.map(p=>p.id!==postId?p:{...p,comments:[...(p.comments||[]),opt]}));
    try{const{error}=await supabase.from('comments').insert({post_id:postId,user_id:user.id,content:text});if(error)throw error;fetchPosts();}catch{toast.error('Failed');fetchPosts();}
  };

  const handleDelete=async(postId:string)=>{
    if(!user)return;
    try{await supabase.from('post_images').delete().eq('post_id',postId);await supabase.from('posts').delete().eq('id',postId).eq('user_id',user.id);setPosts(prev=>prev.filter(p=>p.id!==postId));toast.success('Deleted');}
    catch{toast.error('Failed');}
  };

  const handleBookmark=async(postId:string)=>{
    if(!user){toast.error('Sign in to save');return;}
    const saved=bookmarks.has(postId);
    setBookmarks(prev=>{const n=new Set(prev);saved?n.delete(postId):n.add(postId);return n;});
    if(saved){await supabase.from('bookmarks').delete().eq('user_id',user.id).eq('post_id',postId);toast.success('Removed from saved');}
    else{await supabase.from('bookmarks').insert({user_id:user.id,post_id:postId,bookmark_type:'post'});toast.success('Saved! ✨');}
  };

  const visible=tab==='trending'?[...posts].sort((a,b)=>((b.likes?.length??0)+(b.comments?.length??0))-((a.likes?.length??0)+(a.comments?.length??0))):posts;

  return (
    <div className="feed-page">
      <style>{CSS}</style>
      <div className="feed-grid">
        <div>
          <ComposeBox user={user} onPost={handlePost}/>
          {newCount>0&&(
            <div className="new-bar" onClick={()=>{setNewCount(0);window.scrollTo({top:0,behavior:'smooth'});fetchPosts();}}>
              <ArrowUp style={{width:13,height:13}}/>{newCount} new posts — tap to refresh
            </div>
          )}
          <Tabs tab={tab} set={setTab}/>
          {loading?(
            <>{[0,1,2].map(i=>(
              <div key={i} className="pcard" style={{padding:'20px 22px',marginBottom:12}}>
                <div style={{display:'flex',gap:12,marginBottom:14}}><div className="sk" style={{width:44,height:44,borderRadius:13,flexShrink:0}}/><div style={{flex:1}}><div className="sk" style={{width:'32%',height:11,borderRadius:6,marginBottom:8}}/><div className="sk" style={{width:'18%',height:9,borderRadius:6}}/></div></div>
                <div className="sk" style={{width:'100%',height:13,borderRadius:6,marginBottom:8}}/><div className="sk" style={{width:'72%',height:13,borderRadius:6,marginBottom:16}}/><div className="sk" style={{width:'100%',paddingTop:'45%',borderRadius:12}}/>
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
                onBookmark={handleBookmark} bookmarked={bookmarks.has(p.id)}/>
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
    </div>
  );
}