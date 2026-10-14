import {useEffect,useState} from "react";
import {getNewsByCategory} from "../services/newsService";
export default function useMiscellaneous(){const [news,setNews]=useState([]);const [loading,setLoading]=useState(true);useEffect(()=>{getNewsByCategory("विविध").then(setNews).finally(()=>setLoading(false))},[]);return {news,loading};}
