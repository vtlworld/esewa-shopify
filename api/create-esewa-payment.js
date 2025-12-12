import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const { draft_id, amount } = req.body;
    if (!draft_id || !amount) return res.status(400).json({ error: 'draft_id and amount required' });

    const pid = `esw_${uuidv4()}`;

    const BASE = process.env.BASE_URL ? process.env.BASE_URL.replace(/\/$/, '') : 'https://esewa-shopify.vercel.app';
    const payload = {
      pid,
      amt: Number(amount).toFixed(2),
      psc: '0',
      pdc: '0',
      tAmt: Number(amount).toFixed(2),
      scd: process.env.ESEWA_MERCHANT_ID || 'YOUR_ESEWA_MERCHANT_ID',
      su: `${BASE}/api/verify-esewa?draft_id=${draft_id}&pid=${pid}`,
      fu: `${BASE}/api/verify-esewa?draft_id=${draft_id}&pid=${pid}&status=fail`
    };

    const ESEWA_URL = process.env.NODE_ENV === 'production' ? 'https://esewa.com.np/epay/main' : 'https://uat.esewa.com.np/epay/main';

    const inputs = Object.entries(payload).map(([k,v]) => `<input type="hidden" name="${k}" value="${v}">`).join('\n');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting to eSewa</title></head><body>
      <p>Redirecting to secure payment gateway...</p>
      <form id="esewaForm" action="${ESEWA_URL}" method="POST">${inputs}<noscript><button type="submit">Continue</button></noscript></form>
      <script>document.getElementById('esewaForm').submit();</script></body></html>`;

    res.setHeader('Content-Type','text/html');
    return res.send(html);

  } catch(err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}
