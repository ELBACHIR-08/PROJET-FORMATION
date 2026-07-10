const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || "Erreur Gemini API" });

    return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
