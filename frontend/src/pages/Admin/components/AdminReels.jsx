import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, Film } from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { absoluteUrl } from "../../../services/api";
import { Btn, Th, Td, Modal, Input, ImagePicker } from "./AdminUI";

export default function AdminReels({ setMsg, startOpen = false }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => { try { setItems(await adminApi.listReels()); } catch (e) { setMsg(e.message); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (startOpen) openNew(); }, []);

  const openEdit = (r) => setModal({ id: r.id, title: r.title, video_url: r.video_url, thumbnail: r.thumbnail || "", file: null });
  const openNew = () => setModal({ id: null, title: "", video_url: "", thumbnail: "", file: null });

  const save = async (e) => {
    e.preventDefault();
    const m = modal;
    const fd = new FormData();
    fd.append("category", "reel");
    fd.append("title", m.title);
    fd.append("video_url", m.video_url);
    if (m.file) fd.append("image", m.file);
    else fd.append("thumbnail", m.thumbnail || "");
    try {
      if (m.id) await adminApi.updateReel(m.id, fd);
      else await adminApi.createReel(fd);
      setModal(null);
      setMsg(m.id ? "रील अपडेट भयो" : "रील थपियो");
      load();
    } catch (err) { setMsg(err.message); }
  };

  const remove = async (r) => {
    if (!window.confirm(`"${r.title}" मेट्ने हो?`)) return;
    try { await adminApi.deleteReel(r.id); setMsg("रील मेटियो"); load(); } catch (err) { setMsg(err.message); }
  };

  const embed = (u) => (String(u).match(/(youtube\.com|youtu\.be)/i) ? "युट्युब" : /facebook|fb\.watch|fb\.com/i.test(String(u)) ? "फेसबुक" : "लिंक");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} वटा रील</p>
        <Btn onClick={openNew}><Plus size={16}/> नयाँ रील</Btn>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>थम्बनेल</Th><Th>शीर्षक</Th><Th>भिडियो लिंक</Th><Th className="text-right">कार्य</Th></tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <Td>{r.thumbnail ? <img src={absoluteUrl(r.thumbnail)} alt="" className="h-14 w-10 rounded-lg object-cover"/> : <div className="grid h-14 w-10 place-items-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400">REEL</div>}</Td>
                <Td><b className="line-clamp-2 max-w-sm text-slate-800">{r.title}</b></Td>
                <Td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{embed(r.video_url)}</span><span className="block max-w-[220px] truncate text-xs text-slate-400">{r.video_url}</span></Td>
                <Td className="text-right">
                  <div className="inline-flex gap-2">
                    <Btn kind="soft" onClick={() => openEdit(r)}><Pencil size={15}/> सम्पादन</Btn>
                    <Btn kind="danger" onClick={() => remove(r)}><Trash2 size={15}/> मेट्ने</Btn>
                  </div>
                </Td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="4" className="px-4 py-10 text-center text-slate-400">कुनै रील छैन। "नयाँ रील" थप्नुहोस्।</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.id ? "रील सम्पादन" : "नयाँ रील"} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <Input label="रील शीर्षक" required placeholder="जस्तै: संसद बैठकको मुख्य बिन्दुहरू" value={modal.title} onChange={(e) => setModal({ ...modal, title: e.target.value })}/>
            <Input label="भिडियो लिंक (फेसबुक वा युट्युब)" required placeholder="https://www.facebook.com/... वा https://www.youtube.com/watch?v=..." value={modal.video_url} onChange={(e) => setModal({ ...modal, video_url: e.target.value })}/>
            <ImagePicker file={modal.file} setFile={(f) => setModal((m) => (m ? { ...m, file: f } : m))} preview={modal.file ? modal.preview : modal.thumbnail} setPreview={(p) => setModal((m) => (m ? { ...m, preview: p } : m))} hint={"रीलको थम्बनेल — फोटो वा GIF, अधिकतम ५० MB"}/>
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-700">फेसबुक रील/भिडियो वा युट्युब लिंक मात्र राख्नुहोस् — होमपेजमा रील बकसमा देखिनेछ।</p>
            <div className="flex justify-end gap-2 pt-1">
              <Btn kind="ghost" type="button" onClick={() => setModal(null)}>रद्द गर्नुहोस्</Btn>
              <Btn type="submit"><Save size={16}/> बचत गर्नुहोस्</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}