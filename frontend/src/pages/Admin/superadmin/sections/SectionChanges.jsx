import React, { useEffect, useState } from "react";
import { Panel, Btn, Alert, Loading, superApi } from "./ui";

/**
 * परिवर्तन अनुरोध — मालिकको अनुमति कतिखाने आयो हेर्ने।
 * अनुमति/अस्वीकार वेबसाइटको /approve/:key पेजबाट हुन्छ (इमेलको लिंक)।
 */
const ST = {
  pending:    { l: "पर्खाइमा",  c: "bg-amber-50 text-amber-700" },
  approved:   { l: "अनुमति भयो", c: "bg-emerald-50 text-emerald-700" },
  rejected:   { l: "अस्वीकार",  c: "bg-rose-50 text-rose-700" },
  expired:    { l: "म्याद सकियो", c: "bg-slate-100 text-slate-600" },
  cancelled:  { l: "रद्द",      c: "bg-slate-100 text-slate-600" },
  superseded: { l: "नयाँले प्रतिस्थापन", c: "bg-slate-100 text-slate-600" },
};

const when = (d) => {
  if (!d) return "—";
  const x = new Date(d);
  return isNaN(x.getTime()) ? "—" : x.toLocaleString("ne-NP");
};

const SectionChanges = () => {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState(null);

  const load = async (status = "") => {
    try { setRows(await superApi.listChanges(status)); }
    catch (e) { setMsg({ kind: "err", text: e.message }); }
  };
  useEffect(() => { load(filter); /* eslint-disable-next-line */ }, [filter]);

  const cancel = async (r) => {
    try { await superApi.cancelChange(r.id); setMsg({ kind: "ok", text: "अनुरोध रद्द भयो।" }); load(filter); }
    catch (e) { setMsg({ kind: "err", text: e.message }); }
  };

  if (!rows) return <Loading />;
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      <Panel
        title="परिवर्तन अनुरोध"
        desc="कुनै पनि खाता/पासवर्ड परिवर्तन यहाँ आउँछ। मालिकले इमेलको लिंक थिचेर निर्णय गर्नुहुन्छ।"
        right={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-slate-900"
          >
            <option value="">सबै</option>
            <option value="pending">पर्खाइमा</option>
            <option value="approved">अनुमति भयो</option>
            <option value="rejected">अस्वीकार</option>
            <option value="expired">म्याद सकियो</option>
          </select>
        }
      >
        {pending > 0 && (
          <div className="mb-4 border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
            ⏳ {pending} अटा अनुरोध पर्खाइमा छ। मालिकले इमेल हेरेर निर्णय गर्नुपर्छ —
            अहिलेसम्म केही पनि बदलिएको छैन।
          </div>
        )}

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm font-bold text-slate-400">कुनै अनुरोध छैन।</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => {
              const s = ST[r.status] || ST.pending;
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 border border-slate-200 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-800">
                      {r.type_label}
                      <span className={`px-2 py-0.5 text-[11px] font-black ${s.c}`}>{s.l}</span>
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{r.summary}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">
                      {r.admin_name} ({r.admin_email}) · {when(r.created_at)}
                      {r.expires_at && r.status === "pending" && ` · म्याद ${when(r.expires_at)}`}
                    </p>
                  </div>
                  {r.status === "pending" && (
                    <Btn kind="soft" onClick={() => cancel(r)}>रद्द गर्नुहोस्</Btn>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default SectionChanges;
