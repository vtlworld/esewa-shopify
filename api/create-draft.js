import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method Not Allowed'});
  try {
    const body = req.body;
    const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
    const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

    if (!SHOP || !TOKEN) return res.status(500).json({error:'Missing SHOP or TOKEN env variables'});

    const line_items = (body.items || []).map(i => ({
      variant_id: i.variant_id, quantity: Number(i.quantity || 1)
    }));

    const draftPayload = {
      draft_order: {
        line_items,
        note: body.note || '',
        use_customer_default_address: false,
        customer: {
          email: (body.customer && body.customer.email) || '',
          first_name: (body.customer && body.customer.first_name) || '',
          last_name: (body.customer && body.customer.last_name) || ''
        },
        shipping_address: body.shipping_address || {},
        applied_discount: null
      }
    };

    const resp = await fetch(`https://${SHOP}/admin/api/2024-10/draft_orders.json`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'X-Shopify-Access-Token': TOKEN },
      body: JSON.stringify(draftPayload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(500).json({error:'Shopify create draft failed', detail: txt});
    }

    const data = await resp.json();
    return res.json({ draft: data.draft_order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({error:String(err)});
  }
}
