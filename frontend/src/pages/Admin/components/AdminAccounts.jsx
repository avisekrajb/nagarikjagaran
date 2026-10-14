import React, { useEffect, useState } from "react";
import { nepaliDateTime } from "../../../utils/formatDate";
import {
  ShieldCheck, UserPlus, Pencil, Trash2, KeyRound, Power, RefreshCw,
  Users, AlertCircle, CheckCircle2
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { Btn, Modal, Input, Th, Td } from "./AdminUI";

const nf = (n) => Number(n || 0).toLocaleString("ne-NP");

const when = (ts) => {
  if (!ts) return "कहिल्यै";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return nepaliDateTime(d);
};

/* ---------- पासवर्ड मोडल ---------- */
function PasswordModal({ mode, admin, me, onClose, setMsg }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [needMaster, setNeedMaster] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const own = mode === "me";
  /* सुपर एडमिन आफ्नै पासवर्ड बदल्दा गुप्त (master) पासवर्ड पनि चाहिन्छ */
  const selfSuper = own && me?.role === "superadmin";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (newPassword.length < 6) return setErr("नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ");
    if (newPassword !== confirm) return setErr("दुवै पासवर्ड मिलेन");

    setBusy(true);
    try {
      if (own) {
        const r = await adminApi.changePassword(currentPassword, newPassword, masterPassword);
        setMsg(r.message || "अनुरोध पठियो");
      } else {
        const r = await adminApi.resetAdminPassword(admin.id, newPassword);
        setMsg(r.message || "अनुरोध पठियो");
      }
      onClose();
    } catch (ex) {
      /* सुपर एडमिनलाई गुप्त पासवर्ड खोज्नुपर्छ */
      if (ex.data && ex.data.needMaster) setNeedMaster(true);
      setErr(ex.message || "पासवर्ड बदल्न सकिएन");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={own ? "मेरो पासवर्ड बदल्नुहोस्" : `${admin.name} को पासवर्ड बदल्नुहोस्`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {own ? (
          <Input
            label="पुरानो पासवर्ड"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••"
          />
        ) : (
          <p className="rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-bold text-brand-700">
            <AlertCircle size={13} className="mr-1 inline" />
            {admin.email} को पासवर्ड नयाँ पासवर्डले प्रतिस्थापन हुनेछ।
          </p>
        )}
        <Input
          label="नयाँ पासवर्ड"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="कम्तीमा ६ अक्षर"
        />
        <Input
          label="नयाँ पासवर्ड पुनः लेख्नुहोस्"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••"
        />
        {err && (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600">{err}</p>
        )}

        {selfSuper && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] font-bold leading-relaxed text-amber-800">
            🔒 सुपर एडमिनको आफ्नै पासवर्ड बद्दा **गुप्त पासवर्ड (master password)**
            पनि चाहिन्छ। त्यसपछि मालिकको इमेलमा पठिएको ४ अङ्कको OTP ले मात्र
            बदलिन्छ।
          </p>
        )}

        {selfSuper && needMaster && (
          <Input
            label="गुप्त (master) पासवर्ड"
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="••••••"
            autoFocus
          />
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Btn kind="ghost" type="button" onClick={onClose}>रद्द</Btn>
          <Btn type="submit" disabled={busy}>
            <KeyRound size={15} /> {busy ? "पठाउँदै..." : "अनुरोध पठाउनुहोस्"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- नयाँ / सम्पादन मोडल ---------- */
function AdminModal({ edit, onClose, setMsg }) {
  const [form, setForm] = useState({
    name: edit?.name || "",
    email: edit?.email || "",
    password: "",
    is_active: edit ? (edit.is_active ? 1 : 0) : 1
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim()) return setErr("नाम लेख्नुहोस्");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setErr("सही इमेल ठेगाना लेख्नुहोस्");
    }
    if (!edit && form.password.length < 6) {
      return setErr("पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ");
    }

    setBusy(true);
    try {
      if (edit) {
        await adminApi.updateAdmin(edit.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          is_active: form.is_active
        });
        setMsg("एडमिन खाता अद्यावधिक भयो");
      } else {
        await adminApi.createAdmin({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        });
        setMsg("नयाँ एडमिन खाता बन्यो");
      }
      onClose();
    } catch (ex) {
      setErr(ex.message || "बच्न सकिएन");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={edit ? "एडमिन सम्पादन" : "नयाँ एडमिन खाता"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="पूरा नाम"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="जस्तै: कृष्णप्रसाद मरासिनी"
        />
        <Input
          label="इमेल"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="name@nagariknews.com"
        />
        {!edit && (
          <Input
            label="पासवर्ड"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="कम्तीमा ६ अक्षर"
          />
        )}
        {edit && (
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span>
              <b className="block text-sm font-black text-slate-700">स्थिति</b>
              <small className="text-xs font-bold text-slate-400">
                निष्क्रिय भए ड्यासबोर्ड हेर्न मात्र मिल्छ
              </small>
            </span>
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
              className="h-5 w-5"
            />
          </label>
        )}
        {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Btn kind="ghost" type="button" onClick={onClose}>रद्द</Btn>
          <Btn type="submit" disabled={busy}>
            {busy ? "बच्दै..." : edit ? "अद्यावधिक गर्नुहोस्" : "खाता बनाउनुहोस्"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- मुख्य ---------- */
export default function AdminAccounts({ setMsg, me }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [creating, setCreating] = useState(false);
  const [pwFor, setPwFor] = useState(null);
  const [changePw, setChangePw] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminApi.listAdmins();
      /* सुपर एडमिनले सबै देख्छन्। regular एडमिनलाई सुपर एडमिन
         यहाँ देखिन्दैन (backend ले पहिले नै हटाइसक्छ — यो दोस्रो सुरक्षा) */
      const iAmSuper = me?.role === "superadmin";
      setRows(iAmSuper ? list : list.filter((a) => a.role !== "superadmin"));
    } catch (e) {
      setMsg(e.message || "एडमिन सूची लोड हुन सकेन");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggle = async (a) => {
    try {
      const r = await adminApi.updateAdmin(a.id, { is_active: a.is_active ? 0 : 1 });
      setMsg(r.message || `${a.name} को अनुरोध पठियो`);
      load();
    } catch (e) {
      setMsg(e.message || "बदल्न सकिएन");
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`"${a.name}" लाई मेट्ने अनुरोध पठाउने?\n(मालिकले अनुमति दिएपछि मात्र मेटिनेछ)`)) return;
    try {
      const r = await adminApi.deleteAdmin(a.id);
      setMsg(r.message || "मेट्ने अनुरोध पठियो");
      load();
    } catch (e) {
      setMsg(e.message || "मेट्न सकिएन");
    }
  };

  const activeCount = rows.filter((r) => r.is_active).length;
  const iAmSuper = me?.role === "superadmin";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
            <ShieldCheck size={20} className="text-blue-600" />
            {iAmSuper ? "सबै खाता" : "एडमिन खाता व्यवस्थापन"}
          </h2>
          <p className="mt-0.5 text-xs font-bold text-slate-500">
            {iAmSuper
              ? "सुपर एडमिन र साधारण एडमिन — दुवै खाता यहाँ देखिन्छन्"
              : "साधारण एडमिनहरू मात्र। सुपर एडमिनको खाता यहाँ देखिँदैन।"}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn kind="soft" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> रिफ्रेस
          </Btn>
          <Btn onClick={() => setCreating(true)}><UserPlus size={15} /> नयाँ एडमिन</Btn>
        </div>
      </div>

      {!iAmSuper && (
        <div className="flex items-start gap-2 border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-800">
          <ShieldCheck size={14} className="mt-0.5 flex-none" />
          <span>
            तपाईं साधारण एडमिन हुनुहुन्छ। सुपर एडमिनको खाता यहाँ नदेखिने र
            नबदल्ने गरी बन्द गरिएको छ। सबै परिवर्तन मालिकको अनुमति बाटा मात्र हुन्छ।
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "कुल एडमिन", v: rows.length, tone: "text-blue-600", bg: "bg-blue-50" },
          { l: "सक्रिय", v: activeCount, tone: "text-emerald-600", bg: "bg-emerald-50" },
          { l: "निष्क्रिय", v: rows.length - activeCount, tone: "text-slate-500", bg: "bg-slate-100" },
          { l: "पहिलो एडमिन", v: rows.find((r) => r.id === 1) ? "✓" : "—", tone: "text-violet-600", bg: "bg-violet-50" }
        ].map((x) => (
          <div key={x.l} className={`rounded-2xl ${x.bg} p-4`}>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{x.l}</p>
            <p className={`mt-1 text-2xl font-black leading-none ${x.tone}`}>{nf(x.v)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
            <Users size={16} className="text-blue-600" /> सबै एडमिन
          </h3>
          <Btn kind="soft" onClick={() => setChangePw(true)}>
            <KeyRound size={15} /> मेरो पासवर्ड बदल्नुहोस्
          </Btn>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50">
              <tr>
                <Th>#</Th>
                <Th>नाम</Th>
                <Th>इमेल</Th>
                <Th>स्थिति</Th>
                <Th>अन्तिम लगइन</Th>
                <Th className="text-right">कार्य</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm font-bold text-slate-400">
                  {loading ? "लोड हुँदैछ..." : "कुनै एडमिन भेटिएन"}
                </td></tr>
              )}
              {rows.map((a) => (
                <tr key={a.id} className="transition hover:bg-blue-50/40">
                  <Td>
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-xs font-black text-blue-600">
                      {a.id}
                    </span>
                  </Td>
                  <Td>
                    <b className="text-sm font-black text-slate-800">{a.name}</b>
                    {me && me.id === a.id && (
                      <span className="ml-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                        तपाईं
                      </span>
                    )}
                    {a.id === 1 && me && me.id !== a.id && (
                      <span className="ml-1.5 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black text-violet-700">
                        मुख्य
                      </span>
                    )}
                  </Td>
                  <Td><span className="text-xs font-bold text-slate-500">{a.email}</span></Td>
                  <Td>
                    {a.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">
                        <CheckCircle2 size={11} /> सक्रिय
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">
                        <AlertCircle size={11} /> निष्क्रिय
                      </span>
                    )}
                  </Td>
                  <Td><span className="text-[11px] font-bold text-slate-400">{when(a.last_login)}</span></Td>
                  <Td>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button
                        title={a.is_active ? "निष्क्रिय पार्नुहोस्" : "सक्रिय पार्नुहोस्"}
                        onClick={() => toggle(a)}
                        className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                          a.is_active
                            ? "bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        title="पासवर्ड बदल्नुहोस्"
                        onClick={() => setPwFor(a)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-600 transition hover:bg-violet-100"
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        title="सम्पादन"
                        onClick={() => setEdit(a)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="मेट्नुहोस्"
                        onClick={() => remove(a)}
                        disabled={me && me.id === a.id}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {creating && <AdminModal onClose={() => setCreating(false)} setMsg={setMsg} />}
      {edit && <AdminModal edit={edit} onClose={() => setEdit(null)} setMsg={setMsg} />}
      {pwFor && <PasswordModal mode="other" admin={pwFor} onClose={() => setPwFor(null)} setMsg={setMsg} />}
      {changePw && <PasswordModal mode="me" me={me} onClose={() => setChangePw(false)} setMsg={setMsg} />}
    </div>
  );
}
