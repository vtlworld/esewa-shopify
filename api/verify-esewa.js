import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { draft_id, pid } = req.query;
    if (!draft_id || !pid) return res.status(400).send('Missing params');

    const VERIFY_URL = process.env.NODE_ENV === 'production' ? 'https://esewa.com.np/epay/transrec' : 'https://uat.esewa.com.np/epay/transrec';
    const form = new URLSearchParams();
    form.append('pid', pid);
    form.append('scd', process.env.ESEWA_MERCHANT_ID || 'YOUR_ESEWA_MERCHANT_ID');

    const vresp = await fetch(VERIFY_URL, { method:'POST', body: form });
    const vtext = await vresp.text();

    const success = /Success/i.test(vtext);

    if (!success) {
      console.warn('eSewa verify failed', vtext);
      return res.redirect('/pages/payment?status=fail&draft_id=' + encodeURIComponent(draft_id));
    }

    const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
    const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

    if (!SHOP || !TOKEN) {
      return res.redirect('/pages/payment?status=error&draft_id=' + encodeURIComponent(draft_id));
    }

    // Complete draft order
    const completeResp = await fetch(`https://${SHOP}/admin/api/2024-10/draft_orders/${draft_id}/complete.json`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'X-Shopify-Access-Token': TOKEN },
      body: JSON.stringify({})
    });

    if (!completeResp.ok) {
      const txt = await completeResp.text();
      console.error('Draft complete failed', txt);
      return res.redirect('/pages/payment?status=error&draft_id=' + encodeURIComponent(draft_id));
    }

    const completeData = await completeResp.json();
    const order_id = completeData?.order?.id || completeData?.draft_order?.order_id || null;

    if (!order_id) {
      return res.redirect('/pages/payment?status=success&draft_id=' + encodeURIComponent(draft_id));
    }

    // Create transaction (optional)
    const r = await fetch(`https://${SHOP}/admin/api/2024-10/orders/${order_id}.json`, {
      headers: { 'X-Shopify-Access-Token': TOKEN }
    });
    const ord = await r.json();
    const amount = Number(ord.order.current_total_price || ord.order.total_price || 0).toFixed(2);

    const txPayload = { transaction: { kind: 'capture', status: 'success', amount } };
    await fetch(`https://${SHOP}/admin/api/2024-10/orders/${order_id}/transactions.json`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'X-Shopify-Access-Token': TOKEN },
      body: JSON.stringify(txPayload)
    }).catch(e => console.error('tx error', e));

    // Redirect to your Shopify success page
    return res.redirect('https://www.vtlworld.in/pages/payment?status=success&order_id=' + encodeURIComponent(order_id));

  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
}
