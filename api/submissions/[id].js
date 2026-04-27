const fs = require("fs");
const path = require("path");

const SUBMISSIONS_DIR = path.join(process.cwd(), "submissions");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const file = path.join(SUBMISSIONS_DIR, `${id}.json`);

    if (!fs.existsSync(file)) {
      return res.status(404).json({ error: "Not found" });
    }

    const raw = fs.readFileSync(file, "utf8");
    const obj = JSON.parse(raw);

    return res.json(obj);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};