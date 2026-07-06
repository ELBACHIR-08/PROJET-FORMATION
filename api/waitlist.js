/**
 * Vercel Serverless Function — POST /api/waitlist
 *
 * Proxies the waitlist signup to Supabase using server-side environment
 * variables. No Supabase credentials are ever exposed to the client.
 *
 * Expected request body: { fullname: string, email: string }
 * Responses:
 *   201 — successfully inserted
 *   409 — email already registered (idempotent, treated as success by client)
 *   400 — invalid payload
 *   405 — method not allowed
 *   500 — upstream Supabase error
 */

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

/**
 * @param {import('@vercel/node').VercelRequest}  req
 * @param {import('@vercel/node').VercelResponse} res
 */
module.exports = async function handler(req, res) {
  // ── Method guard ──────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ── Environment guard ─────────────────────────────────────────────────────
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[waitlist] Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  // ── Payload validation ────────────────────────────────────────────────────
  const { fullname, email } = req.body || {};

  if (!fullname || typeof fullname !== 'string' || !fullname.trim()) {
    return res.status(400).json({ error: 'fullname is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  // ── Supabase INSERT ───────────────────────────────────────────────────────
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey:        SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer:        'return=minimal',
      },
      body: JSON.stringify({
        fullname: fullname.trim(),
        email:    email.trim(),
      }),
    });

    // Duplicate email — idempotent success
    if (response.status === 409) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    if (!response.ok) {
      const body = await response.text();
      console.error(`[waitlist] Supabase error ${response.status}:`, body);
      return res.status(500).json({ error: 'Upstream error' });
    }

    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('[waitlist] Fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
