import React from "react";
import { useState, useEffect } from "react";
import { Mail, Phone, Facebook, Instagram, Youtube, Users, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import FooterLinks from "./FooterLinks";
import FooterBottom from "./FooterBottom";
import Brand from "../Common/Brand";
import { getFooterData } from "../../services/newsService";
import { absoluteUrl } from "../../services/api";

export default function Footer() {
  const [f, setF] = useState(null);
  useEffect(() => { getFooterData().then(setF); }, []);
  const data = f || {};
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900">
      <div className="footer-banner">
        <img className="footer-banner-photo" src={absoluteUrl("/navbarbg/navbarbg.png")} alt="" aria-hidden="true" />
        <div className="footer-banner-body">
        <div className="container-shell py-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Brand />
              <p className="mt-4 max-w-xl leading-7 text-white/85">{data.description || "विश्वसनीय समाचार, तथ्यमा आधारित विश्लेषण र नेपाली समाजका आवाजहरूलाई एउटै डिजिटल घरमा जोड्ने आधुनिक समाचार पोर्टल।"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex flex-col gap-2.5">
                <Link to="/ourteam" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-5 py-2.5 text-sm font-black text-white ring-1 ring-inset ring-white/25 transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-700"><Users size={15} /> हाम्रो टिम</Link>
                <Link to="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-black text-brand-700 shadow transition hover:-translate-y-0.5"><MessageSquare size={15} /> सम्पर्क</Link>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 text-sm backdrop-blur">
                <b className="block text-lg text-white">सम्पर्क</b>
                <p className="mt-2 flex items-center gap-2 text-white/90"><Mail size={17} /> {data.email || "hello@nagariknews.example"}</p>
                <p className="mt-3 flex items-center gap-2 text-white/90"><Phone size={17} /> {data.phone || "+९७७ १ ४१२३४५६"}</p>
                <div className="mt-4 flex gap-3">
                  <a href={data.facebook || "#"} aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-600 transition hover:-translate-y-0.5"><Facebook size={17} /></a>
                  <a href={data.instagram || "#"} aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-pink-600 transition hover:-translate-y-0.5"><Instagram size={17} /></a>
                  <a href={data.youtube || "#"} aria-label="Youtube" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-600 transition hover:-translate-y-0.5"><Youtube size={17} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div className="container-shell py-10">
        <FooterLinks data={data} />
      </div>
      <div className="footer-banner-bottombar">
        <div className="container-shell py-5">
          <FooterBottom />
        </div>
      </div>
    </footer>
  );
}