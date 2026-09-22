#!/usr/bin/env node
import fs from "node:fs";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function indexIndicators(record) {
  const map = new Map();
  for (const item of record.indicators || []) {
    if (map.has(item.indicator_id)) throw new Error(`duplicate indicator: ${item.indicator_id}`);
    map.set(item.indicator_id, item);
  }
  return map;
}

function isNumericScore(v) {
  return Number.isInteger(v) && v >= 0 && v <= 5;
}

function tierCountsForHighScores(record) {
  const counts = { A: 0, B: 0, C: 0, D: 0, none: 0 };
  for (const item of record.indicators || []) {
    if (!isNumericScore(item.score) || item.score < 4) continue;
    const tiers = [...new Set((item.evidence || []).map(e => e.source_tier).filter(Boolean))];
    if (!tiers.length) counts.none += 1;
    for (const t of tiers) {
      if (Object.prototype.hasOwnProperty.call(counts, t)) counts[t] += 1;
    }
  }
  return counts;
}

function neFrequency(record) {
  const byDimension = { D1: { ne: 0, total: 0 }, D2: { ne: 0, total: 0 }, D3: { ne: 0, total: 0 }, D4: { ne: 0, total: 0 } };
  let ne = 0;
  for (const item of record.indicators || []) {
    if (!byDimension[item.dimension_id]) byDimension[item.dimension_id] = { ne: 0, total: 0 };
    byDimension[item.dimension_id].total += 1;
    if (item.score === "NE") {
      ne += 1;
      byDimension[item.dimension_id].ne += 1;
    }
  }
  const dimensions = {};
  for (const [id, x] of Object.entries(byDimension)) {
    dimensions[id] = { ...x, percent: x.total ? Number((100 * x.ne / x.total).toFixed(1)) : 0 };
  }
  return { count: ne, percent: record.indicators?.length ? Number((100 * ne / record.indicators.length).toFixed(1)) : 0, dimensions };
}

export function compareScoringRecords(pass1, pass2) {
  if (pass1.institution_id !== pass2.institution_id) throw new Error("institution_id mismatch");
  if (pass1.methodology_version !== pass2.methodology_version) throw new Error("methodology_version mismatch");
  if (pass1.scoring_lock?.dossier_snapshot_id !== pass2.scoring_lock?.dossier_snapshot_id) throw new Error("dossier snapshot mismatch");
  if (pass1.assessor_id === pass2.assessor_id) throw new Error("independent assessor ids required");
  if (!pass1.scoring_lock?.locked || !pass2.scoring_lock?.locked) throw new Error("both passes must be locked");
  if (pass1.scoring_lock?.other_pass_visible_before_lock !== false || pass2.scoring_lock?.other_pass_visible_before_lock !== false) {
    throw new Error("independence contract violated");
  }

  const a = indexIndicators(pass1);
  const b = indexIndicators(pass2);
  const ids = [...new Set([...a.keys(), ...b.keys()])].sort();
  if (ids.length !== 20) throw new Error(`expected 20 indicators, got ${ids.length}`);

  let exact = 0;
  let withinOne = 0;
  let material = 0;
  let numericPairs = 0;
  let absDiffSum = 0;
  let neMismatch = 0;
  const disagreements = [];
  const dimensions = {};

  for (const id of ids) {
    const x = a.get(id), y = b.get(id);
    if (!x || !y) throw new Error(`indicator missing from one pass: ${id}`);
    if (x.dimension_id !== y.dimension_id) throw new Error(`dimension mismatch: ${id}`);
    const dim = x.dimension_id;
    if (!dimensions[dim]) dimensions[dim] = { total: 0, exact: 0, within_one: 0, material: 0 };
    dimensions[dim].total += 1;

    const sx = x.score, sy = y.score;
    const bothNE = sx === "NE" && sy === "NE";
    const bothNumeric = isNumericScore(sx) && isNumericScore(sy);
    const same = bothNE || (bothNumeric && sx === sy);
    const diff = bothNumeric ? Math.abs(sx - sy) : null;
    const within = same || (bothNumeric && diff <= 1);
    const isMaterial = (!bothNE && !bothNumeric) || (bothNumeric && diff >= 2);

    if (same) { exact += 1; dimensions[dim].exact += 1; }
    if (within) { withinOne += 1; dimensions[dim].within_one += 1; }
    if (isMaterial) { material += 1; dimensions[dim].material += 1; }
    if (bothNumeric) { numericPairs += 1; absDiffSum += diff; }
    if (!bothNE && !bothNumeric) neMismatch += 1;

    if (!same) {
      disagreements.push({
        indicator_id: id,
        dimension_id: dim,
        pass_1: sx,
        pass_2: sy,
        absolute_difference: diff,
        material: isMaterial,
        reason_required: isMaterial,
        reconciliation_status: "PENDING_HUMAN_RECONCILIATION"
      });
    }
  }

  for (const d of Object.values(dimensions)) {
    d.exact_agreement_percent = Number((100 * d.exact / d.total).toFixed(1));
    d.within_one_agreement_percent = Number((100 * d.within_one / d.total).toFixed(1));
  }

  return {
    schema_version: "1.0",
    institution_id: pass1.institution_id,
    methodology_version: pass1.methodology_version,
    dossier_snapshot_id: pass1.scoring_lock.dossier_snapshot_id,
    synthetic_fixture: Boolean(pass1.synthetic_fixture && pass2.synthetic_fixture),
    metrics: {
      indicator_count: ids.length,
      exact_agreement_count: exact,
      exact_agreement_percent: Number((100 * exact / ids.length).toFixed(1)),
      within_one_agreement_count: withinOne,
      within_one_agreement_percent: Number((100 * withinOne / ids.length).toFixed(1)),
      numeric_pair_count: numericPairs,
      numeric_mean_absolute_difference: numericPairs ? Number((absDiffSum / numericPairs).toFixed(4)) : null,
      ne_mismatch_count: neMismatch,
      material_disagreement_count: material
    },
    dimensions,
    pass_1_ne_frequency: neFrequency(pass1),
    pass_2_ne_frequency: neFrequency(pass2),
    high_score_evidence_tiers: {
      pass_1: tierCountsForHighScores(pass1),
      pass_2: tierCountsForHighScores(pass2)
    },
    disagreements,
    interpretation: "Descriptive reliability diagnostics only. No automatic gate pass, score averaging or human reconciliation is performed."
  };
}

if (process.argv[1] && process.argv[1].endsWith("protocolometry-reliability.mjs")) {
  const [pass1Path, pass2Path] = process.argv.slice(2);
  if (!pass1Path || !pass2Path) {
    console.error("Usage: node scripts/protocolometry-reliability.mjs PASS1.json PASS2.json");
    process.exit(2);
  }
  const report = compareScoringRecords(readJson(pass1Path), readJson(pass2Path));
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}
