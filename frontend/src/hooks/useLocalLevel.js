import {useEffect,useState} from "react";
import {getNewsByCategory} from "../services/newsService";
export default function useLocalLevel(){const [news,setNews]=useState([]);const [loading,setLoading]=useState(true);useEffect(()=>{getNewsByCategory("स्थानीय तह").then(setNews).finally(()=>setLoading(false))},[]);return {news,loading};}
