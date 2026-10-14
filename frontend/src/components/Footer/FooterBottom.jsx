import React from "react";
import { SITE_IDENTITY, copyrightLine } from "../../config/siteIdentity";

/**
 * नाम, इमेल, कपीराइट — सबै `src/config/siteIdentity.js` बाट आउँछ।
 * यहाँ हातले लेखिएको केही पनि छैन; सबै एकै ठाउँबाट।
 */
export default function FooterBottom() {
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm font-bold text-white/90">{copyrightLine()}</p>
      <a
        href={SITE_IDENTITY.creditUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-black text-white transition hover:opacity-90"
      >
        <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/30">Powered by</span>
        <span className="tracking-wide underline-offset-4 hover:underline">{SITE_IDENTITY.creditLabel}</span>
      </a>
    </div>
  );
}
