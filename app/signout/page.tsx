import {signOut} from '@/auth';
export const dynamic='force-dynamic';
export default function SignOut(){return <main className="main"><section className="sign-panel"><h1>Sign out of openvibegames?</h1><form action={async()=>{'use server';await signOut({redirectTo:'/'});}}><button type="submit" className="button primary">Sign out</button></form><a href="/account">Keep playing</a></section></main>;}
