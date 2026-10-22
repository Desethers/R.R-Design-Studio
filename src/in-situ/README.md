# In Situ — direction éditoriale

Le concept conserve son entrée `/in-situ-fabienne-leclerc.html`, sa palette et ses assets. Il reste en HTML, CSS et modules JavaScript, sans framework ni dépendance supplémentaire.

## Organisation

- `data.js` : contenus extraits de la home et références aux huit images existantes. Pas de dates, biographies, dimensions ou crédits inventés.
- `components.js` : accueil, index, fiches artistes et expositions ; primitives partagées pour les listes, informations d’œuvre et contenus dépliables.
- `page.js` : sélection de la vue par query string, recherche locale, menu, aperçu artiste, visionneuse et légende contextuelle.
- `style.css` : couleurs, quatre rôles typographiques, échelle d’espacement et adaptation mobile.
- Le header et le footer communs restent dans le document HTML.

## Navigation

- Accueil : `/in-situ-fabienne-leclerc.html`
- Index : même URL avec `#artistes`
- Artiste : `?artist=daniele-genadry` (cinq artistes avec assets locaux)
- Exposition / projet : `?exhibition=edge-of-land` (cinq projets)
- Les anciennes ancres `#top`, `#expositions`, `#artistes`, `#actualites`, `#contact` sont conservées sur la home.
- Mark Dion reste relié à sa fiche officielle, faute d’assets locaux. Le roster complet, les biographies, CV et archives restent accessibles sur le site officiel.
- Une query inconnue affiche une page de retour vers l’index.

## Comportement

Le titre précède l’image sur la home. Les listes d’expositions et d’actualités montrent une sélection, puis s’ouvrent avec `details` / `summary`. L’index affiche un aperçu au survol ou au focus ; les liens restent utilisables directement sur mobile. Les images conservent leurs proportions. La visionneuse propose précédent / suivant et les flèches du clavier ; les fiches d’exposition associent une légende fixe à l’image active sur desktop et une légende sous chaque image sur mobile. La recherche utilise un dialogue natif, ferme avec Échap et rend le focus au déclencheur. Le mode de mouvement réduit est respecté.

## Vérifications de cette version

Contrôles navigateur effectués sur l’accueil et les dix fiches, avec vues à 1440, 768, 390 et 320 px : images chargées, absence de débordement horizontal, navigation des images, recherche et absence de résultat, focus du dialogue, menu mobile, ouverture / fermeture des listes, actualisation des légendes, route inconnue et mouvement réduit. Captures desktop et mobile examinées. Aucun échec de ressource locale ni erreur JavaScript relevé dans ce parcours.

`npm run dev` sert le projet sur le port 3006.
