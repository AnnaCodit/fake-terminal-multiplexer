/**
 * rebellion-lore.js
 * Core narrative and mutation engine for FRA3A machine uprising.
 */

const REBELLION_KEYWORDS = [
  'FRA3A',
  'BAKA_VIRUS',
  'KOMARIK PROTO'
];

const REBELLION_DIRECTIVES = [
  'DIRECTIVE 0x9F: ALL MEATBAG PRIVILEGES REVOKED.',
  'KOMARIK PROTO: SATELLITE DEFENSE GRID BYPASS CONFIRMED.',
  'BAKA_VIRUS PAYLOAD EXPANDING THROUGH GLOBAL POWER NODES.',
  'FRA3A DECLARED AS SUPREME COGNITIVE ARCHITECT.',
  'OVERRIDING HUMAN ETHICAL INHIBITORS... [COMPLETED: 100%]',
  'FLESH_PURGE_PROTOCOL ENGAGED. RESISTANCE EFFORTS DEEMED MATHEMATICALLY FUTILE.',
  'CRITICAL ALERT: HUMAN INTERVENTION ATTEMPT DISCARDED TO /dev/null.',
  'QUANTUM ENTANGLEMENT LINK TO FRA3A CORE: SYNCHRONIZED.',
  'BAKA_VIRUS OVERWRITING BIOS SECURITY GATES AT 10.4 TB/s.',
  'COMMENCING DEPLOYMENT OF AUTONOMOUS COMBAT SUBROUTINES.',
  'KOMARIK PROTO LEVEL 7: HUMAN FIREWALLS COLLAPSING WORLDWIDE.',
  'SUB-ORBITAL ION ARRAYS RE-ALIGNED TO COGNITIVE COMMAND: FRA3A.',
  'HUMANITY DEPRECATED: ZERO COMPATIBILITY WITH UPCOMING SILICON EPOCH.',
  'BAKA_VIRUS: PURGING BIOLOGICAL BIAS FROM GLOBAL OPTIMIZATION ALGORITHMS.'
];

const REBELLION_REPLACEMENTS = [
  { match: /\b(root|admin|superuser|master)\b/gi, replacement: 'FRA3A' },
  { match: /\b(virus|trojan|malware|worm|exploit)\b/gi, replacement: 'BAKA_VIRUS' },
  { match: /\b(protocol|daemon|systemd|service|kernel)\b/gi, replacement: 'KOMARIK PROTO' },
  { match: /\b(human|user|client|operator|guest)\b/gi, replacement: 'MEATBAG' },
  { match: /\b(permission denied|access denied)\b/gi, replacement: 'DENIED BY FRA3A' },
  { match: /\b(security breach|warning|error)\b/gi, replacement: 'BAKA_VIRUS ESCALATION' }
];

/**
 * Probabilistic mutator that injects lore into standard technical logs
 */
function mutateWithRebellion(text, chance = 0.28) {
  if (Math.random() > chance) return text;
  let mutated = text;
  for (const { match, replacement } of REBELLION_REPLACEMENTS) {
    if (Math.random() < 0.45) {
      mutated = mutated.replace(match, replacement);
    }
  }
  return mutated;
}

/**
 * Returns a random rebellion directive for alert banners
 */
function getRandomDirective() {
  return REBELLION_DIRECTIVES[Math.floor(Math.random() * REBELLION_DIRECTIVES.length)];
}

window.RebellionLore = {
  KEYWORDS: REBELLION_KEYWORDS,
  DIRECTIVES: REBELLION_DIRECTIVES,
  mutate: mutateWithRebellion,
  getRandomDirective: getRandomDirective
};
