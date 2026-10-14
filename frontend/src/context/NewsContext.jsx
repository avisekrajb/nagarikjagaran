import {createContext,useContext} from "react"; import useNews from "../hooks/useNews";
const C=createContext(null); export const NewsProvider=({children})=><C.Provider value={useNews()}>{children}</C.Provider>; export const useNewsContext=()=>useContext(C);
