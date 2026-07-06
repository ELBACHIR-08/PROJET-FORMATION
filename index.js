/**
 * Digital Virgo KMS – Coming Soon Page
 * Handles countdown timer, form validation and waitlist submission to Supabase.
 */

// ─── Supabase Configuration ────────────────────────────────────────────────
const SUPABASE_URL = 'https://eeqhmfkqjdlrscgekjha.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcWhtZmtxamRscnNjZ2VramhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyODM1NTAsImV4cCI6MjA5ODg1OTU1MH0.RB1Bgs5AUAMDtOVRvMx7N_1JGW8LQZ6LvQ6c2uItguM';

/**
 * Inserts a new row into the public.waitlist table via Supabase REST API.
 * @param {string} fullname
 * @param {string} email
 * @returns {Promise<{ok: boolean, duplicate: boolean}>}
 */
async function saveToWaitlist(fullname, email) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ fullname, email }),
  });

  // 409 Conflict = duplicate email — treat as already registered (success path)
  if (response.status === 409) {
    return { ok: true, duplicate: true };
  }

  return { ok: response.ok, duplicate: false };
}

// ─── DOM Ready ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // ── Countdown Logic ──────────────────────────────────────────────────────
  const targetDate = new Date('2026-07-13T00:00:00').getTime();

  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const difference = targetDate - Date.now();

    if (difference <= 0) {
      if (daysEl)    daysEl.textContent    = '00';
      if (hoursEl)   hoursEl.textContent   = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days    = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (daysEl)    daysEl.textContent    = String(days).padStart(2, '0');
    if (hoursEl)   hoursEl.textContent   = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── Form Handling ────────────────────────────────────────────────────────
  const form           = document.getElementById('early-access-form');
  const successMessage = document.getElementById('success-message');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullnameInput = document.getElementById('fullname');
    const emailInput    = document.getElementById('email');
    const fullnameError = document.getElementById('fullname-error');
    const emailError    = document.getElementById('email-error');
    const submitBtn     = form.querySelector('button[type="submit"]');

    let isValid = true;

    // ── Validate fullname ──
    if (!fullnameInput.value.trim()) {
      fullnameInput.parentElement.classList.add('invalid');
      fullnameError.textContent = 'Le nom complet est requis.';
      isValid = false;
    } else {
      fullnameInput.parentElement.classList.remove('invalid');
      fullnameError.textContent = '';
    }

    // ── Validate email ──
    const emailValue  = emailInput.value.trim();
    const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    if (!isValid) return;

    // ── Submit to Supabase ──
    if (submitBtn) {
      submitBtn.disabled     = true;
      submitBtn.textContent  = 'Inscription en cours…';
    }

    try {
      const { ok, duplicate } = await saveToWaitlist(
        fullnameInput.value.trim(),
        emailValue
      );

      if (!ok) {
        throw new Error('Erreur serveur lors de l\'inscription.');
      }

      if (duplicate) {
        console.info('[Waitlist] Email déjà inscrit — affichage du succès.');
      }

      showSuccess();
    } catch (err) {
      console.error('[Waitlist] Erreur :', err);
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Rejoindre la liste d\'attente';
      }
      if (emailError) {
        emailError.textContent =
          'Une erreur est survenue. Veuillez réessayer plus tard.';
      }
    }
  });

  // ── Clear validation styles on user input ──
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      const errorSpan = document.getElementById(`${input.id}-error`);
      input.parentElement.classList.remove('invalid');
      if (errorSpan) errorSpan.textContent = '';
    });
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Hides all form fields except the success message, then reveals it.
   */
  function showSuccess() {
    Array.from(form.children).forEach((child) => {
      if (child !== successMessage) child.style.display = 'none';
    });
    successMessage.style.display = 'flex';
    successMessage.setAttribute('aria-hidden', 'false');
  }
});
