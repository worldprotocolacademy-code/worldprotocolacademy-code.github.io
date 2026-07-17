from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOADER = '<script defer src="/scripts/virtual-sande-connected-vessels.js?v=20260718-2"></script>'
TARGETS = [
    'audio-media-engine.html',
    'tools/academic-search-hub/index.html',
    'wpaws/protocol-symbols-verified/index.html',
    'multi-ai-command-center.html',
    'journal/vol-1-issue-1-2026.html',
    'wpaws/diplomatic-analysis-lab/index.html',
]


def patch(rel):
    path = ROOT / rel
    if not path.exists():
        raise RuntimeError(f'missing target: {rel}')
    text = path.read_text(encoding='utf-8')
    if 'virtual-sande-connected-vessels.js' in text:
        return False
    if '</head>' not in text:
        raise RuntimeError(f'missing </head>: {rel}')
    path.write_text(text.replace('</head>', LOADER + '\n</head>', 1), encoding='utf-8')
    return True


if __name__ == '__main__':
    changed = [rel for rel in TARGETS if patch(rel)]
    print({'phase2_loaders_added': changed})
