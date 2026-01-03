# CV Forge AI 🚀

**CV Forge AI** est une application web moderne permettant de créer, personnaliser et exporter des CV professionnels. Elle exploite la puissance de l'intelligence artificielle **Google Gemini** pour assister l'utilisateur dans la rédaction du contenu et la génération de designs uniques.

## 💡 Approche et Philosophie

Cette application a été conçue autour de trois piliers fondamentaux pour repenser la création de CV :

1.  **L'IA comme Architecte Visuel** : Au-delà de la simple rédaction de texte, nous utilisons Gemini pour manipuler la structure JSON de l'application. Cela permet à l'utilisateur de générer des mises en pages (layouts), des palettes de couleurs et des typographies entièrement nouvelles simplement en les décrivant en langage naturel.
2.  **Rendu "Print-Perfect"** : L'architecture sépare strictement la logique d'édition (Formulaires React) du moteur de rendu. La prévisualisation est calibrée au millimètre près pour le format A4 via CSS Grid et Flexbox, garantissant que le PDF exporté est identique à l'écran, sans les problèmes de marges classiques du web.
3.  **Performance & Confidentialité** : L'application fonctionne comme une SPA (Single Page Application) ultra-rapide utilisant React 19. Les données sensibles de l'utilisateur restent locales le plus longtemps possible, et les appels à l'IA sont sécurisés via une fonction serverless proxy pour ne jamais exposer les clés API côté client.

## ✨ Fonctionnalités

*   **📝 Éditeur Temps Réel** : Interface intuitive pour remplir les informations personnelles, expériences, formations et compétences.
*   **📸 Photo de Profil** : Support complet pour l'ajout, la prévisualisation et l'intégration de photos (encodage Base64 local), avec adaptation automatique des mises en page.
*   **🧠 Assistance IA (Gemini)** :
    *   **Génération de résumé** : Créez une accroche percutante basée sur votre titre de poste.
    *   **Amélioration de texte** : Reformulez vos descriptions d'expérience pour les rendre plus professionnelles et orientées action.
    *   **Design Génératif** : Décrivez le style souhaité (ex: *"Minimaliste avec une touche de bleu tech et des bordures géométriques"*) et l'IA génère une configuration visuelle unique en temps réel.
*   **🎨 Modèles Prédéfinis** : Choisissez parmi les styles Moderne, Classique ou Élégant, ou créez le vôtre via l'IA.
*   **🖨️ Export PDF** : Rendu haute fidélité au format A4, optimisé pour l'impression sans marges indésirables (Full Bleed).
*   **📱 Responsive** : Interface adaptative offrant un éditeur sur mobile/tablette et une prévisualisation zoomable.

## 🛠️ Stack Technique

*   **Frontend** : React 19, TypeScript, Vite.
*   **Styling** : Tailwind CSS.
*   **Icônes** : Lucide React.
*   **IA** : Google GenAI SDK (`@google/genai`).
*   **Backend** : Fonction Serverless (Node.js) pour sécuriser l'appel API et gérer les Prompts.

## 🚀 Installation et Démarrage

### Prérequis

*   Node.js (v18 ou supérieur)
*   Une clé API Google Gemini (disponible sur [Google AI Studio](https://aistudio.google.com/)).

### Installation

1.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/votre-user/cv-forge-ai.git
    cd cv-forge-ai
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Configuration de l'environnement** :
    Ce projet utilise un fichier d'API backend (`api/generate.js`) qui nécessite la clé API.
    
    *En local (avec Vite)*, assurez-vous que votre environnement charge la clé, ou créez un fichier `.env` à la racine :
    ```env
    API_KEY=votre_clé_api_google_gemini_ici
    ```

4.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

5.  Ouvrez `http://localhost:5173` dans votre navigateur.

## 📂 Structure du Projet

*   `src/components/` : Contient l'interface utilisateur (`Editor.tsx`) et le moteur de rendu du CV (`Preview.tsx`).
*   `src/services/` : Logique client (`gemini.ts`) pour communiquer avec le backend.
*   `api/generate.js` : Point d'entrée serveur (Serverless Function) qui communique directement avec Google Gemini pour protéger la clé API.
*   `src/types.ts` : Définitions TypeScript (Interfaces `CVData`, `DesignConfig`, etc.).

## 🤖 Guide d'utilisation de l'IA

### 1. Génération de Résumé
Dans la section "Infos Personnelles", remplissez votre **Titre du poste**, puis cliquez sur l'icône **Baguette Magique** <kbd>🪄</kbd> à côté de la zone "Résumé". L'IA rédigera un paragraphe d'introduction professionnel.

### 2. Amélioration d'Expérience
Dans la section "Expérience", remplissez le **Rôle** et une description sommaire (ex: "J'ai fait du react"). Cliquez sur **Améliorer**. L'IA reformulera le texte avec un langage corporatif et des verbes d'action.

### 3. Design Sur-Mesure (Feature Unique)
Dans la barre d'outils en haut, cliquez sur l'icône **Palette Multicolore** <kbd>🎨</kbd>.
*   Une boîte de dialogue s'ouvre.
*   Décrivez le CV de vos rêves (ex: *"Un style cyberpunk, fond sombre, texte vert néon, police monospace"*).
*   L'IA va générer une configuration JSON complète (couleurs, polices, espacements, décorations) et l'appliquer instantanément.

## 📄 Licence

Ce projet est conçu à des fins éducatives et de démonstration technique.