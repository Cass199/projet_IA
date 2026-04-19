document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-interview');
    const skipIntro = document.getElementById('skip-intro');
    const intro = document.getElementById('intro-screen');
    const form = document.getElementById('application-form');
    const steps = Array.from(form.querySelectorAll('.step'));
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const currentStepEl = document.getElementById('current-step');
    const resultSection = document.getElementById('result');

    let current = 0;

    function showStep(index) {
        steps.forEach((s, i) => {
            s.hidden = i !== index;
        });
        current = index;
        currentStepEl.textContent = String(index + 1);

        prevBtn.disabled = index === 0;
        // Show submit on last step
        if (index === steps.length - 1) {
            nextBtn.hidden = true;
            submitBtn.hidden = false;
        } else {
            nextBtn.hidden = false;
            submitBtn.hidden = true;
        }
    }

    function validateStep(index) {
        const step = steps[index];
        const controls = Array.from(step.querySelectorAll('input,textarea,select'));
        for (const el of controls) {
            if (el.hasAttribute('required') && !el.value.trim()) {
                el.focus();
                return false;
            }
        }
        return true;
    }

    startBtn.addEventListener('click', () => {
        intro.hidden = true;
        form.hidden = false;
        showStep(0);
    });

    skipIntro.addEventListener('click', () => {
        intro.hidden = true;
        form.hidden = false;
        showStep(0);
    });

    prevBtn.addEventListener('click', () => {
        if (current > 0) showStep(current - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (!validateStep(current)) return;
        if (current < steps.length - 1) showStep(current + 1);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateStep(current)) return;

        // Collect values
        const data = {};
        const fields = Array.from(form.querySelectorAll('input,textarea,select'));
        fields.forEach((f) => {
            if (!f.name) return;
            data[f.name] = f.value;
        });

        // Show a summary
        form.hidden = true;
        resultSection.hidden = false;
        resultSection.innerHTML = '';

        const heading = document.createElement('h3');
        heading.textContent = 'Merci — Résumé des réponses';
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(data, null, 2);
        resultSection.appendChild(heading);
        resultSection.appendChild(pre);

        console.log('Interview data:', data);

        // Add a restart button
        const restart = document.createElement('button');
        restart.className = 'btn btn-ghost';
        restart.textContent = 'Recommencer';
        restart.addEventListener('click', () => {
            resultSection.hidden = true;
            form.hidden = false;
            form.reset();
            showStep(0);
        });
        resultSection.appendChild(restart);
    });

    // Initialize: keep intro visible and form hidden
    intro.hidden = false;
    form.hidden = true;
    resultSection.hidden = true;
});