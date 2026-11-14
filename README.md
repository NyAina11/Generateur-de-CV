# CV Forge AI 🚀

**CV Forge AI** est une application web permettant de créer, personnaliser et exporter des CV professionnels. Elle s'appuie sur l'intelligence artificielle **Google Gemini** pour aider à rédiger le contenu et générer des designs uniques.

## 💡 Approche et Philosophie

Cette application a été conçue autour de trois piliers :

1.  **L'IA comme Architecte Visuel** : au-delà de la rédaction, Gemini produit une configuration JSON (mise en page, palette, typographie) à partir d'une simple description en langage naturel. Cette configuration est validée puis corrigée côté application : un design généré reste toujours lisible, même si l'IA propose des couleurs trop peu contrastées.
2.  **Rendu « Print-Perfect »** : le moteur de rendu est séparé des formulaires d'édition. L'aperçu est calibré au millimètre pour le format A4 ; le PDF exporté est identique à l'écran, bord à bord, y compris sur plusieurs pages.
3.  **Performance & Confidentialité** : l'application est une SPA React. Le CV est enregistré uniquement dans le navigateur de l'utilisateur, et les appels à l'IA passent par une fonction serverless pour ne jamais exposer la clé API côté client.

## ✨ Fonctionnalités

*   **📝 Éditeur temps réel** : informations personnelles, expériences, formations, compétences, langues et centres d'intérêt. Les éléments se réordonnent et une suppression peut être annulée.
*   **💾 Sauvegarde automatique** : le CV est conservé dans le navigateur (aucun compte, aucun serveur). Une sauvegarde peut être téléchargée puis réimportée sur un autre appareil.
*   **📸 Photo de profil** : la photo est redimensionnée et compressée localement avant d'être intégrée.
*   **🧠 Assistance IA (Gemini)** :
    *   **Rédaction du résumé** à partir du poste visé et du contenu réel du CV (compétences, expériences, formation).
    *   **Reformulation des expériences** avec des verbes d'action, sans inventer de faits.
    *   **Design génératif** : décrivez le style souhaité (ex. : *« Tech, mode sombre, police monospace »*) et l'IA génère une mise en page complète.
    *   En cas d'échec de l'IA, votre texte n'est jamais modifié ; chaque résultat peut être annulé.
*   **🎨 Modèles** : Moderne, Classique, Élégant, ou votre design généré par l'IA. Couleur du thème au choix, y compris personnalisée.
*   **🖨️ Export PDF** : format A4 pleine page, liens cliquables (e-mail, téléphone, site), repères de saut de page dans l'aperçu.
*   **📱 Responsive** : sur téléphone et tablette, on bascule entre l'éditeur et un aperçu ajusté à la largeur de l'écran.

## 🛠️ Stack Technique

*   **Frontend** : React 19, TypeScript, Vite 8.
*   **Styles** : Tailwind CSS 3.
*   **Icônes** : Lucide React.
*   **IA** : Google GenAI SDK (`@google/genai`).
*   **Backend** : une fonction serverless Node.js (`api/generate.js`, compatible Vercel).
*   **Tests** : Vitest.

## 🚀 Installation et Démarrage

### Prérequis

*   Node.js 20.19 ou supérieur.
*   Une clé API Google Gemini, à créer sur [Google AI Studio](https://aistudio.google.com/apikey). Elle n'est nécessaire que pour les fonctions d'IA : le reste de l'application fonctionne sans.

### Installation

1.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/NyAina11/Generateur-de-CV.git
    cd Generateur-de-CV
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Configurer la clé API** : copiez `.env.example` en `.env` et renseignez votre clé.
    ```env
    GEMINI_API_KEY=votre_clé_api_google_gemini
    ```
    Le fichier `.env` est ignoré par Git. L'ancien nom de variable `API_KEY` reste accepté.

4.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
    Vite sert l'application **et** la fonction `/api/generate` : aucun autre outil n'est nécessaire en local.

5.  Ouvrez `http://localhost:5173` dans votre navigateur.

### Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement (application + API locale) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Sert le build de production en local |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires |
| `npm run check` | Typecheck, tests et build à la suite |

### Déploiement (Vercel)

1.  Importez le dépôt dans Vercel : le projet Vite et la fonction `api/generate.js` sont détectés automatiquement.
2.  Dans *Settings → Environment Variables*, ajoutez `GEMINI_API_KEY`.
3.  Déployez.

Variables d'environnement prises en charge par la fonction :

| Variable | Rôle |
| --- | --- |
| `GEMINI_API_KEY` | Clé API Gemini (obligatoire pour l'IA). `API_KEY` est accepté en repli. |
| `GEMINI_MODEL` | Optionnel. Modèle à essayer en premier. Par défaut : `gemini-3.8-flash`, puis `gemini-3-flash-preview` si le premier est indisponible. |
| `ALLOWED_ORIGINS` | Optionnel. Origines supplémentaires autorisées à appeler l'API, séparées par des virgules. |

## 🔒 Sécurité et confidentialité

*   La clé API n'existe que côté serveur ; elle n'est jamais incluse dans le code envoyé au navigateur.
*   La fonction valide et borne toutes les entrées, refuse les appels lancés depuis un autre site et limite le nombre de demandes par adresse IP. Cette limitation est « au mieux » (mémoire propre à chaque instance serverless) : pour un site à fort trafic, complétez-la par une limite côté plateforme.
*   Les erreurs techniques restent dans les journaux du serveur ; le navigateur ne reçoit qu'un message destiné à l'utilisateur.
*   Le contenu du CV reste dans le navigateur. Seuls les textes à traiter sont envoyés à Gemini, et uniquement quand un bouton d'IA est utilisé. La photo n'est jamais envoyée.

## 📂 Structure du Projet

```
api/generate.js            Fonction serverless : seul point de contact avec Gemini
src/
  App.tsx                  Barre d'outils, bascule mobile, import / export
  components/
    Editor.tsx             Formulaires d'édition
    Preview.tsx            Feuille A4 (pagination, fond pleine page)
    PreviewPane.tsx        Mise à l'échelle de l'aperçu
    DesignDialog.tsx       Boîte de dialogue « Design IA »
    Toast.tsx              Notifications
    templates/             Modèles Moderne, Classique, Élégant et IA
  hooks/usePersistentCV.ts Sauvegarde automatique dans le navigateur
  lib/                     Couleurs et contraste, validation des données, pagination
  services/gemini.ts       Client de l'API interne
  types.ts                 Types (`CVData`, `DesignConfig`…)
tests/                     Tests unitaires (Vitest)
```

## 🤖 Guide d'utilisation de l'IA

### 1. Rédaction du résumé
Dans « Informations personnelles », renseignez le **titre du poste**, puis cliquez sur **Rédiger avec l'IA** au-dessus du résumé. Plus le CV est rempli (compétences, expériences), plus le résumé sera pertinent. Si un résumé existe déjà, l'IA l'améliore.

### 2. Amélioration d'une expérience
Dans « Expérience », écrivez une description même sommaire (ex. : « J'ai fait du React »), puis cliquez sur **Améliorer avec l'IA**. Le texte est reformulé sous forme de puces, avec des verbes d'action.

### 3. Design sur mesure
Dans la barre d'outils, cliquez sur **Design IA**.
*   Décrivez le CV de vos rêves (ex. : *« Un style cyberpunk, fond sombre, texte vert néon, police monospace »*) ou partez d'une suggestion.
*   L'IA génère une configuration complète (mise en page, couleurs, polices, décorations), appliquée immédiatement.
*   Vous pouvez revenir à un modèle prédéfini puis retrouver votre design, ou en générer un autre.

Relisez toujours un texte produit par l'IA avant de l'utiliser : le bouton **Annuler** de la notification rétablit votre version.

## 📄 Licence

Ce projet est conçu à des fins éducatives et de démonstration technique.
