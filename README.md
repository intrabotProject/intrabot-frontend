# IntraBot — Frontend

Interface Next.js pour le chatbot RAG documentaire IntraBot.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- Zéro dépendance UI externe — CSS custom uniquement

## Architecture

```
[Frontend :3000]  →  [Gateway :8000]  →  ingestion :8001 / search :8002
```

Le frontend appelle directement l'orchestrateur. Il n'y a plus de couche BFF/proxy dans Next.js.

## Structure

```
src/
├── app/
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
│   └── gateway.ts              ← Appels vers l'orchestrateur :8000
└── types/index.ts              ← Contrats d'API TypeScript
```

## Démarrage

```bash
# 1. Démarrer les services backend (ingestion, search, gateway)

# 2. Installer les dépendances frontend
npm install

# 3. Configurer les variables d'environnement
cp .env.local.example .env.local

# 4. Lancer en développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

## Configuration

| Variable | Défaut | Description |
|---|---|---|
| `NEXT_PUBLIC_GATEWAY_URL` | `http://localhost:8000` | URL de l'orchestrateur API |

## Pages

| Route | Description |
|---|---|
| `/` | Redirige vers `/chat` |
| `/chat` | Interface de recherche documentaire RAG |
| `/ingestion` | Déclenchement de l'ingestion des documents |

---

*Université Paris Dauphine — Projet IntraBot — 2025-2026*
