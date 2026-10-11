import { getDatabase } from '@netlify/database';
// Values remain parameters; this adapter converts only our own fixed SQL strings.
function statement(query:string,values:unknown[]=[]){
 let index=0;const sql=query.replace(/\?/g,()=>'$'+(++index));
 const execute=async()=>{const result=await getDatabase().pool.query(sql,values);return {rows:result.rows.map((row:Record<string,unknown>)=>{for(const key of ['rating','ratingCount','playCount','created'])if(row[key]!=null)row[key]=Number(row[key]);return row;}),changes:result.rowCount??0};};
 return {bind:(...params:unknown[])=>statement(query,params),first:async<T=Record<string,unknown>>()=>(await execute()).rows[0] as T|null??null,all:async()=>({results:(await execute()).rows}),run:async()=>({meta:{changes:(await execute()).changes}})};
}
export function db(){return {prepare:statement};}
export const gameQuery=`SELECT g.*, p.name creator, (SELECT AVG(stars) FROM ratings WHERE game=g.id) rating, (SELECT COUNT(*) FROM ratings WHERE game=g.id) "ratingCount", (SELECT COUNT(*) FROM plays WHERE game=g.id) "playCount" FROM games g JOIN profiles p ON p.id=g.owner`;
export function safeEmbed(input:string){
 const match=input.match(/src\s*=\s*["']([^"']+)["']/i);const u=new URL(match?match[1]:input.trim());
 if(u.protocol!=='https:'||u.port||u.username||u.password)throw new Error('Use a secure HTTPS embed URL.');
 if(!((u.hostname==='itch.io'&&/^\/embed-upload\/\d+\/?$/.test(u.pathname))||(u.hostname==='html-classic.itch.zone'&&u.pathname.startsWith('/html/'))))throw new Error('Paste the playable iframe from itch.io (embed-upload or html-classic.itch.zone), not the store widget.');
 return u.href;
}
export function httpsUrl(value:string,optional=false){if(optional&&!value)return '';const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw new Error('Links must use HTTPS.');return u.href;}
