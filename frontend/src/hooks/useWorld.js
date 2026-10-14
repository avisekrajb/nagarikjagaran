import {useEffect,useState} from "react";
import {getNewsByCategory} from "../services/newsService";
export default function useWorld(){const [news,setNews]=useState([]);const [loading,setLoading]=useState(true);useEffect(()=>{getNewsByCategory("विश्व").then(setNews).finally(()=>setLoading(false))},[]);return {news,loading};}
