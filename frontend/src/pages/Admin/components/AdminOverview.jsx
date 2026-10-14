import React, { useEffect, useMemo, useState } from "react";
import { nepaliDate } from "../../../utils/formatDate";
import {
  Eye, Users, Newspaper, Megaphone, MousePointerClick, Mail, MessageSquare,
  Activity, TrendingUp, Globe, RefreshCw, Monitor, Smartphone, Tablet,
  Plus, Film, PanelsTopLeft, ShieldCheck
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { absoluteUrl } from "../../../services/api";
import { Btn } from "./AdminUI";

const RANGES = [
  { key: "week", label: "साप्ताहिक", sub: "७ दिन" },
  { key: "month", label: "मासिक", sub: "यो महिना" },
  { key: "year", label: "वार्षिक", sub: "यो वर्ष" }
];

const T = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  violet: "bg-violet-50 text-violet-700 border-violet-100",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-100"
};

const ACTION_META = {
  login: ["लगइन", T.blue, ShieldCheck],
  news_create: ["नयाँ समाचार", T.green, Newspaper],
  news_update: ["समाचार सम्पादन", T.amber, Newspaper],
  news_delete: ["समाचार मेटियो", T.rose, Newspaper],
  ad_create: ["नयाँ विज्ञापन", T.green, Megaphone],
  ad_update: ["विज्ञापन सम्पादन", T.amber, Megaphone],
  ad_delete: ["विज्ञापन मेटियो", T.rose, Megaphone],
  reel_create: ["नयाँ रील", T.green, Film],
  reel_update: ["रील सम्पादन", T.amber, Film],
  reel_delete: ["रील मेटियो", T.rose, Film],
  admin_create: ["नयाँ एडमिन", T.violet, Users],
  admin_update: ["एडमिन सम्पादन", T.amber, Users],
  admin_delete: ["एडमिन मेटियो", T.rose, Users],
  admin_activate: ["एडमिन सक्रिय", T.green, Users],
  admin_deactivate: ["एडमिन निष्क्रिय", T.slate, Users],
  admin_password_reset: ["पासवर्ड रिसेट", T.violet, ShieldCheck],
  password_change: ["पासवर्ड बदलियो", T.violet, ShieldCheck],
  profile_update: ["प्रोफाइल बदलियो", T.blue, Users],
  subscriber_delete: ["सब्सक्राइबर हटाए", T.slate, Mail],
  comment_delete: ["टिप्पणी मेटियो", T.slate, MessageSquare],
  message_delete: ["सन्देश मेटियो", T.slate, MessageSquare],
  footer_update: ["फुटर बदलियो", T.cyan, PanelsTopLeft],
  header_photo_update: ["हेडर फोटो बदलियो", T.cyan, Monitor],
  team_create: ["टिम सदस्य थपियो", T.green, Users],
  team_update: ["टिम सम्पादन", T.amber, Users],
  team_delete: ["टिम सदस्य मेटियो", T.rose, Users]
};

const FB = ["परिवर्तन", T.slate, Activity];
const nf = (n) => Number(n || 0).toLocaleString("ne-NP");

const relative = (ts) => {
  if (!ts) return "";
  const m = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "अहिले";
  if (m < 60) return `${m} मिनेट पहिले`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} घण्टा पहिले`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} दिन पहिले`;
  return nepaliDate(ts);
};

const shortLabel = (label, range) => {
  if (!label) return "";
  if (range === "year") return String(Number(String(label).split("-")[1]) || 0);
  const d = new Date(String(label).replace(/-/g, "/"));
  return isNaN(d.getTime()) ? String(label) : `${d.getDate()}`;
};

const devIcon = (d) => (d === "mobile" ? Smartphone : d === "tablet" ? Tablet : Monitor);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-soft ${className}`}>{children}</div>
);

const SectionTitle = ({ icon: Icon, title, extra }) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
      {Icon ? <Icon size={16} className="text-blue-600" /> : null}
      {title}
    </h3>
    {extra}
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-4 ${gradient} text-white shadow-lg transition hover:-translate-y-0.5 sm:p-5`}>
    <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
    <span className="absolute -bottom-8 -left-4 h-16 w-16 rounded-full bg-white/10" />
    <div className="relative flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-black uppercase tracking-wider text-white/80 sm:text-[11px]">{label}</p>
        <p className="mt-1 text-xl font-black leading-none sm:text-2xl xl:text-3xl">{nf(value)}</p>
        {sub ? <p className="mt-1.5 truncate text-[10px] font-bold text-white/75 sm:text-[11px]">{sub}</p> : null}
      </div>
      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white/20 ring-1 ring-white/25 sm:h-10 sm:w-10">
        <Icon size={17} />
      </span>
    </div>
  </div>
);

export default function AdminOverview({ setMsg, onNavigate }) {
  const [range, setRange] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniq, setUniq] = useState(false);

  const load = async (r = range) => {
    setLoading(true);
    try {
      setData(await adminApi.dashboard(r));
    } catch (e) {
      setMsg(e.message || "तथ्याङ्क लोड हुन सकेन");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(range); /* eslint-disable-next-line */ }, [range]);

  const s = data?.stats;
  const v = data?.visitors;
  const series = data?.series?.data || [];
  const logs = data?.logs || [];
  const maxLogs = data?.maxLogs || 50;

  const chart = useMemo(() => {
    const key = uniq ? "uniques" : "visits";
    const max = Math.max(1, ...series.map((r) => Number(r[key] || 0)));
    return series.map((r) => ({
      label: shortLabel(r.label, range),
      raw: r.label,
      visits: Number(r.visits || 0),
      uniques: Number(r.uniques || 0),
      pct: Math.max(4, Math.round((Number(r[key] || 0) / max) * 100))
    }));
  }, [series, uniq, range]);

  const rVisits = useMemo(() => series.reduce((a, r) => a + Number(r.visits || 0), 0), [series]);
  const rUniq = useMemo(() => series.reduce((a, r) => a + Number(r.uniques || 0), 0), [series]);

  const cards = [
    { icon: Eye, label: "कुल दृश्य", value: s?.totalViews, sub: `समाचार ${nf(s?.newsViews)} · विज्ञापन ${nf(s?.adViews)}`, gradient: "bg-gradient-to-br from-indigo-600 to-violet-500" },
    { icon: Users, label: "कुल भिजिटर", value: v?.all, sub: `${nf(v?.allUnique)} फरक · आज ${nf(v?.today)}`, gradient: "bg-gradient-to-br from-blue-600 to-cyan-500" },
    { icon: Newspaper, label: "कुल समाचार", value: s?.news, sub: `प्रकाशित ${nf(s?.newsPublished)} · ड्राफ्ट ${nf(s?.newsDraft)}`, gradient: "bg-gradient-to-br from-emerald-600 to-teal-500" },
    { icon: Megaphone, label: "कुल विज्ञापन", value: s?.ads, sub: `सक्रिय ${nf(s?.adsActive)} · दृश्य ${nf(s?.adViews)} · क्लिक ${nf(s?.adClicks)}`, gradient: "bg-gradient-to-br from-amber-500 to-orange-500" },
    { icon: Mail, label: "सब्सक्राइबर", value: s?.subscribers, sub: `टिप्पणी ${nf(s?.comments)} · सन्देश ${nf(s?.messages)}`, gradient: "bg-gradient-to-br from-rose-500 to-pink-500" },
    { icon: MousePointerClick, label: "कुल क्लिक", value: s?.totalClicks, sub: `समाचार ${nf(s?.newsClicks)} · विज्ञापन ${nf(s?.adClicks)}`, gradient: "bg-gradient-to-br from-slate-700 to-slate-500" }
  ];

  const quick = [
    { label: "नयाँ समाचार", icon: Plus, run: () => onNavigate("news", "newNews") },
    { label: "नयाँ विज्ञापन", icon: Plus, run: () => onNavigate("ads", "newAd") },
    { label: "रील थप्नुहोस्", icon: Film, run: () => onNavigate("reels") },
    { label: "फुटर सम्पादन", icon: PanelsTopLeft, run: () => onNavigate("footer") },
    { label: "एडमिन खाता", icon: ShieldCheck, run: () => onNavigate("accounts") },
    { label: "साइट हेर्नुहोस्", icon: Globe, run: () => window.open("/", "_blank") }
  ];

  const catTop = Math.max(1, ...(s?.byCategory || []).map((x) => Number(x.total)));
  const pageTop = Math.max(1, ...(data?.topPages || []).map((x) => Number(x.visits)));

return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
            <TrendingUp size={20} className="text-blue-600" /> ड्यासबोर्ड अवलोकन
          </h2>
          <p className="mt-0.5 text-xs font-bold text-slate-500">भिजिटर, दृश्य र सम्पादन गतिविधि — सबै एउटै ठाउँमा</p>
        </div>
        <Btn kind="soft" onClick={() => load(range)} disabled={loading}>
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> रिफ्रेस
        </Btn>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionTitle
            icon={Users}
            title="भिजिटर"
            extra={
              <button
                type="button"
                onClick={() => setUniq((m) => !m)}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
              >
                {uniq ? "फरक भिजिटर" : "कुल भिजिटर"}
              </button>
            }
          />
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-black transition sm:flex-none ${
                  range === r.key
                    ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow"
                    : "text-slate-500 hover:bg-white hover:text-slate-700"
                }`}
              >
                {r.label}
                <span className="ml-1 hidden text-[10px] font-bold opacity-70 sm:inline">{r.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: "आज", val: v?.today, tone: "text-blue-600" },
            { k: "हप्ता", val: v?.week, tone: "text-emerald-600" },
            { k: "महिना", val: v?.month, tone: "text-amber-600" },
            { k: "वर्ष", val: v?.year, tone: "text-violet-600" }
          ].map((x) => (
            <div key={x.k} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <p className={`text-lg font-black leading-none sm:text-2xl ${x.tone}`}>{nf(x.val)}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{x.k}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          {chart.length === 0 ? (
            <div className="grid h-40 place-items-center rounded-xl border border-dashed border-slate-200 text-center">
              <div>
                <Globe size={26} className="mx-auto text-slate-300" />
                <p className="mt-2 text-sm font-black text-slate-500">अहिलेसम्म भिजिटर डाटा छैन</p>
                <p className="mt-0.5 text-xs font-bold text-slate-400">साइट हेर्नुभएपछि यहाँ ग्राफ देखिनेछ</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-44 items-end gap-1 overflow-x-auto sm:h-56 sm:gap-2">
                {chart.map((c) => (
                  <div key={c.raw} className="group flex min-w-[24px] flex-1 flex-col items-center gap-1.5 sm:min-w-[32px]">
                    <span className="text-[10px] font-black text-slate-400 opacity-0 transition group-hover:opacity-100">
                      {nf(uniq ? c.uniques : c.visits)}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 transition-all duration-500 group-hover:to-cyan-300"
                      style={{ height: `${c.pct}%` }}
                      title={`${c.raw} — ${c.visits} भिजिटर / ${c.uniques} फरक`}
                    />
                    <span className="text-[9px] font-black text-slate-400 sm:text-[10px]">{c.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500">
                <span>
                  {RANGES.find((r) => r.key === range)?.label} कुल:{" "}
                  <b className="text-slate-800">{nf(uniq ? rUniq : rVisits)}</b>{" "}
                  {uniq ? "फरक भिजिटर" : "भिजिटर"}
                </span>
                <span className="text-slate-400">
                  अन्तिम {range === "year" ? "१२ महिना" : range === "month" ? "३० दिन" : "७ दिन"}
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* परिवर्तनको लग */}
      <Card className="p-4 sm:p-5">
        <SectionTitle
          icon={Activity}
          title="परिवर्तनको लग"
          extra={
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
              {logs.length}/{maxLogs} — ५० पछि आफै मेटिन्छ
            </span>
          }
        />
        <ul className="max-h-[24rem] space-y-1.5 overflow-y-auto pr-1">
          {logs.length === 0 && (
            <li className="py-8 text-center text-sm font-bold text-slate-400">
              अहिलेसम्म कुनै परिवर्तन भएको छैन
            </li>
          )}
          {logs.map((l) => {
            const [label, tone, Icon] = ACTION_META[l.action] || FB;
            return (
              <li
                key={l.id}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 p-2.5 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <span className={`grid h-8 w-8 flex-none place-items-center rounded-lg border ${tone}`}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5">
                    <b className="text-xs font-black text-slate-800">{label}</b>
                    {l.admin_name ? (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {l.admin_name}
                      </span>
                    ) : null}
                    <span className="text-[10px] font-bold text-slate-400">{relative(l.created_at)}</span>
                  </p>
                  {l.details ? (
                    <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500">{l.details}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={Newspaper} title="श्रेणी अनुसार समाचार" />
          {!(s?.byCategory || []).length && (
            <p className="py-6 text-center text-sm font-bold text-slate-400">कुनै समाचार छैन</p>
          )}
          <ul className="space-y-2.5">
            {(s?.byCategory || []).slice(0, 8).map((c) => (
              <li key={c.category}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-black text-slate-700">{c.category}</span>
                  <span className="flex-none font-bold text-slate-400">
                    {nf(c.total)} · {nf(c.views)} दृश्य
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                    style={{ width: `${Math.max(6, (Number(c.total) / catTop) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle icon={Eye} title="सर्वाधिक हेरिएका समाचार" />
          {!(s?.topNews || []).length && (
            <p className="py-6 text-center text-sm font-bold text-slate-400">कुनै समाचार छैन</p>
          )}
          <ul className="space-y-2">
            {(s?.topNews || []).map((n, i) => (
              <li
                key={n.id}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2 transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <span className="w-4 flex-none text-center text-xs font-black text-blue-200">{i + 1}</span>
                {n.image ? (
                  <img src={absoluteUrl(n.image)} alt="" className="h-9 w-12 flex-none rounded-lg object-cover" />
                ) : (
                  <span className="h-9 w-12 flex-none rounded-lg bg-slate-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-slate-700">{n.title}</p>
                  <p className="mt-0.5 truncate text-[10px] font-bold text-slate-400">
                    {n.category}{n.date ? ` • ${n.date}` : ""}
                  </p>
                </div>
                <div className="flex flex-none flex-col items-end">
                  <span className="flex items-center gap-1 text-xs font-black text-blue-600">
                    <Eye size={11} /> {nf(n.view_count)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <MousePointerClick size={9} /> {nf(n.click_count)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col p-4 sm:p-5">
          <SectionTitle icon={Globe} title="धेरै हेरिएका पृष्ठ" />
          {!(data?.topPages || []).length && (
            <p className="py-6 text-center text-sm font-bold text-slate-400">अहिलेसम्म पृष्ठ डाटा छैन</p>
          )}
          <ul className="space-y-2">
            {(data?.topPages || []).map((p) => (
              <li key={p.path}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-black text-slate-700">{p.path}</span>
                  <span className="flex-none font-bold text-blue-600">{nf(p.visits)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                    style={{ width: `${Math.max(6, (Number(p.visits) / pageTop) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          {(data?.recentVisitors || []).length > 0 && (
            <>
              <p className="mb-2 mt-5 border-t border-slate-100 pt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                हालका भिजिटर
              </p>
              <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {data.recentVisitors.map((rv, i) => {
                  const DIcon = devIcon(rv.device);
                  return (
                    <li key={`${rv.visitor_key}-${i}`} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <DIcon size={13} className="flex-none text-slate-400" />
                      <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-600">
                        {rv.path || "/"}
                      </span>
                      <span className="flex-none text-[10px] font-bold text-slate-400">
                        {relative(rv.created_at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <SectionTitle icon={Plus} title="द्रुत कार्य" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {quick.map((q, i) => (
            <button
              key={q.label}
              type="button"
              onClick={q.run}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <q.icon size={14} /> {q.label}
            </button>
          ))}
        </div>
      </Card>

    </div>
  );
}
