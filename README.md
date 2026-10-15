# FormaCAD Studio

Application de CAO 3D dans le navigateur, inspirée des workflows des logiciels de conception mécanique.

## Fonctionnalités actuelles

- Vue 3D manipulable avec orbite, sélection et axes de référence.
- Ajout de blocs, sphères et cylindres.
- Esquisses 2D paramétriques simples : rectangle et cercle.
- Extrusion d'un rectangle ou d'un cercle en solide 3D.
- Arbre des objets et inspecteur : nom, position, échelle, couleur et dimensions.
- Sauvegarde dans le navigateur, export/import de projet JSON.
- Export STL des solides.
- Connexion Supabase facultative pour la sauvegarde cloud.

**Limites actuelles :** ce prototype n'est pas un remplacement complet de SOLIDWORKS. Il ne dispose pas encore d'un noyau B-Rep paramétrique professionnel, ni des opérations booléennes fiables (perçage/coupe), congés, chanfreins, contraintes d'esquisse avancées, assemblages avec contraintes ou mises en plan techniques. L'extrusion actuelle crée un solide simple depuis le profil rectangle/cercle.

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

Le premier lancement installe les dépendances. Une connexion Internet est nécessaire pour cette installation et pour les modules Supabase chargés à la demande.

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

La sauvegarde locale fonctionne sans compte Supabase. Pour activer la sauvegarde cloud, exécute `supabase.sql` dans l'éditeur SQL du projet Supabase puis configure l'URL et la clé publique (publishable/anon) depuis le bouton **Connexion Supabase**. Ne mets jamais une clé `service_role` dans le navigateur.
