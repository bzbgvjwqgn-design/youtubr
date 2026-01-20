# Deploying Youtubr to Vercel

This file contains quick deploy steps and the environment variables required to run the app in production on Vercel.

## Required Environment Variables (Vercel)
- NEXT_PUBLIC_APP_URL (e.g. https://your-app.vercel.app)
- DATABASE_URL (postgres connection string)
- NEXT_PUBLIC_CASHFREE_KEY_ID
- CASHFREE_SECRET_KEY
- NEXT_PUBLIC_CASHFREE_MODE (TEST or PROD)
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID (optional)
- GOOGLE_CLIENT_SECRET (optional)

## Deploy via Vercel Dashboard
1. Push repository to GitHub.
2. In Vercel, click "New Project" and import this repository.
3. In Project Settings -> Environment Variables, add the keys above.
4. Deploy. Vercel will build with `npm run build`.

## Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```
When prompted, configure environment variables through the dashboard or `vercel env add`.

## Webhook
Set Cashfree webhook to: `https://<your-deploy-domain>/api/payments/webhook`

## Notes
- Use a production Postgres instance for `DATABASE_URL`.
- Ensure Cashfree account is configured for UPI AutoPay if you plan to offer subscriptions.
