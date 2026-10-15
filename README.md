# FormaCAD Studio

## Lancer en local sur macOS

1. Installe Node.js LTS depuis https://nodejs.org si Node.js et npm ne sont pas déjà installés.
2. Télécharge ce dépôt avec **Code → Download ZIP**, puis décompresse-le.
3. Ouvre Terminal et place-toi dans le dossier extrait.
4. Exécute :

   ```bash
   chmod +x start-local.command
   ./start-local.command
   ```

5. Le navigateur s'ouvre sur http://localhost:5173/. Laisse Terminal ouvert pendant l'utilisation.

Le premier lancement installe les dépendances automatiquement. Une connexion Internet est nécessaire pour cette installation et pour les modules Supabase chargés à la demande.

## Lancer manuellement

```bash
npm install
npm run dev
```

Pour vérifier la compilation de production :

```bash
npm run build
npm run preview
```

## GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` construit l'application puis déploie `dist/` à chaque push sur `main`.

Dans **Settings → Pages**, sélectionne **GitHub Actions** comme source de publication si ce n'est pas déjà fait. Puis ouvre l'onglet **Actions** pour vérifier l'exécution du workflow.

## Supabase

La sauvegarde locale dans le navigateur fonctionne sans compte Supabase. Pour la sauvegarde cloud, exécute `supabase.sql` dans l'éditeur SQL du projet Supabase puis configure l'URL et la clé publique (publishable/anon) depuis le bouton **Connexion Supabase**. Ne mets jamais une clé `service_role` dans le navigateur.
