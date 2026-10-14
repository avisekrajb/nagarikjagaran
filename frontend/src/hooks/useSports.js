import {useEffect,useState} from "react";
import {getNewsByCategory} from "../services/newsService";
export default function useSports(){const [news,setNews]=useState([]);const [loading,setLoading]=useState(true);useEffect(()=>{getNewsByCategory("खेलकुद").then(setNews).finally(()=>setLoading(false))},[]);return {news,loading};}
