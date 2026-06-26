# WPA Institute Maximum Protection — Upload Map MK

## Каде да се качи

Оди во главниот root на repo:

`worldprotocolacademy-code.github.io/`

Качи ги сите елементи од ZIP-от:

```text
robots.txt
ai.txt
.well-known/
LICENSE
scripts/
tools/
docs/
UPLOAD-MAP-MK.md
BUILD_REPORT.json
```

## Правилни патеки после upload

```text
/robots.txt
/ai.txt
/.well-known/ai.txt
/LICENSE
/scripts/site_quality_check.py
/tools/wpa-ip-protection/index.html
/docs/WPA_INSTITUTE_MAX_PROTECTION_DOCTRINE_MK.md
/docs/robots-strict-lockdown-NOT-FOR-UPLOAD.txt
/UPLOAD-MAP-MK.md
/BUILD_REPORT.json
```

## Не качувај / не заменувај

Овој пакет НЕ содржи:

```text
/index.html
/institute.html
/privacy.html
/disclaimer.html
```

## Commit message

`Add maximum WPA institute protection layer`

## По upload

Провери:

```text
https://worldprotocolacademy-code.github.io/robots.txt
https://worldprotocolacademy-code.github.io/ai.txt
https://worldprotocolacademy-code.github.io/.well-known/ai.txt
https://worldprotocolacademy-code.github.io/tools/wpa-ip-protection/
```

Потоа пушти Actions rerun за WPA Site Quality CI.
