# IntraBot — Frontend

Interface Next.js pour le chatbot RAG documentaire IntraBot.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- Zéro dépendance UI externe — CSS custom uniquement

## Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ingest/route.ts     ← Proxy → intrabot-ingestion :8001/ingest
│   │   ├── search/route.ts     ← Proxy → intrabot-search :8002/api/v1/search
│   │   └── health/route.ts     ← Health check des deux services
│   ├── chat/page.tsx           ← Page de recherche (interface principale)
│   ├── ingestion/page.tsx      ← Page de déclenchement d'ingestion
│   ├── layout.tsx              ← Shell avec sidebar
│   └── globals.css             ← Design system complet
├── components/
│   ├── layout/Sidebar.tsx
│   ├── chat/MessageBubble.tsx
│   ├── chat/SourceList.tsx
│   └── ui/StatusBar.tsx
├── services/
│   ├── ingestion.ts            ← Appels directs vers :8001
│   └── search.ts               ← Appels directs vers :8002
└── types/index.ts              ← Contrats d'API TypeScript
```

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local si les services tournent sur d'autres ports

# 3. Lancer en développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

## Passer à l'orchestrateur

Quand l'orchestrateur sera disponible, modifier uniquement `.env.local` :

```env
NEXT_PUBLIC_INGESTION_URL=http://localhost:XXXX
NEXT_PUBLIC_SEARCH_URL=http://localhost:XXXX
```

Aucune modification de code nécessaire.

## Pages

| Route | Description |
|---|---|
| `/` | Redirige vers `/chat` |
| `/chat` | Interface de recherche documentaire RAG |
| `/ingestion` | Déclenchement de l'ingestion des documents |

## API Routes (BFF)

| Route | Méthode | Description |
|---|---|---|
| `/api/search` | POST | Proxy vers le service de recherche |
| `/api/ingest` | POST | Proxy vers le service d'ingestion |
| `/api/health` | GET | État des deux microservices |

---

*Université Paris Dauphine — Projet IntraBot — 2025-2026*
