import {useEffect,useState} from "react";
import {getNewsByCategory} from "../services/newsService";
export default function useArt(){const [news,setNews]=useState([]);const [loading,setLoading]=useState(true);useEffect(()=>{getNewsByCategory("कला").then(setNews).finally(()=>setLoading(false))},[]);return {news,loading};}
