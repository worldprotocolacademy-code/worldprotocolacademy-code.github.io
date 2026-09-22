# WPA Journal Watch — Production Editorial Candidate Queue

WPA Journal Watch connects the WPA Journal with WPA Watch.

It generates **production editorial topic candidates**, not automatic articles. Human editorial review remains mandatory.

## Public URLs after upload

```text
/journal/watch/
/tools/wpa-watch/journal-map.json
```

## Package structure

```text
journal/watch/index.html
journal/watch/topics.json
journal/watch/editorial-queue.json
tools/wpa-watch/journal-map.json
.github/workflows/wpa-journal-watch.yml
docs/JOURNAL_WATCH_POLICY.md
docs/INTEGRATION_SNIPPETS.md
generate-journal-watch.mjs
```

## Upload instructions

Upload these folders/files to the root of the existing GitHub Pages repository:

```text
worldprotocolacademy-code.github.io
```

Then run:

Actions → WPA Journal Watch → Run workflow

## Important policy

WPA Journal Watch does not automatically publish articles.

It only creates:

- Detected topics
- Suggested article type
- Research angle
- Manual verification queue

Every article still requires normal journal process.
