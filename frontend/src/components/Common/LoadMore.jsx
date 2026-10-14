import React, { useEffect, useRef, useState } from "react";

/**
 * स्क्रोल गर्दा आफैँ "अरू खोज्नुहोस्" — pagination जस्तै।
 *
 * - loadMore() : अर्को पटक देखाउने
 * - done      : सबै देखाइसकियो
 * - auto      : true भए स्क्रोल गर्दा आफैँ थपिन्छ, false भए बटन थिच्नुपर्छ
 */
export default function LoadMore({
  loadMore,
  done = false,
  auto = true,
  label = "अरू समाचार हेर्नुहोस्",
  loadingLabel = "लोड हुँदैछ…",
  rootMargin = "400px",
  className = "mt-8 flex justify-center"
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  const guard = useRef(false);

  const run = async () => {
    if (busy || done || failed) return;
    setBusy(true);
    try {
      await loadMore();
      guard.current = false;
    } catch (e) {
      setFailed(true);
      guard.current = false;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!auto || done || failed) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !guard.current) {
          guard.current = true;
          run();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, done, failed, busy]);

  if (done) return null;

  /* auto मा खाली sentinel मात्र — "स्क्रोल गर्दैछि…" जस्तो पाठ हरेक खण्डमा
     थुप्रिने होइन, खाली ठाउँ मात्र छोडिन्छ (browser ले नजरले हेर्छ)। */
  if (auto && !busy && !failed) {
    return <div ref={ref} aria-hidden="true" style={{ height: 1 }} />;
  }

  return (
    <div ref={ref} className={className}>
      {busy && <span className="text-xs font-bold text-slate-400">{loadingLabel}</span>}
      {failed && (
        <button
          type="button"
          onClick={run}
          className="rounded-full border border-slate-300 px-5 py-2 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700"
        >
          पुनः प्रयास
        </button>
      )}
    </div>
  );
}