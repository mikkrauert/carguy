export interface CarSpec {
  key: string;
  short: string;
  variantId: string;
  variantLabel: string;
  powerKW: number;
  torqueNm: number;
  massKg: number;
  cda: number;
  claimed0to100: number;
  vmaxKmh: number;
  vmaxOptionKmh: number;
  redlineRPM: number;
  idleRPM: number;
  wheelRadiusM: number;
  /** Gearbox ratios, one per gear. */
  gearRatios: number[];
  /** Final drive ratio per gear (same length as gearRatios; some gearboxes use different final drives per gear). */
  finalDriveRatios: number[];
}

export interface SimOptions {
  targetDistanceM: number;
  startSpeedKmh: number;
  lockGear: boolean;
  gearNumber: number;
  raisedVmax: boolean;
}

export interface SimResult {
  /** Distance in meters, sampled every DT seconds. */
  pos: number[];
  /** Speed in m/s, sampled every DT seconds. */
  spd: number[];
  /** 1-indexed gear, sampled every DT seconds. */
  gearTrace: number[];
  /** Time to reach 100 km/h, seconds, or null if never reached. */
  time100: number | null;
  /** Distance at which 100 km/h was reached, or null. */
  dist100: number | null;
  finalTime: number;
  finalSpeed: number;
  gearCount: number;
}
