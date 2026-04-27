// Navigation helpers: step management and validation
export function showStep(steps, index, elements = {}) {
  const { currentStepEl, totalStepsEl, progressFill } = elements;
  steps.forEach((s, i) => {
    if (i === index) {
      s.hidden = false;
      requestAnimationFrame(() => s.classList.add('active'));
      s.removeAttribute('aria-hidden');
    } else {
      if (s.classList.contains('active')) {
        s.classList.remove('active');
        setTimeout(() => { if (!s.classList.contains('active')) s.hidden = true; }, 320);
      } else {
        s.hidden = true;
      }
      s.setAttribute('aria-hidden', 'true');
    }
  });
  if (currentStepEl) currentStepEl.textContent = String(index + 1);
  if (totalStepsEl) totalStepsEl.textContent = String(steps.length);
  if (progressFill) {
    const pct = Math.round(((index + 1) / steps.length) * 100);
    progressFill.style.width = pct + '%';
    const bar = progressFill.parentElement;
    if (bar) bar.setAttribute('aria-valuenow', String(pct));
  }
}

export function showError(control, message) {
  clearError(control);
  control.classList.add('input-error');
  control.setAttribute('aria-invalid', 'true');
  const err = document.createElement('div');
  err.className = 'error-text';
  err.setAttribute('role', 'alert');
  err.textContent = message;
  control.insertAdjacentElement('afterend', err);
}

export function clearError(control) {
  control.classList.remove('input-error');
  control.removeAttribute('aria-invalid');
  const next = control.nextElementSibling;
  if (next && next.classList && next.classList.contains('error-text')) next.remove();
}

export function validateStep(steps, index) {
  const step = steps[index];
  const controls = Array.from(step.querySelectorAll('input,textarea,select'));
  let ok = true;
  for (const el of controls) {
    clearError(el);
    if (el.hasAttribute('required')) {
      const val = (el.value || '').toString().trim();
      if (!val) {
        showError(el, 'Ce champ est requis.');
        if (ok) el.focus();
        ok = false;
      } else if (el.type === 'email') {
        const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!re.test(val)) {
          showError(el, 'Adresse e-mail invalide.');
          if (ok) el.focus();
          ok = false;
        }
      }
    }
  }
  return ok;
}

export function attachControls(steps, showStepFn, validateStepFn, form, elements = {}) {
  steps.forEach((stepEl, i) => {
    if (stepEl.querySelector('.step-controls')) return;
    const ctrl = document.createElement('div');
    ctrl.className = 'controls step-controls';
    ctrl.style.marginTop = '12px';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'btn btn-ghost';
    prev.textContent = 'Précédent';
    prev.addEventListener('click', () => {
      if (i > 0) {
        const curControls = Array.from(steps[i].querySelectorAll('input,textarea,select'));
        curControls.forEach(clearError);
        // Call showStepFn with compatible signature: either (steps, index, elements) or (index, elements)
        if (typeof showStepFn === 'function') {
          if (showStepFn.length >= 3) showStepFn(steps, i - 1, elements);
          else showStepFn(i - 1, elements);
        }
      }
    });
    if (i === 0) prev.disabled = true;
    ctrl.appendChild(prev);

    if (i < steps.length - 1) {
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn btn-primary';
      next.textContent = 'Suivant';
      next.addEventListener('click', () => {
        if (!validateStepFn(steps, i)) return;
        if (typeof showStepFn === 'function') {
          if (showStepFn.length >= 3) showStepFn(steps, i + 1, elements);
          else showStepFn(i + 1, elements);
        }
      });
      ctrl.appendChild(next);
    } else {
      const finish = document.createElement('button');
      finish.type = 'button';
      finish.className = 'btn btn-primary';
      finish.textContent = 'Terminer';
      finish.addEventListener('click', () => {
        if (!validateStepFn(steps, i)) return;
        form.requestSubmit();
      });
      ctrl.appendChild(finish);
    }

    stepEl.appendChild(ctrl);
  });
}
