# WPA Public Sitemap + Site Quality CI Hotfix

Овој пакет ги покрива следните две забелешки:

1. `sitemap.xml` да стане public-only.
2. Deploy/CI workflow да проверува sitemap, robots, HTML, локални линкови, noindex страници и basic SEO/accessibility.

## Фајлови

```txt
sitemap.xml
.github/workflows/site-quality.yml
scripts/site_quality_check.py
CLOUDFLARE-WPAWS-EXACT-RULE.md
```

## Каде да се стават

```txt
root/sitemap.xml
root/.github/workflows/site-quality.yml
root/scripts/site_quality_check.py
```

## Commit

```bash
git add sitemap.xml .github/workflows/site-quality.yml scripts/site_quality_check.py
git commit -m "Add public-only sitemap and site quality CI"
git push
```

## Што проверува CI

- sitemap.xml е валиден XML
- sitemap содржи само јавни allowlisted URLs
- sitemap не содржи `ai/student-desk.html`, `wpaws/`, `thanks.html`, `test-modals.html`, analytics/monetization/promotion helper страници
- robots.txt покажува кон canonical sitemap
- homepage нема јавен Student Desk линк
- `ai/student-desk.html` има noindex ако постои
- `wpaws/index.html` има noindex и data-nosnippet ако постои
- public HTML страници имаат title, viewport, meta description и canonical
- сликите имаат alt
- локалните internal links водат до постоечки фајлови или directory index

## Важна забелешка

Овој CI може намерно да падне ако во repo има веќе постоечки broken local links. Тоа е добро: ќе ти покаже точно кој линк треба да се поправи.
