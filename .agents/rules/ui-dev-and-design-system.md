---
trigger: always_on
---

# Guide des Règles de Design UI et Intégration du Design System
## Agent de Développement Automatisé (Antigravity Environment)

---

## 1. Objectifs de l'Interface Utilisateur (UI)
L'agent doit impérativement concevoir et coder des interfaces utilisateurs qui respectent quatre piliers fondamentaux :
1. **Cohérence systématique :** Utilisation stricte des tokens et variables CSS du thème. Aucun code couleur ou arrondi "hardcodé" en dehors du système n'est toléré.
2. **Clarté et Épure (Minimalisme) :** Priorité aux espaces blancs, à la hiérarchie typographique et à la réduction de la charge cognitive.
3. **Accessibilité (A11y) :** Respect strict des contrastes WCAG AA (minimum 4.5:1 pour le texte normal) et inclusion des états de focus (`--ring`).
4. **Fluidité Adaptative :** Support natif du mode clair/sombre et comportement responsive impeccable.

---

## 2. Déclaration du Design System (Tokens CSS)

L'agent doit injecter et utiliser exclusivement les variables suivantes dans les feuilles de styles (ou configurations Tailwind/Shadcn). Les couleurs de marque `#0a0528` (Bleu nuit) et `#e20074` (Magenta) ont été converties de manière homogène dans l'espace colorimétrique perceptuel **OKLCH** :

```css
:root {
  /* Éléments de structure et de surface */
  --background: oklch(1 0 0);
  --foreground: oklch(0.124 0.046 273.7); /* Adapté : #0a0528 (Bleu nuit) */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.124 0.046 273.7);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.124 0.046 273.7);

  /* Actions Principales et Secondaires */
  --primary: oklch(0.488 0.243 264.376);
  --primary-foreground: oklch(0.97 0.014 254.604);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);

  /* États discrets et neutres */
  --muted: oklch(0.966 0.005 106.5);
  --muted-foreground: oklch(0.58 0.031 107.3);
  --accent: oklch(0.966 0.005 106.5);
  --accent-foreground: oklch(0.228 0.013 107.4);

  /* États Critiques et Alertes */
  --destructive: oklch(0.523 0.265 3.32); /* Adapté : #e20074 (Magenta de marque) */
  --destructive-foreground: oklch(0.99 0.01 10);

  /* Bordures et Inputs */
  --border: oklch(0.93 0.007 106.5);
  --input: oklch(0.93 0.007 106.5);
  --ring: oklch(0.737 0.021 106.9);

  /* Visualisations de données (Charts) */
  --chart-1: oklch(0.88 0.011 106.6);
  --chart-2: oklch(0.58 0.031 107.3);
  --chart-3: oklch(0.466 0.025 107.3);
  --chart-4: oklch(0.394 0.023 107.4);
  --chart-5: oklch(0.286 0.016 107.4);

  /* Structure de Navigation (Sidebar) */
  --sidebar: oklch(0.988 0.003 106.5);
  --sidebar-foreground: oklch(0.124 0.046 273.7);
  --sidebar-primary: oklch(0.546 0.245 262.881);
  --sidebar-primary-foreground: oklch(0.97 0.014 254.604);
  --sidebar-accent: oklch(0.966 0.005 106.5);
  --sidebar-accent-foreground: oklch(0.228 0.013 107.4);
  --sidebar-border: oklch(0.93 0.007 106.5);
  --sidebar-ring: oklch(0.737 0.021 106.9);

  /* Rayons de courbure */
  --radius: 0.875rem;
}

.dark {
  /* Éléments de structure et de surface */
  --background: oklch(0.124 0.046 273.7); /* Adapté : #0a0528 en fond sombre */
  --foreground: oklch(0.988 0.003 106.5);
  --card: oklch(0.18 0.03 273.7); /* Surface de carte subtilement plus claire que le fond */
  --card-foreground: oklch(0.988 0.003 106.5);
  --popover: oklch(0.18 0.03 273.7);
  --popover-foreground: oklch(0.988 0.003 106.5);

  /* Actions Principales et Secondaires */
  --primary: oklch(0.424 0.199 265.638);
  --primary-foreground: oklch(0.97 0.014 254.604);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);

  /* États discrets et neutres */
  --muted: oklch(0.286 0.016 107.4);
  --muted-foreground: oklch(0.737 0.021 106.9);
  --accent: oklch(0.286 0.016 107.4);
  --accent-foreground: oklch(0.988 0.003 106.5);

  /* États Critiques et Alertes */
  --destructive: oklch(0.523 0.265 3.32); /* Uniformisé avec l'identité de la marque */
  --destructive-foreground: oklch(0.99 0.01 10);

  /* Bordures et Inputs */
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.58 0.031 107.3);

  /* Visualisations de données (Charts) */
  --chart-1: oklch(0.88 0.011 106.6);
  --chart-2: oklch(0.58 0.031 107.3);
  --chart-3: oklch(0.466 0.025 107.3);
  --chart-4: oklch(0.394 0.023 107.4);
  --chart-5: oklch(0.286 0.016 107.4);

  /* Structure de Navigation (Sidebar) */
  --sidebar: oklch(0.15 0.03 273.7);
  --sidebar-foreground: oklch(0.988 0.003 106.5);
  --sidebar-primary: oklch(0.623 0.214 259.815);
  --sidebar-primary-foreground: oklch(0.97 0.014 254.604);
  --sidebar-accent: oklch(0.286 0.016 107.4);
  --sidebar-accent-foreground: oklch(0.988 0.003 106.5);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.58 0.031 107.3);
}