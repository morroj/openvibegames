import {auth} from '../auth';
export async function getGoogleUser(){
 if(!process.env.AUTH_SECRET||!process.env.AUTH_GOOGLE_ID||!process.env.AUTH_GOOGLE_SECRET)return null;
 const session=await auth();const user=session?.user;
 return user?.id?.startsWith('google:')?{userId:user.id,fullName:user.name??null}:null;
}
