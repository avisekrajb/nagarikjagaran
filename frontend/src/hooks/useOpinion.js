import {useEffect,useState} from "react";
import {getNewsByCategory} from "../services/newsService";
export default function useOpinion(){const [news,setNews]=useState([]);const [loading,setLoading]=useState(true);useEffect(()=>{getNewsByCategory("विचार").then(setNews).finally(()=>setLoading(false))},[]);return {news,loading};}
