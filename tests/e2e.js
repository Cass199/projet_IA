const puppeteer = require('puppeteer');

(async () => {
  const url = 'http://127.0.0.1:8000';
  let browser = null;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Start interview
    await page.waitForSelector('#start-interview');
    await page.click('#start-interview');

    // Helper: fill required fields in the currently visible step and click primary button
    for (let step = 0; step < 10; step++) {
      // give UI a moment
      await page.waitForTimeout(250);
      const advanced = await page.evaluate(() => {
        const steps = Array.from(document.querySelectorAll('.step'));
        const cur = steps.find(s => !s.hidden);
        if (!cur) return false;
        const reqs = Array.from(cur.querySelectorAll('[required]'));
        reqs.forEach(el => {
          if (el.tagName === 'INPUT') {
            if (el.type === 'number') el.value = '1';
            else el.value = 'Test';
          } else if (el.tagName === 'TEXTAREA') {
            el.value = 'Texte de test pour la validation.';
          } else if (el.tagName === 'SELECT') {
            // pick the first non-empty option
            for (const o of el.options) {
              if (o.value) { el.value = o.value; break; }
            }
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // find primary button inside current step (Suivant / Terminer)
        const btn = cur.querySelector('.btn-primary');
        if (btn) { btn.click(); return true; }
        return false;
      });
      // if no advance button found, break
      if (!advanced) break;
    }

    // Wait for result screen
    await page.waitForSelector('#result .job-sheet', { timeout: 8000 });
    console.log('E2E: Parcours complet réussi — fiche affichée.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    if (browser) await browser.close();
    console.error('E2E: Erreur lors du test', err);
    process.exit(2);
  }
})();
