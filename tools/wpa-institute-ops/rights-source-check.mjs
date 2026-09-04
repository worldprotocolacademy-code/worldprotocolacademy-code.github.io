import fs from 'fs/promises';

const ROOT = process.cwd();
const generated = new Date().toISOString();
const SCHOLARLY_FILE = `${ROOT}/data/open-knowledge/scholarly-atoms.json`;
const INSTITUTIONAL_FILE = `${ROOT}/data/open-knowledge/institutional-practice-atoms.json`;
const REPORT_FILE = `${ROOT}/data/open-knowledge/rights-source-gate.json`;
const USER_AGENT = 'WorldProtocolAcademy-OpenKnowledge/1.1 (+https://worldprotocolacademy.mk/open-knowledge-command/)';
const ROBOTS_TIMEOUT_MS = Math.max(4000, Number(process.env.WPA_ROBOTS_TIMEOUT_MS || 8000));

const readJson = async (file, fallback = {}) => {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
};
const writeJson = async (file, value) => fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
const clean = (value = '') => String(value).replace(/\s+/g, ' ').trim();

function normalizeLicense(value) {
  return clean(value).toLowerCase();
}

function reusableOpenLicense(value) {
  const license = normalizeLicense(value);
  if (!license) return false;
  if (/\bcc0\b|public[-_ ]?domain|creativecommons\.org\/publicdomain\//i.test(license)) return true;
  if (/\b(?:by[-_ ]?nc|by[-_ ]?nd|nc[-_ ]?sa|nc[-_ ]?nd)\b|\/by-nc(?:-|\/)|\/by-nd(?:-|\/)/i.test(license)) return false;
  if (/^cc[-_ ]?by(?:[-_ ]?sa)?(?:[-_ ]?\d(?:\.\d)?)?$/i.test(license)) return true;
  if (/creativecommons\.org\/licenses\/by(?:-sa)?\//i.test(license)) return true;
  return false;
}

function metadataOnlySummary(atom) {
  const title = clean(atom.title || atom.atom_id || 'Untitled source');
  return `Metadata-only discovery record for “${title.slice(0, 220)}”. Substantive text is withheld from WPA-native transformation until a reuse-compatible rights basis or explicit manual authorisation is verified.`;
}

function hardenScholarlyAtom(atom) {
  const originalAccessBasis = String(atom.access_basis || 'UNKNOWN');
  const originalReuseStatus = String(atom.reuse_status || 'UNKNOWN');
  const license = normalizeLicense(atom.license);
  const publicDomain = originalAccessBasis === 'PUBLIC_DOMAIN';
  const manuallyAuthorised = originalAccessBasis === 'MANUALLY_AUTHORISED';
  const compatibleOpenLicense = originalAccessBasis === 'OPEN_LICENSE' && reusableOpenLicense(license);
  const eligible = publicDomain || manuallyAuthorised || compatibleOpenLicense;

  if (eligible) {
    return {
      ...atom,
      reuse_status: 'ELIGIBLE_AFTER_HUMAN_REVIEW',
      rights_source_gate: {
        decision: 'ELIGIBLE_AFTER_HUMAN_REVIEW',
        original_access_basis: originalAccessBasis,
        license: atom.license || null,
        commercial_context_safe_for_adaptation: publicDomain || manuallyAuthorised || compatibleOpenLicense,
        human_review_required: true,
        checked_at: generated
      }
    };
  }

  const reason = originalAccessBasis === 'OPEN_LICENSE'
    ? 'Licence is non-commercial, no-derivatives, unknown, or otherwise not approved for broad WPA-native adaptation.'
    : 'Open visibility or metadata access is not a substantive reuse licence.';

  return {
    ...atom,
    access_basis: 'OPEN_METADATA_ONLY',
    reuse_status: 'HOLD',
    knowledge_summary: metadataOnlySummary(atom),
    limitations: Array.from(new Set([
      ...(atom.limitations || []),
      'Substantive source text is not routed into WPA-native transformation while the rights basis is held.'
    ])),
    rights_source_gate: {
      decision: 'METADATA_ONLY_HOLD',
      reason,
      original_access_basis: originalAccessBasis,
      original_reuse_status: originalReuseStatus,
      license: atom.license || null,
      human_review_required: true,
      checked_at: generated
    }
  };
}

function parseRobots(text) {
  const groups = [];
  let current = { agents: [], rules: [], crawlDelay: 0 };
  const flush = () => {
    if (current.agents.length) groups.push(current);
    current = { agents: [], rules: [], crawlDelay: 0 };
  };

  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const index = line.indexOf(':');
    if (index < 0) continue;
    const key = line.slice(0, index).trim().toLowerCase();
    const value = line.slice(index + 1).trim();
    if (key === 'user-agent') {
      if (current.rules.length || current.crawlDelay) flush();
      current.agents.push(value.toLowerCase());
    } else if (current.agents.length && (key === 'allow' || key === 'disallow')) {
      if (key === 'disallow' && value === '') continue;
      current.rules.push({ type: key, pattern: value });
    } else if (current.agents.length && key === 'crawl-delay') {
      current.crawlDelay = Math.max(0, Number(value) || 0);
    }
  }
  flush();
  return groups;
}

function ruleRegex(pattern) {
  const raw = String(pattern || '');
  const endAnchored = raw.endsWith('$');
  const body = endAnchored ? raw.slice(0, -1) : raw;
  const escaped = body
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${escaped}${endAnchored ? '$' : ''}`);
}

function selectedRobotsGroups(groups) {
  const token = 'worldprotocolacademy-openknowledge';
  const specific = groups
    .filter((group) => group.agents.some((agent) => agent !== '*' && (token === agent || token.startsWith(agent))))
    .map((group) => ({ group, specificity: Math.max(...group.agents.filter((agent) => agent !== '*').map((agent) => agent.length)) }))
    .sort((a, b) => b.specificity - a.specificity);
  if (specific.length) {
    const max = specific[0].specificity;
    return specific.filter((item) => item.specificity === max).map((item) => item.group);
  }
  return groups.filter((group) => group.agents.includes('*'));
}

function evaluateRobots(groups, targetUrl) {
  const selected = selectedRobotsGroups(groups);
  if (!selected.length) return { allows: true, matched_rule: null, crawl_delay_seconds: 0 };
  const url = new URL(targetUrl);
  const path = `${url.pathname || '/'}${url.search || ''}`;
  const matches = [];
  let crawlDelay = 0;
  for (const group of selected) {
    crawlDelay = Math.max(crawlDelay, Number(group.crawlDelay || 0));
    for (const rule of group.rules || []) {
      if (!rule.pattern) continue;
      try {
        if (ruleRegex(rule.pattern).test(path)) {
          matches.push({ ...rule, length: rule.pattern.replace(/[*$]/g, '').length });
        }
      } catch {}
    }
  }
  if (!matches.length) return { allows: true, matched_rule: null, crawl_delay_seconds: crawlDelay };
  matches.sort((a, b) => b.length - a.length || (a.type === 'allow' ? -1 : 1));
  const winner = matches[0];
  return { allows: winner.type === 'allow', matched_rule: winner, crawl_delay_seconds: crawlDelay };
}

const robotsCache = new Map();
async function fetchRobotsOrigin(origin) {
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  const promise = (async () => {
    try {
      const response = await fetch(`${origin}/robots.txt`, {
        redirect: 'follow',
        headers: { 'user-agent': USER_AGENT, accept: 'text/plain,*/*;q=0.5' },
        signal: AbortSignal.timeout(ROBOTS_TIMEOUT_MS)
      });
      if (response.status === 404) return { status: 'NOT_PUBLISHED', rules: [], fail_closed_hold: false };
      if (!response.ok) return { status: `HTTP_${response.status}`, rules: [], fail_closed_hold: true };
      const text = (await response.text()).slice(0, 120000);
      return { status: 'PUBLISHED_PARSED', rules: parseRobots(text), fail_closed_hold: false };
    } catch (error) {
      return { status: 'UNAVAILABLE', rules: [], fail_closed_hold: true, error: String(error?.message || error).slice(0, 180) };
    }
  })();
  robotsCache.set(origin, promise);
  return promise;
}

async function robotsDecision(targetUrl) {
  let url;
  try { url = new URL(targetUrl); } catch {
    return { decision: 'HOLD', status: 'INVALID_URL', url: targetUrl };
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    return { decision: 'HOLD', status: 'NON_PUBLIC_PROTOCOL', url: targetUrl };
  }
  const originPolicy = await fetchRobotsOrigin(url.origin);
  if (originPolicy.fail_closed_hold) {
    return { decision: 'HOLD', status: originPolicy.status, url: targetUrl, error: originPolicy.error || null };
  }
  const evaluated = evaluateRobots(originPolicy.rules, targetUrl);
  return {
    decision: evaluated.allows ? 'ALLOW' : 'HOLD',
    status: originPolicy.status,
    url: targetUrl,
    matched_rule: evaluated.matched_rule || null,
    crawl_delay_seconds: evaluated.crawl_delay_seconds || 0
  };
}

async function hardenInstitutionalAtoms(atoms) {
  const eligible = [];
  const quarantine = [];
  for (const atom of atoms || []) {
    const refs = (atom.source_refs || [])
      .map((ref) => ref?.url_or_identifier)
      .filter((value) => /^https?:\/\//i.test(String(value || '')));
    const decisions = [];
    for (const url of refs) decisions.push(await robotsDecision(url));
    const blocked = refs.length === 0 || decisions.some((decision) => decision.decision !== 'ALLOW');
    if (blocked) {
      quarantine.push({
        atom_id: atom.atom_id,
        institution_id: atom.institution_id,
        institution_name: atom.institution_name,
        release_state: 'WITHHELD_RIGHTS_SOURCE_CHECK',
        reason: refs.length === 0 ? 'No public HTTP(S) source reference is available.' : 'At least one source path is disallowed or could not be safely verified against robots.txt.',
        source_decisions: decisions,
        human_gate: 'REQUIRED',
        checked_at: generated
      });
      continue;
    }
    eligible.push({
      ...atom,
      reuse_status: 'ELIGIBLE_AFTER_HUMAN_REVIEW',
      rights_source_gate: {
        decision: 'ELIGIBLE_AFTER_HUMAN_REVIEW',
        source_decisions: decisions,
        body_retention: atom.portal_signals?.source_body_retained === false ? 'NONE' : 'INVALID',
        human_review_required: true,
        checked_at: generated
      }
    });
  }
  return { eligible, quarantine };
}

await fs.mkdir(`${ROOT}/data/open-knowledge`, { recursive: true });
const [scholarly, institutional] = await Promise.all([
  readJson(SCHOLARLY_FILE, { atoms: [], errors: [] }),
  readJson(INSTITUTIONAL_FILE, { atoms: [] })
]);

const hardenedScholarly = (scholarly.atoms || []).map(hardenScholarlyAtom);
const scholarlyEligible = hardenedScholarly.filter((atom) => atom.reuse_status === 'ELIGIBLE_AFTER_HUMAN_REVIEW').length;
const scholarlyHolds = hardenedScholarly.length - scholarlyEligible;
const restrictedLicenseHolds = hardenedScholarly.filter((atom) => atom.rights_source_gate?.decision === 'METADATA_ONLY_HOLD' && atom.rights_source_gate?.original_access_basis === 'OPEN_LICENSE').length;

const institutionalResult = await hardenInstitutionalAtoms(institutional.atoms || []);

await writeJson(SCHOLARLY_FILE, {
  ...scholarly,
  generated,
  rights_source_gate_mode: 'FAIL_CLOSED',
  atoms: hardenedScholarly
});

await writeJson(INSTITUTIONAL_FILE, {
  ...institutional,
  generated,
  rights_source_gate_mode: 'FAIL_CLOSED',
  retained_total: institutionalResult.eligible.length,
  atoms: institutionalResult.eligible,
  rights_source_quarantine: institutionalResult.quarantine
});

const report = {
  schema: 'wpa-rights-source-gate/1.0',
  generated,
  mode: 'FAIL_CLOSED',
  purpose: 'Independent post-harvest rights and robots-path verification before WPA-native transformation.',
  scholarly: {
    total: hardenedScholarly.length,
    substantive_eligible_after_human_review: scholarlyEligible,
    metadata_only_or_held: scholarlyHolds,
    restricted_or_unknown_open_license_holds: restrictedLicenseHolds,
    transient_source_errors_this_cycle: Array.isArray(scholarly.errors) ? scholarly.errors.length : 0
  },
  institutional: {
    input_atoms: (institutional.atoms || []).length,
    eligible_after_path_level_robots_check: institutionalResult.eligible.length,
    quarantined: institutionalResult.quarantine.length,
    robots_origins_checked: robotsCache.size
  },
  controls: {
    open_access_visibility_is_not_reuse_permission: true,
    cc_nc_and_cc_nd_are_not_routed_for_broad_adaptation: true,
    unknown_open_licence_is_metadata_only: true,
    robots_rules_cached_by_origin_but_evaluated_per_exact_path: true,
    robots_unavailable_or_error_is_fail_closed_hold: true,
    protected_source_body_retention: 'DISABLED',
    human_review_before_consequential_reuse: 'REQUIRED',
    source_failure_never_relaxes_rights_rules: true
  },
  source_resilience: {
    policy: 'Transient 403/429/timeouts degrade that source for the cycle; the Institute continues with independent lawful sources and retries on later cycles. Source unavailability never upgrades a rights basis or permits bypass.',
    current_cycle_degraded: Array.isArray(scholarly.errors) && scholarly.errors.length > 0
  }
};

await writeJson(REPORT_FILE, report);
console.log(`WPA RIGHTS/SOURCE CHECK complete: scholarly eligible ${scholarlyEligible}/${hardenedScholarly.length}; institutional eligible ${institutionalResult.eligible.length}/${(institutional.atoms || []).length}; quarantined ${institutionalResult.quarantine.length}.`);