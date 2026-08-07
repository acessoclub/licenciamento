const TO_EMAIL = process.env.TO_EMAIL || 'devacessoclub@gmail.com';
const FROM_EMAIL =
  process.env.FROM_EMAIL || 'Licenciamento Acesso Club <noreply@acessoclub.com>';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label, value) {
  return `<tr><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #eee;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(value)}</td></tr>`;
}

function buildHtml(payload) {
  const extra = Object.entries(payload)
    .filter(([key]) =>
      ![
        'nome',
        'telefone',
        'email',
        'cidade',
        'estado',
        'populacao',
      ].includes(key),
    )
    .map(([key, value]) => row(key, value))
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:Arial,sans-serif;line-height:1.5;color:#111;max-width:640px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;margin:0 0 16px;">Nova candidatura — Licenciamento</h1>
  <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
    ${row('Nome', payload.nome)}
    ${row('Telefone', payload.telefone)}
    ${row('E-mail', payload.email)}
    ${row('Cidade', payload.cidade)}
    ${row('Estado', payload.estado)}
    ${row('População', payload.populacao)}
    ${extra}
  </table>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(503).json({ error: 'Email service unavailable' });
  }

  const body = req.body ?? {};
  const nome = String(body.nome ?? '').trim();
  const telefone = String(body.telefone ?? '').trim();
  const email = String(body.email ?? '').trim();
  const cidade = String(body.cidade ?? '').trim();
  const estado = String(body.estado ?? '').trim();

  if (!nome || !telefone || !email || !cidade || !estado) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const subject = `[Licenciamento] Candidatura — ${nome} (${cidade}/${estado})`;
  const html = buildHtml(body);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: [email],
        subject,
        html,
        tags: [{ name: 'type', value: 'licenciamento-candidatura' }],
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Resend error', response.status, data);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (error) {
    console.error('Candidatura email error', error);
    return res.status(502).json({ error: 'Failed to send email' });
  }
};
