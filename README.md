# Miniatures de Parfum

Catalogue en ligne d'une collection de miniatures de parfum (photos, parfumeur, type, contenance, boîte),
avec un espace d'administration pour ajouter, modifier, supprimer et importer/exporter la collection.

**Stack :** Next.js 16 (App Router, Server Actions) · React 19 · Tailwind CSS 4 · Supabase (base + stockage des photos) · Vercel.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis compléter les valeurs
npm run dev                  # http://localhost:3000
```

| Commande            | Rôle                             |
| ------------------- | -------------------------------- |
| `npm run dev`       | serveur de développement         |
| `npm run build`     | build de production              |
| `npm run lint`      | ESLint                           |
| `npm run typecheck` | vérification TypeScript          |
| `npm run format`    | mise en forme du code (Prettier) |

## Variables d'environnement

Voir [.env.example](.env.example). À renseigner aussi dans Vercel (Settings > Environment Variables).

| Variable                        | Où elle sert                                 |
| ------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | adresse du projet Supabase                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lectures publiques (soumises aux règles RLS) |
| `SUPABASE_SECRET_KEY`           | écritures de l'admin, **serveur uniquement** |
| `JWT_SECRET`                    | signature du cookie de session admin         |
| `GOOGLE_CLIENT_ID`              | identifiant du client OAuth Google           |
| `GOOGLE_CLIENT_SECRET`          | secret du client OAuth Google                |
| `ADMIN_GOOGLE_EMAILS`           | adresses Google autorisées (virgules)        |

## Organisation

```
src/
  app/
    page.tsx                 accueil : collection paginée, filtre par lettre
    parfum/[id]/             fiche d'une miniature (+ édition admin)
    parfumeurs/              liste des parfumeurs, puis leurs miniatures
    recherche/               recherche + visionneuse plein écran
    gestion/                 administration (tableau éditable, import/export Excel)
    actions/                 Server Actions : connexion, écritures, import
    api/export-xlsx/         téléchargement de la collection en Excel
  components/                en-tête, barre d'onglets mobile, cartes, pagination…
  lib/
    queries.ts               lectures (côté serveur)
    session.ts               session admin (cookie JWT signé)
    storage.ts               photos dans Supabase Storage
    collection-file.ts       lecture/écriture/validation des fichiers Excel
    perfume.ts               types, libellés des types de parfum, utilitaires
```

Le navigateur ne parle jamais directement à Supabase : toutes les lectures se font côté serveur, et
toutes les écritures passent par des Server Actions qui vérifient la session admin avant d'utiliser
la clé secrète.

## Sécurité de la base Supabase (à faire une fois)

Avant cette refonte, les écritures partaient du navigateur avec la clé publique : quiconque l'ouvrait
dans la console pouvait modifier ou vider la table. Le nouveau code n'en a plus besoin, il faut donc
**fermer l'accès en écriture à la clé publique**. Ordre à respecter :

1. Ajouter `SUPABASE_SECRET_KEY` dans `.env.local` et dans Vercel.
2. Déployer le nouveau code.
3. Dans Supabase > SQL Editor, regarder les règles existantes :

   ```sql
   select schemaname, tablename, policyname, roles, cmd
   from pg_policies
   where tablename = 'perfumes' or (schemaname = 'storage' and tablename = 'objects');
   ```

4. Activer RLS sur la table et n'autoriser que la lecture publique :

   ```sql
   alter table public.perfumes enable row level security;

   -- Supprimer chaque règle qui autorise INSERT / UPDATE / DELETE (ou ALL) à anon ou public :
   -- drop policy "nom de la règle" on public.perfumes;

   create policy "Lecture publique des miniatures"
     on public.perfumes for select
     to anon, authenticated
     using (true);
   ```

5. Pour les photos (bucket `images`, public en lecture) : supprimer les règles de `storage.objects`
   qui autorisent INSERT / UPDATE / DELETE à `anon` ou `public`. La lecture des photos passe par leur
   URL publique et n'a besoin d'aucune règle.

La clé secrète ignore RLS : l'admin du site continue de fonctionner, et la clé publique ne peut plus
que lire.

## Connexion Google

Page `/connexion` → bouton « Se connecter avec Google » → choix du compte chez Google → retour sur
`/api/auth/google/callback`. Le site vérifie le jeton Google (signature, destinataire, adresse
vérifiée) puis ouvre la session admin **uniquement si l'adresse figure dans `ADMIN_GOOGLE_EMAILS`**.
Il n'y a qu'un seul compte admin : chaque adresse autorisée l'ouvre.

Réglages Google Cloud (console.cloud.google.com > Google Auth Platform) :

- **Audience** : type « Externe ». En mode « Test », ajouter chaque adresse autorisée comme
  utilisateur test (double barrière avec `ADMIN_GOOGLE_EMAILS`).
- **Clients** : client OAuth de type « Application Web », URI de redirection autorisés :
  - `https://<domaine-de-production>/api/auth/google/callback`
  - `http://localhost:3000/api/auth/google/callback`

Variables : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_GOOGLE_EMAILS` (adresses séparées par
des virgules). Pour ajouter ou retirer une adresse : modifier `ADMIN_GOOGLE_EMAILS` dans Vercel (et
la liste des utilisateurs test), puis redéployer. Tant que ces variables manquent, le bouton Google
n'est pas affiché.
