import { showToast } from './utils.js';

export const STORAGE_KEY = 'jobInterviewFormData_v1';

export const formData = {
  name: '', role: '', email: '', location: '', experience: '', daily: '', mainTasks: '', hardSkills: '', softSkills: '', level: '', tools: '', workEnv: '', techStack: '', education: '', certs: '', careerPath: '', challenges: '', commonMistakes: '', value: '', kpis: '', growth: '', anecdote: '', publish: ''
};

export const nameToKey = {
  'name': 'name', 'role': 'role', 'email': 'email', 'location': 'location', 'experience': 'experience', 'daily': 'daily', 'main-tasks': 'mainTasks', 'hard-skills': 'hardSkills', 'soft-skills': 'softSkills', 'level': 'level', 'tools': 'tools', 'work-env': 'workEnv', 'tech-stack': 'techStack', 'education': 'education', 'certs': 'certs', 'career-path': 'careerPath', 'challenges': 'challenges', 'common-mistakes': 'commonMistakes', 'value': 'value', 'kpis': 'kpis', 'growth': 'growth', 'anecdote': 'anecdote', 'publish': 'publish'
};

export function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  } catch (err) {
    // Do not break the UX on storage failure
    // eslint-disable-next-line no-console
    console.warn('Impossible de sauvegarder les réponses dans localStorage', err);
  }
}

export function loadFromStorage(form) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return false;
    Object.keys(formData).forEach(k => {
      if (Object.prototype.hasOwnProperty.call(saved, k)) formData[k] = saved[k] == null ? '' : String(saved[k]);
    });
    // populate fields
    const fields = Array.from(form.querySelectorAll('input[name],textarea[name],select[name]'));
    fields.forEach(f => {
      const key = nameToKey[f.name];
      if (!key) return;
      if (formData[key] !== undefined) f.value = formData[key];
    });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Erreur lors du chargement depuis localStorage', err);
    return false;
  }
}

export function initFormDataFromForm(form) {
  const fields = Array.from(form.querySelectorAll('input[name],textarea[name],select[name]'));
  fields.forEach(f => {
    const key = nameToKey[f.name];
    if (!key) return;
    formData[key] = f.value || '';
  });
}

export function resetFormData(form) {
  try {
    form.reset();
    Object.keys(formData).forEach(k => formData[k] = '');
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    showToast('Toutes les réponses ont été supprimées');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Reset failed', err);
  }
}

export function bindFieldsToFormData(form, clearErrorFn) {
  const fields = Array.from(form.querySelectorAll('input[name],textarea[name],select[name]'));
  fields.forEach((f) => {
    const key = nameToKey[f.name];
    if (!key) return;
    const handler = () => {
      formData[key] = f.value;
      if (typeof clearErrorFn === 'function') clearErrorFn(f);
      saveToStorage();
    };
    f.addEventListener('input', handler);
    f.addEventListener('change', handler);
  });
}
