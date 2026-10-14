import React from "react";
import { X, ExternalLink } from "lucide-react";
import { absoluteUrl } from "../../services/api";
import { useWatermark } from "../Common/Watermark";
import { useSite } from "../../context/SiteContext";

/**
 * भिडियोमाथि watermark — एडमिनले रीलका लागि अलग स्थान (reel_pos_x/y, size) मिलाउँछ।
 * लोगो नभए "न" ब्र्यान्ड चिन्ह देखाउँछ।
 */
function VideoMark() {
  const wm = useWatermark();
  const { site } = useSite();
  if (!wm || !wm.enabled || !wm.reel_enabled) return null;

  const src = wm.logo ? absoluteUrl(wm.logo) : absoluteUrl(site?.logo || "");
  const size = Number(wm.reel_size) || 34;
  return (
    <span
      className="vid-mark"
      aria-hidden="true"
      style={{
        right: "auto",
        bottom: "auto",
        left: `${Number(wm.reel_pos_x) || 0}%`,
        top: `${Number(wm.reel_pos_y) || 0}%`,
        width: size,
        height: size,
        opacity: Number(wm.reel_opacity) || 0.9,
        transform: "translate(-50%,-50%)",
      }}
    >
      {src ? (
        <img src={src} alt="" />
      ) : (
        <span className="vid-mark-fallback">न</span>
      )}
    </span>
  );
}

const embedInfo = (u) => {
  const s = String(u || "");
  /* सिधा भिडियो फाइल (.webm/.mp4 — Commons बाट) */
  if (/\.(webm|mp4|ogv|ogg)(\?|$)/i.test(s)) return { type: "file", src: s };
  const m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,15})|youtu\.be\/([\w-]{6,15})/);
  if (m) return { type: "yt", src: `https://www.youtube.com/embed/${m[1] || m[2]}?autoplay=1` };
  if (/facebook\.com|fb\.watch|fb\.com/i.test(s)) return { type: "fb", src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(s)}&show_text=false&autoplay=1` };
  return { type: "link" };
};

export default function ReelViewer({ reel, onClose }) {
  if (!reel) return null;
  const info = embedInfo(reel.video_url);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      {/* ९:१६ भएला फ्रेम */}
      <div
        className="relative w-full max-w-[min(92vw,calc((100vh-4rem)*9/16))] overflow-hidden rounded-3xl bg-slate-900 shadow-2xl"
        style={{ aspectRatio: "9 / 16" }}
        onClick={(e) => e.stopPropagation()}
      >
        {info.type === "file" ? (
          <video
            src={info.src}
            poster={reel.image || undefined}
            className="absolute inset-0 h-full w-full object-cover"
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        ) : (
          <>
            {reel.image ? <img className="h-full w-full object-cover opacity-30" src={reel.image} alt="" /> : <div className="h-full w-full opacity-30" />}
            {info.type === "yt" || info.type === "fb" ? (
              <iframe
                src={info.src}
                title={reel.title}
                className="absolute inset-0 h-full w-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-white">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-600 shadow-xl"><ExternalLink size={26} /></span>
                <a href={reel.video_url || "#"} target="_blank" rel="noreferrer" className="rounded-full bg-white/95 px-6 py-2.5 text-sm font-black text-slate-900 transition hover:bg-white">
                  {reel.video_url ? "युट्युब / फेसबुकमा हेर्नुहोस्" : "भिडियो लिंक छैन"}
                </a>
              </div>
            )}
          </>
        )}
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white"><X /></button>
        {/* भिडियोमा watermark — तल सानो */}
        <VideoMark />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-14 text-white">
          <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            {info.type === "yt" ? "युट्युब" : info.type === "fb" ? "फेसबुक रील" : info.type === "file" ? "विडियो" : reel.category || "रील"}
          </span>
          <h2 className="mt-2 text-xl font-black leading-snug">{reel.title}</h2>
        </div>
      </div>
    </div>
  );
}