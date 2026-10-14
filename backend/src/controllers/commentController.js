const CommentModel = require("../models/CommentModel");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");

const list = asyncHandler(async (req, res) => {
  res.json(await CommentModel.findByNews(req.params.id));
});

const create = asyncHandler(async (req, res) => {
  const { name, comment } = req.body || {};
  if (!comment || !String(comment).trim()) {
    return res.status(400).json({ message: "टिप्पणी लेख्नुहोस्" });
  }
  const row = await CommentModel.create({ news_id: req.params.id, name, comment });
  res.json(row);
});

const listAll = asyncHandler(async (req, res) => {
  res.json(await CommentModel.listAll());
});

const remove = asyncHandler(async (req, res) => {
  await CommentModel.remove(req.params.id);
  res.json({ ok: true });
  await logChange(req, "comment_delete", "comments", `टिप्पणी मेटियो #${req.params.id}`);
});

module.exports = { list, create, listAll, remove };