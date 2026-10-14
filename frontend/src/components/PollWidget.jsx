import React, { useEffect, useState } from "react";
import { publicApi } from "../services/adminApi";

/** एउटा browser लाई पहिचान गर्ने स्थायी key — मतदान एकपटक मात्र हुनका लागि */
const voterKey = () => {
  let k = localStorage.getItem("nagarik_voter");
  if (!k) {
    k = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("nagarik_voter", k);
  }
  return k;
};

/**
 * पोल — साइडबारमा देखिनेछ। सुपर एडमिनले बनाएको हो,
 * पाठकले एकपटक मात्र मतदान गर्न पाउँछन्।
 */
const PollWidget = ({ className = "" }) => {
  const [polls, setPolls] = useState([]);
  const [picked, setPicked] = useState({});      // {pollId: optionId}
  const [voted, setVoted] = useState({});        // {pollId: true}
  const [busy, setBusy] = useState({});
  const [err, setErr] = useState(null);

  const load = () =>
    publicApi.polls().then(setPolls).catch(() => setPolls([]));

  useEffect(() => {
    load();
    // पहिले मतदान गरेका पोल छुटै पहिचान गर्ने
    const mine = localStorage.getItem("nagarik_voted_polls");
    if (mine) setVoted(JSON.parse(mine));
  }, []);

  const remember = (pollId) => {
    const next = { ...voted, [pollId]: true };
    setVoted(next);
    localStorage.setItem("nagarik_voted_polls", JSON.stringify(next));
  };

  const vote = async (poll, optionId) => {
    if (busy[poll.id]) return;
    setBusy((s) => ({ ...s, [poll.id]: true }));
    setErr(null);
    try {
      await publicApi.vote(poll.id, optionId, voterKey());
      setPicked((p) => ({ ...p, [poll.id]: optionId }));
      remember(poll.id);
      await load();
    } catch (e) {
      setErr(e.message);
      load();
    } finally {
      setBusy((s) => ({ ...s, [poll.id]: false }));
    }
  };

  if (!polls.length) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {polls.map((p) => {
        const done = !!voted[p.id];
        const myPick = picked[p.id];
        return (
          <div key={p.id} className="border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black leading-snug text-slate-900">{p.question}</h3>

            <div className="mt-3 space-y-2">
              {p.options.map((o) => {
                const mine = myPick === o.id;
                if (done) {
                  return (
                    <div key={o.id}>
                      <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                        <span className={mine ? "text-brand-700" : "text-slate-500"}>
                          {o.label}{mine ? "  ✓" : ""}
                        </span>
                        <span className="text-slate-400">{o.percent}%</span>
                      </div>
                      <div className="h-2 bg-slate-100">
                        <div
                          className={`h-2 transition-all ${mine ? "bg-brand-600" : "bg-slate-400"}`}
                          style={{ width: `${o.percent}%` }}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <button
                    key={o.id}
                    onClick={() => vote(p, o.id)}
                    disabled={busy[p.id]}
                    className="block w-full border border-slate-200 px-3 py-2 text-left text-xs font-bold text-slate-700 transition hover:border-brand-600 hover:bg-brand-50 disabled:opacity-50"
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[10px] font-bold text-slate-400">
              {done ? `कुल ${p.total_votes} मत · तपाईंले मतदान गर्नुभयो` : `कुल ${p.total_votes} मत · एकपटक मात्र`}
            </p>
          </div>
        );
      })}
      {err && <p className="text-[11px] font-bold text-rose-600">{err}</p>}
    </div>
  );
};

export default PollWidget;
