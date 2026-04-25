# Cloudflare Header Rule — corrected exact WPAWS workspace rule

Use this only if you want Cloudflare edge headers in addition to the in-page meta robots.

IMPORTANT:
Do NOT use `starts_with(http.request.uri.path, "/wpaws/")` if any child labs under `/wpaws/`
are intended to be public/indexable later.

Recommended expression for the WPAWS workspace only:

```txt
(http.request.uri.path eq "/wpaws/" or http.request.uri.path eq "/wpaws/index.html")
```

Set response headers:

```txt
X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex
Cache-Control: no-store, private, max-age=0
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
```
