import fs from 'fs/promises';

const file = 'tools/wpa-product-factory/data/academic-records.json';
const data = JSON.parse(await fs.readFile(file, 'utf8'));
const records = Array.isArray(data.records) ? data.records : [];
const threshold = Math.max(0, Number(process.env.WPA_ACADEMIC_RELEVANCE_MIN || 45));
const traceabilityMin = Math.max(0, Number(process.env.WPA_ACADEMIC_TRACEABILITY_MIN || 50));

const passed = records
  .filter(r => Number(r.traceability_score || 0) >= traceabilityMin && Number(r.wpa_relevance_score || 0) >= threshold && r.wpa_relevance_pass !== false)
  .sort((a,b) => Number(b.wpa_relevance_score||0)-Number(a.wpa_relevance_score||0) || Number(b.traceability_score||0)-Number(a.traceability_score||0) || Number(b.year||0)-Number(a.year||0));

const excluded = records.length - passed.length;
data.relevance_gate = {
  applied: true,
  wpa_relevance_min: threshold,
  traceability_min: traceabilityMin,
  input_records: records.length,
  passed_records: passed.length,
  excluded_records: excluded,
  rule: 'Academic Radar input requires both WPA domain relevance and metadata traceability. Generic technical, clinical or unrelated uses of the word protocol do not qualify.'
};
data.records = passed.slice(0,120);
data.total = data.records.length;
data.total_relevant = data.records.length;
await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
console.log(`Academic relevance gate: ${data.records.length}/${records.length} records passed (relevance >= ${threshold}, traceability >= ${traceabilityMin}).`);
