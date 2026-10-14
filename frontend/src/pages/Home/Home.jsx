import React, { useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import useNews from "../../hooks/useNews";
import HeroSlider from "../../components/NewsCard/HeroSlider";
import NewsCard from "../../components/NewsCard/NewsCard";
import TrendingNews from "../../components/Sidebar/TrendingNews";
import SidebarAd from "../../components/Sidebar/SidebarAd";
import FramerSidebar from "../../components/Sidebar/FramerSidebar";
import PopularNews from "../../components/Sidebar/PopularNews";
import AdSlot from "../../components/Ads/AdSlot";
import ReelsSection from "../../components/Reels/ReelsSection";
import SectionHeader from "../../components/NewsSection/SectionHeader";
import PhotoMarquee from "../../components/Ticker/PhotoMarquee";
import MiniCategorySidebar from "../../components/Sidebar/MiniCategorySidebar";
import { thumbSrcSet } from "../../services/api";
import { newestFirst } from "../../utils/sortNews";

const fadeL = { hidden: { opacity: 0, x: -70 }, show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } } };
const fadeR = { hidden: { opacity: 0, x: 70 }, show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } } };
const rise = { hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
const cascade = { hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } };

export default function Home() {
  const live = useNews();
  const list = useMemo(() => newestFirst(live.news || []), [live.news]);
  const cat = (c) => list.filter((n) => n.category === c);
  const world = cat("विश्व");
  const local = cat("स्थानीय तह");
  const art = cat("कला");
  const politics = cat("राजनीति");
  const sports = cat("खेलकुद");
  const misc = cat("विविध");
  const tajaRef = useRef(null);
  const artRef = useRef(null);
  const sportsRef = useRef(null);

  return (
    <>
      {/* ताजा खबर मार्की अब Header भित्र छ — सबै पृष्ठमा देखिन्छ */}
      <AdSlot position="ticker-after" className="container-shell py-2" />
      <main className="container-shell pt-8">
        <motion.div  variants={cascade} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.div variants={fadeL} className="min-w-0">
            <HeroSlider news={list.slice(0, 15)} />
          </motion.div>
          <motion.div variants={fadeR} className="min-w-0 fill-h">
            <PopularNews />
          </motion.div>
        </motion.div>

        <motion.div  className="my-4"><AdSlot position="banner" /></motion.div>

        <motion.div  className="mb-6"><AdSlot position="home-main" /></motion.div>

        <motion.section variants={rise}  className="section-space">
          <SectionHeader title="ताजा खबर" link="सबै हेर्नुहोस्" linkTo="/news" />
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <motion.div ref={tajaRef} variants={cascade}  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.slice(0, 9).map((n) => (
                  <motion.div key={n.id} className="h-full">
                    <NewsCard news={n} />
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-8 text-center">
                <Link to="/news" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700">सबै हेर्नुहोस् <ArrowRight size={17} /></Link>
              </div>
            </div>
            <div className="min-w-0 space-y-5">
              <FramerSidebar target={tajaRef}><TrendingNews /></FramerSidebar>
              <SidebarAd />
            </div>
          </div>
        </motion.section>

        <motion.section variants={rise}  className="section-space">
          <SectionHeader title="समाचार बुलेटिन" link="सबै हेर्नुहोस्" linkTo="/news" />
          {/* ४/४ ग्रिड — प्रत्येक कार्ड सूची-ढाँचा: बायँ मिनी फोटो, दायँ शीर्षक */}
          <div className="bulletin-grid sm:grid-cols-2 lg:grid-cols-4">
            {list.slice(0, 8).map((n) => (
              <Link key={n.id} to={`/article/${n.id}`} className="bulletin-card">
                <span className="bulletin-media">
                  <img
                    src={n.image}
                    srcSet={thumbSrcSet(n.image)}
                    sizes="100px"
                    alt={n.title}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="bulletin-body">
                  <h4>{n.title}</h4>
                  <p>{n.summary}</p>
                </span>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.div  className="my-8"><AdSlot position="home-bulletin" /></motion.div>

        <motion.section variants={rise}  className="section-space">
          <SectionHeader title="विश्व" link="सबै हेर्नुहोस्" linkTo="/world" />
          <motion.div variants={cascade}  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {world.slice(0, 4).map((n) => (
              <motion.div key={n.id} className="h-full">
                <NewsCard news={n} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* रील — विश्व खण्डपछि, समाचारपछि */}
        <ReelsSection />

        <motion.section variants={rise}  className="section-space">
          <SectionHeader title="स्थानीय तह" link="सबै हेर्नुहोस्" linkTo="/local-level" />
          <motion.div variants={cascade}  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {local.slice(0, 4).map((n) => (
              <motion.div key={n.id} className="h-full">
                <NewsCard news={n} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.div  className="my-4"><AdSlot position="home-local-bottom" /></motion.div>

        <motion.section variants={rise}  className="section-space">
          <SectionHeader title="कला/मनोरञ्जन" link="सबै हेर्नुहोस्" linkTo="/art" />
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <motion.div ref={artRef} variants={cascade}  className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {art.slice(0, 6).map((n) => (
                <motion.div key={n.id} className="h-full">
                  <NewsCard news={n} />
                </motion.div>
              ))}
            </motion.div>
            <MiniCategorySidebar title="कला/मनोरञ्जन" path="/art" adPosition="home-culture-ad" news={art.slice(0, 5)} target={artRef} />
          </div>
        </motion.section>

        <motion.div  className="my-4"><AdSlot position="home-art-bottom" /></motion.div>

        <motion.section variants={rise}  className="section-space">
          <SectionHeader title="राजनीति" link="सबै हेर्नुहोस्" linkTo="/politics" />
          <motion.div variants={cascade}  className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            {politics.slice(0, 4).map((n) => (
              <motion.div key={n.id} className="h-full">
                <Link to={`/article/${n.id}`} className="group flex items-center gap-4 border-b border-slate-200 pb-4">
                  <img src={n.image} alt={n.title} className="h-20 w-28 flex-none rounded-xl object-cover shadow-sm transition duration-300 group-hover:scale-105" />
                  <div>
                    <h4 className="text-base font-extrabold leading-6 text-slate-800 transition group-hover:text-brand-600">{n.title}</h4>
                    <p className="card-summary line-clamp-3 mt-1 text-slate-600">{n.summary}</p>
                    <small className="mt-1 block text-xs text-slate-400">{n.date}</small>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.div  className="my-4"><AdSlot position="home-politics-bottom" /></motion.div>

        <motion.section variants={rise}  className="section-space">
          <SectionHeader title="खेलकुद" link="सबै हेर्नुहोस्" linkTo="/sports" />
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <motion.div ref={sportsRef} variants={cascade}  className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sports.slice(0, 6).map((n) => (
                <motion.div key={n.id} className="h-full">
                  <NewsCard news={n} />
                </motion.div>
              ))}
            </motion.div>
            <MiniCategorySidebar title="खेलकुद" path="/sports" adPosition="home-sports-ad" news={sports.slice(0, 5)} target={sportsRef} />
          </div>
        </motion.section>

        <motion.div  className="my-4"><AdSlot position="home-sports-bottom" /></motion.div>

        <motion.section variants={rise}  className="section-space">
          <SectionHeader title="विविध" link="सबै हेर्नुहोस्" linkTo="/miscellaneous" />
          <motion.div variants={cascade}  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {misc.slice(0, 8).map((n) => (
              <motion.div key={n.id} className="h-full">
                <NewsCard news={n} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.div  className="my-4"><AdSlot position="home-misc-bottom" /></motion.div>

        <motion.div  className="my-4"><AdSlot position="banner" /></motion.div>
      </main>
      <motion.div ><PhotoMarquee /></motion.div>
      <div className="container-shell py-4"><AdSlot position="home-marquee" /></div>
    </>
  );
}

// ======================================================================
//  स्क्युअमोर्फिक होमपेज — अस्वीकृत, यहाँ comment गरिएको छ।
//  माथि मूल होमपेज सक्रिय छ। यो हटाएर यहि प्रयोग गर्न सकिन्छ।
// ======================================================================
// /* ===================================================================
//    होमपेज : स्क्युअमोर्फिज्म (skeuomorphism) डिजाइन
//    उठेको सतह · भित्र खोलेको फ्रेम · चमकिलो तस्वीर · छापिएको पाठ
//    =================================================================== */
// import React, { useMemo } from "react";
// import { Link } from "react-router-dom";
// import { ArrowRight, CalendarDays, Clock } from "lucide-react";
// import useNews from "../../hooks/useNews";
// import { newestFirst } from "../../utils/sortNews";
// import { formatDate } from "../../utils/formatDate";
// import { thumbSrcSet } from "../../services/api";
// import LatestTicker from "../../components/Ticker/LatestTicker";
// import TrendingNews from "../../components/Sidebar/TrendingNews";
// import PopularNews from "../../components/Sidebar/PopularNews";
// import SidebarAd from "../../components/Sidebar/SidebarAd";
// import MiniCalendar from "../../components/Sidebar/MiniCalendar";
// import AdSlot from "../../components/Ads/AdSlot";
// import ReelsSection from "../../components/Reels/ReelsSection";
// import PhotoMarquee from "../../components/Ticker/PhotoMarquee";
//
// /* ------------------------------------------------------------------
//    स्क्युअमोर्फिक खण्ड शीर्षक : नीलो धातुको पट्टी
//    ------------------------------------------------------------------ */
// const SkHead = ({ title, to }) => (
//   <div className="sk-sec-head">
//     <h2 className="sk-sec-title">{title}</h2>
//     <span className="sk-sec-line" />
//     {to && (
//       <Link to={to} className="sk-btn !py-2 !px-4 !text-[12.5px]">
//         सबै हेर्नुहोस् <ArrowRight size={13} />
//       </Link>
//     )}
//   </div>
// );
//
// /* ------------------------------------------------------------------
//    मुख्य खबर — ठूलो उठेको प्यानल
//    ------------------------------------------------------------------ */
// const SkHero = ({ news }) => (
//   <Link to={`/article/${news.id}`} className="sk-hero group">
//     <span className="sk-hero-media">
//       <img
//         src={news.image}
//         srcSet={thumbSrcSet(news.image)}
//         sizes="(max-width: 1024px) 100vw, 820px"
//         alt={news.title}
//         fetchPriority="high"
//       />
//     </span>
//     <span className="sk-hero-body">
//       <span className="sk-chip">{news.category}</span>
//       <h2 className="sk-hero-title">{news.title}</h2>
//       <p className="sk-hero-sum line-clamp-2">{news.summary}</p>
//       <span className="sk-meta">
//         <span>{news.author}</span>
//         <span className="h-1 w-1 rounded-full bg-slate-300" />
//         <Clock size={12} />
//         <span>{news.date}</span>
//       </span>
//     </span>
//   </Link>
// );
//
// /* ------------------------------------------------------------------
//    न्युज कार्ड — उठेको सतह + चमकिलो फोटो
//    ------------------------------------------------------------------ */
// const SkCard = ({ news }) => (
//   <Link to={`/article/${news.id}`} className="sk-card group">
//     <span className="sk-card-media">
//       <img
//         src={news.image}
//         srcSet={thumbSrcSet(news.image)}
//         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 370px"
//         alt={news.title}
//         loading="lazy"
//         decoding="async"
//       />
//     </span>
//     <span className="sk-card-body">
//       <span className="sk-chip">{news.category}</span>
//       <h3 className="sk-title line-clamp-3">{news.title}</h3>
//       <p className="sk-sum line-clamp-2">{news.summary}</p>
//       <span className="sk-meta">
//         <Clock size={12} />
//         <span>{news.date}</span>
//         <span className="h-1 w-1 rounded-full bg-slate-300" />
//         <span>{news.readingTime}</span>
//       </span>
//     </span>
//   </Link>
// );
//
// /* ------------------------------------------------------------------
//    भित्र खोलेको सानो सूची (वेल)
//    ------------------------------------------------------------------ */
// const SkWell = ({ title, items }) => (
//   <section className="sk-side">
//     <h3 className="sk-side-head">{title}</h3>
//     <div className="sk-side-body">
//       <div className="sk-well">
//         {items.map((n, i) => (
//           <Link key={n.id} to={`/article/${n.id}`} className="sk-well-item group">
//             <span className="sk-well-n">{i + 1}</span>
//             <span className="min-w-0 flex-1">
//               <p className="sk-well-t line-clamp-2">{n.title}</p>
//               <p className="sk-well-m">{n.date}</p>
//             </span>
//             {n.image && (
//               <span className="sk-well-media">
//                 <img src={n.image} srcSet={thumbSrcSet(n.image)} sizes="82px" alt={n.title} loading="lazy" />
//               </span>
//             )}
//           </Link>
//         ))}
//       </div>
//     </div>
//   </section>
// );
//
// export default function Home() {
//   const live = useNews();
//   const news = useMemo(() => newestFirst(live.news || []), [live.news]);
//
//   const cat = (c) => news.filter((n) => n.category === c);
//   const [hero, ...rest] = news;
//   /* ताजा खबर : शीर्षक १ + सहायक ३ पछिका ६ वटा */
//   const latest = rest.slice(3, 9);
//
//   if (!news.length) {
//     return (
//       <>
//         <LatestTicker />
//         <main className="container-shell py-20 text-center">
//           <div className="sk-panel px-8 py-10">
//             <p className="text-sm font-bold text-slate-500">हालसम्म कुनै समाचार प्रकाशित भएको छैन।</p>
//           </div>
//         </main>
//       </>
//     );
//   }
//
//   /* सबै खण्डमा उही ढाँचा : शीर्षक + कार्ड ग्रिड */
//   const Section = ({ title, to, items, four }) => {
//     if (!items.length) return null;
//     return (
//       <section className="mt-12">
//         <SkHead title={title} to={to} />
//         <div className={four ? "sk-grid sk-grid-4" : "sk-grid"}>
//           {items.map((n) => (
//             <SkCard key={n.id} news={n} />
//           ))}
//         </div>
//       </section>
//     );
//   };
//
//   return (
//     <div className="sk">
//       <LatestTicker />
//       <AdSlot position="ticker-after" className="container-shell py-2" />
//
//       <main className="container-shell pt-6">
//         {/* ---------------- मिति पट्टी ---------------- */}
//         <div className="sk-well mb-7 flex flex-wrap items-center justify-between gap-3 !py-2.5">
//           <span className="flex items-center gap-2 text-[12.5px] font-black uppercase tracking-[.1em] text-slate-500">
//             <CalendarDays size={14} className="text-brand-600" />
//             {formatDate(new Date())}
//           </span>
//           <span className="text-[12.5px] font-bold text-slate-500">
//             नागरिक जागरण · तथ्यमा आधारित पत्रकारिता
//           </span>
//         </div>
//
//         {/* ---------------- मुख्य खबर + साइडबार ---------------- */}
//         <section className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
//           <div className="min-w-0 space-y-5">
//             <SkHero news={hero} />
//             <div className="sk-grid">
//               {rest.slice(0, 3).map((n) => (
//                 <SkCard key={n.id} news={n} />
//               ))}
//             </div>
//           </div>
//
//           <aside className="min-w-0 space-y-5">
//             <PopularNews />
//             <TrendingNews />
//             <SidebarAd />
//           </aside>
//         </section>
//
//         {/* ---------------- ताजा खबर ---------------- */}
//         <Section title="ताजा खबर" to="/news" items={rest.slice(3, 9)} />
//
//         <div className="mt-9">
//           <AdSlot position="home-main" />
//         </div>
//
//         {/* ---------------- विश्व ---------------- */}
//         <Section title="विश्व" to="/world" items={cat("विश्व").slice(0, 4)} four />
//
//         {/* ---------------- रील ---------------- */}
//         <ReelsSection />
//
//         {/* ---------------- स्थानीय तह + वेल + पात्रो ---------------- */}
//         {cat("स्थानीय तह").length > 0 && (
//           <section className="mt-12">
//             <SkHead title="स्थानीय तह" to="/local-level" />
//             <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
//               <div className="sk-grid">
//                 {cat("स्थानीय तह").slice(0, 3).map((n) => (
//                   <SkCard key={n.id} news={n} />
//                 ))}
//               </div>
//               <div className="min-w-0 space-y-5">
//                 <SkWell title="वडा · नगरका खबर" items={cat("स्थानीय तह").slice(3, 7)} />
//                 <MiniCalendar />
//               </div>
//             </div>
//           </section>
//         )}
//
//         {/* ---------------- समाचार बुलेटिन ---------------- */}
//         <Section title="समाचार बुलेटिन" to="/news" items={rest.slice(9, 13)} four />
//
//         {/* ---------------- राजनीति + कला ---------------- */}
//         <section className="mt-12 grid gap-8 lg:grid-cols-2">
//           <div>
//             <SkHead title="राजनीति" to="/politics" />
//             <div className="sk-grid">
//               {cat("राजनीति").slice(0, 2).map((n) => (
//                 <SkCard key={n.id} news={n} />
//               ))}
//             </div>
//           </div>
//           <div>
//             <SkHead title="कला/मनोरञ्जन" to="/art" />
//             <div className="sk-grid">
//               {cat("कला").slice(0, 2).map((n) => (
//                 <SkCard key={n.id} news={n} />
//               ))}
//             </div>
//           </div>
//         </section>
//
//         {/* ---------------- खेलकुद + विचार ---------------- */}
//         <section className="mt-12 grid gap-8 lg:grid-cols-2">
//           <div>
//             <SkHead title="खेलकुद" to="/sports" />
//             <div className="sk-grid">
//               {cat("खेलकुद").slice(0, 2).map((n) => (
//                 <SkCard key={n.id} news={n} />
//               ))}
//             </div>
//           </div>
//           <div>
//             <SkHead title="विचार" to="/opinion" />
//             <div className="sk-grid">
//               {cat("विचार").slice(0, 2).map((n) => (
//                 <SkCard key={n.id} news={n} />
//               ))}
//             </div>
//           </div>
//         </section>
//
//         {/* ---------------- विविध ---------------- */}
//         <Section title="विविध" to="/miscellaneous" items={cat("विविध").slice(0, 4)} four />
//
//         <div className="mt-9">
//           <AdSlot position="home-bulletin" />
//         </div>
//       </main>
//
//       <PhotoMarquee />
//       <div className="container-shell py-4">
//         <AdSlot position="home-marquee" />
//       </div>
//     </div>
//   );
// }
