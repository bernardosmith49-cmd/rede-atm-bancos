<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/628520f1-bb36-4aec-9f61-27360c95494d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Supabase / Relatórios em tempo real

O aplicativo agora usa Supabase para publicar e receber relatórios comunitários de ATM.

### Variáveis de ambiente

Configure no Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Realtime

Se a tabela `atm_reports` foi criada pelo SQL Editor, execute `supabase/realtime.sql` uma única vez no SQL Editor do Supabase.

A chave usada no navegador deve ser a Publishable key (ou antiga anon key). Nunca use a Secret/service_role key no frontend.
