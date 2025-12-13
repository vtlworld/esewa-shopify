import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).send("Method Not Allowed");

  try {
    const { draft_id, amount } = req.query;

    if (!draft_id || !amount)
      return res.status(400).send("Missing params");

    const MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
    const BASE = process.env.BASE_URL;

    const esewaRedirectURL =
      `https://uat.esewa.com.np/epay/main?` +
      `amt=${amount}` +
      `&pdc=0` +
      `&psc=0` +
      `&txAmt=0` +
      `&tAmt=${amount}` +
      `&scd=${MERCHANT_ID}` +
      `&pid=${draft_id}` +
      `&su=${BASE}/api/verify-esewa?draft_id=${draft_id}` +
      `&fu=${BASE}/api/verify-esewa?draft_id=${draft_id}`;

    return res.redirect(esewaRedirectURL);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
