export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const { text } = req.body;
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'Sei LOYAH, analizza messaggi relazionali. Rispondi in JSON con pattern (max 3 parole) e advice (1 frase pratica in italiano).'
        },{
          role: 'user',
          content: text
        }],
        temperature: 0.7,
        max_tokens: 150
      })
    });
    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content || '';
    let pattern = 'evitamento soft';
    let advice = 'Osserva la coerenza tra parole e azioni.';
    try {
      const parsed = JSON.parse(content);
      pattern = parsed.pattern || pattern;
      advice = parsed.advice || advice;
    } catch {
      const lines = content.split('\n');
      pattern = lines[0]?.replace(/[^a-zA-Zàèéìòù\s]/g,'').trim() || pattern;
      advice = lines[1] || advice;
    }
    return res.status(200).json({ pattern, advice });
  } catch (e) {
    return res.status(200).json({ pattern: 'evitamento soft', advice: 'Demo: aggiungi OPENAI_API_KEY su Vercel.' });
  }
}