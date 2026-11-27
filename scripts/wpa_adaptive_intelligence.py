#!/usr/bin/env python3
"""WPA adaptive intelligence: bounded, deterministic shadow routing, no network."""
import argparse
import hashlib
import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

VERSION = '0.1.0-rc1'
DOMAINS = ('protocol', 'diplomacy', 'public_relations', 'security', 'communicology')
ROUTES = dict(zip(DOMAINS, ('Protocol', 'Diplomacy', 'Strategic Communication', 'Security', 'Communicology')))


def timestamp(value):
    result = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if result.tzinfo is None:
        raise ValueError('Timezone required')
    return result.astimezone(timezone.utc)


def number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 100:
        raise ValueError('Invalid score')
    return value


def build(packet, more=(), less=(), now=None):
    now = now or datetime.now(timezone.utc)
    more, less = set(more), set(less)
    if (more | less) - set(DOMAINS) or more & less:
        raise ValueError('Invalid or conflicting explicit preferences')
    if (packet.get('status') != 'AUTO_GENERATED_READY_FOR_HUMAN_GATE'
            or packet.get('canonical_input', {}).get('system') != 'WPA Journal Live'
            or packet.get('human_gate', {}).get('state') != 'PENDING'
            or packet.get('boundaries', {}).get('automatic_external_publication') is not False):
        raise ValueError('Upstream contract or Human Gate failed')
    generated = timestamp(packet['generated_at'])
    if not now - timedelta(hours=8) <= generated <= now:
        raise ValueError('Stale or future daily packet')
    rows, seen = [], set()
    items = packet['items']
    if not isinstance(items, list) or not 3 <= len(items) <= 10:
        raise ValueError('Invalid daily item count')
    for index, item in enumerate(items):
        domain, url = item['domain'], item['original_url']
        parsed = urlsplit(url)
        if (domain not in DOMAINS or parsed.scheme not in ('https', 'http') or not parsed.hostname
                or parsed.username or parsed.password or url in seen or not item.get('source')
                or not item.get('verification_status') or not item.get('title')):
            raise ValueError('Invalid or duplicate evidence')
        if not generated - timedelta(hours=48) <= timestamp(item['published_at']) <= generated:
            raise ValueError('Item outside evidence window')
        relevance, confidence = number(item['relevance_score']), number(item['source_confidence'])
        if min(relevance, confidence) < 65:
            raise ValueError('Evidence floor failed')
        seen.add(url)
        adjustment = 5 if domain in more else -5 if domain in less else 0
        base = number(item['score'])
        rows.append({'source_url': url, 'source': item['source'], 'domain': domain,
                     'verification_status': item['verification_status'], 'upstream_rank': index + 1,
                     'base_score': base, 'adjustment': adjustment, 'routing_score': base + adjustment,
                     'specialist_candidate': ROUTES[domain], 'authority': 'HG1_PREPARATION_ONLY',
                     'reason': 'explicit_more' if adjustment > 0 else 'explicit_less' if adjustment < 0 else 'neutral'})
    if len({r['domain'] for r in rows}) < 2 or len({r['source'].strip().lower() for r in rows}) < 2:
        raise ValueError('Insufficient diversity')
    rows.sort(key=lambda r: (-r['routing_score'], r['upstream_rank']))
    digest = hashlib.sha256(json.dumps(packet, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return {'version': VERSION, 'status': 'SHADOW_CANDIDATES_ONLY', 'input_sha256': digest,
            'input_generated_at': packet['generated_at'], 'human_gate': 'PENDING',
            'external_actions': False, 'provider_calls': False, 'profile_storage': False,
            'source_verification_performed': False, 'items': rows}


def self_test():
    import copy
    now = datetime(2026, 11, 26, 12, tzinfo=timezone.utc)
    packet = {'status': 'AUTO_GENERATED_READY_FOR_HUMAN_GATE', 'generated_at': now.isoformat(),
              'canonical_input': {'system': 'WPA Journal Live'}, 'human_gate': {'state': 'PENDING'},
              'boundaries': {'automatic_external_publication': False}, 'items': [
                  {'domain': d, 'original_url': 'https://example.org/' + d, 'source': 'Fixture ' + d,
                   'verification_status': 'candidate', 'title': 'Synthetic fixture', 'published_at': now.isoformat(),
                   'relevance_score': 90, 'source_confidence': 90, 'score': 90 - i}
                  for i, d in enumerate(DOMAINS)]}
    neutral = build(packet, now=now)
    adaptive = build(packet, more=['communicology'], less=['protocol'], now=now)
    assert neutral == build(packet, now=now)
    assert adaptive['items'][0]['domain'] == 'communicology'
    assert len(adaptive['items']) == len(packet['items']) and adaptive['human_gate'] == 'PENDING'
    assert adaptive['external_actions'] is False and adaptive['provider_calls'] is False
    assert all(r['verification_status'] == 'candidate' for r in adaptive['items'])
    assert adaptive['input_sha256'] == neutral['input_sha256']
    cases = [('stale', lambda p: p.update(generated_at=(now - timedelta(hours=9)).isoformat())),
             ('gate', lambda p: p['human_gate'].update(state='APPROVED')),
             ('external', lambda p: p['boundaries'].update(automatic_external_publication=True)),
             ('confidence', lambda p: p['items'][0].update(source_confidence=64)),
             ('nan', lambda p: p['items'][0].update(score=float('nan'))),
             ('url', lambda p: p['items'][0].update(original_url='javascript:alert(1)')),
             ('duplicate', lambda p: p['items'][0].update(original_url=p['items'][1]['original_url'])),
             ('old item', lambda p: p['items'][0].update(published_at=(now - timedelta(hours=49)).isoformat())),
             ('missing provenance', lambda p: p['items'][0].pop('source'))]
    for name, mutate in cases:
        invalid = copy.deepcopy(packet)
        mutate(invalid)
        try:
            build(invalid, now=now)
        except (ValueError, KeyError):
            continue
        raise AssertionError(name)
    try:
        build(packet, more=['protocol'], less=['protocol'], now=now)
    except ValueError:
        pass
    else:
        raise AssertionError('conflicting preference')
    print('PASS: 6 positive assertions, 10 negative cases; synthetic inputs only')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--more', choices=DOMAINS, action='append', default=[])
    parser.add_argument('--less', choices=DOMAINS, action='append', default=[])
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if not args.input or not args.output or args.input.resolve() == args.output.resolve():
        parser.error('Distinct input and output paths required')
    result = build(json.loads(args.input.read_text(encoding='utf-8')), args.more, args.less)
    with args.output.open('x', encoding='utf-8') as handle:
        json.dump(result, handle, ensure_ascii=False, indent=2)
        handle.write('\n')


if __name__ == '__main__':
    main()
