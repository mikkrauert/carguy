import { describe, expect, it } from "vitest";
import { buildCarSpec, simulate } from "../../src/sim";
import type { SimOptions } from "../../src/sim";

/**
 * Locks the simulator's current output for the three prototype cars so that
 * physics changes (rotating mass inertia, gear-dependent shift time, etc. —
 * see docs/PLAN.md Faas 1) are deliberate and go through the benchmark
 * suite, not silent regressions from refactoring.
 *
 * These numbers were captured from the ported engine and match the ones
 * recorded in docs/PLAN.md for the BMW M3 (fixed-gear 80-120 km/h, 0-200).
 */
describe("golden: quarter mile, default settings", () => {
  const opts: SimOptions = {
    targetDistanceM: 402.336,
    startSpeedKmh: 0,
    lockGear: false,
    gearNumber: 1,
    raisedVmax: false,
  };

  it("Audi RS3 8Y", () => {
    const r = simulate(buildCarSpec("audi-rs3", "rs3-8y"), opts);
    expect(r.time100).toBeCloseTo(3.82, 2);
    expect(r.finalTime).toBeCloseTo(11.94, 2);
    expect(r.finalSpeed * 3.6).toBeCloseTo(189.02, 1);
  });

  it("Mercedes-AMG GLC 63 S", () => {
    const r = simulate(buildCarSpec("mercedes-amg-glc63", "glc63s"), opts);
    expect(r.time100).toBeCloseTo(3.64, 2);
    expect(r.finalTime).toBeCloseTo(11.76, 2);
    expect(r.finalSpeed * 3.6).toBeCloseTo(191.3, 1);
  });

  it("BMW M3 Competition xDrive G80", () => {
    const r = simulate(buildCarSpec("bmw-m3", "g80"), opts);
    expect(r.time100).toBeCloseTo(3.54, 2);
    expect(r.finalTime).toBeCloseTo(11.54, 2);
    expect(r.finalSpeed * 3.6).toBeCloseTo(197.51, 1);
  });
});

describe("golden: BMW M3 xDrive, fixed-gear 80-120 km/h (docs/PLAN.md reference)", () => {
  const m3 = buildCarSpec("bmw-m3", "g80");

  function timeTo120From80(gearNumber: number): number | null {
    const r = simulate(m3, { targetDistanceM: 100000, startSpeedKmh: 80, lockGear: true, gearNumber, raisedVmax: false });
    const idx = r.spd.findIndex((v) => v * 3.6 >= 120);
    return idx >= 0 ? idx * 0.02 : null;
  }

  it("4th gear: 2,42 s (BMW claims 2,6 s)", () => {
    expect(timeTo120From80(4)).toBeCloseTo(2.42, 2);
  });

  it("5th gear: 3,26 s (BMW claims 3,4 s)", () => {
    expect(timeTo120From80(5)).toBeCloseTo(3.26, 2);
  });
});

describe("golden: BMW M3 xDrive 0-200 km/h", () => {
  it("11,86 s (independent measurement, see data/measurements.json)", () => {
    const m3 = buildCarSpec("bmw-m3", "g80");
    const r = simulate(m3, { targetDistanceM: 100000, startSpeedKmh: 0, lockGear: false, gearNumber: 1, raisedVmax: false });
    const idx = r.spd.findIndex((v) => v * 3.6 >= 200);
    expect(idx * 0.02).toBeCloseTo(11.86, 2);
  });
});
