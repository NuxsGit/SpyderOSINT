# Documentation — SpyderOSINT

> Outil web d'OSINT (Open Source Intelligence) permettant de rechercher et
> corréler des informations publiques à partir d'une entrée utilisateur
> (email, IP, identifiant Discord, adresse, nom d'utilisateur).

Ce document décrit l'architecture, les routes, les modules internes et
l'état actuel du projet.

---

## 1. Vue d'ensemble

| Élément        | Détail                                                        |
| -------------- | ------------------------------------------------------------- |
| **Nom**        | `spyderosint`                                                 |
| **Type**       | Application web full-stack (SSR)                              |
| **Framework**  | [Astro](https://astro.build) v7 (`output: 'server'`)          |
| **Adaptateur** | `@astrojs/node` en mode `middleware`                          |
| **Langage**    | TypeScript (ESM)                                              |
| **Node**       | `>= 22.12.0`                                                  |
| **Auth**       | Sessions par cookie + OAuth Discord (via `arctic`/`oslo`)     |
| **DB**         | `better-sqlite3` (prévue, non encore câblée)                  |
| **Hachage**    | `argon2` (prévu, non encore câblé)                            |

### Dépendances principales
- `astro` — framework
- `@astrojs/node` — adaptateur serveur Node
- `arctic` / `oslo` — gestion OAuth & sessions
- `argon2` — hachage de mots de passe (à venir)
- `better-sqlite3` — base de données locale (à venir)

---

## 2. Structure du projet

```text
SpyderOSINT/
├── public/                     # Assets statiques servis tels quels
├── src/
│   ├── lib/                    # Logique métier réutilisable
│   │   ├── auth.ts             # Helpers de session (TODO: implémentation réelle)
│   │   ├── oauth/
│   │   │   ├── discord.ts      # Flux OAuth Discord (auth URL, token, user)
│   │   │   └── types.ts        # Types Discord / AppUser
│   │   ├── parsers/
│   │   │   └── inputDetector.ts# Détection du type d'entrée (regex)
│   │   └── utils/
│   │       └── sseHelpers.ts   # Encodage d'événements Server-Sent Events
│   ├── pages/
│   │   ├── index.astro         # Page d'accueil (UI de recherche)
│   │   ├── dashboard.astro     # Tableau de bord (protégé)
│   │   ├── login.astro         # Connexion
│   │   ├── register.astro      # Inscription
│   │   └── api/                # Routes API (SSR)
│   │       ├── search.ts       # Détection de type + modules à lancer
│   │       ├── auth/
│   │       │   ├── login.ts    # Login email/mot de passe (démo)
│   │       │   ├── register.ts # Inscription (démo)
│   │       │   ├── me.ts       # Session courante
│   │       │   └── oauth/
│   │       │       ├── discord.ts        # Redirection vers Discord
│   │       │       ├── logout.ts         # Déconnexion
│   │       │       └── discord/
│   │       │           └── callback.ts   # Callback OAuth Discord
│   │       └── stream/
│   │           └── discord.ts  # Stream SSE des modules Discord
│   └── (components/, styles/)  # Alias configurés mais dossiers non présents
├── astro.config.mjs            # Config Astro + alias Vite
├── package.json
├── tsconfig.json
└── README.md
```

### Alias configurés (`astro.config.mjs`)
| Alias          | Cible                  |
| -------------- | ---------------------- |
| `@lib`         | `./src/lib`            |
| `@components`  | `./src/components`     |
| `@styles`      | `./src/styles`         |

> ⚠️ Les dossiers `@components` et `@styles` n'existent pas encore.

---

## 3. Fonctionnalités

### 3.1 Détection automatique de l'entrée (`inputDetector.ts`)
La fonction `detectInputType(input)` classe une chaîne dans l'un des types :

| Type          | Pattern / méthode                              | Confiance |
| ------------- | ---------------------------------------------- | --------- |
| `email`       | Regex email RFC 5322 simplifié                 | high      |
| `ip`          | IPv4/IPv6 + validation des octets (IPv4)       | high      |
| `discord_id`  | Snowflake 17–19 chiffres                       | high      |
| `address`     | Numéro + mot-clé de voirie (rue, avenue…)      | medium    |
| `username`    | Alphanumérique + tirets/underscores (2–50)     | medium/low|

Chaque type est associé à une liste de **modules** (`MODULE_MAP`) qui
seront exécutés (ex. `email` → `hibp`, `holehe`, `google_profile`…).

### 3.2 Recherche (`POST /api/search`)
1. Valide la longueur minimale (≥ 2 caractères).
2. Appelle `detectInputType`.
3. Retourne le type détecté, la confiance, la liste de modules,
   et une `streamUrl` vers le flux SSE correspondant.

### 3.3 Streaming SSE (`/api/stream/*`)
Les résultats sont diffusés en temps réel via **Server-Sent Events**
(`sseHelpers.ts` → `encodeSSE`).
- `GET /api/stream/discord?q=<id>` : décodage Snowflake + lookup via
  l'API publique `discordlookup.mesalytic.moe`.

### 3.4 Authentification
- **Email / mot de passe** (`/api/auth/login`, `/api/auth/register`) :
  validation basique, puis **session démo** encodée en base64 dans un
  cookie `sessionId` (httpOnly, secure en prod, 7 jours).
- **OAuth Discord** :
  - `GET /api/auth/oauth/discord` → redirection vers l'écran d'autorisation.
  - `GET /api/auth/oauth/discord/callback` → échange du code, récupération
    du profil, création de session.
- **Session** : `getSession()` / `createSession()` / `destroySession()`
  dans `lib/auth.ts` (logique réelle à implémenter).
- **Déconnexion** : `/api/auth/oauth/logout`.
- **Session courante** : `/api/auth/me`.

### 3.5 Pages
| Route            | Rôle                                  |
| ---------------- | ------------------------------------- |
| `/`              | Accueil + moteur de recherche (UI)    |
| `/dashboard`     | Tableau de bord (redirige si pas de session) |
| `/login`         | Connexion                             |
| `/register`      | Inscription                           |

---

## 4. Variables d'environnement

| Variable                  | Usage                              |
| ------------------------- | ---------------------------------- |
| `DISCORD_CLIENT_ID`       | ID client OAuth Discord            |
| `DISCORD_CLIENT_SECRET`   | Secret OAuth Discord               |
| `DISCORD_REDIRECT_URI`    | URI de redirection OAuth           |
| `NODE_ENV`                | Active le flag `secure` des cookies|
| `SESSION_SECRET`          | (à venir) secret de signature JWT  |

---

## 5. Commandes

```sh
npm install        # Installe les dépendances
npm run dev        # Serveur de dev (Astro) — voir AGENTS.md pour le mode background
npm run build      # Build de production (./dist)
npm run preview    # Prévisualise le build
npm run astro      # CLI Astro (check, add…)
```

> Selon `AGENTS.md`, lancer le dev server en arrière-plan :
> `astro dev --background` (gestion via `astro dev stop` / `status` / `logs`).

---

## 6. État d'avancement & TODO

Le projet est à **l'état de prototype / squelette** : beaucoup de
fonctions critiques sont stubées (marquées `TODO`).

- [ ] **Auth réelle** : `verifyCredentials`, `createUser`, `createSession`
      utilisent des placeholders. Brancher `better-sqlite3` + `argon2`.
- [ ] **Persistance** : aucune base de données n'est encore interrogée.
- [ ] **Modules OSINT** : seuls `discord` (SSE) est partiellement implémenté.
      Les modules `hibp`, `holehe`, `shodan`, `geolocation`, etc. sont
      déclarés dans `MODULE_MAP` mais non codés.
- [ ] **Module manquant** : `src/pages/api/stream/discord.ts` importe
      `../../../lib/modules/discord/snowflake` — ce fichier/dossier
      **n'existe pas** (build en erreur sur cette route). À créer ou corriger.
- [ ] **Pages protégées** : `dashboard.astro` redirige vers `/register`
      si pas de session (logique à revoir).
- [ ] **Dossiers manquants** : `@components` et `@styles` référencés mais
      absents.

---

## 7. Notes de sécurité

- Les sessions de démo (`login.ts`, `callback.ts`) encodent des données
  en **base64 sans signature** : non sécurisé, uniquement pour le prototype.
- `secure: true` sur les cookies n'est activé qu'en production.
- Les secrets OAuth ne doivent **jamais** être commités ; utiliser un
  fichier `.env` (non présent actuellement).
