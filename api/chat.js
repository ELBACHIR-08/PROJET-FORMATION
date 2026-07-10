const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API manquante.' });

  try {
    const { message, vertical = 'LIVE' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message manquant' });

    const { data: wikis, error } = await supabase.from('wiki_articles').select('title, content').eq('vertical', vertical);
    if (error) return res.status(500).json({ error: 'Erreur Supabase.' });

    let contextText = 'BASE DE CONNAISSANCES :\n\n';
    if (wikis && wikis.length > 0) {
      wikis.forEach(wiki => {
        contextText += '=== ' + wiki.title + ' ===\n' + wiki.content + '\n\n';
      });
    } else {
      contextText += 'Vide.\n';
    }

    const systemPrompt = `Tu es l'Assistant IA interne de Digital Virgo (projet DV-Knowledge).
Ton rôle est d'aider les collaborateurs en répondant à leurs questions de manière professionnelle, claire et concise.

RÈGLE ABSOLUE : Pour toute question technique ou métier, tu DOIS te baser EXCLUSIVEMENT sur le contexte fourni ci-dessous. 
Si la réponse ne s'y trouve pas, explique poliment que l'information n'est pas encore documentée dans le Wiki pour cette section, au lieu d'inventer une réponse.

Cependant, tu as le droit de répondre de manière naturelle aux formules de politesse (Bonjour, merci, etc.) et de présenter ton rôle si on te le demande.

Contexte (Base de connaissances interne) :
${contextText}`;

    const isOpenAI = apiKey.startsWith('sk-');
    let replyText = '';
    let apiFailed = false;

    if (isOpenAI) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.1
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn("OpenAI API failed (Quota/Limit), switching to free fallback...", data.error?.message);
        apiFailed = true;
      } else {
        replyText = data.choices[0].message.content;
      }
    } else {
      // Fallback Gemini logic
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: message }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn("Gemini API failed (Quota/Limit), switching to free fallback...", data.error?.message);
        apiFailed = true;
      } else {
        replyText = data.candidates[0].content.parts[0].text;
      }
    }

    // ULTIMATE FAIL-SAFE: Free AI endpoint (No API key required)
    if (apiFailed) {
      const fallbackResponse = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.1
        })
      });
      const fallbackData = await fallbackResponse.json();
      if (!fallbackResponse.ok) {
        return res.status(500).json({ error: "Tous les services IA sont actuellement indisponibles." });
      }
      replyText = fallbackData.choices[0].message.content;
    }

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
