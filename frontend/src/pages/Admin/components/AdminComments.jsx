import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { nepaliDate } from "../../../utils/formatDate";
import { adminApi } from "../../../services/adminApi";
import { Btn, Th, Td } from "./AdminUI";

export default function AdminComments({ setMsg }) {
  const [items, setItems] = useState([]);
  const load = async () => { try { setItems(await adminApi.listComments()); } catch (e) { setMsg(e.message); } };
  useEffect(() => { load(); }, []);

  const remove = async (c) => {
    if (!window.confirm("यो टिप्पणी मेट्ने हो?")) return;
    try { await adminApi.deleteComment(c.id); setMsg("टिप्पणी मेटियो"); load(); } catch (err) { setMsg(err.message); }
  };

  const fmt = (d) => {
    try { return nepaliDate(d); }
    catch (e) { return d || ""; }
  };

  return (
    <div>
      <div className="mb-4"><p className="text-sm text-slate-500">{items.length} वटा टिप्पणी</p></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>समाचार</Th><Th>नाम</Th><Th>टिप्पणी</Th><Th>मिति</Th><Th className="text-right">कार्य</Th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60">
                <Td><Link to={`/article/${c.news_id}`} className="line-clamp-2 max-w-xs font-bold text-brand-700 hover:underline">{c.news_title || `#${c.news_id}`}</Link></Td>
                <Td><b className="text-slate-700">{c.name || "पाठक"}</b></Td>
                <Td className="line-clamp-2 max-w-xs text-slate-500">{c.comment}</Td>
                <Td className="whitespace-nowrap text-xs text-slate-400">{fmt(c.created_at)}</Td>
                <Td className="text-right"><Btn kind="danger" onClick={() => remove(c)}><Trash2 size={15}/> मेट्ने</Btn></Td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">कुनै टिप्पणी छैन।</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}