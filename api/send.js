const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const nodemailer = require("nodemailer");
const crypto = require("crypto");

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !port || !user || !pass) {
    throw new Error("SMTP configuration missing");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, data, markdown, html } = req.body || {};

    const id = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
    const { error: insertError } = await supabase
        .from("submissions")
        .insert({
            id,
            recipient_email: to || null,
            name: data?.name || null,
            role: data?.role || null,
            data: data || {},
            markdown: markdown || "",
            html: html || ""
        });

    if (insertError) {
        throw new Error("Erreur Supabase insert: " + insertError.message);
    }
    
    const owner = process.env.OWNER_EMAIL;
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

    if (!owner) {
      throw new Error("OWNER_EMAIL missing");
    }

    const transport = getTransport();

    const role = data?.role || "Sans titre";
    const name = data?.name || "Anonyme";

    await transport.sendMail({
      from,
      to: owner,
      subject: `Nouvelle fiche métier: ${role}`,
      html: `
        <p>Nouvelle fiche soumise par <strong>${name}</strong>.</p>
        <div>${html || ""}</div>
      `,
      attachments: markdown
        ? [
            {
              filename: `${role.replace(/[^a-z0-9-_]+/gi, "-")}.md`,
              content: markdown,
            },
          ]
        : [],
    });

    if (to) {
      await transport.sendMail({
        from,
        to,
        subject: `Confirmation : votre fiche métier (${role})`,
        text: `Bonjour ${name},

Nous avons bien reçu votre fiche métier. Merci pour votre contribution.`,
      });
    }

    return res.json({
      ok: true,
      id,
      warning:
        "La fiche n'est pas encore stockée durablement. Il faut ajouter une base de données.",
    });
  } catch (err) {
    console.error("Send error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};