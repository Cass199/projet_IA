const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("id,timestamp,name,role")
    .order("timestamp", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data || []);
};