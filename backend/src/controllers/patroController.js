const PatroModel = require("../models/PatroModel");
const hamroPatro = require("../services/hamroPatro");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");

/** sync मा गतिमा भएको डाटा नोट गर्ने होइन — हरेक ल्याउँदा पुनः गनिन्छ */
const lastSync = { at: 0, running: false, error: "" };
const SYNC_COOLDOWN = 10 * 60 * 1000;

/**
 * सार्वजनिक : पात्रो डाटा
 * frontend ले आफ्नो विक्रम महिना आफैँ गणना गर्छ (त्यहाँ नै प्राधिकृतिक तालिका छ),
 * त्यसैले यहाँ मिति गणित हुँदैन — सबै सक्रिय बिदा/पर्व फिर्ता दिन्छ।
 */
const getPatro = asyncHandler(async (req, res) => {
  const settings = await PatroModel.getSettings();
  const holidays = await PatroModel.list({ onlyEnabled: true });
  res.json({
    source: "database",
    settings,
    holidays,
    total: holidays.length,
    syncedAt: lastSync.at ? new Date(lastSync.at).toISOString() : null,
    lastError: lastSync.error || ""
  });
});

/* ---------------- एडमिन : सेटिङ ---------------- */
const getSettings = asyncHandler(async (req, res) => {
  res.json(await PatroModel.getSettings());
});

const updateSettings = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const row = await PatroModel.updateSettings({
    sunday_holiday: b.sunday_holiday,
    saturday_holiday: b.saturday_holiday
  });
  await logChange(
    req,
    "patro_settings",
    "patro",
    `पात्रो सेटिङ — आइतबार: ${row.sunday_holiday ? "बिदा" : "सामान्य"}, शनिबार: ${row.saturday_holiday ? "बिदा" : "सामान्य"}`
  );
  res.json(row);
});

/* ---------------- एडमिन : बिदा / पर्व ---------------- */
const listHolidays = asyncHandler(async (req, res) => {
  res.json(await PatroModel.list({ onlyEnabled: false }));
});

const createHoliday = asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!b.title || !String(b.title).trim()) {
    return res.status(400).json({ message: "बिदा/पर्वको नाम लेख्नुहोस्" });
  }
  const row = await PatroModel.create({
    title: b.title,
    bs_year: b.bs_year,
    bs_month: b.bs_month,
    bs_day: b.bs_day,
    description: b.description,
    is_enabled: b.is_enabled
  });
  await logChange(req, "patro_holiday_create", "patro", `नयाँ बिदा — ${row.title}`);
  res.status(201).json(row);
});

const updateHoliday = asyncHandler(async (req, res) => {
  const existing = await PatroModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "बिदा भेटिएन" });
  const row = await PatroModel.update(req.params.id, req.body || {});
  const flipped = existing.is_enabled !== row.is_enabled;
  await logChange(
    req,
    flipped ? (row.is_enabled ? "patro_holiday_enable" : "patro_holiday_disable") : "patro_holiday_update",
    "patro",
    `${row.title} ${flipped ? (row.is_enabled ? "सक्रिय" : "निष्क्रिय") : "सम्पादन"}`
  );
  res.json(row);
});

const removeHoliday = asyncHandler(async (req, res) => {
  const existing = await PatroModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "बिदा भेटिएन" });
  await PatroModel.remove(req.params.id);
  await logChange(req, "patro_holiday_delete", "patro", `बिदा मेटियो — ${existing.title}`);
  res.json({ ok: true });
});

/**
 * हाम्रो पात्रोबाट वास्तविक बिदा/पर्व ल्याउने।
 * frontend ले वर्तमानको विक्रम वर्ष/महिना पठाउँछ।
 */
const sync = asyncHandler(async (req, res) => {
  if (lastSync.running) return res.status(429).json({ message: "अघि्लो sync चलिरहेको छ" });
  if (Date.now() - lastSync.at < SYNC_COOLDOWN && req.query.force !== "1") {
    return res.status(429).json({ message: "नयाँ sync भएको हालै छ — केही बेर पर्खनुहोस्" });
  }

  const year = Number(req.body?.year || req.query.year);
  const month = req.body?.month ?? req.query.month;
  const count = Number(req.body?.count || req.query.count || 12);

  if (!year || month === undefined || month === null || month === "") {
    return res.status(400).json({ message: "विक्रम वर्ष र महिना पठाउनुहोस्" });
  }

  lastSync.running = true;
  lastSync.error = "";
  try {
    const r = await hamroPatro.fetchRange({ year, month: Number(month), count });

    let created = 0;
    let updated = 0;
    for (const m of r.months) {
      for (const item of m.items) {
        // eslint-disable-next-line no-await-in-loop
        const out = await PatroModel.upsertByKey(item);
        if (out.created) created += 1;
        else updated += 1;
      }
    }

    lastSync.at = Date.now();
    lastSync.error = r.errors.join("; ");

    await logChange(
      req,
      "patro_sync",
      "patro",
      `पात्रो sync — ${r.months.length} महिना, ${created} नयाँ, ${updated} अद्यावधिक`
    );

    res.json({
      ok: true,
      months: r.months.length,
      found: r.total,
      created,
      updated,
      errors: r.errors
    });
  } catch (e) {
    lastSync.error = e.message;
    res.status(502).json({ message: "हाम्रो पात्रोसँग जोडिन सकिएन: " + e.message });
  } finally {
    lastSync.running = false;
  }
});

module.exports = {
  getPatro, getSettings, updateSettings,
  listHolidays, createHoliday, updateHoliday, removeHoliday, sync
};
