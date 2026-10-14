import React from "react";
import { useState } from "react";
import { Facebook, Twitter, Link2, Check } from "lucide-react";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { incrementNewsClick } from "../../services/newsService";

function WhatsAppIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 0 16.47z" />
    </svg>
  );
}

export default function SocialShare({ article, className = "" }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const t = encodeURIComponent(article.title);
  const links = [
    { label: "फेसबुक", Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, cls: "bg-[#1877F2] hover:brightness-110" },
    { label: "ट्विटर", Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${t}`, cls: "bg-black hover:bg-slate-800" },
    { label: "व्हाट्सएप", Icon: WhatsAppIcon, href: `https://api.whatsapp.com/send?text=${t}%20${encodeURIComponent(url)}`, cls: "bg-[#25D366] hover:brightness-105" }
  ];
  const copy = async () => {
    await copyToClipboard(url);
    incrementNewsClick(article.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const handleShareClick = () => {
    incrementNewsClick(article.id);
  };
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      <span className="text-xs font-semibold tracking-normal text-slate-500">शेयर गर्नुहोस्</span>
      <span className="h-4 w-px bg-slate-200" />
      {links.map(({ label, Icon, href, cls }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" title={label} onClick={handleShareClick}
          className={`grid h-9 w-9 place-items-center rounded-full text-white shadow-md transition ${cls}`}>
          <Icon size={16} />
        </a>
      ))}
      <button onClick={copy} title="लिंक कपी गर्नुहोस्"
        className={`grid h-9 w-9 place-items-center rounded-full shadow-md transition ${copied ? "border border-emerald-200 bg-emerald-50 text-emerald-600" : "border border-slate-200 bg-brand-600 text-white hover:brightness-110"}`}>
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
      {copied && <span className="text-xs font-bold text-emerald-600">लिंक कपी भयो!</span>}
    </div>
  );
}