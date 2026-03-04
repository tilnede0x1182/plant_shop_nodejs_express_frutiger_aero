# RAPPORT D'ANALYSE DES DUPLICATIONS DE CODE (Principe DRY)

## Introduction
Projet Express + SQLite + front React (embarqué dans `public/script.js`).

---

## Violations DRY

### 1. Connexion SQLite recopiée dans chaque modèle - 🔴 Critique
`models/planteModel.js`, `models/userModel.js` et `models/orderModel.js` instancient chacun leur propre `sqlite3.Database` en pointant sur `../db/plantes.db`, puis réécrivent les mêmes helpers (`db.run`, `db.get`, `db.all`). On duplique ainsi la gestion d’erreurs, l’ouverture/fermeture et les transactions. **Action** : créer un module `db.js` unique exportant une connexion partagée (ou des fonctions `query`, `run`, `get` promifiées) afin de supprimer ces répétitions et d’unifier la configuration (journalisation, PRAGMA, etc.).

### 2. Gestion des réponses HTTP répétée dans les contrôleurs - 🟠 Haute
`controllers/planteController.js` et `controllers/orderController.js` utilisent partout le même schéma `model.xxx(..., (err, result) => { if (err) res.status(500)...; if (!result) res.status(404)...; res.json(...) })`. L’absence de wrapper entraîne cinq blocs quasiment identiques juste pour `plantes` (getAll/getById/create/update/remove). **Action** : créer un utilitaire `handleCallback(res, { notFoundMessage })` ou passer à `async/await` avec `try/catch` pour factoriser la gestion des erreurs HTTP.

### 3. Front React : composants dupliquent la logique d’accès utilisateur/admin - 🟠 Haute
Dans `public/script.js`, les vues `renderPlantListPage` et `renderPlantShowPage` chargent chacune `const session = JSON.parse(localStorage.getItem("utilisateur"))` puis dupliquent la même section JSX pour afficher les boutons `Modifier/Supprimer` quand `utilisateur.role === "admin"`. Tout changement d’UI admin doit être reporté sur les deux blocs. **Action** : extraire un composant `AdminPlantActions` (ou un hook `useCurrentUser`) qui encapsule la récupération du session storage et l’affichage conditionnel des boutons, pour respecter DRY côté front.

---

## Impact estimé

| Refactoring proposé                          | Lignes supprimées | Complexité |
|----------------------------------------------|-------------------|------------|
| Module SQLite partagé + helpers promisifiés  | ~150              | Moyenne    |
| Wrapper d’erreurs pour les contrôleurs REST  | ~60               | Faible     |
| Composant/hook partagé pour l’UI admin front | ~40               | Faible     |

---

## Conclusion
La duplication touche à la fois la couche data (trois connexions SQLite) et la couche web (gestion d’erreurs Express, rendu React). Sans mutualisation, chaque évolution (logique SQL, design admin) devra être appliquée plusieurs fois, ce qui viole directement la consigne DRY.***
