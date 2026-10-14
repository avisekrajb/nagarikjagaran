const asyncHandler = require("../../utils/asyncHandler");
const { logChange } = require("../../utils/activityLog");
const alert = require("./alert");
const { SiteSettingModel, AdminRoleModel } = require("../models/superAdmin");
const { PollModel, ScoreboardModel, AdPositionModel } = require("../models/content");
const ChangeRequestModel = require("../models/changeRequest");

/* ================= सेटिङ ================= */
const getSettings = asyncHandler(async (req, res) => res.json(await SiteSettingModel.all()));

const updateSettings = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const clean = {};
  ["maintenance_on", "maintenance_msg", "show_patro", "show_dark_mode", "nav_buttons", "copyright", "powered_by"]
    .forEach((k) => { if (body[k] !== undefined) clean[k] = body[k]; });

  const rows = await SiteSettingModel.setMany(clean);
  await logChange(req, "settings_update", "site_settings", Object.keys(clean).join(", "));

  if (clean.maintenance_on === true || clean.maintenance_on === "true") {
    alert.notify("मर्मत मोड सुरु भयो", "warn", [
      ["कसले", req.admin.email],
      ["सन्देश", String(clean.maintenance_msg || "").slice(0, 120)],
      ["IP", alert.info(req).ip],
    ]);
  }
  res.json(rows);
});

/* ================= न्युबार बटन ================= */
const getNav = asyncHandler(async (req, res) => res.json(await NavModel()));
const saveNav = asyncHandler(async (req, res) => {
  const rows = await SiteSettingModel.set("nav_buttons", JSON.stringify(req.body?.items || []));
  await logChange(req, "nav_update", "site_settings", "न्युबार बटन परिवर्तन");
  res.json(rows);
});
/** मूल बटनहरू — DB मा नभए यहीबाट */
const NavModel = async () => {
  const s = await SiteSettingModel.all();
  let custom = [];
  try { custom = JSON.parse(s.nav_buttons || "[]"); } catch (e) { custom = []; }
  return custom;
};

/* ================= एडमिन भूमिका ================= */
const listAdmins = asyncHandler(async (req, res) => res.json(await AdminRoleModel.list()));

const setRole = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if ((req.body || {}).role === "superadmin") {
    return res.status(400).json({ message: "थप सुपर एडमिन बनाउन मिल्दैन — यो खाता लक छ" });
  }
  await AdminRoleModel.setRole(id, (req.body || {}).role || "admin");
  await logChange(req, "role_update", "admins", `#${id}`);
  res.json(await AdminRoleModel.list());
});

const setLocked = asyncHandler(async (req, res) => {
  await AdminRoleModel.setLocked(Number(req.params.id), (req.body || {}).locked);
  res.json(await AdminRoleModel.list());
});

/* ================= पोल ================= */
const listPolls = asyncHandler(async (req, res) => res.json(await PollModel.list()));

const createPoll = asyncHandler(async (req, res) => {
  const { question, options, show_in_sidebar } = req.body || {};
  if (!question || !String(question).trim()) return res.status(400).json({ message: "प्रश्न लेख्नुहोस्" });
  const list = (Array.isArray(options) ? options : []).map((o) => String(o).trim()).filter(Boolean);
  if (list.length < 2) return res.status(400).json({ message: "कम्तीमा २ विकल्प चाहिन्छ" });
  await PollModel.create({ question, options: list, show_in_sidebar: show_in_sidebar !== false });
  await logChange(req, "poll_create", "polls", String(question).slice(0, 60));
  res.json(await PollModel.list());
});

const removePoll = asyncHandler(async (req, res) => {
  await PollModel.remove(Number(req.params.id));
  res.json(await PollModel.list());
});

const togglePoll = asyncHandler(async (req, res) => {
  await PollModel.setActive(Number(req.params.id), (req.body || {}).active);
  res.json(await PollModel.list());
});

/* ================= स्कोरबोर्ड ================= */
const listScores = asyncHandler(async (req, res) => res.json(await ScoreboardModel.list()));

const createScore = asyncHandler(async (req, res) => {
  const d = req.body || {};
  if (!d.home_team || !d.away_team) return res.status(400).json({ message: "दुवै टोलीको नाम चाहिन्छ" });
  await ScoreboardModel.create(d);
  await logChange(req, "score_create", "scoreboard", `${d.home_team} vs ${d.away_team}`);
  res.json(await ScoreboardModel.list());
});

const updateScore = asyncHandler(async (req, res) => {
  await ScoreboardModel.update(Number(req.params.id), req.body || {});
  res.json(await ScoreboardModel.list());
});

const removeScore = asyncHandler(async (req, res) => {
  await ScoreboardModel.remove(Number(req.params.id));
  res.json(await ScoreboardModel.list());
});

/* ================= विज्ञापन स्थान ================= */
const listAdPositions = asyncHandler(async (req, res) => res.json(await AdPositionModel.list()));

const createAdPosition = asyncHandler(async (req, res) => {
  try {
    await AdPositionModel.create(req.body || {});
    res.json(await AdPositionModel.list());
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

const updateAdPosition = asyncHandler(async (req, res) => {
  await AdPositionModel.update(Number(req.params.id), req.body || {});
  res.json(await AdPositionModel.list());
});

const removeAdPosition = asyncHandler(async (req, res) => {
  await AdPositionModel.remove(Number(req.params.id));
  res.json(await AdPositionModel.list());
});

/* ================= परिवर्तन अनुरोध (approval queue) ================= */
const listChanges = asyncHandler(async (req, res) =>
  res.json(await ChangeRequestModel.list(req.query.status))
);

const cancelChange = asyncHandler(async (req, res) => {
  await ChangeRequestModel.cancel(Number(req.params.id));
  res.json(await ChangeRequestModel.list());
});

/* ================= परीक्षण इमेल ================= */
const testAlert = asyncHandler(async (req, res) => {
  const i = alert.info(req);
  const ok = await alert.notify("सुपर एडमिनबाट परीक्षण सूचना", "info", [
    ["कसले", req.admin.email], ["IP", i.ip], ["ब्राउजर", i.ua], ["मिति", new Date().toString()],
  ]);
  res.json({ ok, to: alert.ALERT_EMAIL });
});

module.exports = {
  getSettings, updateSettings,
  getNav, saveNav,
  listAdmins, setRole, setLocked,
  listPolls, createPoll, removePoll, togglePoll,
  listScores, createScore, updateScore, removeScore,
  listAdPositions, createAdPosition, updateAdPosition, removeAdPosition,
  listChanges, cancelChange,
  testAlert,
};
