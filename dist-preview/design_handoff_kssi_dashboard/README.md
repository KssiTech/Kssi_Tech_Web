# Handoff : Tableau de bord KSSI Tech — Suivi des installations FTTH

## Vue d'ensemble
Tableau de bord « Vue d'ensemble » pour KSSI Tech qui visualise les données d'un fichier Excel
de suivi d'installations fibre (FTTH B2C). L'utilisateur importe son fichier `.xlsx` (les onglets
correspondent aux équipes : Hamza, Omar, Mohammed) et le dashboard calcule automatiquement les
KPI, un graphique d'installations par jour, les répartitions par débit et par équipe, la liste de
suivi filtrable, et un panneau d'assistant IA.

## À propos des fichiers de design
Les fichiers de ce bundle sont des **références de design réalisées en HTML** — un prototype
montrant l'apparence et le comportement souhaités, **pas du code de production à copier tel quel**.
L'objectif est de **recréer ce design dans votre projet existant** (React/Vue/etc., avec vos
patterns, votre routing, votre état) en réutilisant vos composants et votre design system. Si le
projet n'a pas encore de stack front, choisissez la plus adaptée et implémentez-y le design.

Le prototype utilise la librairie **SheetJS (xlsx)** pour lire le fichier Excel côté navigateur —
c'est la pièce technique centrale à reprendre. Le reste (cartes, graphique en points, table) est de
la mise en page que vous reconstruisez avec vos composants.

## Fidélité
**Haute fidélité (hifi).** Couleurs, typographie, espacements et interactions sont définitifs.
Reproduisez l'UI fidèlement avec vos librairies, puis branchez la vraie logique de parsing décrite
plus bas.

## Écran : Vue d'ensemble
- **But** : importer un Excel de suivi et lire instantanément l'état des installations.
- **Layout** : page sur fond `#eef0f4`, conteneur `max-width:1380px` centré, padding `26px 30px`.
  - **Top bar** : logo KSSI (badge noir `#15171f`, radius 13px) + nom « KSSI Tech », avatars
    d'équipes empilés, barre de navigation pilule blanche (Vue d'ensemble actif = pilule noire),
    icônes réglages/notifs/profil à droite.
  - **Grille principale** : 2 colonnes `grid-template-columns: 1fr 372px`, `gap:20px`,
    `align-items:start`.
  - **Colonne gauche** (`flex column`, gap 20px) :
    1. **3 cartes KPI** (`grid 3 colonnes`) : Demandes totales / Installées / À retraiter.
    2. **Carte graphique** « Analyse des installations » : sous-colonne d'analyse à gauche (226px)
       + graphique en points à droite.
    3. **Carte table** « Suivi des installations » : onglets de filtre + lignes.
  - **Colonne droite** (`flex column`, gap 20px) :
    1. **Installations à venir** (tâches prioritaires).
    2. **Importer un fichier Excel** (dropzone + répartitions débit/équipe).
    3. **Assistant IA**.

### Composants — détails
**Cartes (génériques)** : `background:#fff; border-radius:20px; box-shadow:0 6px 20px rgba(30,35,60,.05)`.
Padding ~22-24px.

**Carte KPI** :
- Label : 14px, weight 600, `#6c7184`.
- Pill delta (haut droite) : positif `bg:#e4f7ef color:#16a06f`, négatif `bg:#fdecec color:#e0564f`,
  radius 8px, padding `4px 9px`, 12px/700.
- Grand nombre : 38px, weight 800, `letter-spacing:-1px` (la carte « Installées » en vert `#16a06f`).
- Sous-texte : 13px, `#9398a8`.

**Carte graphique** :
- Titre : 18px/800.
- Panneau d'analyse gauche (226px) : légende (puces 11px — « Réalisées » vert `#16c79a`,
  « Pic de la période » couleur accent), encadré insight (`bg = accent à 12%`, bordure `accent à 22%`,
  radius 14px) avec texte calculé, bouton « Lancer l'analyse » (dégradé `accent → #5b8def`, radius 13px,
  14px/700, texte blanc) qui bascule vers une recommandation détaillée.
- Dropdowns (Installations / Planifications, période) : pills `bg:#f4f5f8`, radius 11px, 13px/600.
- **Graphique en points** : un point = une installation. Pour chaque jour de la plage de dates, une
  colonne empile les points depuis le bas. Points réalisés en vert `#bfe9d6` ; la colonne du **pic**
  (jour avec le max) est en couleur **accent** avec une pastille « N inst. » au-dessus et une ligne
  pointillée horizontale au niveau du pic. Axe Y = 0…max, axe X = dates `JJ/MM`. Point = 10px, gap 5px.

**Carte table « Suivi des installations »** :
- Onglets : Toutes / Installées / Planifiées / Bloquées / Annulées, avec compteur. Onglet actif =
  `bg accent, texte blanc` ; inactif `bg:#f4f5f8, texte #6c7184`. Radius 11px.
- Colonnes : `grid-template-columns: 2.1fr 1.2fr 1fr 1.1fr 1.2fr 40px` — Client / Équipe / Débit /
  Planifié / Statut / (⋮).
- En-têtes : 12px/700, `#9398a8`, uppercase, `letter-spacing:.4px`.
- Ligne : `border-top:1px solid #f3f4f8`, padding `13px 6px`.
- **Avatar client : cercle** (`border-radius:50%`), 38px, initiales blanches sur couleur dérivée du nom.
- Nom 14px/700 ; SIP en sous-texte 12px `#9398a8`.
- **Badge de statut** : pill avec puce 6px. Couleurs ci-dessous.

**Installations à venir** (colonne droite) : liste des demandes au statut « planifié » triées par date,
avatar cercle 34px, nom 14px/700, pill date (accent sur fond accent-12%), sous-texte « Équipe · Débit ».

**Importer un fichier Excel** : carte dégradée `linear-gradient(160deg,#f4f2ff,#eef6ff 55%,#eafaf3)`.
`<input type="file" accept=".xlsx,.xls,.csv">` masqué ; dropzone (bordure pointillée `#c9c4ea`, devient
accent au survol/drag) cliquable + drag&drop ; bouton « Choisir un fichier » (accent). En dessous :
**Répartition par débit** (barres 20/50/100 Méga, couleurs `#16c79a`, `#5b8def`, accent) et **Par équipe**
(carte par équipe avec installées / total).

**Assistant IA** : carte dégradée lavande `linear-gradient(160deg,#eef0ff,#f3effb 55%,#eef6ff)`.
Salutation « Bonjour Hamza 👋 » + « Comment puis-je vous aider ? » (23px/800). Onglets KSSI AI /
GPT / DeepSeek. Grille 2×2 d'actions (Relancer injoignables 📞, Replanifier retards 📅, Optimiser
planning ⚡, Rapport hebdo 📄), chacune carte blanche + icône colorée. Barre de saisie + bouton accent.

## Logique de parsing Excel (cœur de la fonctionnalité)
Avec SheetJS : `XLSX.read(arrayBuffer, {type:'array'})`, puis pour **chaque onglet** :
`XLSX.utils.sheet_to_json(sheet, {header:1, raw:false, defval:''})`.

1. **Trouver la ligne d'en-tête** : première ligne contenant une cellule `NOM` **et** une cellule
   `EQUIPE` (fallback : ligne contenant `EQUIPE`).
2. **Mapper les colonnes** par regex sur les libellés (insensible à la casse) :
   - `NOM` → nom client
   - `EQUIPE` → équipe (ex. « EQUIPE hamza KSSITECH »)
   - `DEBIT` / `DÉBIT` → débit (ex. « 20 Méga Fibre »)
   - `ETAT` / `ÉTAT` → état (ex. « ok », « Blocage client »)
   - `…PLANIF…` → date de planification
   - `…INSTALLATION…` → date d'installation
   - `COMM` / commentaire → commentaire (ex. « Demande annulé », « client injoignable », « Client installé »)
   - `SIP` → identifiant SIP
3. **Construire les enregistrements** : ignorer les lignes sans `NOM`.

### Règles de classification du statut (ordre important)
1. `annulé` si le **commentaire** contient `annul`.
2. sinon `bloqué` si l'**état** contient `blocage`.
3. sinon `installé` si une **date d'installation** existe **ou** le commentaire contient `install(é)`.
4. sinon `planifié` si une **date de planification** existe.
5. sinon `en attente`.

### KPI calculés
- **Demandes totales** = nombre de lignes.
- **Installées** = lignes au statut `installé` ; **Taux** = installées / total (arrondi %).
- **À retraiter** = annulées + bloquées.
- **Débit** : extraire le nombre via `/(\d+)\s*m[ée]ga/i` → buckets 20 / 50 / 100.
- **Équipe** : extraire via `/equipe\s+([\wéèàâ'-]+)/i` puis retirer « kssi tech ».
- **Graphique** : grouper par jour sur la date d'installation (ou de planification selon le toggle).
- **Insight** : taux + nb d'injoignables (`/injoign/i` dans le commentaire) + nb de bloqués.

## Interactions & comportement
- **Import** : clic ou drag&drop d'un `.xlsx` → recalcul complet du dashboard (FileReader →
  ArrayBuffer → SheetJS). Multi-onglets fusionnés. Gestion d'erreur si aucune ligne reconnue.
- **Onglets table** : filtrent les lignes par statut (état local `tab`).
- **Toggle métrique** : « Installations » ⇄ « Planifications » change la date pilotant le graphique.
- **Lancer l'analyse** : bascule l'encadré insight entre constat et recommandation (état `analyzed`).
- Survol dropzone/onglets/actions IA → feedback visuel.

## State (prototype)
`records` (tableau d'enregistrements), `tab` (filtre actif), `metric` (`install` | `planif`),
`fileName`, `dragging` (drag&drop), `analyzed` (mode insight).

## Design tokens
- **Fond app** : `#eef0f4` · **Carte** : `#fff` · **Encre** : `#1d2030` · **Gris texte** : `#6c7184`,
  `#9398a8` · **Bordures** : `#f3f4f8`, `#eef0f4`.
- **Accent (violet)** : `#6c5ce6` (prop `accent`, alternatives `#5b8def`, `#16a06f`, `#caa35e`).
- **Vert** : `#16c79a` / `#16a06f` (succès), points graphique `#bfe9d6`.
- **Bleu** : `#5b8def` · **Or (logo)** : `#caa35e` · **Rouge** : `#e0564f`/`#ef5b54` · **Ambre** : `#d99a2b`.
- **Statuts** : Installé `bg #e4f7ef / #16a06f` · Planifié `#eceafe / #6c5ce6` · Bloqué `#fdecec / #e0564f`
  · Annulé `#f1f2f6 / #8a90a3` · En attente `#fdf3e3 / #d99a2b`.
- **Radius** : cartes 20px, pills/contrôles 11-13px, avatars **50% (cercle)**, badges 8-9px.
- **Ombre carte** : `0 6px 20px rgba(30,35,60,.05)`.
- **Typo** : « Plus Jakarta Sans » (Google Fonts), poids 400/500/600/700/800. Grands nombres 38px/800
  `letter-spacing:-1px` ; titres de carte 18px/800 ; corps 13-14px.

## Assets
- `assets/kssi-logo.png` — logo KSSI (K noir + accent or), PNG transparent 1024×1024.
- Librairie externe : **SheetJS** `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`
  (ou `npm i xlsx` dans votre projet).
- Aucune photo client : avatars = initiales sur fond coloré (couleur dérivée du nom).

## Fichiers
- `KSSI Dashboard.dc.html` — le prototype complet (template + logique). Le template est la mise en
  page inline ; la classe `Component` (en bas du fichier) contient `defaultRecords`, le parsing Excel
  (`readFile`), la classification (`status`/`statusMeta`), le graphique (`buildChart`) et tous les
  calculs (`renderVals`). C'est votre référence à reproduire.
