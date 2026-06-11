# Google Scholar / Search Console deployment steps

Upload these files/folders to the root of the GitHub Pages repository:

```text
scholar/
sitemap-scholar.xml
robots.txt
CITATION.cff
bibtex/wpa-scholar-records-2026.bib
ris/wpa-scholar-records-2026.ris
data/wpa-scholar-records-2026.json
```

Then open Google Search Console and submit:

```text
https://worldprotocolacademy-code.github.io/sitemap-scholar.xml
```

Use URL Inspection for these URLs:

```text
https://worldprotocolacademy-code.github.io/scholar/
https://worldprotocolacademy-code.github.io/papers.html
https://worldprotocolacademy-code.github.io/bibliography/
https://worldprotocolacademy-code.github.io/working-papers/
https://worldprotocolacademy-code.github.io/scholar/wpa-wp-009.html
```

Important: this improves crawler discovery and metadata parsing. It does not force immediate inclusion or citation counts.
