/** Gravitational acceleration, m/s^2. */
export const G = 9.81;
/** Air density, kg/m^3. */
export const AIR = 1.225;
/** Tyre-road friction coefficient (all cars assumed AWD-level grip). */
export const MU = 1.05;
/** Rolling resistance coefficient. */
export const CRR = 0.015;
/** Drivetrain mechanical efficiency. */
export const DRIVETRAIN_EFF = 0.87;
/** Simulation time step, seconds. */
export const DT = 0.02;
/** Maximum simulated time before giving up, seconds. */
export const MAX_T = 60;
/** Gear shift pause, seconds. */
export const SHIFT_TIME = 0.15;

export const DISTANCES_M: Record<string, number> = {
  "200": 200,
  "402": 402.336,
  "1000": 1000,
  "1609": 1609.344,
  "2000": 2000,
};
