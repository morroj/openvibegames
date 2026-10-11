'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Carousel,CarouselContent,CarouselItem,type CarouselApi} from '@/components/ui/carousel';
import {Gamepad2,Play,Pause,ChevronLeft,ChevronRight,Star,VolumeX,Film} from 'lucide-react';
import type {Game} from './hub';

export function useReducedMotion(){
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 return reduced;
}
export function GameArtwork({game,className='',eager=false}:{game:Game;className?:string;eager?:boolean}){
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[game.cover]);
 return <div className={'game-art '+className} data-genre={game.genre}>{game.cover&&!failed?<img src={game.cover} alt={game.name+' game preview'} loading={eager?'eager':'lazy'} referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>:<div className="art-fallback"><Gamepad2 aria-hidden="true" size={44}/><span>{game.name}</span></div>}</div>;
}
export function GameRow({title,games,ranked=false}:{title:string;games:Game[];ranked?:boolean}){
 const [api,setApi]=useState<CarouselApi>(),[hover,setHover]=useState(false),[focus,setFocus]=useState(false),[dragging,setDragging]=useState(false),[paused,setPaused]=useState(false),[visible,setVisible]=useState(false),[canMove,setCanMove]=useState(false);
 const row=useRef<HTMLElement>(null),reduced=useReducedMotion(),heading=useMemo(()=>title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),[title]);
 useEffect(()=>{if(!row.current)return;const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:0.15});observer.observe(row.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!api)return;const down=()=>setDragging(true),up=()=>setDragging(false),update=()=>setCanMove(api.canScrollNext()||api.canScrollPrev());api.on('pointerDown',down);api.on('pointerUp',up);api.on('reInit',update);api.on('select',update);update();return()=>{api.off('pointerDown',down);api.off('pointerUp',up);api.off('reInit',update);api.off('select',update);};},[api]);
 useEffect(()=>{if(!api||paused||hover||focus||dragging||reduced||!visible||!canMove)return;const timer=window.setInterval(()=>{if(document.hidden)return;if(api.canScrollNext())api.scrollNext();else api.scrollTo(0);},5000);return()=>window.clearInterval(timer);},[api,paused,hover,focus,dragging,reduced,visible,canMove]);
 return <section className={'game-row '+(ranked?'ranked-row':'')} ref={row} aria-labelledby={heading} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocus(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocus(false);}}>
 <div className="row-heading"><h2 id={heading}>{title}</h2>{games.length>0&&<span className="row-count">{games.length} {games.length===1?'game':'games'}</span>}<div className="row-controls">{canMove&&<>{!reduced&&<button className="row-control" onClick={()=>setPaused(!paused)} aria-label={(paused?'Resume':'Pause')+' automatic scrolling in '+title} aria-pressed={paused}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>}<button className="row-control" aria-label={'Previous game in '+title} onClick={()=>api?.scrollPrev()}><ChevronLeft size={21}/></button><button className="row-control" aria-label={'Next game in '+title} onClick={()=>api?.canScrollNext()?api.scrollNext():api?.scrollTo(0)}><ChevronRight size={21}/></button></>}</div></div>
 {games.length?<Carousel opts={{align:'start',loop:true,slidesToScroll:1,duration:35}} setApi={setApi} className="game-carousel" aria-label={title}>
 <CarouselContent className="game-track">{games.map((g,index)=><CarouselItem className="game-slide" key={g.id}><article className="library-card">{ranked&&<span className="game-rank" aria-label={'Rank '+(index+1)}>{index+1}</span>}<div className="tile-body"><a href={'/game/'+g.id} className="tile-cover" aria-label={'View '+g.name}><GameArtwork game={g}/><span className="tile-play"><Play size={22} fill="currentColor"/></span><span className="tile-genre">{g.genre}</span></a><div className="tile-meta"><a className="tile-title" href={'/game/'+g.id}>{g.name}</a><div className="tile-stats"><span><Star size={13}/>{g.rating?Number(g.rating).toFixed(1)+'/5':'Unrated'}</span><span>{g.playCount.toLocaleString()} plays</span></div><a className="tile-creator" href={'/creator/'+g.owner}>by {g.creator}</a></div></div></article></CarouselItem>)}</CarouselContent>
 </Carousel>:<div className="row-empty"><Gamepad2 size={22}/><span>{title==='Most popular'?'The arcade is waiting for its first game.':'New games will appear here when they’re published.'}</span><a href="/submit">Post a game</a></div>}
 </section>;
}
function FeaturedGame({game}:{game:Game}){
 const video=useRef<HTMLVideoElement>(null),[failed,setFailed]=useState(false),[paused,setPaused]=useState(false),[blocked,setBlocked]=useState(false),[manualPlayback,setManualPlayback]=useState(false),reduced=useReducedMotion();
 useEffect(()=>{setFailed(false);setPaused(false);setBlocked(false);setManualPlayback(false);},[game.id,game.trailer]);
 useEffect(()=>{const el=video.current;if(!el||failed)return;if(paused||(reduced&&!manualPlayback)||document.hidden){el.pause();return;}el.play().then(()=>setBlocked(false)).catch(()=>setBlocked(true));},[game.id,game.trailer,paused,reduced,failed,manualPlayback]);
 useEffect(()=>{const update=()=>{const el=video.current;if(!el)return;if(document.hidden)el.pause();else if(!paused&&(!reduced||manualPlayback))el.play().catch(()=>setBlocked(true));};document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[paused,reduced,manualPlayback]);
 async function toggle(){if((reduced&&!manualPlayback)||blocked){try{await video.current?.play();setManualPlayback(true);setBlocked(false);setPaused(false);}catch{setBlocked(true);}return;}setPaused(!paused);}
 return <section className="featured" aria-label={'Featured game: '+game.name}><GameArtwork game={game} className="featured-backdrop" eager/>
 {game.trailer&&!failed&&<video ref={video} key={game.trailer} className="featured-video" src={game.trailer} poster={game.cover||undefined} autoPlay={!reduced} muted playsInline loop preload="metadata" tabIndex={-1} aria-hidden="true" onError={()=>setFailed(true)} onTimeUpdate={e=>{if(e.currentTarget.currentTime>=30)e.currentTarget.currentTime=0;}}/>}
 <div className="featured-shade"/><div className="featured-content"><span className="feature-label"><span/>MOST POPULAR GAME</span><h1>{game.name}</h1><div className="feature-stats"><span className="feature-genre">{game.genre}</span><span><Star size={16}/>{game.rating?Number(game.rating).toFixed(1)+'/5':'Unrated'}</span><span>{game.playCount.toLocaleString()} plays</span></div><p className="featured-summary">{game.description}</p><div className="featured-actions"><a className="button primary" href={'/game/'+game.id}><Play size={19} fill="currentColor"/>View game</a><a className="button secondary" href={'/creator/'+game.owner}>by {game.creator}</a></div></div>
 {game.trailer&&!failed?<div className="trailer-controls"><span><VolumeX size={16}/>Muted trailer</span><button className="media-control" aria-label={(paused||blocked||(reduced&&!manualPlayback)?'Play':'Pause')+' featured trailer'} onClick={toggle}>{paused||blocked||(reduced&&!manualPlayback)?<Play size={18}/>:<Pause size={18}/>}</button></div>:<span className="trailer-fallback"><Film size={15}/>{failed?'Trailer unavailable · showing cover':'Game preview'}</span>}
 </section>;
}
export default function Discovery({games,loading=false}:{games:Game[];loading?:boolean}){
 const popular=useMemo(()=>[...games].sort((a,b)=>b.playCount-a.playCount||b.created-a.created),[games]);
 const recent=useMemo(()=>[...games].sort((a,b)=>b.created-a.created),[games]);
 const genres=['Arcade','Puzzle','Adventure','Platformer','Strategy','Other'];
 return <>{popular[0]?<FeaturedGame game={popular[0]}/>:<section className="featured featured-empty"><div className="featured-shade"/><div className="featured-content"><span className="feature-label">STUDENT-MADE. READY TO PLAY.</span><h1>Your next favorite<br/>starts here<span>.</span></h1><p className="featured-summary">{loading?'Opening the arcade…':'A home for the games you make. Publish your first game to bring the arcade to life.'}</p><a className="button primary" href="/submit"><Gamepad2 size={20}/>Post your game</a></div></section>}
 <div className="library-rows"><GameRow title="Most popular" games={popular.slice(0,20)} ranked/><GameRow title="Recently added" games={recent}/><div id="genres">{genres.filter(genre=>games.some(g=>g.genre===genre)).map(genre=><GameRow key={genre} title={genre} games={recent.filter(g=>g.genre===genre)}/>)}</div>{!games.length&&!loading&&<div className="genre-empty"><h2>Find your genre</h2><p>Arcade, puzzles, adventures and more. Genre rows appear as games are added.</p></div>}</div></>;
}



