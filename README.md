# esewa-shopify

This backend is a Vercel-deployable serverless project that supports:
- Creating Shopify Draft Orders (with customer & shipping)
- Generating an eSewa payment form (redirect)
- Verifying eSewa payment and completing the draft order -> creating an order
- Marking the order as paid via Shopify transactions

## Important - Environment variables (set these in Vercel)
- SHOPIFY_STORE_DOMAIN = vtlworld.myshopify.com
- SHOPIFY_ADMIN_TOKEN = <your admin token>
- ESEWA_MERCHANT_ID = <your esewa merchant id>
- BASE_URL = https://esewa-shopify.vercel.app   # placeholder; update after deploy
- NODE_ENV = development

## Deployment
1. Upload this folder to Vercel (Drag & Drop ZIP or use Vercel CLI).
2. Add the env variables above in Project Settings -> Environment Variables.
3. Deploy and test using eSewa UAT credentials (NODE_ENV != production).

## Notes
- Do NOT commit your admin token into git.
- The verify handler redirects to: https://www.vtlworld.in/pages/payment
  You can change that redirect in api/verify-esewa.js if needed.
