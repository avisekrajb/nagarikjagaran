import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";

/* ------------------------------------------------------------------
   Code splitting : हरेक पेज छुट्टै chunk मा।
   पहिले सबै एकै file (≈६९२ KB) मा थियो — अहिले सुरुमा मुख्य
   shell + Home मात्र आउँछ, बाँकी आवश्यक पर्दा मात्र download हुन्छ।
   ------------------------------------------------------------------ */

const Loading = () => (
  <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
    <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      लोड हुँदैछ…
    </div>
  </div>
);

const SearchResults  = lazy(() => import("../pages/Search/SearchResults"));
const AdminLogin     = lazy(() => import("../pages/Admin/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("../pages/Admin/superadmin/SuperAdminDashboard"));
const SuperAdminLogin = lazy(() => import("../pages/Admin/SuperAdminLogin"));
const SuperSuperLogin = lazy(() => import("../pages/Admin/SuperSuperLogin"));
const SuperSuperAdminDashboard = lazy(() => import("../pages/Admin/superadmin/SuperSuperAdminDashboard"));
const ApproveChange = lazy(() => import("../pages/ApproveChange"));
const ForgotPassword = lazy(() => import("../pages/Admin/ForgotPassword"));
const Patro          = lazy(() => import("../pages/Patro/Patro"));
const UnicodeConverter = lazy(() => import("../pages/UnicodeConverter/UnicodeConverter"));
const ContactPage    = lazy(() => import("../pages/Contact/ContactPage"));
const OurTeamPage    = lazy(() => import("../pages/Team/OurTeamPage"));
const AuthorPage     = lazy(() => import("../pages/Author/AuthorPage"));
const VideosPage     = lazy(() => import("../pages/Videos/VideosPage"));

const News               = lazy(() => import("../pages/News/News"));
const NewsDetail         = lazy(() => import("../pages/News/NewsDetail"));
const World              = lazy(() => import("../pages/World/World"));
const WorldDetail        = lazy(() => import("../pages/World/WorldDetail"));
const LocalLevel         = lazy(() => import("../pages/LocalLevel/LocalLevel"));
const LocalLevelDetail   = lazy(() => import("../pages/LocalLevel/LocalLevelDetail"));
const Art                = lazy(() => import("../pages/Art/Art"));
const ArtDetail          = lazy(() => import("../pages/Art/ArtDetail"));
const Politics           = lazy(() => import("../pages/Politics/Politics"));
const PoliticsDetail     = lazy(() => import("../pages/Politics/PoliticsDetail"));
const Opinion            = lazy(() => import("../pages/Opinion/Opinion"));
const OpinionDetail      = lazy(() => import("../pages/Opinion/OpinionDetail"));
const Sports             = lazy(() => import("../pages/Sports/Sports"));
const SportsDetail       = lazy(() => import("../pages/Sports/SportsDetail"));
const Miscellaneous     = lazy(() => import("../pages/Miscellaneous/Miscellaneous"));
const MiscellaneousDetail = lazy(() => import("../pages/Miscellaneous/MiscellaneousDetail"));

/* श्रेणी पृष्ठ : [path, सूची, विवरण] */
const rows = [
  ["/news", News, NewsDetail],
  ["/world", World, WorldDetail],
  ["/local-level", LocalLevel, LocalLevelDetail],
  ["/art", Art, ArtDetail],
  ["/politics", Politics, PoliticsDetail],
  ["/opinion", Opinion, OpinionDetail],
  ["/sports", Sports, SportsDetail],
  ["/miscellaneous", Miscellaneous, MiscellaneousDetail]
];

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/patro" element={<Patro />} />
        <Route path="/unicodeconverter" element={<UnicodeConverter />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/ourteam" element={<OurTeamPage />} />
        <Route path="/author/:author" element={<AuthorPage />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        {/* इमेलको लिंक → ४ अङ्कको OTP लेख्ने पेज (सार्वजनिक) */}
      <Route path="/approve/:key" element={<ApproveChange />} />
        {/* बिर्सनुभएको पासवर्ड — OTP बाट */}
      <Route path="/admin/forgot" element={<ForgotPassword />} />
      <Route path="/superadmin/forgot" element={<ForgotPassword />} />
      <Route path="/super/superadmin/forgot" element={<ForgotPassword />} />
        {/* सुपर-सुपर एडमिन — सबैभन्दा माथिल्लो खाता */}
      <Route path="/super/superadmin/login" element={<SuperSuperLogin />} />
      <Route path="/super/superadmin" element={<SuperSuperAdminDashboard />} />
        {/* सुपर एडमिन : छुट्टै ड्यासबोर्ड र आफ्नै route */}
      <Route path="/superadmin" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/:section" element={<SuperAdminDashboard />} />

        {/* regular एडमिन — सुपर खण्ड यहाँ छैन */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/:section" element={<AdminDashboard />} />

        {rows.map(([p, C, D]) => (
          <React.Fragment key={p}>
            <Route path={p} element={<C />} />
            <Route path={`${p}/:id`} element={<D />} />
          </React.Fragment>
        ))}

        <Route path="/article/:id" element={<NewsDetail />} />
      </Routes>
    </Suspense>
  );
}
