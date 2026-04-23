import { escapeHtml } from './utils.js';

function summarizeText(text, max = 120) {
  if (!text) return '';
  const s = String(text).trim();
  const m = s.match(/([^\.\!\?]+[\.\!\?])\s*/);
  const first = m ? m[1].trim() : s;
  if (first.length <= max) return escapeHtml(first);
  return escapeHtml(first.slice(0, max).trim()) + '...';
}

function formatParagraphs(text) {
  if (!text) return '';
  const parts = String(text).trim().split(/\n\s*\n/).map(p => escapeHtml(p).replace(/\n/g, '<br>'));
  return parts.map(p => `<p>${p}</p>`).join('\n');
}

function formatAsList(text) {
  if (!text) return '';
  const s = String(text).trim();
  let items = s.split(/\r?\n/).map(i => i.trim()).filter(Boolean);
  if (items.length <= 1) items = s.split(/,|;/).map(i => i.trim()).filter(Boolean);
  if (items.length <= 1) return `<p>${escapeHtml(s)}</p>`;
  const lis = items.map(i => `<li>${escapeHtml(i)}</li>`).join('');
  return `<ul>${lis}</ul>`;
}

export function generateJobSheet(data) {
  const container = document.createElement('article');
  container.className = 'card job-sheet';

  const title = document.createElement('h2');
  title.textContent = data.role ? `${data.role}` : (data.name ? `Fiche de ${data.name}` : 'Fiche métier');
  container.appendChild(title);

  const meta = document.createElement('p');
  meta.className = 'muted';
  const parts = [];
  if (data.location) parts.push(escapeHtml(data.location));
  if (data.experience) parts.push(`${escapeHtml(data.experience)} ans d'expérience`);
  meta.innerHTML = parts.join(' — ');
  if (parts.length) container.appendChild(meta);

  const shortParts = [];
  if (data.role) shortParts.push(`<strong>Intitulé :</strong> ${escapeHtml(data.role)}`);
  if (data.experience) shortParts.push(`<strong>Expérience :</strong> ${escapeHtml(data.experience)} ans`);
  const mission = summarizeText(data.mainTasks || data.daily || '');
  if (mission) shortParts.push(`<strong>Mission principale :</strong> ${mission}`);
  const skillsShort = summarizeText(data.hardSkills || data.softSkills || '');
  if (skillsShort) shortParts.push(`<strong>Compétences clés :</strong> ${skillsShort}`);
  const adviceShort = summarizeText(data.commonMistakes || data.tools || '');
  if (adviceShort) shortParts.push(`<strong>Conseil principal :</strong> ${adviceShort}`);

  const shortBlock = document.createElement('div');
  shortBlock.className = 'job-summary';
  shortBlock.innerHTML = shortParts.length ? shortParts.join('<br>') : '<em>Résumé non disponible</em>';
  container.appendChild(shortBlock);

  function appendSection(headingText, htmlContent) {
    const section = document.createElement('section');
    const h = document.createElement('h3');
    h.textContent = headingText;
    section.appendChild(h);
    const div = document.createElement('div');
    div.innerHTML = htmlContent || '<em>Non renseigné</em>';
    section.appendChild(div);
    container.appendChild(section);
  }

  appendSection('Présentation', formatParagraphs(data.daily || data.value || ''));
  appendSection('Missions principales', formatAsList(data.mainTasks));

  const skillsHtml = [];
  if (data.hardSkills) skillsHtml.push(`<strong>Techniques :</strong> ${formatAsList(data.hardSkills)}`);
  if (data.softSkills) skillsHtml.push(`<strong>Comportementales :</strong> ${formatAsList(data.softSkills)}`);
  if (data.level) skillsHtml.push(`<p><strong>Niveau typique :</strong> ${escapeHtml(data.level)}</p>`);
  appendSection('Compétences', skillsHtml.join('\n'));

  const toolsCombined = [data.tools, data.techStack].filter(Boolean).join('\n');
  const envHtml = [];
  if (toolsCombined) envHtml.push(formatAsList(toolsCombined));
  if (data.workEnv) envHtml.push(`<p><strong>Environnement :</strong> ${escapeHtml(data.workEnv)}</p>`);
  appendSection('Outils et environnement', envHtml.join('\n'));

  const parcoursHtml = [];
  if (data.education) parcoursHtml.push(`<p><strong>Formation :</strong> ${escapeHtml(data.education)}</p>`);
  if (data.certs) parcoursHtml.push(`<p><strong>Certifications :</strong> ${escapeHtml(data.certs)}</p>`);
  if (data.careerPath) parcoursHtml.push(formatParagraphs(data.careerPath));
  appendSection('Parcours professionnel', parcoursHtml.join('\n'));

  appendSection('Difficultés', formatParagraphs(data.challenges));

  const positives = [];
  if (data.value) positives.push(formatParagraphs(data.value));
  if (data.kpis) positives.push(`<p><strong>Indicateurs :</strong> ${escapeHtml(data.kpis)}</p>`);
  if (data.growth) positives.push(`<p><strong>Projection :</strong> ${escapeHtml(data.growth)}</p>`);
  appendSection('Aspects positifs / Valeur apportée', positives.join('\n'));

  const adviceHtml = [];
  if (data.commonMistakes) adviceHtml.push(formatAsList(data.commonMistakes));
  if (data.tools) adviceHtml.push(`<p><strong>Conseil :</strong> privilégier ${escapeHtml((data.tools || '').split(',')[0] || '')}</p>`);
  appendSection('Conseils', adviceHtml.join('\n'));

  appendSection('Anecdote', formatParagraphs(data.anecdote));

  const footer = document.createElement('p');
  footer.className = 'muted';
  footer.textContent = 'Fiche générée à partir des réponses fournies.';
  container.appendChild(footer);

  return container;
}

export function generateMarkdown(data) {
  const lines = [];
  const title = data.role || (data.name ? `Fiche de ${data.name}` : 'Fiche métier');
  lines.push(`# ${title}`);
  if (data.location || data.experience) {
    const meta = [];
    if (data.location) meta.push(data.location);
    if (data.experience) meta.push(`${data.experience} ans`);
    if (meta.length) lines.push(`*${meta.join(' — ')}*`);
  }
  lines.push('');

  const summarize = (text) => {
    if (!text) return '';
    const s = String(text).trim();
    const m = s.match(/([^\.\!\?]+[\.\!\?])\s*/);
    return m ? m[1].trim() : (s.length < 240 ? s : s.slice(0, 240) + '...');
  };

  const shortParts = [];
  if (data.role) shortParts.push(`**Intitulé :** ${data.role}`);
  if (data.experience) shortParts.push(`**Expérience :** ${data.experience} ans`);
  const mission = summarize(data.mainTasks || data.daily || '');
  if (mission) shortParts.push(`**Mission principale :** ${mission}`);
  const skillsShort = summarize(data.hardSkills || data.softSkills || '');
  if (skillsShort) shortParts.push(`**Compétences clés :** ${skillsShort}`);
  if (shortParts.length) {
    lines.push(shortParts.join('  \n'));
    lines.push('');
  }

  function addSection(h, field, asList = false) {
    lines.push(`## ${h}`);
    if (!field) {
      lines.push('_Non renseigné_');
      lines.push('');
      return;
    }
    const s = String(field).trim();
    if (asList) {
      const items = s.split(/\r?\n|,|;/).map(i => i.trim()).filter(Boolean);
      if (items.length <= 1) {
        lines.push(s);
      } else {
        items.forEach(it => lines.push(`- ${it}`));
      }
    } else {
      const paras = s.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      paras.forEach(p => lines.push(p));
    }
    lines.push('');
  }

  addSection('Présentation', data.daily || data.value);
  addSection('Missions principales', data.mainTasks, true);
  addSection('Compétences techniques', data.hardSkills, true);
  addSection('Compétences comportementales', data.softSkills, true);
  addSection('Outils et environnement', [data.tools, data.techStack, data.workEnv].filter(Boolean).join('\n'), true);
  addSection('Parcours professionnel', [data.education ? `Formation : ${data.education}` : '', data.certs ? `Certifications : ${data.certs}` : '', data.careerPath || ''].filter(Boolean).join('\n\n'));
  addSection('Difficultés', data.challenges);
  addSection('Aspects positifs / Valeur', [data.value ? data.value : '', data.kpis ? `Indicateurs : ${data.kpis}` : '', data.growth ? `Projection : ${data.growth}` : ''].filter(Boolean).join('\n\n'));
  addSection('Conseils', [data.commonMistakes || '', data.tools ? `Conseil outils : ${data.tools.split(',')[0] || ''}` : ''].filter(Boolean).join('\n\n'));
  addSection('Anecdote', data.anecdote);

  lines.push('---');
  lines.push('*Fiche générée par Job Interview App*');

  return lines.join('\n');
}
