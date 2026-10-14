import {useEffect,useState} from "react"; import {getAllNews} from "../services/newsService";
export default function useNews(){const [news,setNews]=useState([]);const [loading,setLoading]=useState(true);useEffect(()=>{getAllNews().then(setNews).finally(()=>setLoading(false))},[]);return {news,loading};}
