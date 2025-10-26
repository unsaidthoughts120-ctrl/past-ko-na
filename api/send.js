// api/send.js
export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { message, nick } = req.body || {};
  if (!message || message.trim().length === 0)
    return res.status(400).json({ error: 'Message cannot be empty' });

  const BOT = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;
  if (!BOT || !CHAT)
    return res.status(500).json({ error: 'Server not configured' });

  const text = `📬 *Anonymous Message Received*\n\n${message.slice(0,2000)}\n\n${nick ? `— ${nick.slice(0,50)}` : ''}`;

  try {
    const payload = new URLSearchParams();
    payload.append('chat_id', CHAT);
    payload.append('text', text);
    payload.append('parse_mode', 'Markdown');

    const telegramRes = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
      method: 'POST',
      body: payload
    });

    const telegramJson = await telegramRes.json();
    if (!telegramJson.ok) {
      console.error('Telegram error:', telegramJson);
      return res.status(500).json({ error: 'Telegram API failed' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
