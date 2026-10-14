import React from "react";
import { Link } from "react-router-dom";
import { User, Mail, Twitter, Linkedin } from "lucide-react";

export default function AuthorMiniSidebar({ author, authorPhoto, authorBio }) {
  if (!author) return null;

  return (
    <div className="side-box">
      <div className="flex items-center gap-3 mb-4">
        {authorPhoto ? (
          <img src={authorPhoto} alt={author} className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-200" />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-2xl font-black text-white">
            <User size={24} />
          </div>
        )}
        <div>
          <h4 className="font-black text-slate-800">{author}</h4>
          <span className="text-xs font-bold text-slate-400">लेखक</span>
        </div>
      </div>
      {authorBio && <p className="text-sm text-slate-600 leading-relaxed mb-4">{authorBio}</p>}
      <div className="flex items-center gap-2">
        <a href="#" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-brand-600 transition" title="इमेल"><Mail size={14} /></a>
        <a href="#" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-brand-600 transition" title="ट्विटर"><Twitter size={14} /></a>
        <a href="#" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-brand-600 transition" title="लिंक्डइन"><Linkedin size={14} /></a>
      </div>
    </div>
  );
}