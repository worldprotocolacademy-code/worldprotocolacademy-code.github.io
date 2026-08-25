import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

const ApplicationSchema = z.object({
  programmeId: z.string().min(2).max(120),
  consentVersion: z.string().min(1).max(80)
});

const DecisionSchema = z.object({
  decision: z.enum(['admitted', 'rejected']),
  reason: z.string().min(5).max(2000)
});

const AssessmentConfirmSchema = z.object({
  result: z.number().min(0).max(100),
  passed: z.boolean(),
  reason: z.string().min(5).max(2000)
});

const ApprovalSchema = z.object({
  reason: z.string().min(5).max(2000)
});

const jwksCache = new Map();

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      ...extra
    }
  });
}

function now() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function enabled(env) {
  return env.WPA_BACKEND_MODE === 'STAGING' || env.WPA_BACKEND_MODE === 'PRODUCTION';
}

function requireDb(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured');
}

async function parseBody(request, schema) {
  let raw;
  try { raw = await request.json(); } catch { throw new HttpError(400, 'invalid_json'); }
  const result = schema.safeParse(raw);
  if (!result.success) throw new HttpError(400, 'invalid_request', result.error.flatten());
  return result.data;
}

class HttpError extends Error {
  constructor(status, code, details) {
    super(code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getAccessJwks(env) {
  const domain = env.ACCESS_TEAM_DOMAIN;
  if (!domain || domain.startsWith('REPLACE_')) throw new HttpError(503, 'access_not_configured');
  if (!jwksCache.has(domain)) {
    jwksCache.set(domain, createRemoteJWKSet(new URL(`https://${domain}/cdn-cgi/access/certs`)));
  }
  return jwksCache.get(domain);
}

async function authenticate(request, env) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) throw new HttpError(401, 'access_token_required');
  if (!env.ACCESS_AUD || env.ACCESS_AUD.startsWith('REPLACE_')) throw new HttpError(503, 'access_not_configured');

  const { payload } = await jwtVerify(token, getAccessJwks(env), {
    audience: env.ACCESS_AUD,
    issuer: `https://${env.ACCESS_TEAM_DOMAIN}`
  });

  const email = String(payload.email || '').trim().toLowerCase();
  if (!email) throw new HttpError(401, 'access_identity_missing_email');

  let roles = [];
  if (env.DB) {
    const rows = await env.DB.prepare(
      'SELECT role FROM user_roles WHERE email = ?1 AND revoked_at IS NULL'
    ).bind(email).all();
    roles = (rows.results || []).map(r => r.role);
  }

  if (env.BOOTSTRAP_ADMIN_EMAIL && email === env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    roles = Array.from(new Set([...roles, 'admin']));
  }

  if (!roles.length) roles = ['student'];
  return { email, roles };
}

function requireRole(actor, allowed) {
  if (!actor.roles.some(role => allowed.includes(role))) throw new HttpError(403, 'insufficient_role');
}

function requireMutationEnabled(env) {
  requireDb(env);
  if (!enabled(env)) throw new HttpError(503, 'backend_activation_disabled');
}

async function auditBatch(env, { actor, objectType, objectId, eventType, previousState, newState, reason, gateClass, action, requestId, statements = [] }) {
  const approvalId = id('appr');
  const auditId = id('audit');
  const ts = now();
  const primaryRole = actor.roles.includes('admin') ? 'admin' : actor.roles[0];
  const approval = env.DB.prepare(`
    INSERT INTO human_approvals
      (approval_id, object_type, object_id, gate_class, action, decision, actor_email, actor_role, reason, previous_state, new_state, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, 'approved', ?6, ?7, ?8, ?9, ?10, ?11)
  `).bind(approvalId, objectType, objectId, gateClass, action, actor.email, primaryRole, reason, previousState, newState, ts);
  const audit = env.DB.prepare(`
    INSERT INTO audit_events
      (audit_id, event_type, object_type, object_id, actor_email, actor_role, request_id, previous_state, new_state, metadata_json, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
  `).bind(auditId, eventType, objectType, objectId, actor.email, primaryRole, requestId, previousState, newState, JSON.stringify({ reason, approvalId }), ts);
  await env.DB.batch([...statements, approval, audit]);
  return { approvalId, auditId, at: ts };
}

async function createApplication(request, env, actor, requestId) {
  requireMutationEnabled(env);
  const body = await parseBody(request, ApplicationSchema);
  const applicationId = id('app');
  const ts = now();
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO applications
        (application_id, student_email, programme_id, status, consent_version, consent_at, submitted_at, created_at, updated_at)
      VALUES (?1, ?2, ?3, 'submitted', ?4, ?5, ?5, ?5, ?5)
    `).bind(applicationId, actor.email, body.programmeId, body.consentVersion, ts),
    env.DB.prepare(`
      INSERT INTO audit_events
        (audit_id, event_type, object_type, object_id, actor_email, actor_role, request_id, previous_state, new_state, metadata_json, created_at)
      VALUES (?1, 'application_submitted', 'application', ?2, ?3, 'student', ?4, NULL, 'submitted', ?5, ?6)
    `).bind(id('audit'), applicationId, actor.email, requestId, JSON.stringify({ consentVersion: body.consentVersion }), ts)
  ]);
  return json({ ok: true, applicationId, status: 'submitted', humanGateClass: 'HG1' }, 201);
}

async function getApplication(env, actor, applicationId) {
  requireDb(env);
  const row = await env.DB.prepare('SELECT * FROM applications WHERE application_id = ?1').bind(applicationId).first();
  if (!row) throw new HttpError(404, 'application_not_found');
  const staff = actor.roles.some(r => ['reviewer', 'admin', 'issuer'].includes(r));
  if (!staff && row.student_email !== actor.email) throw new HttpError(403, 'not_owner');
  return json({ application: row });
}

async function decideApplication(request, env, actor, applicationId, requestId) {
  requireMutationEnabled(env);
  requireRole(actor, ['reviewer', 'admin']);
  const body = await parseBody(request, DecisionSchema);
  const row = await env.DB.prepare('SELECT * FROM applications WHERE application_id = ?1').bind(applicationId).first();
  if (!row) throw new HttpError(404, 'application_not_found');
  if (!['submitted', 'under_review'].includes(row.status)) throw new HttpError(409, 'invalid_application_state');
  const ts = now();
  const update = env.DB.prepare(`
    UPDATE applications SET status = ?1, decided_at = ?2, decided_by = ?3, decision_reason = ?4, updated_at = ?2
    WHERE application_id = ?5 AND status IN ('submitted','under_review')
  `).bind(body.decision, ts, actor.email, body.reason, applicationId);
  const audit = await auditBatch(env, {
    actor, objectType: 'application', objectId: applicationId, eventType: 'admission_decision',
    previousState: row.status, newState: body.decision, reason: body.reason, gateClass: 'HG3',
    action: 'admission_decision', requestId, statements: [update]
  });
  return json({ ok: true, applicationId, status: body.decision, humanApproval: audit });
}

async function confirmAssessment(request, env, actor, assessmentId, requestId) {
  requireMutationEnabled(env);
  requireRole(actor, ['reviewer', 'admin']);
  const body = await parseBody(request, AssessmentConfirmSchema);
  const row = await env.DB.prepare('SELECT * FROM assessments WHERE assessment_id = ?1').bind(assessmentId).first();
  if (!row) throw new HttpError(404, 'assessment_not_found');
  if (!['submitted', 'under_review'].includes(row.status)) throw new HttpError(409, 'invalid_assessment_state');
  const next = body.passed ? 'confirmed_pass' : 'confirmed_fail';
  const ts = now();
  const update = env.DB.prepare(`
    UPDATE assessments SET human_confirmed_result = ?1, status = ?2, confirmed_by = ?3, confirmed_at = ?4, updated_at = ?4
    WHERE assessment_id = ?5 AND status IN ('submitted','under_review')
  `).bind(body.result, next, actor.email, ts, assessmentId);
  const audit = await auditBatch(env, {
    actor, objectType: 'assessment', objectId: assessmentId, eventType: 'assessment_human_confirmation',
    previousState: row.status, newState: next, reason: body.reason, gateClass: 'HG3',
    action: 'confirm_assessment', requestId, statements: [update]
  });
  return json({ ok: true, assessmentId, status: next, humanApproval: audit });
}

async function authoriseCertificate(request, env, actor, certificateId, requestId) {
  requireMutationEnabled(env);
  requireRole(actor, ['issuer', 'admin']);
  const body = await parseBody(request, ApprovalSchema);
  const row = await env.DB.prepare('SELECT * FROM certificates WHERE certificate_id = ?1').bind(certificateId).first();
  if (!row) throw new HttpError(404, 'certificate_not_found');
  if (!['eligible', 'pending_authorisation'].includes(row.status)) throw new HttpError(409, 'invalid_certificate_state');
  const assessment = await env.DB.prepare('SELECT status FROM assessments WHERE assessment_id = ?1').bind(row.assessment_id).first();
  if (!assessment || assessment.status !== 'confirmed_pass') throw new HttpError(409, 'assessment_not_human_confirmed_pass');
  const ts = now();
  const update = env.DB.prepare(`
    UPDATE certificates SET status = 'authorised', authorised_by = ?1, authorised_at = ?2, updated_at = ?2
    WHERE certificate_id = ?3 AND status IN ('eligible','pending_authorisation')
  `).bind(actor.email, ts, certificateId);
  const audit = await auditBatch(env, {
    actor, objectType: 'certificate', objectId: certificateId, eventType: 'certificate_authorised',
    previousState: row.status, newState: 'authorised', reason: body.reason, gateClass: 'HG3',
    action: 'certificate_authorisation', requestId, statements: [update]
  });
  return json({ ok: true, certificateId, status: 'authorised', humanApproval: audit });
}

async function issueCertificate(request, env, actor, certificateId, requestId) {
  requireMutationEnabled(env);
  requireRole(actor, ['issuer', 'admin']);
  const body = await parseBody(request, ApprovalSchema);
  const row = await env.DB.prepare('SELECT * FROM certificates WHERE certificate_id = ?1').bind(certificateId).first();
  if (!row) throw new HttpError(404, 'certificate_not_found');
  if (row.status !== 'authorised') throw new HttpError(409, 'certificate_not_authorised');
  if (!row.authorised_by || !row.authorised_at) throw new HttpError(409, 'missing_human_authorisation_record');
  const ts = now();
  const serial = `WPA-${new Date().getUTCFullYear()}-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
  const verificationCode = crypto.randomUUID().replaceAll('-', '').toUpperCase();
  const update = env.DB.prepare(`
    UPDATE certificates SET status = 'issued', serial = ?1, verification_code = ?2, issued_by = ?3, issued_at = ?4, updated_at = ?4
    WHERE certificate_id = ?5 AND status = 'authorised'
  `).bind(serial, verificationCode, actor.email, ts, certificateId);
  const audit = await auditBatch(env, {
    actor, objectType: 'certificate', objectId: certificateId, eventType: 'certificate_issued',
    previousState: 'authorised', newState: 'issued', reason: body.reason, gateClass: 'HG3',
    action: 'certificate_issue', requestId, statements: [update]
  });
  return json({ ok: true, certificateId, status: 'issued', serial, verificationCode, humanApproval: audit }, 201);
}

async function verifyCertificate(env, code) {
  requireDb(env);
  const row = await env.DB.prepare(`
    SELECT serial, programme_id, status, issued_at, revoked_at
    FROM certificates WHERE verification_code = ?1
  `).bind(code).first();
  if (!row) return json({ verified: false, status: 'not_found' }, 404);
  return json({
    verified: row.status === 'issued',
    serial: row.serial,
    programmeId: row.programme_id,
    status: row.status,
    issuedAt: row.issued_at,
    revokedAt: row.revoked_at || null
  });
}

export default {
  async fetch(request, env) {
    const requestId = request.headers.get('cf-ray') || crypto.randomUUID();
    try {
      const url = new URL(request.url);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204 });

      if (url.pathname === '/health') {
        return json({
          service: 'wpa-student-ops-backend',
          version: '0.1.0',
          mode: env.WPA_BACKEND_MODE || 'DISABLED',
          mutationsEnabled: enabled(env),
          d1Configured: Boolean(env.DB),
          accessConfigured: Boolean(env.ACCESS_AUD && !env.ACCESS_AUD.startsWith('REPLACE_'))
        });
      }

      const publicVerify = url.pathname.match(/^\/v1\/public\/certificates\/([A-Z0-9]+)$/i);
      if (request.method === 'GET' && publicVerify) return verifyCertificate(env, publicVerify[1].toUpperCase());

      if (!url.pathname.startsWith('/v1/')) throw new HttpError(404, 'not_found');
      const actor = await authenticate(request, env);

      if (request.method === 'GET' && url.pathname === '/v1/me') {
        return json({ email: actor.email, roles: actor.roles, backendMode: env.WPA_BACKEND_MODE || 'DISABLED' });
      }

      if (request.method === 'POST' && url.pathname === '/v1/applications') {
        return createApplication(request, env, actor, requestId);
      }

      let match = url.pathname.match(/^\/v1\/applications\/([^/]+)$/);
      if (request.method === 'GET' && match) return getApplication(env, actor, match[1]);

      match = url.pathname.match(/^\/v1\/applications\/([^/]+)\/decision$/);
      if (request.method === 'POST' && match) return decideApplication(request, env, actor, match[1], requestId);

      match = url.pathname.match(/^\/v1\/assessments\/([^/]+)\/confirm$/);
      if (request.method === 'POST' && match) return confirmAssessment(request, env, actor, match[1], requestId);

      match = url.pathname.match(/^\/v1\/certificates\/([^/]+)\/authorise$/);
      if (request.method === 'POST' && match) return authoriseCertificate(request, env, actor, match[1], requestId);

      match = url.pathname.match(/^\/v1\/certificates\/([^/]+)\/issue$/);
      if (request.method === 'POST' && match) return issueCertificate(request, env, actor, match[1], requestId);

      throw new HttpError(404, 'not_found');
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.code, details: error.details || null }, error.status);
      if (error?.code === 'ERR_JWT_EXPIRED' || error?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' || error?.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
        return json({ error: 'access_token_invalid' }, 401);
      }
      console.error('WPA_STUDENT_OPS_ERROR', requestId, error?.message || error);
      return json({ error: 'internal_error', requestId }, 500);
    }
  }
};
