// This file contains the JavaScript code for the job interview application.

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('application-form');
    const resultSection = document.getElementById('result');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const position = document.getElementById('position').value;
        const message = `Thank you, ${name}. Your application for the position of ${position} has been submitted!`;

        resultSection.textContent = message;
        form.reset();
    });
});