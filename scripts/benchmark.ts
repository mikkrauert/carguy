/**
 * Võrdlustestistik: simuleerib igas data/measurements.json kirjes oleva mõõdiku
 * ja võrdleb sõltumatu mõõtmisega. CI kirjutab tulemuse PR kommentaariks.
 *
 * Praegu on measurements.json-is vaid kaks autot (Faas 0 näidisandmed).
 * Faas 1 kasvatab selle 20-30 autoni eri tüüpidest, vt docs/PLAN.md.
 */
import { buildCarSpec, simulate } from "../src/sim";
import measurements from "../data/measurements.json";

const DT = 0.02;

interface Measurement {
  modelId: string;
  variantId: string;
  source: string;
  metric: string;
  value: number;
  unit: string;
}

/** Parses "0-100 km/h" -> { fromKmh: 0, toKmh: 100 }, "veerandmiil" -> quarter mile. */
function parseMetric(metric: string): { kind: "speed"; fromKmh: number; toKmh: number } | { kind: "distance"; meters: number } | null {
  const speedMatch = metric.match(/^(\d+)-(\d+) km\/h$/);
  if (speedMatch) {
    return { kind: "speed", fromKmh: Number(speedMatch[1]), toKmh: Number(speedMatch[2]) };
  }
  if (metric === "veerandmiil") return { kind: "distance", meters: 402.336 };
  return null;
}

function simulateMetric(modelId: string, variantId: string, metric: string): number | null {
  const parsed = parseMetric(metric);
  if (!parsed) return null;
  const car = buildCarSpec(modelId, variantId);

  if (parsed.kind === "distance") {
    const r = simulate(car, { targetDistanceM: parsed.meters, startSpeedKmh: 0, lockGear: false, gearNumber: 1, raisedVmax: false });
    return r.finalTime;
  }

  const r = simulate(car, {
    targetDistanceM: 100000,
    startSpeedKmh: parsed.fromKmh,
    lockGear: false,
    gearNumber: 1,
    raisedVmax: false,
  });
  const idx = r.spd.findIndex((v) => v * 3.6 >= parsed.toKmh);
  return idx >= 0 ? idx * DT : null;
}

function main() {
  const rows: { modelId: string; variantId: string; metric: string; measured: number; simulated: number | null; errorS: number | null }[] = [];

  for (const m of measurements as Measurement[]) {
    const simulated = simulateMetric(m.modelId, m.variantId, m.metric);
    rows.push({
      modelId: m.modelId,
      variantId: m.variantId,
      metric: m.metric,
      measured: m.value,
      simulated,
      errorS: simulated !== null ? simulated - m.value : null,
    });
  }

  const withError = rows.filter((r): r is typeof r & { errorS: number } => r.errorS !== null);
  const meanError = withError.reduce((s, r) => s + r.errorS, 0) / withError.length;
  const meanAbsError = withError.reduce((s, r) => s + Math.abs(r.errorS), 0) / withError.length;

  const lines: string[] = [];
  lines.push("| Auto | Mõõdik | Mõõdetud | Simuleeritud | Vahe |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const r of rows) {
    const sim = r.simulated !== null ? r.simulated.toFixed(2) + " s" : "-";
    const err = r.errorS !== null ? (r.errorS >= 0 ? "+" : "") + r.errorS.toFixed(2) + " s" : "-";
    lines.push(`| ${r.modelId}/${r.variantId} | ${r.metric} | ${r.measured.toFixed(2)} s | ${sim} | ${err} |`);
  }
  lines.push("");
  lines.push(`Keskmine viga (kallutatus): ${meanError.toFixed(3)} s`);
  lines.push(`Keskmine absoluutviga: ${meanAbsError.toFixed(3)} s`);

  console.log(lines.join("\n"));
}

main();
