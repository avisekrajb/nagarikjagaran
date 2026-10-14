import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, Search, X, RefreshCw,
  ChevronLeft, ChevronRight, LayoutGrid, Eye, Loader2
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { absoluteUrl } from "../../../services/api";
import NewsFormModal from "../NewsFormModal";
import { Btn, Th, Td } from "./AdminUI";

const PER_PAGE = 20;

/** १, २, … ८ … ९९, १०० सबै देखाउने पेज सूची */
const pageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => out.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => out.add(n));
  const sorted = [...out].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const withGaps = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) withGaps.push("...");
    withGaps.push(n);
  });
  return withGaps;
};

const nf = (n) => Number(n || 0).toLocaleString("ne-NP");

export default function AdminNews({ setMsg, startOpen = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const timer = useRef(null);

  const load = async (opts = {}) => {
    const p = opts.page ?? page;
    const s = opts.q ?? q;
    const c = opts.category ?? category;
    setLoading(true);
    try {
      const res = await adminApi.manageNews({ page: p, limit: PER_PAGE, q: s, category: c });
      setData(res);
    } catch (e) {
      setMsg("समाचार लोड गर्न सकिएन: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load({ page: 1 }); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (startOpen) setModal(null); /* eslint-disable-next-line */ }, []);

  // खोज — टाइप गरेपछि ३५०ms पछि मात्र सर्च
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setQ(query.trim());
      setPage(1);
      load({ page: 1, q: query.trim() });
    }, 350);
    return () => clearTimeout(timer.current);
  }, [query]);

  const items = data?.items || [];
  const cats = data?.categories || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const cur = data?.page || 1;
  const activeCat = category;

  const pickCat = (name) => {
    setCategory(name);
    setPage(1);
    load({ page: 1, category: name });
  };

  const goPage = (p) => {
    if (p === "..." || p === cur) return;
    const next = Math.min(pages, Math.max(1, p));
    setPage(next);
    load({ page: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (n) => {
    if (!window.confirm(`"${n.title}" मेट्ने हो?`)) return;
    try {
      await adminApi.deleteNews(n.id);
      setMsg("समाचार मेटियो");
      load();
    } catch (err) { setMsg(err.message); }
  };

  const openEdit = (n) => setModal(n);
  const openNew = () => setModal(null);

  const stats = useMemo(() => {
    const pub = items.filter((n) => String(n.status || "published") !== "draft").length;
    const views = items.reduce((a, n) => a + Number(n.view_count || 0), 0);
    return { pub, draft: items.length - pub, views };
  }, [items]);

  return (
    <div className="space-y-4">
      {/* ---------- सिर ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
            <LayoutGrid size={20} className="text-blue-600" /> समाचार व्यवस्थापन
          </h2>
          <p className="mt-0.5 text-xs font-bold text-slate-500">
            {activeCat ? `${activeCat} श्रेणीमा ` : "जम्मा "}
            <b className="text-slate-700">{nf(total)}</b> समाचार
            {q ? ` • "${q}" खोजेको` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn kind="soft" onClick={() => load()} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> रिफ्रेस
          </Btn>
          <Btn onClick={openNew}><Plus size={15} /> नयाँ समाचार</Btn>
        </div>
      </div>

      {/* ---------- खोज + श्रेणी ---------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-soft sm:p-4">
        <div className="relative">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="शीर्षक, सारांश, लेखक वा ट्यागमा खोज्नुहोस्..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="हटाउनुहोस्"
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-slate-200 text-slate-600 transition hover:bg-slate-300"
            >
              <X size={13} />
            </button>
          )}
          {loading && (
            <Loader2 size={16} className="absolute right-10 top-1/2 -translate-y-1/2 animate-spin text-blue-600" />
          )}
        </div>

        {/* श्रेणी बटन — साथमा वास्तविक गणना */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => pickCat("")}
            className={`rounded-full px-3.5 py-2 text-xs font-black transition ${
              activeCat === ""
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            सबै श्रेणी
            <span className={`ml-1.5 tabular-nums ${activeCat === "" ? "text-white/70" : "text-slate-400"}`}>
              {nf(data?.allCount ?? 0)}
            </span>
          </button>

          {cats.map((c) => (
            <button
              key={c.name}
              onClick={() => pickCat(c.name)}
              className={`rounded-full px-3.5 py-2 text-xs font-black transition ${
                activeCat === c.name
                  ? "bg-blue-600 text-white shadow"
                  : "bg-blue-50 text-brand-700 hover:bg-blue-100"
              }`}
            >
              {c.name}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  activeCat === c.name ? "bg-white/25" : "bg-white"
                }`}
              >
                {nf(c.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- तालिका ---------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 text-[11px] font-bold text-slate-500">
          <span>यो पृष्ठ: <b className="text-slate-700">{data?.from || 0}–{data?.to || 0}</b></span>
          <span>कुल: <b className="text-slate-700">{nf(total)}</b></span>
          <span className="hidden sm:inline">पृष्ठ: <b className="text-slate-700">{cur}/{pages}</b></span>
          <span className="ml-auto hidden gap-3 md:flex">
            <span className="text-emerald-600">प्रकाशित {stats.pub}</span>
            <span className="text-amber-600">ड्राफ्ट {stats.draft}</span>
            <span className="text-blue-600">दृश्य {nf(stats.views)}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>#</Th><Th>फोटो</Th><Th>शीर्षक</Th><Th>श्रेणी</Th>
                <Th>लेखक</Th><Th>मिति</Th><Th>स्थिति</Th><Th>दृश्य</Th>
                <Th className="text-right">कार्य</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((n, i) => (
                <tr key={n.id} className="transition hover:bg-blue-50/40">
                  <Td className="text-xs font-black tabular-nums text-slate-300">{(cur - 1) * PER_PAGE + i + 1}</Td>
                  <Td>
                    {n.image ? (
                      <img src={absoluteUrl(n.image)} alt="" className="h-11 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="h-11 w-16 rounded-lg bg-slate-100" />
                    )}
                  </Td>
                  <Td><b className="line-clamp-2 max-w-sm text-slate-800">{n.title}</b></Td>
                  <Td>
                    <span className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                      {n.category}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-slate-500">{n.author}</Td>
                  <Td className="whitespace-nowrap text-slate-500">{n.date}</Td>
                  <Td>
                    {String(n.status || "published") === "draft" ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">ड्राफ्ट</span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">प्रकाशित</span>
                    )}
                  </Td>
                  <Td>
                    <span className="flex items-center gap-1 text-xs font-black tabular-nums text-slate-600">
                      <Eye size={12} className="text-slate-400" /> {nf(n.view_count)}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-2">
                      <Btn kind="soft" onClick={() => openEdit(n)}><Pencil size={15} /> सम्पादन</Btn>
                      <Btn kind="danger" onClick={() => remove(n)}><Trash2 size={15} /> मेट्ने</Btn>
                    </div>
                  </Td>
                </tr>
              ))}

              {!loading && !items.length && (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-slate-400">
                    {q || activeCat
                      ? "यो खोज/श्रेणीमा कुनै समाचार भेटिएन।"
                      : "कुनै समाचार छैन। “नयाँ समाचार” थप्नुहोस्।"}
                  </td>
                </tr>
              )}

              {loading && !items.length && (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-slate-400">
                    <Loader2 size={22} className="mx-auto animate-spin text-blue-600" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- पेजिनेसन ---------- */}
      {pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
          <button
            onClick={() => goPage(cur - 1)}
            disabled={cur <= 1}
            className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={17} />
          </button>

          {pageList(cur, pages).map((p, i) =>
            p === "..." ? (
              <span key={`g${i}`} className="px-1.5 text-sm font-black text-slate-400">…</span>
            ) : (
              <button
                key={p}
                onClick={() => goPage(p)}
                className={`h-9 min-w-[36px] flex-none rounded-lg px-2.5 text-sm font-black tabular-nums transition ${
                  p === cur
                    ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow"
                    : "border border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goPage(cur + 1)}
            disabled={cur >= pages}
            className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={17} />
          </button>

          <span className="ml-1 hidden text-xs font-bold text-slate-400 sm:inline">
            पृष्ठ {cur} / {pages} · जम्मा {nf(total)}
          </span>
        </div>
      )}

      {modal !== undefined && (
        <NewsFormModal news={modal} onClose={() => setModal(undefined)} onSaved={() => load()} setMsg={setMsg} />
      )}
    </div>
  );
}
