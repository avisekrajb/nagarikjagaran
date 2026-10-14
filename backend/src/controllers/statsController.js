const StatsModel = require("../models/StatsModel");
const VisitorModel = require("../models/VisitorModel");
const ActivityLogModel = require("../models/ActivityLogModel");
const asyncHandler = require("../utils/asyncHandler");

const RANGES = new Set(["week", "month", "year"]);

// मुख्य ड्यासबोर्ड: कुल संख्या + भिजिटर (साप्ताहिक/मासिक/वार्षिक) + परिवर्तन लग
const dashboard = asyncHandler(async (req, res) => {
  const range = RANGES.has(req.query.range) ? req.query.range : "week";

  const [stats, visitors, series, topPages, logs, recentVisitors] = await Promise.all([
    StatsModel.dashboard(),
    VisitorModel.totals(),
    VisitorModel.series(range),
    VisitorModel.topPages(8),
    ActivityLogModel.list(50),
    VisitorModel.recent(10)
  ]);

  res.json({
    range,
    stats,
    visitors,
    series,
    topPages,
    logs,
    recentVisitors,
    maxLogs: ActivityLogModel.MAX
  });
});

const visitorStats = asyncHandler(async (req, res) => {
  const range = RANGES.has(req.query.range) ? req.query.range : "week";
  const [totals, series, topPages, recentVisitors] = await Promise.all([
    VisitorModel.totals(),
    VisitorModel.series(range),
    VisitorModel.topPages(8),
    VisitorModel.recent(12)
  ]);
  res.json({ range, totals, series, topPages, recentVisitors });
});

const logs = asyncHandler(async (req, res) => {
  const rows = await ActivityLogModel.list(req.query.limit);
  res.json({ logs: rows, max: ActivityLogModel.MAX });
});

module.exports = { dashboard, visitorStats, logs };
