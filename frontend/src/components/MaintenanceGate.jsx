import React, { useEffect, useState } from "react";
import { publicApi } from "../services/adminApi";

/**
 * मर्मत मोड — सुपर एडमिनले साइट बन्द गरे यो पूरा पेज देखिन्छ।
 * एडमिन/लगइन पेज खुला रहन्छन्।
 */
const MaintenanceGate = ({ children }) => {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    let alive = true;
    publicApi.config().then((c) => alive && setCfg(c)).catch(() => alive && setCfg({}));
    const id = setInterval(
      () => publicApi.config().then((c) => alive && setCfg(c)).catch(() => {}),
      60000
    );
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (!cfg) return children;                     // अझै थिएको छैन → साइट देखाउने
  if (!cfg.maintenance_on) return children;

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-16 text-center">
      <div className="mx-auto max-w-lg bg-white p-8 shadow-xl">
        <span className="mx-auto grid h-14 w-14 place-items-center bg-amber-100 text-2xl">🔧</span>
        <h1 className="mt-5 text-xl font-black text-slate-900">साइट मर्मतमा छ</h1>
        <p className="mt-3 whitespace-pre-line text-sm font-bold leading-relaxed text-slate-600">
          {cfg.maintenance_msg || "साइट मर्मतमा छ। केही बेरमा फर्कन्छ।"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-slate-900 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-700"
        >
          पुनः प्रयास गर्नुहोस्
        </button>
      </div>
    </div>
  );
};

export default MaintenanceGate;
