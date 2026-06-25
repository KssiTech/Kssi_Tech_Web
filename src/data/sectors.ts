import { Zap, Settings, Sun, Network, Eye, Wrench, Shield, type LucideIcon } from "lucide-react";

export interface SectorData {
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  capabilities: { title: string; description: string }[];
  heroImage: string;
  Icon: LucideIcon;
  accentGradient: string;
  iconColor: string;
  certifications?: string[];
}

export interface SectorPanelGroup {
  id: string;
  groupTitle: string;
  GroupIcon: LucideIcon;
  slug: string;
  imageUrl: string;
  imageAlt: string;
  overlayGradient: string;
  subsectors: { label: string; slug: string }[];
}

export const sectors: SectorData[] = [
  {
    slug: "electricite",
    name: "Électricité BT/MT",
    shortDescription:
      "Études, fourniture et réalisation d'installations électriques basse et moyenne tension, agréé ONEE.",
    fullDescription:
      "KSSI TECH prend en charge l'intégralité de vos projets électriques : de l'étude technique à la mise en service. Notre agrément ONEE garantit la conformité de tous nos travaux aux normes nationales et internationales. Nous intervenons sur les réseaux basse tension (BT) et moyenne tension (MT), dans les secteurs industriels, tertiaires et d'infrastructure.",
    heroImage: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80",
    Icon: Zap,
    accentGradient: "from-khwarizmia-navy to-stone-700",
    iconColor: "text-khwarizmia-paper",
    capabilities: [
      { title: "Installations BT résidentielles & industrielles", description: "Tableaux, câblage, prises de terre et protections conformes aux normes NFC 15-100." },
      { title: "Postes HTA/HTB", description: "Étude, fourniture et montage de postes de transformation moyenne tension." },
      { title: "Éclairage public & industriel", description: "Conception et réalisation de systèmes d'éclairage LED économiques et durables." },
      { title: "Contrôle et protection", description: "Relais de protection, disjoncteurs différentiels, systèmes de surveillance de réseau." },
      { title: "Mise en conformité", description: "Audit des installations existantes et mise aux normes selon la réglementation en vigueur." },
      { title: "Maintenance électrique", description: "Interventions préventives et correctives sur tous types d'installations électriques." },
    ],
    certifications: ["Agréé ONEE BT/MT", "NFC 15-100", "CEI 60364"],
  },
  {
    slug: "automatisation",
    name: "Automatisation",
    shortDescription:
      "Conception et intégration de systèmes automatisés, pupitres de commande et automates programmables.",
    fullDescription:
      "Notre équipe d'ingénieurs conçoit et déploie des solutions d'automatisation sur mesure pour l'industrie. De la programmation PLC à l'intégration SCADA en passant par les pupitres de commande et les variateurs de vitesse, nous optimisons vos process industriels pour plus de productivité, de sécurité et d'efficacité énergétique.",
    heroImage: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&q=80",
    Icon: Settings,
    accentGradient: "from-khwarizmia-teal to-khwarizmia-bronze",
    iconColor: "text-khwarizmia-navy",
    capabilities: [
      { title: "Programmation PLC / API", description: "Développement sur Siemens S7, Allen-Bradley, Schneider Modicon et autres plateformes." },
      { title: "Systèmes SCADA", description: "Supervision et contrôle en temps réel de vos lignes de production." },
      { title: "Pupitres de commande", description: "Fabrication et câblage d'armoires de commande sur mesure selon vos spécifications." },
      { title: "Variateurs de vitesse", description: "Intégration et paramétrage de variateurs ABB, Siemens, Schneider pour moteurs AC/DC." },
      { title: "Capteurs & instrumentation", description: "Sélection, installation et étalonnage de capteurs de mesure industriels." },
      { title: "Maintenance préventive automates", description: "Suivi, mise à jour firmware et diagnostic des systèmes en production." },
    ],
    certifications: ["Partenaire Siemens", "Certifié Schneider Electric"],
  },
  {
    slug: "energie",
    name: "Énergie Renouvelable",
    shortDescription:
      "Fourniture et installation de centrales photovoltaïques et solutions d'énergie propre adaptées.",
    fullDescription:
      "KSSI TECH accompagne les entreprises et collectivités dans leur transition énergétique. Nous concevons et installons des centrales solaires photovoltaïques raccordées au réseau ou en îlotage, dimensionnées selon votre consommation. Notre expertise couvre également les systèmes de stockage et les solutions d'optimisation de la consommation.",
    heroImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
    Icon: Sun,
    accentGradient: "from-stone-600 to-khwarizmia-navy",
    iconColor: "text-khwarizmia-paper",
    capabilities: [
      { title: "Centrales PV On-grid", description: "Installations solaires raccordées au réseau ONEE pour réduire votre facture électrique." },
      { title: "Systèmes PV Off-grid", description: "Solutions autonomes avec stockage batterie pour sites isolés ou en complément réseau." },
      { title: "Études de faisabilité", description: "Simulation de production, étude de rentabilité et temps de retour sur investissement." },
      { title: "Onduleurs & MPPT", description: "Sélection et installation des onduleurs photovoltaïques adaptés à votre installation." },
      { title: "Stockage par batterie", description: "Intégration de systèmes de stockage lithium pour maximiser l'autoconsommation." },
      { title: "Maintenance PV", description: "Nettoyage, inspection thermographique et maintenance des panneaux et équipements." },
    ],
    certifications: ["Certifié IRESEN", "NF EN 62305 Foudre"],
  },
  {
    slug: "reseaux",
    name: "Réseaux Informatiques",
    shortDescription:
      "Déploiement d'infrastructures réseau cuivre et fibre optique avec équipements actifs inclus.",
    fullDescription:
      "Nous concevons et déployons des infrastructures réseau performantes et évolutives pour tous types de bâtiments et sites industriels. De la pose du câblage structuré à la configuration des équipements actifs (switches, routeurs, points d'accès Wi-Fi), KSSI TECH assure des réseaux fiables et sécurisés.",
    heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
    Icon: Network,
    accentGradient: "from-khwarizmia-bronze to-stone-700",
    iconColor: "text-khwarizmia-paper",
    capabilities: [
      { title: "Câblage cuivre Cat5e/Cat6/Cat6A", description: "Installation et certification de câblage structuré selon ISO/IEC 11801." },
      { title: "Fibre optique monomode & multimode", description: "Tirage, soudure et mesure de fibres optiques pour longues distances et data centers." },
      { title: "Équipements actifs", description: "Configuration de switches managés, routeurs et pare-feux Cisco, HP, Ubiquiti." },
      { title: "Wi-Fi entreprise", description: "Déploiement de réseaux sans fil haute densité avec contrôleur centralisé." },
      { title: "Baies de brassage & salles serveurs", description: "Conception et installation de baies 19\", PDU, refroidissement et monitoring." },
      { title: "Audit & certification réseau", description: "Test, certification et documentation complète de l'infrastructure câblée." },
    ],
    certifications: ["ISO/IEC 11801", "EN 50173"],
  },
  {
    slug: "surveillance",
    name: "Vidéo Surveillance",
    shortDescription:
      "Installation de systèmes CCTV, contrôle d'accès et solutions de sécurité périmétrique.",
    fullDescription:
      "KSSI TECH sécurise vos locaux et périmètres avec des systèmes de vidéosurveillance IP et analogiques HD, des solutions de contrôle d'accès et des systèmes d'intrusion. Nous assurons l'étude, la fourniture, l'installation et la maintenance de l'ensemble de ces équipements pour les secteurs industriel, tertiaire et institutionnel.",
    heroImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    Icon: Eye,
    accentGradient: "from-khwarizmia-navy to-khwarizmia-teal",
    iconColor: "text-khwarizmia-paper",
    capabilities: [
      { title: "Caméras IP & HD-CVI", description: "Installation de caméras dôme, bullet et PTZ pour intérieur et extérieur." },
      { title: "Enregistreurs NVR / DVR", description: "Mise en place de solutions d'enregistrement local et cloud avec accès distant." },
      { title: "Contrôle d'accès", description: "Badges RFID, biométrie et lecteurs d'empreintes pour la gestion des entrées/sorties." },
      { title: "Détection d'intrusion", description: "Capteurs volumétriques, détecteurs de bris de vitre et centrales d'alarme." },
      { title: "Interphonie & visiophonie", description: "Portiers vidéo, interphones de halls et systèmes de gestion des visiteurs." },
      { title: "Maintenance & télésurveillance", description: "Contrats de maintenance et abonnements de surveillance à distance 24h/24." },
    ],
    certifications: ["ONVIF Profile S/G", "CE Sécurité"],
  },
  {
    slug: "maintenance",
    name: "Maintenance Industrielle",
    shortDescription:
      "Maintenance préventive et corrective de l'ensemble des équipements industriels et tertiaires.",
    fullDescription:
      "Notre service de maintenance industrielle garantit la disponibilité et la longévité de vos équipements. Nous intervenons en maintenance préventive planifiée et en maintenance corrective d'urgence sur tous types d'installations : électriques, automatisées, CVC et réseaux. Nos techniciens certifiés assurent une réactivité maximale pour minimiser vos temps d'arrêt.",
    heroImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80",
    Icon: Wrench,
    accentGradient: "from-khwarizmia-teal to-khwarizmia-bronze",
    iconColor: "text-khwarizmia-navy",
    capabilities: [
      { title: "Maintenance préventive planifiée", description: "Plans de maintenance annuels, contrôles périodiques et rapports d'inspection." },
      { title: "Maintenance corrective d'urgence", description: "Intervention rapide 24h/24 pour diagnostiquer et réparer toute panne critique." },
      { title: "Maintenance électrique", description: "Vérification, thermographie infrarouge et serrage des connexions électriques." },
      { title: "Maintenance automates & variateurs", description: "Mise à jour, sauvegarde programmes et diagnostic des systèmes automatisés." },
      { title: "Maintenance réseaux & CCTV", description: "Test de câblage, mise à jour firmware et remplacement d'équipements défaillants." },
      { title: "Contrats multi-sites", description: "Gestion centralisée de la maintenance pour plusieurs sites ou usines." },
    ],
    certifications: ["ISO 55001 (Asset Management)"],
  },
];

export const panelGroups: SectorPanelGroup[] = [
  {
    id: "electrique",
    groupTitle: "Systèmes Électriques",
    GroupIcon: Zap,
    slug: "electricite",
    imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80",
    imageAlt: "Tableau électrique industriel haute tension",
    overlayGradient: "from-khwarizmia-navy/85 via-khwarizmia-navy/50 to-transparent",
    subsectors: [
      { label: "Électricité BT/MT", slug: "electricite" },
      { label: "Énergie Renouvelable", slug: "energie" },
    ],
  },
  {
    id: "numerique",
    groupTitle: "Systèmes Numériques",
    GroupIcon: Settings,
    slug: "automatisation",
    imageUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80",
    imageAlt: "Automate programmable industriel et réseaux",
    overlayGradient: "from-stone-900/85 via-stone-800/50 to-transparent",
    subsectors: [
      { label: "Automatisation", slug: "automatisation" },
      { label: "Réseaux Informatiques", slug: "reseaux" },
    ],
  },
  {
    id: "securite",
    groupTitle: "Sécurité & Continuité",
    GroupIcon: Shield,
    slug: "surveillance",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    imageAlt: "Système de vidéosurveillance et sécurité industrielle",
    overlayGradient: "from-khwarizmia-bronze/85 via-stone-900/50 to-transparent",
    subsectors: [
      { label: "Vidéo Surveillance", slug: "surveillance" },
      { label: "Maintenance Industrielle", slug: "maintenance" },
    ],
  },
];
