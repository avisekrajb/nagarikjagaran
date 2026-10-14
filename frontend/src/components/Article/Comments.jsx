import React, { useState, useEffect } from "react";
import { MessageCircle, Send, Sparkles, MessagesSquare } from "lucide-react";
import Swal from "sweetalert2";
import { getComments, addComment } from "../../services/newsService";
import { formatDate } from "../../utils/formatDate";

const devDigit = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[+d]);
const GRADS = ["from-blue-500 to-sky-300", "from-violet-500 to-fuchsia-300", "from-emerald-500 to-teal-300", "from-amber-400 to-orange-300", "from-rose-500 to-pink-300"];
const initials = (name) => (name || "पाठक").trim().slice(0, 1);

/* नोट : Intl("ne-NP") ब्राउजरलाई THAI Buddhist Era ("BE २५६९ अक्टोबर") देखाउँछ,
   विक्रम सम्वत् होइन। त्यसैले आफ्नै formatDate (adToBs) प्रयोग गरिएको छ। */
const fmt = (d) => {
  try {
    const diff = Date.now() - new Date(d).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "अहिले";
    if (min < 60) return `${devDigit(min)} मिनेट अघि`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${devDigit(hr)} घण्टा अघि`;
    return formatDate(d);
  } catch (e) { return ""; }
};

export default function Comments({ newsId }) {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => getComments(newsId).then(setList).catch(() => {});
  useEffect(() => { load(); }, [newsId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await addComment(newsId, { name, comment });
      setComment("");
      await load();
      Swal.fire({
        icon: "success",
        title: "धन्यवाद!",
        text: "तपाईंको टिप्पणी सफलतापूर्वक पठाइयो।",
        confirmButtonText: "ठीक छ",
        confirmButtonColor: "#2563eb",
        timer: 2600,
        timerProgressBar: true,
        customClass: { popup: "swal-modern" },
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "पठाउन सकिएन",
        text: err?.message || "टिप्पणी पठाउँदा समस्या आयो।",
        confirmButtonText: "ठीक छ",
        confirmButtonColor: "#dc2626",
        customClass: { popup: "swal-modern" },
      });
    } finally { setBusy(false); }
  };

  return (
    <section className="mt-14">
      <div className="comment-box overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {/* हेडर — हल्का रङ, आधुनिक */}
        <div className="comment-head flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-sky-50 to-white px-6 py-5 sm:px-8">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-sm">
            <MessagesSquare size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-black leading-tight text-slate-800 sm:text-2xl">टिप्पणीहरू</h2>
            <p className="mt-0.5 text-xs font-bold text-slate-400">
              {list.length ? `${devDigit(list.length)} वटा प्रतिक्रिया` : "पहिलो प्रतिक्रिया तपाईंकै हुन सक्छ"}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={submit}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-sm"><UserDot /></span>
              <div className="min-w-0 flex-1">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="तपाईंको नाम (ऐच्छिक)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
                <div className="comment-field mt-3 rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={3}
                    placeholder="यस समाचारबारे तपाईंको प्रतिक्रिया लेख्नुहोस्..."
                    className="w-full resize-none rounded-t-2xl bg-transparent px-4 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-between gap-2 rounded-b-2xl px-3 pb-3">
                    <span className="hidden pl-1 text-[11px] font-bold text-slate-400 sm:block">
                      <Sparkles size={11} className="mr-1 inline text-blue-400" />नम्र र सभ्य टिप्पणी स्वागत छ
                    </span>
                    <button
                      type="submit"
                      disabled={busy || !comment.trim()}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-50"
                    >
                      <Send size={14} /> {busy ? "पठाउँदै..." : "पठाउनुहोस्"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-8">
            {!list.length && (
              <div className="comment-empty rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-8 text-center">
                <MessageCircle size={26} className="mx-auto text-slate-300" />
                <p className="mt-2 text-sm font-bold text-slate-400">अहिलेसम्म कुनै टिप्पणी छैन। पहिलो टिप्पणी लेख्नुहोस्।</p>
              </div>
            )}
            <div className="space-y-3">
              {list.map((c, i) => (
                <div
                  key={c.id}
                  className="comment-item flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/60"
                >
                  <span className={`grid h-10 w-10 flex-none select-none place-items-center rounded-2xl bg-gradient-to-br ${GRADS[i % GRADS.length]} text-sm font-black text-white shadow-sm`}>{initials(c.name)}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-sm font-black text-slate-700">{c.name || "पाठक"}</b>
                      <span className="comment-chip rounded-full">{fmt(c.created_at)}</span>
                    </div>
                    <p className="mt-1 text-[15px] font-medium leading-relaxed text-slate-600">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UserDot() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill="currentColor" stroke="none" />
      <path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  );
}
