// Load .env in development (if present)
try { require('dotenv').config(); } catch (e) { /* dotenv optional */ }
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple CORS allow for local testing
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json({ limit: '1mb' }));

// Serve static site from project root
app.use(express.static(process.cwd()));

const SUBMISSIONS_DIR = path.join(process.cwd(), 'submissions');
if (!fs.existsSync(SUBMISSIONS_DIR)) {
  fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

app.post('/send', async (req, res) => {
  try {
    const { to, data, markdown, html } = req.body || {};
    console.log('POST /send received - to:', to, 'role:', data && data.role ? data.role : 'n/a');
    // Persist submission to disk (always)
    const id = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    const submission = { id, timestamp: new Date().toISOString(), to, data: data || {}, markdown: markdown || '', html: html || '' };
    const filename = path.join(SUBMISSIONS_DIR, `${id}.json`);
    try { fs.writeFileSync(filename, JSON.stringify(submission, null, 2)); } catch (e) { console.warn('Failed to persist submission', e && e.message ? e.message : e); }
    const owner = process.env.OWNER_EMAIL;
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@example.com';
    if (!owner) console.warn('OWNER_EMAIL not configured — owner will not receive submissions via email.');

    let transport = getTransport();
    let usingTestAccount = false;
    if (!transport) {
      console.warn('SMTP configuration missing — creating Ethereal test account for development');
      // create ethereal test account for dev fallback
      const testAccount = await nodemailer.createTestAccount();
      transport = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
      usingTestAccount = true;
    }

    // Prepare owner email
    const ownerSubject = `Nouvelle fiche métier: ${data && data.role ? data.role : 'Sans titre'}`;
    const ownerHtml = `
      <p>Nouvelle fiche soumise par <strong>${data && data.name ? data.name : 'Anonyme'}</strong>.</p>
      <div>${html || ''}</div>
    `;

    const attachments = [];
    if (markdown) attachments.push({ filename: `${(data && data.role ? data.role : 'fiche-metier').replace(/[^a-z0-9-_]+/ig,'-')}.md`, content: markdown });

    let ownerPreview = null;
    if (owner) {
      const ownerInfo = await transport.sendMail({ from, to: owner, subject: ownerSubject, html: ownerHtml, attachments });
      if (usingTestAccount) ownerPreview = nodemailer.getTestMessageUrl(ownerInfo) || null;
    }

    // Send confirmation to user if provided
    if (to) {
      const userSubject = `Confirmation : votre fiche métier (${data && data.role ? data.role : 'Sans titre'})`;
      const userText = `Bonjour ${data && data.name ? data.name : ''},\n\nNous avons bien reçu votre fiche métier. Merci pour votre contribution.`;
      const userInfo = await transport.sendMail({ from, to, subject: userSubject, text: userText });
      var userPreview = null;
      if (usingTestAccount) userPreview = nodemailer.getTestMessageUrl(userInfo) || null;
    }

    const result = { ok: true };
    // include saved id so clients can link to the published page
    result.id = id;
    if (usingTestAccount) result.preview = { owner: ownerPreview, user: userPreview || null };
    return res.json(result);
  } catch (err) {
    console.error('Mail send error', err && err.stack ? err.stack : err);
    // Return structured error for easier debugging in dev. Remove in production.
    return res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT} — serving static files from ${process.cwd()}`);
  console.log('Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and OWNER_EMAIL to enable email sending');
});

// API: list submissions metadata
app.get('/api/submissions', (req, res) => {
  try {
    const files = fs.readdirSync(SUBMISSIONS_DIR).filter(f => f.endsWith('.json'));
    const items = files.map(f => {
      try {
        const raw = fs.readFileSync(path.join(SUBMISSIONS_DIR, f), 'utf8');
        const obj = JSON.parse(raw);
        return { id: obj.id, timestamp: obj.timestamp, name: obj.data && obj.data.name ? obj.data.name : null, role: obj.data && obj.data.role ? obj.data.role : null };
      } catch (e) { return null; }
    }).filter(Boolean).sort((a,b) => (a.timestamp < b.timestamp) ? 1 : -1);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// API: get single submission
app.get('/api/submissions/:id', (req, res) => {
  try {
    const id = req.params.id;
    const file = path.join(SUBMISSIONS_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);
    return res.json(obj);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// Public page: render a single submission as an HTML page (permalink)
app.get('/submissions/:id', (req, res) => {
  try {
    const id = req.params.id;
    const file = path.join(SUBMISSIONS_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return res.status(404).send('Fiche non trouvée');
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);
    const title = (obj.data && obj.data.role) ? obj.data.role : 'Fiche métier';
    const author = (obj.data && obj.data.name) ? obj.data.name : 'Anonyme';
    const html = `<!doctype html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>${escapeHtml(title)}</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <div class="app-container">
          <a href="/submissions.html">← Retour aux fiches publiées</a>
          <h1>${escapeHtml(title)}</h1>
          <p><strong>Auteur:</strong> ${escapeHtml(author)} — <em>${escapeHtml(obj.timestamp)}</em></p>
          <div class="job-sheet">${obj.html || ''}</div>
        </div>
      </body>
      </html>`;
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Erreur serveur');
  }
});

// small helper to avoid XSS in template
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
