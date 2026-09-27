import { AIR, CRR, DRIVETRAIN_EFF, DT, G, MAX_T, MU, SHIFT_TIME } from "./constants";
import type { CarSpec, SimOptions, SimResult } from "./types";

/** Overall (gearbox x final drive) ratio for each gear. */
export function computeGears(car: CarSpec): number[] {
  return car.gearRatios.map((g, i) => g * car.finalDriveRatios[i]);
}

export function engineRpmFor(speedMs: number, ratio: number, wheelRadiusM: number): number {
  return ((speedMs / wheelRadiusM) * ratio * 60) / (2 * Math.PI);
}

/**
 * Synthetic torque curve: flat at the rated torque up to the power-corner RPM,
 * then constant power (torque falling as 1/rpm) up to redline.
 * This is a fallback model — see docs/PLAN.md for the real torque-curve-as-points plan.
 */
export function torqueAt(car: CarSpec, rpm: number): number {
  const cornerRpm = (car.powerKW * 1000 * 9.5493) / car.torqueNm;
  const r = Math.max(rpm, car.idleRPM);
  return r <= cornerRpm ? car.torqueNm : (car.powerKW * 1000 * 9.5493) / r;
}

export function pickAutoGear(car: CarSpec, gears: number[], speedMs: number): number {
  for (let g = 0; g < gears.length; g++) {
    if (engineRpmFor(speedMs, gears[g], car.wheelRadiusM) <= car.redlineRPM) return g;
  }
  return gears.length - 1;
}

export function simulate(car: CarSpec, opts: SimOptions): SimResult {
  const gears = computeGears(car);
  const vCap = (opts.raisedVmax ? car.vmaxOptionKmh : car.vmaxKmh) / 3.6;
  let v = Math.min(opts.startSpeedKmh / 3.6, vCap);
  let x = 0;
  let t = 0;
  let gearIdx = opts.lockGear ? Math.min(opts.gearNumber - 1, gears.length - 1) : pickAutoGear(car, gears, v);
  let shiftTimer = 0;

  const pos: number[] = [];
  const spd: number[] = [];
  const gearTrace: number[] = [];
  let time100: number | null = null;
  let dist100: number | null = null;

  while (t <= MAX_T && x < opts.targetDistanceM) {
    pos.push(x);
    spd.push(v);
    gearTrace.push(gearIdx + 1);
    if (time100 === null && v >= 100 / 3.6) {
      time100 = t;
      dist100 = x;
    }

    let force: number;
    const rpmNow = engineRpmFor(v, gears[gearIdx], car.wheelRadiusM);
    if (shiftTimer > 0) {
      force = 0;
      shiftTimer -= DT;
    } else if (rpmNow > car.redlineRPM) {
      if (!opts.lockGear && gearIdx < gears.length - 1) {
        gearIdx++;
        shiftTimer = SHIFT_TIME;
      }
      force = 0;
    } else {
      force = (torqueAt(car, rpmNow) * gears[gearIdx] * DRIVETRAIN_EFF) / car.wheelRadiusM;
    }

    const fDrive = Math.min(force, MU * car.massKg * G);
    const fDrag = 0.5 * AIR * car.cda * v * v;
    const fRoll = CRR * car.massKg * G;
    const a = (fDrive - fDrag - fRoll) / car.massKg;
    v = Math.max(0, Math.min(v + a * DT, vCap));
    x += v * DT;
    t += DT;
  }

  return {
    pos,
    spd,
    gearTrace,
    time100,
    dist100,
    finalTime: t,
    finalSpeed: v,
    gearCount: gears.length,
  };
}
