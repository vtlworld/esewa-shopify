import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { refId, pid, draft_id } = req.query;

    if (!refId || !pid)
      return res.status(400).send("Missing params");

    const VERIFY_URL = "https://uat.esewa.com.np/epay/transrec";
    const MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";

    const form = new URLSearchParams();
    form.append("amt", "0"); 
    form.append("scd", MERCHANT_ID);
    form.append("rid", refId);
    form.append("pid", pid);

    const resp = await fetch(VERIFY_URL, {
      method: "POST",
      body: form
    });

    const text = await resp.text();

    if (text.includes("Success")) {
      // Mark draft order as completed
      await fetch(
        `https://${process.env.SHOPIFY_DOMAIN}/admin/api/2024-10/draft_orders/${draft_id}/complete.json`,
        {
          method: "PUT",
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      return res.send("Payment Success! Order completed.");
    }

    return res.send("Payment Failed.");
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
