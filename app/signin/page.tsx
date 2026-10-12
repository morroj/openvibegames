import {signIn} from '@/auth';
import {returnPath} from '@/lib/return-path';
export const dynamic='force-dynamic';
export default async function SignInPage({searchParams}:{searchParams:Promise<{returnTo?:string}>}){
 const to=returnPath((await searchParams).returnTo);
 const configured=!!(process.env.AUTH_SECRET&&process.env.AUTH_GOOGLE_ID&&process.env.AUTH_GOOGLE_SECRET);
 return <main className="main"><section className="sign-panel"><h1>Welcome to openvibegames</h1><p>Publish your games, rate your favorites and track your plays.</p>{configured?<form action={async()=>{'use server';await signIn('google',{redirectTo:to});}}><button className="button primary" type="submit">Continue with Google</button></form>:<p>Google sign-in is being configured. Please come back soon.</p>}<a className="back" href="/">Back to games</a></section></main>;
}
