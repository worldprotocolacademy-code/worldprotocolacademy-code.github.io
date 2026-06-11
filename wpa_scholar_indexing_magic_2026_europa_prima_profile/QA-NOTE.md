# QA-NOTE — WPA Scholar Indexing Infrastructure

- Generated: 11 June 2026
- Scholar records created: 28 total
- Academic papers: 19
- WPA Working Papers: 9
- P16 duplicate removed from the paper archive logic; current paper records run P01–P19.
- WPA Working Papers run 001–009, including WP-009 DOI 10.5281/zenodo.20641841.
- Every scholar HTML record includes citation_title, citation_author, citation_publication_date and citation_pdf_url meta tags.
- sitemap-scholar.xml includes /scholar/, /papers.html, /bibliography/, /working-papers/ and all individual scholar records.
- No formal peer-reviewed claim is added for WPA Working Papers.

## ORCID / Academia.edu QA

Confirmed in revised package:

- ORCID link added as `rel=me` signal in Scholar pages.
- Academia.edu link added as `rel=me` signal in Scholar pages.
- Google Scholar and ResearchGate profile links retained as identity signals.
- Individual Scholar landing pages include ORCID and Academia.edu in author metadata/body.
- JSON data file includes `author_profiles` with ORCID, Academia.edu, Google Scholar, ResearchGate and WPA Bibliography.
- No citation counts or peer-review claims were fabricated.


## Full identity graph QA

Confirmed added/retained:

- Europa Prima affiliation signal
- Google Scholar profile
- ORCID profile
- ResearchGate profile
- Academia.edu profile
- AD Scientific Index profile
- Zenodo DOI Records / WPA Working Papers 001-009 layer

No citations were fabricated. Zenodo is represented as DOI publication layer, not as an invented author profile.
