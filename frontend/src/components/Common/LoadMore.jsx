```jsx
import React, { useEffect, useRef, useState } from "react";

export default function LoadMore({
  loadMore,
  done = false,
  auto = true,
  label = "अरू समाचार हेर्नुहोस्",
  loadingLabel = "लोड हुँदैछ…",
  rootMargin = "400px",
  className = "mt-8 flex justify-center",
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const ref = useRef(null);
  const guard = useRef(false);
  const runRef = useRef(null);

  runRef.current = async () => {
    if (guard.current || done || failed) return;

    guard.current = true;
    setBusy(true);

    try {
      await loadMore();
      setFailed(false);
    } catch (error) {
      setFailed(true);
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!auto || done || failed) return;

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runRef.current?.();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [auto, done, failed, rootMargin]);

  if (done) return null;

  if (auto && !busy && !failed) {
    return <div ref={ref} aria-hidden="true" style={{ height: 1 }} />;
  }

  return (
    <div ref={ref} className={className}>
      {busy && (
        <span className="text-xs font-bold text-slate-400">
          {loadingLabel}
        </span>
      )}

      {failed && (
        <button
          type="button"
          onClick={() => runRef.current?.()}
          className="rounded-full border border-slate-300 px-5 py-2 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700"
        >
          पुनः प्रयास
        </button>
      )}

      {!auto && !busy && !failed && (
        <button
          type="button"
          onClick={() => runRef.current?.()}
          className="rounded-full border border-slate-300 px-5 py-2 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700"
        >
          {label}
        </button>
      )}
    </div>
  );
}
```