import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { NewsProvider } from "./context/NewsContext";
import { CategoryProvider } from "./context/CategoryContext";
import { UIProvider } from "./context/UIContext";
import { SiteProvider } from "./context/SiteContext";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AdSlot from "./components/Ads/AdSlot";
import SplashAd from "./components/Ads/SplashAd";
import BackToTop from "./components/Common/BackToTop";
import ScrollToTop from "./components/Common/ScrollToTop";
import TrackArticleClicks from "./components/Common/TrackArticleClicks";
import { WatermarkProvider } from "./components/Common/Watermark";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import MaintenanceGate from "./components/MaintenanceGate";
import { SplashProvider, useSplash } from "./context/SplashContext";
import ScoreboardFloat from "./components/ScoreboardFloat";
import AppRoutes from "./routes/AppRoutes";
import { trackVisit } from "./services/newsService";

function AppShell() {
  const { pathname } = useLocation();
  /* एडमिन *र* सुपरएडमिन दुवैमा साइटको हेडर/मिनिन्युबार/फुटर हराउने */
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/superadmin");
  const isHome = pathname === "/";
  const noPageAd =
    pathname === "/ourteam" || pathname === "/contact" || pathname === "/patro" ||
    pathname.startsWith("/author/");

  // हरेक पृष्ठमा भिजिटर गनना (सर्भरले दिनमा एकपटक मात्र गन्छ)
  useEffect(() => {
    if (!isAdmin) trackVisit(pathname);
  }, [pathname, isAdmin]);

  return (
    <UIProvider>
      <SiteConfigProvider>
      <NewsProvider>
        <CategoryProvider>
          <SiteProvider>
            <WatermarkProvider>
              {/* सुपर एडमिनले मर्मत मोड बाले साइट यसमै बन्द हुन्छ।
                  एडमिन/सुपरएडमिन पेज भने जहाँ छन् त्यहि खुला रहन्छन्। */}
                {isAdmin ? (
                  <AppRoutes />
                ) : (
                  <SplashProvider>
                    <SplashAd />
                    <AppContent />
                  </SplashProvider>
                )}
            </WatermarkProvider>
          </SiteProvider>
        </CategoryProvider>
      </NewsProvider>
    </SiteConfigProvider>
  </UIProvider>
  );
}

function AppContent() {
  const { dismissed } = useSplash();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/superadmin");
  const isHome = pathname === "/";
  const noPageAd = pathname === "/ourteam" || pathname === "/contact" || pathname === "/patro" || pathname.startsWith("/author/");

  if (!dismissed) return null;

  return (
    <MaintenanceGate>
      <ScrollToTop />
      <TrackArticleClicks />
      <ScoreboardFloat />
      <Header />
      {!isHome && !noPageAd && (
        <div className="container-shell pt-4">
          <AdSlot position="page-top" />
        </div>
      )}
      <AppRoutes />
      {!isHome && !noPageAd && (
        <>
          <div className="container-shell py-8">
            <AdSlot position="page-end" />
          </div>
          <Footer />
          <BackToTop />
        </>
      )}
      {isHome && (
        <>
          <Footer />
          <BackToTop />
        </>
      )}
    </MaintenanceGate>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
