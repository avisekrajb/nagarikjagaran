import React from "react"; import {NavLink} from "react-router-dom";
export default function NavigationItem({item}){return <NavLink to={item.path} className={({isActive})=>`nav-link ${isActive?"nav-active":""}`}>{item.label||item.name}</NavLink>}
