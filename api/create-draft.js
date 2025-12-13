import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).send("Method Not Allowed");

  try {
    const { items, customer, shipping_address } = req.body;

    const draftOrder = {
      line_items: items,
      customer,
      shipping_address,
      use_customer_default_address: false,
      tags: ["esewa-payment"],
      note: "Draft order for eSewa checkout",
      shipping_line: {
        title: "Standard Shipping",
        price: "0.00"
      }
    };

    const response = await fetch(
      `https://${process.env.SHOPIFY_DOMAIN}/admin/api/2024-10/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draft_order: draftOrder }),
      }
    );

    const data = await response.json();
    return res.status(200).json({ draft: data.draft_order });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
