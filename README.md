# R.R Design Studio — repères du dossier

Lancer le serveur local avec `npm run dev`, puis ouvrir <http://localhost:3006/library/>.

Pour retrouver les pages directement, ouvrir [l’index des études](studies/index.html) ou <http://localhost:3006/studies/>. Les liens de cet index fonctionnent aussi depuis le Finder en ouvrant `studies/index.html` ; pour les styles et les interactions des études, utiliser le serveur local.

## Où se trouve quoi ?

| Dossier | Contenu |
| --- | --- |
| Racine | Accueil `index.html`, entrée `library.html`, feuille de style commune et configuration npm |
| `pages/site/` | Pages du site principal : artistes, fiches artistes, expositions et fiches expositions |
| `library/` | Entrées et pages de la bibliothèque de composants |
| `studies/artists/` | Études de pages artistes : Van Gogh, Hilma af Klint, Caillebotte |
| `studies/exhibitions/` | Études d’expositions et variantes de présentation |
| `studies/gallery-sites/` | Études de sites de galeries : Darmo, In Situ, Les Objecteurs, Galerie Allen |
| `src/library/` | Données, composants et comportement de la bibliothèque |
| `src/styles/`, `src/in-situ/`, `src/objecteurs/` | Styles et code propres aux études |
| `images/` | Images utilisées par le site et les études ; Van Gogh et Caillebotte sont regroupés dans `images/artists/` |
| `scripts/` | Scripts utilitaires du site principal |
| `docs/` | Notes et documents de référence |
| `exports/` | Fichiers préparés pour l’export |

Les études restent accessibles dans la bibliothèque. Lorsqu’on ajoute une nouvelle étude, placer sa page HTML dans le sous-dossier `studies/` correspondant et déclarer son chemin dans `src/library/registry.js` ou `src/library/data/gallery-templates.js`.
