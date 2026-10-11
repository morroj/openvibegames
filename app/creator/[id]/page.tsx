import Hub from '../../hub';
export default async function Creator({params}:{params:Promise<{id:string}>}){return <Hub mode="creator" id={(await params).id}/>;}
