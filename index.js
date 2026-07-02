document.addEventListener('DOMContentLoaded', () => {
  // Countdown Logic
  // Target date: July 13, 2026, 00:00:00
  const targetDate = new Date('2026-07-13T00:00:00').getTime();

  const daysVal = document.getElementById('days');
  const hoursVal = document.getElementById('hours');
  const minutesVal = document.getElementById('minutes');
  const secondsVal = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (daysVal) daysVal.textContent = '00';
      if (hoursVal) hoursVal.textContent = '00';
      if (minutesVal) minutesVal.textContent = '00';
      if (secondsVal) secondsVal.textContent = '00';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (daysVal) daysVal.textContent = String(days).padStart(2, '0');
    if (hoursVal) hoursVal.textContent = String(hours).padStart(2, '0');
    if (minutesVal) minutesVal.textContent = String(minutes).padStart(2, '0');
    if (secondsVal) secondsVal.textContent = String(seconds).padStart(2, '0');
  }

  // Update countdown immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Form Handling and Validation
  const form = document.getElementById('early-access-form');
  const successMessage = document.getElementById('success-message');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const fullnameInput = document.getElementById('fullname');
      const emailInput = document.getElementById('email');
      const fullnameError = document.getElementById('fullname-error');
      const emailError = document.getElementById('email-error');

      let isValid = true;

      // Validate fullname
      if (!fullnameInput.value.trim()) {
        fullnameInput.parentElement.classList.add('invalid');
        fullnameError.textContent = 'Le nom complet est requis.';
        isValid = false;
      } else {
        fullnameInput.parentElement.classList.remove('invalid');
        fullnameError.textContent = '';
      }

      // Validate email
      const emailValue = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailValue) {
        emailInput.parentElement.classList.add('invalid');
        emailError.textContent = "L'adresse e-mail professionnelle est requise.";
        isValid = false;
      } else if (!emailRegex.test(emailValue)) {
        emailInput.parentElement.classList.add('invalid');
        emailError.textContent = 'Veuillez saisir une adresse e-mail valide.';
        isValid = false;
      } else {
        emailInput.parentElement.classList.remove('invalid');
        emailError.textContent = '';
      }

      if (isValid) {
        // Hide form fields and display success message
        const formChildren = form.children;
        for (let i = 0; i < formChildren.length; i++) {
          if (formChildren[i] !== successMessage) {
            formChildren[i].style.display = 'none';
          }
        }
        
        successMessage.style.display = 'flex';
        successMessage.setAttribute('aria-hidden', 'false');
      }
    });

    // Clear validation styling on input
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const errorSpan = document.getElementById(`${input.id}-error`);
        input.parentElement.classList.remove('invalid');
        if (errorSpan) {
          errorSpan.textContent = '';
        }
      });
    });
  }
});
