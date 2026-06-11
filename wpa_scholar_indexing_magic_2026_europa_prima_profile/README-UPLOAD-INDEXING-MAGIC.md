# WPA Scholar Indexing Infrastructure — upload package

Generated: 11 June 2026

This package creates an indexing layer for:

- 19 scientific / conference / professional paper records
- 9 WPA Working Papers with Zenodo DOI records
- Google Scholar compatible landing pages
- sitemap and robots discovery signals
- BibTeX, RIS and CITATION.cff metadata

## Upload to GitHub Pages

Upload these to the root of the repository:

```text
scholar/
sitemap-scholar.xml
robots.txt
CITATION.cff
bibtex/
ris/
data/
```

Do not delete your existing pages. Keep:

```text
papers.html
bibliography/index.html
working-papers/index.html
```

## PDF step

Read `PDF-COPY-LIST.md`. Google Scholar is strongest when each `/scholar/*.html` page links to a PDF in the same `/scholar/` directory.

## After upload

Open:

```text
https://worldprotocolacademy-code.github.io/scholar/
https://worldprotocolacademy-code.github.io/sitemap-scholar.xml
```

Then submit `sitemap-scholar.xml` in Google Search Console.

## Safety

This package does not fake citations and does not claim peer review for WPA Working Papers. It only improves discoverability, metadata parsing and identity consistency.


## ORCID and Academia.edu update

This revised package adds ORCID and Academia.edu profile signals to the Scholar index and individual landing pages:

```text
ORCID: https://orcid.org/0009-0008-3219-394X
Academia.edu: https://independent.academia.edu/SandeSmiljanov
Google Scholar: https://scholar.google.com/citations?user=5XDYIA0AAAAJ
ResearchGate: https://www.researchgate.net/profile/Sande-Smiljanov-2
```

Upload/replace the full `scholar/` folder and the metadata files in this package.
