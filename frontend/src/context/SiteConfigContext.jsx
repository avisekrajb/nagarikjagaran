import React, { createContext, useContext, useEffect, useState } from "react";
import { publicApi } from "../services/adminApi";

/**
 * सुपर एडमिनका सार्वजनिक सेटिङ एउटै ठाउँमा।
 * पोल, स्कोरबोर्ड, मर्मत मोड, पात्रो/डार्क टगल — सबै यहीबाट।
 */
const Cfg = createContext({});

export const SiteConfigProvider = ({ children }) => {
  const [cfg, setCfg] = useState({});

  useEffect(() => {
    let alive = true;
    const pull = () =>
      publicApi.config().then((c) => alive && setCfg(c)).catch(() => {});

    pull();
    const id = setInterval(pull, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return <Cfg.Provider value={cfg}>{children}</Cfg.Provider>;
};

export const useSiteConfig = () => useContext(Cfg);

/** फिचर टगल — बन्द भए बाल children नै नदेखिने */
export const FeatureToggle = ({ flag, children }) => {
  const cfg = useSiteConfig();
  if (!cfg[flag]) return null;
  return children;
};

export default Cfg;
