# WPA GitHub Upload Package v1.0

## Содржина / Contents

### 📁 data/
- `wpa_institutions_master_list_v1.0.json` — 125 институции, целосни полиња
- `wpa_institutions_master_list_v1.0.csv` — Excel/CSV формат

### 📁 media/
- `media_press_release.md` — Медиска покана (markdown)
- `media_press_release.html` — Медиска покана (HTML со WPA стил)

## Инструкции за upload / Upload Instructions

1. Отвори го твојот GitHub репозиториум
2. Креирај папки: `data/` и `media/` (ако не постојат)
3. Upload ги датотеките во соодветните папки
4. Ажурирај `institute.html` — додади линкови во WPA Public Tools Hub секцијата

## Линкови за institute.html

```html
<!-- Во Tools Hub секцијата -->
<div class="domain-card">
  <div class="domain-tag">Data</div>
  <h3>Master List v1.0</h3>
  <p>125 институции, 9 групи, целосни полиња. JSON + CSV.</p>
  <p style="margin-top: 18px;">
    <a href="data/wpa_institutions_master_list_v1.0.json" class="btn btn-primary" download>JSON ↓</a>
    <a href="data/wpa_institutions_master_list_v1.0.csv" class="btn btn-ghost" style="margin-left: 10px;" download>CSV ↓</a>
  </p>
</div>

<div class="domain-card">
  <div class="domain-tag">Media</div>
  <h3>Press Release</h3>
  <p>Покана за медиумска соработка.</p>
  <p style="margin-top: 18px;">
    <a href="media/media_press_release.html" class="btn btn-primary">Open →</a>
  </p>
</div>
```

---
© 2026 World Protocol Academy
