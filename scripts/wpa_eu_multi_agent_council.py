#!/usr/bin/env python3
"""WPA EU Multi-AI Council v6.0: bounded server-side provider routing.

No network access or billing unless BOTH --live and WPA_EU_COUNCIL_LIVE_ENABLED=1
are present. Provider outputs are advisory and never override an official EU call.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / 'data/eu-application-factory/provider-council-v1.json'
SOURCE = ROOT / 'data/eu-application-factory/priority0-evidence-2026-11-15.json'
ALLOWED_HOSTS = {
    'api.openai.com', 'api.anthropic.com', 'api.x.ai', 'api.moonshot.ai',
    'api.perplexity.ai', 'generativelanguage.googleapis.com',
    'dashscope-intl.aliyuncs.com', 'dashscope.aliyuncs.com',
    'api.deepseek.com', 'open.bigmodel.cn', 'api.z.ai',
    'api.mistral.ai', 'api.eu.mistral.ai'
}
ENDPOINTS = {
    'gpt': 'https://api.openai.com/v1/chat/completions',
    'claude': 'https://api.anthropic.com/v1/messages',
    'grok': 'https://api.x.ai/v1/responses',
    'kimi': 'https://api.moonshot.ai/v1/chat/completions',
    'gemini': 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    'perplexity': 'https://api.perplexity.ai/chat/completions',
    'qwen': 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
    'deepseek': 'https://api.deepseek.com/chat/completions',
    'zai': 'https://api.z.ai/api/paas/v4/chat/completions',
    'mistral': 'https://api.mistral.ai/v1/chat/completions',
}
SYSTEM = (
    'You are a research specialist for World Protocol Academy EU Application Factory. '
    'Use the dated OFFICIAL PUBLIC evidence packet only. Separate facts, proposals, '
    'unknowns and fatal eligibility/timing blockers. Never fabricate open calls, '
    'partners, legal entities, PIC/OID, commitments, awards or submissions. '
    'Return a concise JSON-like analytical memo. This is NOT a verified eligibility decision.'
)


def utcnow():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')


def get_registry():
    d = json.loads(REGISTRY.read_text(encoding='utf-8'))
    assert len(d['providers']) == 13
    return d


def secret_name(pid):
    return 'WPA_EU_' + pid.upper() + '_API_KEY'


def model_name(pid):
    return os.environ.get('WPA_EU_' + pid.upper() + '_MODEL', '').strip()


def provider_state(provider):
    pid = provider['id']
    adapter = provider['adapter']
    if adapter == 'SOURCE_TOOL':
        return 'OFFICIAL_SOURCE_TOOL_NO_MODEL_CALL'
    if adapter == 'LICENSED_INTEGRATION_REQUIRED':
        return 'LICENSED_INTEGRATION_REQUIRED'
    if not os.environ.get(secret_name(pid), '').strip() or not model_name(pid):
        return 'NOT_CONFIGURED'
    if os.environ.get('WPA_EU_COUNCIL_LIVE_ENABLED') != '1':
        return 'CONFIGURED_EXECUTION_DISABLED'
    return 'CONFIGURED_UNTESTED'


def validate_endpoint(url):
    p = urllib.parse.urlsplit(url)
    if p.scheme != 'https' or not p.hostname or p.hostname.lower() not in ALLOWED_HOSTS or p.username or p.password or p.fragment:
        raise ValueError('provider_endpoint_not_allowlisted')
    return url


def _extract_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return ''.join(str(x.get('text', '')) for x in content if isinstance(x, dict))
    return str(content or '')


def query_provider(provider, prompt, timeout=24):
    pid = provider['id']
    key = os.environ.get(secret_name(pid), '').strip()
    model = model_name(pid)
    endpoint = validate_endpoint(os.environ.get('WPA_EU_' + pid.upper() + '_API_URL', '').strip() or ENDPOINTS[pid])
    adapter = provider['adapter']
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    if adapter == 'ANTHROPIC_MESSAGES':
        headers['x-api-key'] = key
        headers['anthropic-version'] = '2023-06-01'
        body = {'model': model, 'max_tokens': 400, 'system': SYSTEM,
                'messages': [{'role': 'user', 'content': prompt}]}
    elif adapter == 'XAI_RESPONSES':
        headers['Authorization'] = 'Bearer ' + key
        body = {'model': model, 'input': SYSTEM + '\n\n' + prompt, 'max_output_tokens': 450}
    else:
        headers['Authorization'] = 'Bearer ' + key
        body = {'model': model, 'messages': [{'role': 'system', 'content': SYSTEM},
                                              {'role': 'user', 'content': prompt}], 'max_tokens': 450}
    request = urllib.request.Request(endpoint, data=json.dumps(body).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            payload = json.load(response)
        if adapter == 'ANTHROPIC_MESSAGES':
            text = _extract_text(payload.get('content', []))
        elif adapter == 'XAI_RESPONSES':
            text = str(payload.get('output_text', ''))
            if not text:
                text = ''.join(_extract_text(x.get('content', [])) for x in payload.get('output', []) if isinstance(x, dict))
        else:
            text = _extract_text(payload['choices'][0]['message']['content'])
        if not text.strip():
            return {'state': 'ERROR', 'error': 'empty_provider_output'}
        return {'state': 'COMPLETED_UNVERIFIED', 'model': model, 'output': text[:6500]}
    except urllib.error.HTTPError as exc:
        return {'state': 'ERROR', 'error': 'provider_http_' + str(exc.code)}
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, IndexError, json.JSONDecodeError) as exc:
        return {'state': 'ERROR', 'error': type(exc).__name__}


def run(task, evidence, selected, live=False, today=None):
    registry = get_registry()
    by_id = {x['id']: x for x in registry['providers']}
    if len(set(selected)) != len(selected) or len(selected) > 3 or not selected:
        raise ValueError('Select 1 to 3 distinct specialists for bounded execution')
    if any(pid not in by_id for pid in selected):
        raise ValueError('Unknown provider')
    if len(task) > 2000 or len(evidence) > 12000:
        raise ValueError('Input size limit exceeded')
    effective_live = live and os.environ.get('WPA_EU_COUNCIL_LIVE_ENABLED') == '1'
    result = {
        'schema': 'wpa-eu-multi-ai-council-run/v1', 'createdAt': utcnow(),
        'mission': task, 'sourcePolicy': 'OFFICIAL_PUBLIC_ONLY',
        'execution': 'LIVE_ALLOWED' if effective_live else 'SAFE_DIAGNOSTIC',
        'humanGate': 'REQUIRED_FOR_SUBMIT_FINANCE_PARTNERS_LEGAL',
        'modelOutputIsEvidence': False,
        'providers': {}, 'completed': 0
    }
    packet = 'MISSION: ' + task + '\nPUBLIC OFFICIAL EVIDENCE:\n' + evidence
    for pid in selected:
        p = by_id[pid]
        state = provider_state(p)
        if not effective_live or state != 'CONFIGURED_UNTESTED':
            result['providers'][pid] = {'state': state, 'executed': False}
            continue
        result['providers'][pid] = query_provider(p, packet)
        result['providers'][pid]['executed'] = True
        if result['providers'][pid]['state'] == 'COMPLETED_UNVERIFIED':
            result['completed'] += 1
    return result


def load_evidence(path, live=False):
    obj = json.loads(Path(path).read_text(encoding='utf-8'))
    if obj.get('classification') != 'OFFICIAL_PUBLIC_ONLY':
        raise ValueError('Evidence is not approved for external provider transmission')
    iso = obj.get('verifiedAsOf', '')
    date = dt.date.fromisoformat(iso)
    age = (dt.date.today() - date).days
    if live and (age < 0 or age > 7):
        raise ValueError('Official evidence too stale for live provider dispatch')
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))


def self_test():
    d = get_registry()
    assert len(set(x['id'] for x in d['providers'])) == 13
    assert 'mistral' in set(x['id'] for x in d['providers'])
    assert provider_state(next(x for x in d['providers'] if x['id'] == 'mistral')) in {'NOT_CONFIGURED', 'CONFIGURED_EXECUTION_DISABLED', 'CONFIGURED_UNTESTED'}
    assert provider_state(next(x for x in d['providers'] if x['id'] == 'harvey')) == 'LICENSED_INTEGRATION_REQUIRED'
    assert provider_state(next(x for x in d['providers'] if x['id'] == 'google_search')) == 'OFFICIAL_SOURCE_TOOL_NO_MODEL_CALL'
    assert validate_endpoint('https://api.eu.mistral.ai/v1/chat/completions')
    for bad in ['http://api.mistral.ai/v1/chat/completions', 'https://evil.example.invalid/', 'https://api.mistral.ai.evil.org/']:
        try:
            validate_endpoint(bad)
        except ValueError:
            continue
        raise AssertionError('Unsafe endpoint accepted: ' + bad)
    r = run('Official call scan only', 'OFFICIAL_PUBLIC_ONLY', ['mistral', 'gpt'], live=False)
    assert r['completed'] == 0 and not any(x['executed'] for x in r['providers'].values())
    sample = load_evidence(SOURCE, live=False)
    assert 'Ohrid' in sample and 'WPA Journal' in sample
    print('WPA_EU_COUNCIL_SELF_TEST_PASS 13_SEATS SAFETY_GATES')


def main():
    a = argparse.ArgumentParser()
    a.add_argument('--self-test', action='store_true')
    a.add_argument('--live', action='store_true')
    a.add_argument('--task', default='Independent analysis of priority WPA Journal and Ohrid 2027 EU funding routes')
    a.add_argument('--providers', default='mistral,gpt,claude')
    a.add_argument('--evidence-file', default=str(SOURCE))
    a.add_argument('--output', default='')
    opts = a.parse_args()
    if opts.self_test:
        self_test(); return
    evidence = load_evidence(opts.evidence_file, live=opts.live)
    result = run(opts.task, evidence, [s.strip() for s in opts.providers.split(',')], live=opts.live)
    if opts.output:
        path = Path(opts.output); path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    safe = {'execution': result['execution'], 'completed': result['completed'],
            'states': {k: {'state': v['state'], 'executed': v['executed']} for k, v in result['providers'].items()}}
    print(json.dumps(safe, ensure_ascii=False))


if __name__ == '__main__':
    main()