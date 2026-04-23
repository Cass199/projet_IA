import { formData, nameToKey, saveToStorage, loadFromStorage, initFormDataFromForm, bindFieldsToFormData, resetFormData } from './data.js';
import { showStep, attachControls, validateStep, clearError } from './nav.js';
import { generateJobSheet, generateMarkdown } from './sheet.js';
import { showToast, copyTextToClipboard, downloadBlob, sanitizeFilename } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-interview');
  const skipIntro = document.getElementById('skip-intro');
  const intro = document.getElementById('intro-screen');
  const form = document.getElementById('application-form');
  const steps = Array.from(form.querySelectorAll('.step'));
  const currentStepEl = document.getElementById('current-step');
  const totalStepsEl = document.getElementById('total-steps');
  const progressFill = document.getElementById('progress-fill');
  const resultSection = document.getElementById('result');
  const resetBtn = document.getElementById('reset-btn');

  let current = 0;

  // prepare UI
  intro.hidden = false;
  form.hidden = true;
  resultSection.hidden = true;
  if (totalStepsEl) totalStepsEl.textContent = String(steps.length);
  if (progressFill) progressFill.style.width = '0%';

  // inject per-step controls
  attachControls(steps, showStep, validateStep, form);

  // load saved draft and bind fields
  const loaded = loadFromStorage(form);
  bindFieldsToFormData(form, clearError);
  if (!loaded) initFormDataFromForm(form);

  // ensure steps ready for transitions
  steps.forEach(s => { s.hidden = false; s.classList.remove('active'); s.setAttribute('aria-hidden', 'true'); });

  function showStepWrapper(idx) {
    current = idx;
    showStep(steps, idx, { currentStepEl, totalStepsEl, progressFill });
  }

  // Form submit: render sheet and controls
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(steps, current)) return;
    initFormDataFromForm(form);

    form.hidden = true;
    resultSection.hidden = false;
    resultSection.innerHTML = '';

    const sheet = generateJobSheet(formData);
    resultSection.appendChild(sheet);

    const ctrl = document.createElement('div');
    ctrl.className = 'controls';
    ctrl.style.marginTop = '14px';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn btn-primary';
    copyBtn.textContent = 'Copier la fiche';
    copyBtn.addEventListener('click', async () => {
      try {
        const text = sheet.innerText.trim();
        await copyTextToClipboard(text);
        showToast('Fiche copiée dans le presse-papiers');
      } catch (err) {
        console.warn('Copy failed', err);
        showToast('Impossible de copier la fiche');
      }
    });
    ctrl.appendChild(copyBtn);

    const exportBtn = document.createElement('button');
    exportBtn.type = 'button';
    exportBtn.className = 'btn btn-ghost';
    exportBtn.textContent = 'Exporter en Markdown';
    exportBtn.addEventListener('click', () => {
      try {
        const md = generateMarkdown(formData);
        const name = sanitizeFilename(formData.role || 'fiche-metier');
        downloadBlob(md, `${name}.md`, 'text/markdown;charset=utf-8');
        showToast('Export Markdown téléchargé');
      } catch (err) {
        console.warn('Export failed', err);
        showToast('Impossible d’exporter la fiche');
      }
    });
    ctrl.appendChild(exportBtn);

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-ghost';
    editBtn.textContent = 'Modifier les réponses';
    editBtn.addEventListener('click', () => {
      resultSection.hidden = true;
      form.hidden = false;
      showStepWrapper(current);
      const first = steps[current].querySelector('input,textarea,select');
      if (first) first.focus();
    });
    ctrl.appendChild(editBtn);

    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.className = 'btn btn-ghost';
    restartBtn.textContent = 'Nouvelle saisie';
    restartBtn.addEventListener('click', () => {
      resultSection.hidden = true;
      form.hidden = false;
      form.reset();
      Object.keys(formData).forEach(k => formData[k] = '');
      try { localStorage.removeItem('jobInterviewFormData_v1'); } catch (e) {}
      showStepWrapper(0);
      const first = steps[0].querySelector('input,textarea,select');
      if (first) first.focus();
    });
    ctrl.appendChild(restartBtn);

    resultSection.appendChild(ctrl);
  });

  // Start / skip
  startBtn.addEventListener('click', () => {
    intro.hidden = true;
    form.hidden = false;
    showStepWrapper(0);
  });
  skipIntro.addEventListener('click', () => {
    intro.hidden = true;
    form.hidden = false;
    showStepWrapper(0);
  });

  // Reset confirmation
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const ok = window.confirm('Confirmez-vous la suppression de toutes les réponses ? Cette action est irréversible.');
      if (ok) {
        resetFormData(form);
        resultSection.hidden = true;
        form.hidden = true;
        intro.hidden = false;
        if (progressFill) progressFill.style.width = '0%';
        showStepWrapper(0);
        if (startBtn) startBtn.focus();
      }
    });
  }
});
