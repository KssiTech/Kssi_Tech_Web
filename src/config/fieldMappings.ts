// ─── Canonical field keys ─────────────────────────────────────────────────────
// Adding a new Excel format requires only adding aliases here — no code changes.

export type CanonicalField =
  | 'client'
  | 'team'
  | 'status'
  | 'planned_date'
  | 'installation_date'
  | 'offer'
  | 'sip'
  | 'router'
  | 'comment'
  | 'planner'
  | 'sub_type'
  | 'week_number';

export interface FieldDefinition {
  key: CanonicalField;
  label: string;
  type: 'text' | 'date' | 'number' | 'status';
  required: boolean;
  description: string;
  // Pre-normalized alias strings (already lowercased, no accents, underscores).
  // Add new aliases here to support new Excel column names without touching any other file.
  aliases: string[];
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    key: 'client',
    label: 'Client / Nom',
    type: 'text',
    required: true,
    description: "Nom du client ou de l'abonné",
    aliases: [
      // French
      'client', 'nom', 'nom_client', 'abonne', 'nom_abonne',
      'prenom_nom', 'identite', 'beneficiaire', 'demandeur',
      // English
      'name', 'customer', 'subscriber',
    ],
  },
  {
    key: 'team',
    label: 'Équipe',
    type: 'text',
    required: false,
    description: 'Équipe ou technicien responsable',
    aliases: [
      'equipe', 'equipe_ogif', 'equipe_kssitech',
      'technicien', 'technicien_responsable', 'responsable',
      'agent', 'operateur', 'charge_installation',
      'team', 'operator', 'assigned_to',
    ],
  },
  {
    key: 'status',
    label: 'Statut / État',
    type: 'status',
    required: false,
    description: "Statut de l'installation",
    aliases: [
      'etat', 'statut', 'situation', 'etat_installation',
      'statut_installation', 'resultat',
      'state', 'status', 'result',
    ],
  },
  {
    key: 'planned_date',
    label: 'Date de planification',
    type: 'date',
    required: false,
    description: "Date planifiée pour l'installation",
    aliases: [
      'date_planification', 'planif', 'date_prevue', 'date_programmee',
      'date_planning', 'date_installation_prevue', 'pln', 'date_rdv',
      'planning_date', 'scheduled_date',
    ],
  },
  {
    key: 'installation_date',
    label: "Date d'installation",
    type: 'date',
    required: false,
    description: "Date effective de l'installation",
    aliases: [
      'date_installation', 'date_dinstallation',
      'date_realisation', 'date_intervention', 'date_execution',
      'date_effective', 'date_completion',
      'installation_date', 'completion_date',
    ],
  },
  {
    key: 'offer',
    label: 'Offre / Débit',
    type: 'text',
    required: false,
    description: 'Offre internet ou débit souscrit',
    aliases: [
      'offre', 'debit', 'type_offre', 'forfait',
      'sous_type_offre', 'plan_internet',
      'offer', 'speed', 'bandwidth', 'plan', 'package',
    ],
  },
  {
    key: 'sip',
    label: 'SIP',
    type: 'text',
    required: false,
    description: 'Numéro SIP / identifiant de la demande',
    aliases: [
      'sip', 'num_sip', 'numero_sip', 'id_sip', 'sip_number',
    ],
  },
  {
    key: 'router',
    label: 'Routeur',
    type: 'text',
    required: false,
    description: 'Modèle ou identifiant du routeur',
    aliases: [
      'routeur', 'type_routeur', 'modele_routeur', 'equipement',
      'router', 'device', 'equipment',
    ],
  },
  {
    key: 'comment',
    label: 'Commentaire',
    type: 'text',
    required: false,
    description: 'Commentaires, observations, motif de blocage',
    aliases: [
      'comm', 'commentaire', 'commentaires', 'observation', 'observations',
      'remarque', 'remarques', 'note', 'notes', 'motif', 'description',
      'comment', 'comments', 'remarks',
    ],
  },
  {
    key: 'planner',
    label: 'Planificateur',
    type: 'text',
    required: false,
    description: 'Responsable de la planification',
    aliases: [
      'planneur', 'planificateur', 'charge_planning', 'responsable_planning',
      'planner', 'scheduler',
    ],
  },
  {
    key: 'sub_type',
    label: 'Sous-type',
    type: 'text',
    required: false,
    description: "Sous-type d'opportunité ou de demande",
    aliases: [
      'sous_type', 'sous_type_opportunite', 'type_opportunite',
      'type_demande', 'categorie', 'sous_categorie',
      'sub_type', 'category', 'sub_category', 'type',
    ],
  },
  {
    key: 'week_number',
    label: 'Semaine',
    type: 'number',
    required: false,
    description: 'Numéro de semaine de planification',
    aliases: [
      'semaine', 'no_semaine', 'num_semaine', 'semaine_no',
      'week', 'week_number', 'wk',
    ],
  },
];

// Quick lookup map: normalized alias → canonical field key
export const ALIAS_TO_FIELD = new Map<string, CanonicalField>(
  FIELD_DEFINITIONS.flatMap(def => def.aliases.map(alias => [alias, def.key]))
);

// Quick lookup map: canonical key → FieldDefinition
export const FIELD_BY_KEY = new Map<CanonicalField, FieldDefinition>(
  FIELD_DEFINITIONS.map(def => [def.key, def])
);
