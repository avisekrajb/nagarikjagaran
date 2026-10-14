import {useEffect,useState} from "react"; import {searchNews} from "../services/newsService";
export default function useSearch(q){const [results,setResults]=useState([]);useEffect(()=>{if(q)searchNews(q).then(setResults);else setResults([])},[q]);return results;}
