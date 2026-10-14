import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * SplashContext — tracks whether splash screen has been dismissed.
 * Splash screen is shown first; rest of app only renders after dismissed.
 * Dismissed when user clicks ✕ / clicks the ad, or automatically after 10s.
 */

const SplashContext = createContext({
  dismissed: false,
  dismiss: () => {},
});

export const SplashProvider = ({ children }) => {
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => setDismissed(true), []);

  /* १० सेकेन्डपछि आफैँ बन्द → साइट देखिन्छ */
  useEffect(() => {
    const t = setTimeout(() => setDismissed(true), 10000);
    return () => clearTimeout(t);
  }, []);

  return (
    <SplashContext.Provider value={{ dismissed, dismiss }}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplash = () => useContext(SplashContext);

export default SplashContext;