import React,{createContext,useContext,useState,useEffect} from "react";

const C=createContext(null);
const getInit=()=>{try{return localStorage.getItem("nagarik-theme")||"light"}catch(e){return "light"}};

export const UIProvider=({children})=>{
  const [drawer,setDrawer]=useState(false);
  const [theme,setTheme]=useState(getInit);
  useEffect(()=>{
    document.documentElement.classList.toggle("dark",theme==="dark");
    try{localStorage.setItem("nagarik-theme",theme)}catch(e){}
  },[theme]);
  const toggleTheme=()=>setTheme(t=>t==="dark"?"light":"dark");
  return <C.Provider value={{drawer,setDrawer,theme,toggleTheme}}>{children}</C.Provider>;
};

export const useUI=()=>useContext(C);