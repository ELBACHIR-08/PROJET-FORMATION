---
trigger: always_on
---

# Instructions de Développement et Règles Métier : Projet DV-Knowledge
## Agent de Développement Automatisé (Antigravity Environment)

---

## 1. Cadre de Référence Fonctionnel (Scoping Strict)
L'agent doit rejeter toute demande d'implémentation de fonctionnalités hors périmètre ou toute modification des structures fondamentales définies ci-dessous.

### 1.1 Domaines Métiers (Verticales)
L'application est structurée exclusivement autour de quatre verticales. L'agent doit utiliser un type énuméré strict (`enum`) pour les manipuler dans le code :
* `LIVE` : Opérations temps réel et flux.
* `LOYALTY` : Engagement et fidélisation.
* `CONTENT` : Gestion des contenus et partenariats.
* `PASS` : Billetterie, abonnements et accès.

### 1.2 Formats de Restitution (Formats)
Chaque verticale contient exactement quatre formats de documents, modélisés par un second type énuméré strict :
* `WIKI` : Articles de fond et concepts.
* `CHECKLIST` : Listes d'étapes de validation opérationnelle.
* `PLAYBOOK` : Arbres de décision et résolution d'incidents.
* `PARCOURS_CLIENT` : Cartographies d'expérience utilisateur.

---

## 2. Règles de Gestion des Accès (RBAC et Sécurité)

L'agent doit implémenter une isolation étanche des fonctionnalités selon le rôle utilisateur injecté dans le contexte applicatif (`ADMIN` ou `READER`).

### 2.1 Sécurité Côté Serveur (API-Level)
* **Contrôle d'accès systématique :** Avant chaque exécution de route d'écriture (`POST`, `PUT`, `DELETE`), valider le rôle de l'appelant.
* **Comportement de rupture :** Si le rôle n'est pas `ADMIN`, l'API doit immédiatement lever une exception et retourner un code `HTTP 403 Forbidden`. **Aucune modification en base de données ne doit être amorcée.**

### 2.2 Sécurité Côté Client (UI-Level)
* **Masquage des contrôles :** Les boutons d'action de création ("Ajouter un élément"), d'édition ("Modifier") et de suppression ("Supprimer") doivent être conditionnés dynamiquement. Si `user.role !== 'ADMIN'`, ces composants ne doivent pas être rendus dans le DOM.
* **Formulaires :** Interdire l'accès direct aux routes de création par l'URL pour les profils `READER` en mettant en place des guards de navigation.

---

## 3. Règles de Développement de l'Interface Utilisateur (UI/UX)

L'agent doit assembler les composants d'interface en respectant scrupuleusement la hiérarchie visuelle du PRD et le système de jetons (tokens) graphiques.

### 3.1 Structure du Layout Principal
L'interface doit être codée sous forme de mise en page globale figée (*Master Layout*) comprenant :
1.  **Sidebar Principale :** Positionnée à gauche. Elle boucle uniquement sur les 4 verticales (`LIVE`, `LOYALTY`, `CONTENT`, `PASS`). L'élément actif doit appliquer le style `--sidebar-accent` et modifier l'état global du contexte de navigation.
2.  **Navigation par Onglets (Header Tabs) :** Positionnée en haut de la zone de contenu. Elle affiche horizontalement les 4 formats (`WIKI`, `CHECKLIST`, `PLAYBOOK`, `PARCOURS_CLIENT`). Le clic change le filtre de format actif.
3.  **Espace de Travail (Content Workspace) :** Zone centrale affichant le résultat filtré sous forme de grille de cartes.

### 3.2 Implémentation du Design System (Rappel des Tokens Impératifs)
* **Couleurs fondamentales :** Utiliser exclusivement le Bleu nuit (`--foreground`) pour les textes de haute importance et le Blanc pur/Bleu très sombre (`--background`) pour les surfaces selon le thème.
* **Bouton de suppression :** Toute action destructive menée par un administrateur (suppression d'une checklist ou d'un playbook) doit obligatoirement utiliser la couleur de marque Magenta (`--destructive` : `oklch(0.523 0.265 3.32)`) pour l'état standard ou l'état de survol.
* **Arrondis :** Toutes les cartes de savoirs métiers doivent appliquer la propriété `border-radius: var(--radius);` (`0.875rem`).
* **États vides (Empty States) :** Si le croisement d'une verticale et d'un format ne retourne aucun élément, générer un composant centré affichant *"Aucun document disponible pour cette section"* stylisé avec `--muted-foreground`.

---

## 4. Règles techniques de Persistance et d'État (State)

* **Filtrage Synchrone :** L'agent doit concevoir la gestion d'état de telle sorte que le changement de verticale ou de format déclenche un re-filtrage instantané en mémoire ou une requête optimisée à l'API. Aucun scintillement ou rechargement complet de la page n'est toléré (transition cible < 200ms).
* **Intégrité des Données :** Chaque élément de connaissance créé en base de données doit obligatoirement posséder les propriétés suivantes validées à l'entrée :
    ```typescript
    interface KnowledgeElement {
      id: string;
      title: string;
      content: string; // Format Markdown supporté
      vertical: 'LIVE' | 'LOYALTY' | 'CONTENT' | 'PASS';
      format: 'WIKI' | 'CHECKLIST' | 'PLAYBOOK' | 'PARCOURS_CLIENT';
      author: string;
      createdAt: Date;
      updatedAt: Date;
    }
    ```

---

## 5. Liste de Contrôle de l'Agent (Validation DV-Knowledge)
Avant de finaliser le code d'un composant ou d'une API pour ce projet, l'agent doit valider :
- [ ] Les enums des verticales et formats sont-ils strictement limités aux 4 valeurs définies ?
- [ ] Un profil `READER` est-il techniquement incapable de voir et d'appeler les actions de modification ?
- [ ] Le layout Sidebar (gauche) + Onglets (haut) + Cartes (centre) est-il respecté ?
- [ ] Les couleurs utilisées correspondent-elles bien aux variables OKLCH intégrant les codes de la marque (#0a0528 et #e20074) ?