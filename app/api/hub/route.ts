import {db,gameQuery,safeEmbed,httpsUrl} from '../../data';
export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
async function identity(){const {getGoogleUser}=await import('../../google-auth');const u=await getGoogleUser();if(!u)return null;const d=db();await d.prepare('INSERT INTO profiles (id,auth_id,name,bio) VALUES (?,?,?,?) ON CONFLICT(auth_id) DO NOTHING').bind(crypto.randomUUID(),u.userId,u.fullName||'New creator','').run();return await d.prepare('SELECT id,name,bio FROM profiles WHERE auth_id=?').bind(u.userId).first<{id:string;name:string;bio:string}>();}
export async function GET(req:Request){try{const d=db(),url=new URL(req.url),me=url.searchParams.get('account')==='1'?await identity():null,profileId=url.searchParams.get('profile');let profile=null;
 if(profileId){profile=await d.prepare('SELECT id,name,bio FROM profiles WHERE id=?').bind(profileId).first();if(!profile)return json({error:'Creator not found'},404);}
 const result=await d.prepare(gameQuery+" WHERE g.status='published' OR g.owner=? ORDER BY g.created DESC").bind(me?.id||'').all();return json({me,profile,games:result.results});}catch(e){console.error(e);return json({error:'The arcade is temporarily unavailable. Please try again.'},503);}}
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Request not allowed'},403);
 if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'Expected JSON'},415);
 const raw=await req.text();if(raw.length>20000)return json({error:'Submission is too large'},413);const body=JSON.parse(raw),d=db();
 if(body.action==='play'){
 const game=await d.prepare("SELECT id FROM games WHERE id=? AND status='published'").bind(body.id).first();if(!game)return json({error:'Game not found'},404);
 const cookie=req.headers.get('cookie')?.match(/(?:^|;\s*)arcade_visitor=([a-f0-9-]{36})(?:;|$)/)?.[1];const visitor=cookie||crypto.randomUUID();
 await d.prepare('INSERT INTO plays (game,visitor,bucket) VALUES (?,?,?) ON CONFLICT DO NOTHING').bind(body.id,visitor,Math.floor(Date.now()/1800000)).run();
 return Response.json({ok:true},{headers:{'Set-Cookie':`arcade_visitor=${visitor}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`,'Cache-Control':'no-store'}});}
 const me=await identity();if(!me)return json({error:'Sign in to continue.'},401);
 if(body.action==='profile'){const name=String(body.name||'').trim(),bio=String(body.bio||'').trim();if(name.length<2||name.length>50||bio.length>300)return json({error:'Use a name of 2–50 characters and a bio up to 300 characters.'},400);await d.prepare('UPDATE profiles SET name=?,bio=? WHERE id=?').bind(name,bio,me.id).run();return json({ok:true});}
 if(body.action==='rate'){if(!Number.isInteger(body.stars)||body.stars<1||body.stars>5)return json({error:'Choose 1 to 5 stars.'},400);const g=await d.prepare("SELECT id FROM games WHERE id=? AND status='published'").bind(body.id).first();if(!g)return json({error:'Game not found'},404);await d.prepare('INSERT INTO ratings (game,"user",stars) VALUES (?,?,?) ON CONFLICT(game,"user") DO UPDATE SET stars=excluded.stars').bind(body.id,me.id,body.stars).run();return json({ok:true});}
 if(body.action==='status'){if(!['published','draft','archived'].includes(body.status))return json({error:'Invalid status'},400);const r=await d.prepare('UPDATE games SET status=? WHERE id=? AND owner=?').bind(body.status,body.id,me.id).run();return json(r.meta.changes?{ok:true}:{error:'Game not found'},r.meta.changes?200:404);}
 if(body.action==='save'){
 const name=String(body.name||'').trim(),description=String(body.description||'').trim(),controls=String(body.controls||'').trim(),genre=String(body.genre||'Other');
 if(name.length<2||name.length>80||description.length<10||description.length>2000||controls.length>500||!['Arcade','Puzzle','Adventure','Platformer','Strategy','Other'].includes(genre))return json({error:'Check the game name, description, genre and controls.'},400);
 const embed=safeEmbed(String(body.embed||'')),source=httpsUrl(String(body.source||'')),cover=httpsUrl(String(body.cover||''),true),trailer=httpsUrl(String(body.trailer||''),true);
 if([embed,source,cover,trailer].some(u=>u.length>2048))return json({error:'Keep media and game links under 2,048 characters.'},400);
 if(body.id){const r=await d.prepare('UPDATE games SET name=?,description=?,controls=?,genre=?,embed=?,source=?,cover=?,trailer=? WHERE id=? AND owner=?').bind(name,description,controls,genre,embed,source,cover,trailer,body.id,me.id).run();if(!r.meta.changes)return json({error:'Game not found'},404);return json({id:body.id});}
 const id=crypto.randomUUID();await d.prepare('INSERT INTO games (id,owner,name,description,genre,controls,embed,source,cover,trailer,status,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,me.id,name,description,genre,controls,embed,source,cover,trailer,'published',Date.now()).run();return json({id});}
 return json({error:'Unknown action'},400);
 }catch(e){console.error(e);return json({error:e instanceof TypeError?'Check the links and try again.':e instanceof Error&&/Paste|HTTPS|secure/.test(e.message)?e.message:'Could not save your changes. Please try again.'},400);}}
