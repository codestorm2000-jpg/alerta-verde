# Alerta Verde — Dashboard

Dashboard de monitoreo de anomalias en paneles solares.

## Setup local
```bash
npm install
cp .env.example .env.local
# Editar .env.local con las credenciales de Supabase
npm run dev
```

## Variables de entorno (configurar en Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Deploy
```bash
git push origin main  # Vercel despliega automaticamente
```
