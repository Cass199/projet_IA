## [2026-04-17 10:00]

### Objectif
- Créer une page d’accueil simple et accessible pour l’application d’interview métier.

### Fichiers modifiés
- index.html

### Changements effectués
- Ajout d'une page d'accueil sémantique contenant un titre, un paragraphe explicatif et un bouton `Commencer l’entretien`.
- Le bouton utilise `type="button"` et `aria-describedby` pour améliorer l'accessibilité.

### Décisions prises
- Fournir un HTML minimal et accessible sans dépendances externes. Le comportement du bouton sera implémenté dans une tâche séparée.

### Problèmes rencontrés
- Aucun.

### Prochaine étape
- Implémenter le gestionnaire JavaScript pour démarrer l'entretien et ajouter des styles CSS.
# IA Dev Log

## Entrée 1
- Date :
- Objectif :
- Fichiers modifiés :
- Changements effectués :
- Décisions prises :
- Problèmes rencontrés :
- Prochaine étape :

# IA Dev Log

Journal des actions réalisées avec l'aide de Copilot dans VS Code.

## [Initialisation]

### Objectif
- Mettre en place un système de développement avec journalisation reproductible.

### Fichiers modifiés
- `.github/agents/dev-log.agent.md`
- `IA_DEV_LOG.md`

### Changements effectués
- Création d'un custom agent orienté développement + journalisation.
- Création du fichier de log principal à la racine du projet.

### Décisions prises
- Utiliser un agent dédié pour imposer la mise à jour du journal.
- Conserver le log dans le dépôt afin de garder une trace locale du workflow.

### Problèmes rencontrés
- Aucun pour l'instant.

### Prochaine étape
- Créer les premiers fichiers du projet et consigner automatiquement les changements.

## [2026-04-19 11:30]

### Objectif
- Ajouter `style.css` : thème sombre, boutons visibles, formulaires lisibles, cartes élégantes, responsive.

### Fichiers modifiés
- style.css
- IA_DEV_LOG.md

### Changements effectués
- Remplacement complet de `style.css` par une feuille de style sombre, modernisée et responsive.
- Ajout de variables CSS, composants (boutons, formulaires, cartes), et règles responsive.

### Décisions prises
- Pas de framework CSS. Variables CSS et composants réutilisables.
- Priorité accessibilité: `focus-visible`, contrastes et préférences de réduction d'animations.

### Problèmes rencontrés
- Aucun immédiat.

### Prochaine étape
- Vérifier l’UI dans le navigateur, ajuster typographie et espacement si nécessaire.

## [2026-04-19 12:05]

### Objectif
- Transformer la page d’accueil en une application avec questionnaire multi-étapes (8 étapes).

### Fichiers modifiés
- index.html
- script.js
- IA_DEV_LOG.md

### Changements effectués
- Remplacement de `index.html` par une interface d'application contenant un questionnaire en 8 étapes : Identification, Activités, Compétences, Outils et environnement, Accès au métier, Difficultés, Valeur et projection, Anecdote.
- Ajout de la navigation step-by-step en `script.js` : affichage d'une seule étape à la fois, boutons Précédent/Suivant, validation basique, et résumé JSON à l'envoi.

### Décisions prises
- Utiliser HTML/JS/CSS vanilla, pas de dépendances externes.
- Garder l'intro écran et permettre de l'ignorer pour accéder directement au formulaire.

### Problèmes rencontrés
- Aucun immédiat. Tester dans le navigateur pour affiner l'ergonomie mobile.

### Prochaine étape
- Tester le parcours complet dans un navigateur, ajuster validations et affichage final si besoin.

