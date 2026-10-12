import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
export const {handlers,auth,signIn,signOut}=NextAuth({
 providers:[Google],session:{strategy:'jwt'},
 callbacks:{
  signIn({account,profile}){return account?.provider==='google' && (profile as {email_verified?:boolean})?.email_verified===true;},
  jwt({token,account}){if(account?.provider==='google')token.sub='google:'+account.providerAccountId;return token;},
  session({session,token}){if(session.user&&token.sub)session.user.id=token.sub;return session;}
 }
});
