import { describe, expect, it } from "vitest";
import { buildCarSpec, computeGears, engineRpmFor, torqueAt } from "../../src/sim";

describe("computeGears", () => {
  it("multiplies gearbox ratio by final drive per gear", () => {
    const car = buildCarSpec("bmw-m3", "g80");
    const gears = computeGears(car);
    expect(gears[0]).toBeCloseTo(5.0 * 3.154, 5);
    expect(gears.length).toBe(8);
  });
});

describe("engineRpmFor", () => {
  it("is zero at zero speed", () => {
    expect(engineRpmFor(0, 3.5, 0.33)).toBe(0);
  });

  it("scales linearly with speed", () => {
    const a = engineRpmFor(10, 3.5, 0.33);
    const b = engineRpmFor(20, 3.5, 0.33);
    expect(b).toBeCloseTo(a * 2, 5);
  });
});

describe("torqueAt", () => {
  it("is flat at rated torque below the power corner", () => {
    const car = buildCarSpec("bmw-m3", "g80");
    expect(torqueAt(car, car.idleRPM)).toBeCloseTo(car.torqueNm, 5);
  });

  it("falls off above the power corner to hold constant power", () => {
    const car = buildCarSpec("bmw-m3", "g80");
    const cornerRpm = (car.powerKW * 1000 * 9.5493) / car.torqueNm;
    const aboveCorner = cornerRpm + 1000;
    const torque = torqueAt(car, aboveCorner);
    const impliedPowerKW = (torque * aboveCorner) / 9549.3;
    expect(impliedPowerKW).toBeCloseTo(car.powerKW, 1);
  });
});
