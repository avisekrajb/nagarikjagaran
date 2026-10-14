import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Save } from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { absoluteUrl } from "../../../services/api";
import { nepaliDate } from "../../../utils/formatDate";
import { AD_POSITIONS } from "../../../components/Ads/AdSlot";
import { Btn, Th, Td, Modal, Input, ImagePicker } from "./AdminUI";

export default function AdminAds({ setMsg, startOpen = false }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => { try { setItems(await adminApi.listAds()); } catch (e) { setMsg(e.message); } };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (startOpen) openNew();
  }, []);

  const openEdit = (a) => setModal({ id: a.id, title: a.title, link: a.link, description: a.description || "", position: a.position, enabled: Number(a.enabled) === 1, expire_date: String(a.expire_date || "").slice(0, 10), image: a.image || "", file: null });
  const openNew = () => setModal({ id: null, title: "", link: "#", description: "", position: "sidebar", enabled: true, expire_date: "", image: "", file: null });

  const save = async (e) => {
    e.preventDefault();
    const m = modal;
    if (!m.id && !m.file && !m.image) {
      setMsg("फोटो वा GIF चयन गर्नुहोस् — छवि बिना विज्ञापन देखिँदैन");
      return;
    }
    const fd = new FormData();
    fd.append("title", m.title);
  fd.append("description", m.description || "");
    fd.append("link", m.link);
    fd.append("position", m.position);
    fd.append("enabled", m.enabled ? "1" : "0");
    fd.append("expire_date", m.expire_date || "");
    if (m.file) fd.append("image", m.file);
    else fd.append("imageUrl", m.image || "");
    setBusy(true);
    try {
      if (m.id) await adminApi.updateAd(m.id, fd);
      else await adminApi.createAd(fd);
      setModal(null);
      setMsg(m.id ? "विज्ञापन अपडेट भयो" : "विज्ञापन थपियो");
      load();
    } catch (err) { setMsg(err.message); }
    finally { setBusy(false); }
  };

  const remove = async (a) => {
    if (!window.confirm(`"${a.title}" मेट्ने हो?`)) return;
    try { await adminApi.deleteAd(a.id); setMsg("विज्ञापन मेटियो"); load(); } catch (err) { setMsg(err.message); }
  };

  const expired = (a) => {
    const d = String(a.expire_date || "");
    return !!d && new Date(d + "T23:59:59").getTime() < Date.now();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} वटा विज्ञापन</p>
        <Btn onClick={openNew}><Plus size={16}/> नयाँ विज्ञापन</Btn>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>फोटो</Th><Th>शीर्षक</Th><Th>स्थान</Th><Th>लिंक</Th><Th>म्याद</Th><Th>स्थिति</Th><Th>देखिएको</Th><Th>क्लिक</Th><Th className="text-right">कार्य</Th></tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/60">
                <Td>{a.image ? <img src={absoluteUrl(a.image)} alt="" className="h-11 w-16 rounded-lg object-cover"/> : <div className="grid h-11 w-16 place-items-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400">AD</div>}</Td>
                <Td><b>{a.title}</b></Td>
                <Td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{(AD_POSITIONS.find((p) => p.value === a.position) || {}).label || a.position}</span></Td>
                <Td className="max-w-[160px] truncate text-slate-500">{a.link}</Td>
                <Td className="whitespace-nowrap text-slate-500">{a.expire_date ? <span className={expired(a) ? "text-red-500" : ""}>{nepaliDate(a.expire_date)}</span> : <span className="text-slate-300">—</span>}</Td>
                <Td>{Number(a.enabled) === 1 && !expired(a) ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">प्रकाशित</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">निष्क्रिय/म्याद सकिएको</span>}</Td>
                <Td className="text-center font-bold text-slate-600">{a.view_count || 0}</Td>
                <Td className="text-center font-bold text-slate-600">{a.click_count || 0}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-2">
                    <Btn kind="soft" onClick={() => openEdit(a)}><Pencil size={15}/> सम्पादन</Btn>
                    <Btn kind="danger" onClick={() => remove(a)}><Trash2 size={15}/> मेट्ने</Btn>
                  </div>
                </Td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="9" className="px-4 py-10 text-center text-slate-400">कुनै विज्ञापन छैन।</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.id ? "विज्ञापन सम्पादन" : "नयाँ विज्ञापन"} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <Input label="विज्ञापन शीर्षक" required value={modal.title} onChange={(e) => setModal({ ...modal, title: e.target.value })}/>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="विज्ञापन लिंक" value={modal.link} onChange={(e) => setModal({ ...modal, link: e.target.value })}/>
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-slate-600">स्थान (पेज सहित)</span>
                <select value={modal.position} onChange={(e) => setModal({ ...modal, position: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  {AD_POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label} — {p.page}</option>)}
                </select>
              </label>
            </div>
            {/* विवरण */}
            <div>
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-slate-600">
                  विज्ञापनको विवरण (ऐच्छिक)
                </span>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="जस्तै : नयाँ पुस्तक प्रकाशन — २०% छूट, यस महिनामा मात्र।"
                  value={modal.description || ""}
                  onChange={(e) => setModal({ ...modal, description: e.target.value })}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
                />
              </label>
              <p className="mt-1 text-right text-[11px] font-bold text-slate-400">
                {String(modal.description || "").length}/500
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <span>
                <Input type="date" label="म्याद सकिने मिति (ऐच्छिक)" value={modal.expire_date} onChange={(e) => setModal({ ...modal, expire_date: e.target.value })}/>
                {modal.expire_date ? <p className="mt-1 text-[11px] font-bold text-emerald-600">{nepaliDate(modal.expire_date)}</p> : null}
              </span>
              <label className="flex items-end gap-2 pb-2.5 text-sm font-bold text-slate-600">
                <input type="checkbox" checked={modal.enabled} onChange={(e) => setModal({ ...modal, enabled: e.target.checked })} className="h-4 w-4 accent-blue-600"/>
                प्रकाशित (वेबसाइटमा देखाउने)
              </label>
            </div>
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-700">विज्ञापन वेबसाइटमा देखिनका लागि: प्रकाशित बाकस चेक गरिएको, म्याद सकिएको नभएको र माथि छानिएको स्थानसँग मिलेको हुनुपर्छ।</p>
            <ImagePicker file={modal.file} setFile={(f) => setModal((m) => (m ? { ...m, file: f } : m))} preview={modal.file ? modal.preview : modal.image} setPreview={(p) => setModal((m) => (m ? { ...m, preview: p } : m))} disabled={busy}/>
            <div className="flex justify-end gap-2 pt-1">
              <Btn kind="ghost" type="button" onClick={() => setModal(null)} disabled={busy}>रद्द गर्नुहोस्</Btn>
              <Btn type="submit" disabled={busy}>
                {busy ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                {busy ? "अपलोड हुँदै..." : "बचत गर्नुहोस्"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}