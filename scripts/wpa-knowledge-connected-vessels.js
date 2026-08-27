/* WPA Knowledge Connected Vessels Bridge v1.0.0
   Public, read-only runtime bridge for the governed WPA knowledge architecture.
   Loads public manifests only. No credentials, scraping, autonomous doctrine edits,
   consequential release, or automatic external posting. Human Gate remains authoritative. */
(function () {
  'use strict';

  var MODEL_URL = '/data/wpa-knowledge-connected-vessels-integration.json?v=20260827-1';
  var MAX_LOCAL_EVENTS = 60;

  function path() {
    return String(window.location.pathname || '/').replace(/\/+$/, '') || '/';
  }

  function surfaceId() {
    var p = path().toLowerCase();
    if (p.indexOf('/journal/live') === 0) return 'wpa_journal_live';
    if (p.indexOf('/wpaws/diplomatic-analysis-lab') === 0) return 'wpaws_diplomatic_analysis_lab';
    if (p.indexOf('/wpaws') === 0) return 'wpaws';
    if (p.indexOf('/tools/academic-search-hub') === 0) return 'academic_search_hub';
    if (p.indexOf('/wpa-global-institutional-evidence-programme') === 0) return 'global_institutional_evidence_programme';
    if (p.indexOf('/protocolometry-center') === 0) return 'protocolometry_center';
    if (p.indexOf('/student-desk') === 0) return 'student_desk';
    if (p.indexOf('/virtual-sande-ai') === 0 || p.indexOf('/viral-sande-ai') === 0) return 'virtual_sande';
    if (p.indexOf('/wpa-briefings') === 0) return 'wpa_briefings';
    return 'wpa_system';
  }

  function traceId() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return 'KCV-' + window.crypto.randomUUID();
      }
    } catch (e) {}
    return 'KCV-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return value;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function fetchJson(url) {
    return fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
      return response.json();
    });
  }

  function localEvent(action, detail) {
    var event = {
      timestamp: new Date().toISOString(),
      trace_id: traceId(),
      surface: surfaceId(),
      action: action || 'read',
      detail: detail || null
    };

    try {
      var stored = JSON.parse(localStorage.getItem('wpa.knowledge.connected_vessels.events') || '[]');
      if (!Array.isArray(stored)) stored = [];
      stored.push(event);
      if (stored.length > MAX_LOCAL_EVENTS) stored = stored.slice(stored.length - MAX_LOCAL_EVENTS);
      localStorage.setItem('wpa.knowledge.connected_vessels.events', JSON.stringify(stored));
    } catch (e) {}

    try {
      document.dispatchEvent(new CustomEvent('wpa:knowledge-connected-vessels-action', { detail: event }));
    } catch (e2) {}

    return event;
  }

  function validateModel(model) {
    if (!model || typeof model !== 'object') throw new Error('Knowledge integration manifest missing');
    if (model.schema !== 'wpa-knowledge-connected-vessels-integration/1.0') throw new Error('Unexpected knowledge integration schema');
    if (model.status !== 'ACTIVE_GOVERNED_INTEGRATION_MODEL') throw new Error('Knowledge integration model is not active');
    if (!model.institutional_dna_reference || !model.scholarly_knowledge_reference) throw new Error('Knowledge stream references missing');
    if (!model.doctrine_rule || !model.rights_rule) throw new Error('Governance rules missing');
    if (!model['24_7_ready'] || model['24_7_ready'].active_scheduler_verified !== false) throw new Error('24/7 verification invariant mismatch');
    return model;
  }

  function referenceMap(model) {
    return deepFreeze({
      connected_vessels: model.connected_vessels_reference,
      institutional_dna: model.institutional_dna_reference,
      institutional_practice_atom_schema: model.institutional_practice_atom_schema,
      scholarly_knowledge: model.scholarly_knowledge_reference,
      scholarly_knowledge_atom_schema: model.scholarly_knowledge_atom_schema,
      academic_search_hub: model.academic_search_hub,
      rag_gate: model.rag_gate
    });
  }

  function boot() {
    fetchJson(MODEL_URL)
      .then(validateModel)
      .then(function (rawModel) {
        var model = deepFreeze(rawModel);
        var refs = referenceMap(model);

        var api = {
          version: '1.0.0',
          schema: model.schema,
          status: model.status,
          surface: surfaceId(),
          model: model,
          references: refs,
          governance: deepFreeze({
            human_gate_required: true,
            autonomous_doctrine_write: false,
            automatic_external_posting: false,
            discovery_is_permission_to_ingest: false,
            active_scheduler_verified: false,
            public_source_and_rights_controls_required: true
          }),
          routes: function () {
            return clone(model.strategic_routes || []);
          },
          snapshot: function () {
            return clone({
              version: this.version,
              schema: this.schema,
              status: this.status,
              surface: surfaceId(),
              governance: this.governance,
              references: refs,
              core_model: model.core_model,
              doctrine_rule: model.doctrine_rule,
              strategy_rule: model.strategy_rule,
              research_rule: model.research_rule,
              rights_rule: model.rights_rule,
              public_principle: model.public_principle
            });
          },
          loadReference: function (key) {
            var url = refs[key];
            if (!url || typeof url !== 'string' || url.charAt(0) !== '/') {
              return Promise.reject(new Error('Unknown or non-local WPA reference: ' + key));
            }
            localEvent('load-reference', { key: key, url: url });
            return fetchJson(url).then(function (data) { return clone(data); });
          },
          trace: function (action, detail) {
            return localEvent(action, detail);
          },
          localEvents: function () {
            try {
              var events = JSON.parse(localStorage.getItem('wpa.knowledge.connected_vessels.events') || '[]');
              return Array.isArray(events) ? clone(events) : [];
            } catch (e) {
              return [];
            }
          }
        };

        window.WPA_KNOWLEDGE_CONNECTED_VESSELS = Object.freeze(api);
        localEvent('ready', { version: api.version, model_version: model.version || null });

        try {
          document.dispatchEvent(new CustomEvent('wpa:knowledge-connected-vessels-ready', {
            detail: {
              version: api.version,
              model_version: model.version || null,
              surface: api.surface,
              human_gate_required: true,
              active_scheduler_verified: false
            }
          }));
        } catch (e) {}
      })
      .catch(function (error) {
        var failure = {
          version: '1.0.0',
          status: 'UNAVAILABLE',
          surface: surfaceId(),
          governance: Object.freeze({
            human_gate_required: true,
            autonomous_doctrine_write: false,
            automatic_external_posting: false,
            active_scheduler_verified: false
          }),
          error: String(error && error.message ? error.message : error)
        };
        window.WPA_KNOWLEDGE_CONNECTED_VESSELS = Object.freeze(failure);
        localEvent('unavailable', { error: failure.error });
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
