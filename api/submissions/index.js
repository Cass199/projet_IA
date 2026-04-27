const fs = require("fs");
const path = require("path");

const SUBMISSIONS_DIR = path.join(process.cwd(), "submissions");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!fs.existsSync(SUBMISSIONS_DIR)) {
      return res.json([]);
    }

    const files = fs.readdirSync(SUBMISSIONS_DIR).filter(f => f.endsWith(".json"));

    const items = files
      .map(f => {
        try {
          const raw = fs.readFileSync(path.join(SUBMISSIONS_DIR, f), "utf8");
          const obj = JSON.parse(raw);

          return {
            id: obj.id,
            timestamp: obj.timestamp,
            name: obj.data?.name || null,
            role: obj.data?.role || null
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.timestamp < b.timestamp ? 1 : -1);

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};