import { PILLARS, DIPLOMATIC_PROTOCOL_CORE, buildCouncilPlan } from './wpa-ai-council-phase3.mjs';

const VERSION = 'wpa-ai-council-prompt-compiler-1.0';

export const ADVISORY_ROLES = [
  { id:'doctrine_guard', name:'Doctrine Guard', instruction:'Protect WPA doctrine, terminology and conceptual distinctions.' },
  { id:'evidence_researcher', name:'Evidence Researcher', instruction:'Map every material claim to a verifiable source or mark it unsupported.' },
  { id