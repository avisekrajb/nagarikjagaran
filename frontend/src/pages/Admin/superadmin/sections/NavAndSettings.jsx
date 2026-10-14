import React, { useEffect, useState } from "react";
import { Panel, Btn, Field, inputCls, Alert, Loading, Toggle, superApi } from "./ui";

/* =====================================================================
   २. मर्मत मोड — साइट बन्द गरी सन्देश देखाउने
   ===================================================================== */
const SectionMaintenance = () => {
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setForm(await superApi.getSettings());
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (patchData) => {
    setBusy(true);
    setMsg(null);
    try {
      setForm(await superApi.saveSettings(patchData));
      setMsg({ kind: "ok", text: "मर्मत सेटिङ सुरक्षित भयो।" });
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (!form) return <Loading />;

  return (
    <div className="space-y-5">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      <Panel title="मर्मत मोड" desc="साइट बन्द गरे पनि एडमिन लगइन र यी पाना खुला रहन्छन्।">
        <div className="space-y-4">
          <Toggle
            on={!!form.maintenance_on}
            label="मर्मत मोड सक्रिय"
            hint="सक्रिय भए सार्वजनिक पेजमा तलको सन्देश देखिनेछ।"
            onChange={(v) => save({ maintenance_on: v })}
          />

          <Field label="सन्देश" hint="पाठकले यही सन्देश देख्नेछन्।">
            <textarea
              className={`${inputCls} min-h-[110px] resize-y`}
              value={form.maintenance_msg || ""}
              onChange={(e) => setForm((s) => ({ ...s, maintenance_msg: e.target.value }))}
              placeholder="जस्तै: साइट मर्मतमा छ, केही बेरमा फर्कन्छ।"
            />
          </Field>

          <Btn disabled={busy} onClick={() => save({ maintenance_msg: form.maintenance_msg })}>
            {busy ? "सुरक्षित हुँदै…" : "सन्देश सुरक्षित गर्नुहोस्"}
          </Btn>
        </div>
      </Panel>
    </div>
  );
};

/* =====================================================================
   ३. फिचर टगल — पात्रो, डार्क मोड, कपाइराइट
   ===================================================================== */
const SectionFeatures = () => {
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setForm(await superApi.getSettings()); } catch (e) { setMsg({ kind: "err", text: e.message }); }
  };
  useEffect(() => { load(); }, []);

  const save = async (patchData) => {
    setBusy(true); setMsg(null);
    try { setForm(await superApi.saveSettings(patchData)); setMsg({ kind: "ok", text: "सुरक्षित भयो।" }); }
    catch (e) { setMsg({ kind: "err", text: e.message }); }
    finally { setBusy(false); }
  };

  if (!form) return <Loading />;

  return (
    <div className="space-y-5">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      <Panel title="साइट फिचर" desc="पात्रो, डार्क मोड र फुटरको पाठ यहाटै बदल्नुहोस्।">
        <div className="space-y-3">
          <Toggle
            on={!!form.show_patro}
            label="हाम्रो पात्रो देखाउने"
            hint="बन्द गरे साइडबारमा हाम्रो पात्रो लुकाइन्छ।"
            onChange={(v) => save({ show_patro: v })}
          />
          <Toggle
            on={!!form.show_dark_mode}
            label="डार्क मोड बटन देखाउने"
            hint="हेडरमा आएको अँध्यारो/उज्यालो बटन।"
            onChange={(v) => save({ show_dark_mode: v })}
          />

          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <Field label="कपाइराइट">
              <input
                className={inputCls}
                value={form.copyright || ""}
                onChange={(e) => setForm((s) => ({ ...s, copyright: e.target.value }))}
              />
            </Field>
            <Field label="पावर बाय">
              <input
                className={inputCls}
                value={form.powered_by || ""}
                onChange={(e) => setForm((s) => ({ ...s, powered_by: e.target.value }))}
              />
            </Field>
          </div>
          <Btn disabled={busy} onClick={() => save({ copyright: form.copyright, powered_by: form.powered_by })}>
            फुटर सुरक्षित गर्नुहोस्
          </Btn>
        </div>
      </Panel>
    </div>
  );
};

export { SectionMaintenance, SectionFeatures };
