import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { KeyRound, CheckCircle2, XCircle, Clock, ShieldCheck, Loader2 } from "lucide-react";
import { publicApi } from "../services/adminApi";

/**
 * ============================================================
 *  /approve/:key — इमेलको लिंक थिच्दा यही खुल्छ।
 *  यहाँ **४ अङ्कको OTP** लेख्नुपर्छ।
 *  सही OTP ले मात्र खाता बदलिन्छ — अरू केही बटन छैन।
 * ============================================================
 */

const STATUS = {
  pending:    { label: "OTP बाँकी छ",  cls: "bg-amber-50 text-amber-700 border-amber-200",  Icon: Clock },
  approved:   { label: "सम्पन्न",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
  failed:     { label: "रद्द",          cls: "bg-rose-50 text-rose-700 border-rose-200",     Icon: XCircle },
  expired:    { label: "म्याद सकियो",  cls: "bg-slate-100 text-slate-600 border-slate-200",   Icon: Clock },
  cancelled:  { label: "रद्द",          cls: "bg-slate-100 text-slate-600 border-slate-200",   Icon: XCircle },
  superseded: { label: "नयाँले प्रतिस्थापन", cls: "bg-slate-100 text-slate-600 border-slate-200", Icon: Clock },
};

const when = (d) => {
  if (!d) return "—";
  const x = new Date(d);
  return isNaN(x.getTime()) ? "—" : x.toLocaleString("ne-NP");
};

export default function ApproveChange() {
  const { key } = useParams();
  const [req, setReq] = useState(undefined);
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    publicApi.changeRequest(key)
      .then(setReq)
      .catch((e) => setReq({ __error: e.message }));
  }, [key]);

  const type = (i, v) => {
    v = v.replace(/\D/g, "").slice(-1);
    setErr("");
    setDigits((d) => {
      const n = [...d];
      n[i] = v;
      return n;
    });
    if (v && i < 3) {
      const box = document.getElementById(`otp-${i + 1}`);
      if (box) box.focus();
    }
  };

  const onKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const prev = document.getElementById(`otp-${i - 1}`);
      if (prev) prev.focus();
    }
  };

  const submit = async (e) => {
    e?.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 4) return setErr("चारै अङ्क भरिसक्नुहोस्।");

    setBusy(true);
    setErr("");
    try {
      const r = await publicApi.verifyOtp(key, otp);
      setOk(r.message);
      setReq(r.request || { ...req, status: "approved" });
    } catch (ex) {
      setErr(ex.message || "OTP जाँच गर्न सकिएन");
      // असफल भए सर्भरले पठाएको अवस्था पान्छ
      if (ex.data && ex.data.request) setReq(ex.data.request);
      setDigits(["", "", "", ""]);
      const first = document.getElementById("otp-0");
      if (first) first.focus();
    } finally {
      setBusy(false);
    }
  };

  if (req === undefined) {
    return (
      <Shell>
        <Loader2 size={30} className="mx-auto animate-spin text-slate-300" />
        <p className="mt-4 text-center text-sm font-bold text-slate-400">अनुरोध हेरिँदैछ…</p>
      </Shell>
    );
  }

  if (req.__error) {
    return (
      <Shell>
        <span className="mx-auto grid h-14 w-14 place-items-center bg-rose-50 text-rose-600">
          <XCircle size={26} />
        </span>
        <h1 className="mt-4 text-center text-lg font-black text-slate-800">यो अनुरोध भेटिएन</h1>
        <p className="mt-2 text-center text-sm font-bold text-slate-400">{req.__error}</p>
        <Home />
      </Shell>
    );
  }

  const st = STATUS[req.status] || STATUS.pending;
  const done = req.status !== "pending";

  return (
    <Shell>
      <div className="border-b border-slate-200 px-6 py-5 text-center">
        <span className={`mx-auto grid h-14 w-14 place-items-center ${done ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"}`}>
          <KeyRound size={26} />
        </span>
        <h1 className="mt-3 text-lg font-black text-slate-900">
          {done ? "प्रक्रिया समाप्त" : "OTP लेख्नुहोस्"}
        </h1>
        <p className="mt-1 text-xs font-bold text-slate-400">
          नागरिक समाचार · खाता परिवर्तन
        </p>
      </div>

      <div className="space-y-4 p-6">
        <span className={`inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-black ${st.cls}`}>
          <st.Icon size={13} /> {st.label}
        </span>

        <dl className="divide-y divide-slate-100 border border-slate-200">
          {[
            ["खाता", req.admin_name || "—"],
            ["इमेल", req.admin_email],
            ["परिवर्तन", req.summary],
            ["मिति", when(req.created_at)],
            req.otp_expires_at && ["OTP म्याद", when(req.otp_expires_at)],
          ].filter(Boolean).map(([k, v]) => (
            <div key={k} className="flex gap-3 px-4 py-2.5">
              <dt className="w-28 flex-none text-xs font-black uppercase tracking-wide text-slate-400">{k}</dt>
              <dd className="min-w-0 break-words text-sm font-bold text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <p className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            <CheckCircle2 size={17} className="flex-none" /> {ok}
          </p>
        )}

        {!done ? (
          <>
            <form onSubmit={submit} className="space-y-3 pt-1">
              <p className="text-center text-xs font-bold text-slate-500">
                इमेलमा पठाइएको <b className="text-slate-800">४ अङ्कको OTP</b> यहाँ लेख्नुहोस्
              </p>
              <div className="flex justify-center gap-2">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    value={d}
                    onChange={(e) => type(i, e.target.value)}
                    onKeyDown={(e) => onKey(i, e)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    className="h-14 w-14 border-2 border-slate-300 bg-white text-center text-2xl font-black text-slate-900 outline-none transition focus:border-slate-900"
                  />
                ))}
              </div>

              {err && (
                <p className="border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-700">
                  {err}
                </p>
              )}

              {typeof req.otp_tries === "number" && req.otp_tries > 0 && (
                <p className="text-center text-[11px] font-bold text-amber-600">
                  {req.otp_tries} पटक गलत भइसकेको — बाँकी {req.otp_max_tries - req.otp_tries} पटक
                </p>
              )}

              <button
                type="submit"
                disabled={busy || digits.join("").length !== 4}
                className="w-full bg-slate-900 py-3 text-sm font-black text-white transition hover:bg-slate-700 disabled:opacity-40"
              >
                {busy ? "जाँच हुँदैछ…" : "OTP जाँच्नुहोस्"}
              </button>
            </form>

            <p className="border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-[11px] font-bold leading-relaxed text-slate-500">
              OTP नमिले वा {req.otp_max_tries} पटक गलत भए यो अनुरोध आफैँ रद्द हुन्छ।
              कुनै पनि परिवर्तन तब हुन्छ, जब सही OTP लेखिन्छ।
            </p>
          </>
        ) : (
          <p className="border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-bold text-slate-500">
            {req.status === "approved"
              ? "यो परिवर्तन लागू भइसकेको छ।"
              : "यो अनुरोध लागू भएको छैन। खाता यथावत् छ।"}
          </p>
        )}

        <Home />
      </div>
    </Shell>
  );
}

const Shell = ({ children }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <div className="w-full max-w-md border border-slate-200 bg-white shadow-xl">
      {children}
    </div>
  </div>
);

const Home = () => (
  <Link
    to="/"
    className="flex items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-xs font-bold text-slate-400 transition hover:text-brand-700"
  >
    <ShieldCheck size={12} /> वेबसाइटमा जानुहोस्
  </Link>
);
