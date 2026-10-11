import Hub from '../../hub';
export default async function Game({params}:{params:Promise<{id:string}>}){return <Hub mode="game" id={(await params).id}/>;}
