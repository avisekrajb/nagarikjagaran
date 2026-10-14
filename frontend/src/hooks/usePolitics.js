import {useEffect,useState} from "react";
import {getNewsByCategory} from "../services/newsService";
export default function usePolitics(){const [news,setNews]=useState([]);const [loading,setLoading]=useState(true);useEffect(()=>{getNewsByCategory("राजनीति").then(setNews).finally(()=>setLoading(false))},[]);return {news,loading};}
