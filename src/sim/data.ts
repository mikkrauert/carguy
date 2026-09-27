import type { CarSpec } from "./types";

import enginesJson from "../../data/components/engines.json";
import gearboxesJson from "../../data/components/gearboxes.json";
import audiRs3 from "../../data/models/audi-rs3.json";
import mercedesAmgGlc63 from "../../data/models/mercedes-amg-glc63.json";
import bmwM3 from "../../data/models/bmw-m3.json";

export type Confidence = "official" | "press_test" | "parts_catalog" | "derived" | "estimate";

export interface FieldValue<T> {
  value: T;
  unit: string;
  source: string;
  confidence: Confidence;
  retrieved: string;
}

export interface EngineComponent {
  id: string;
  label: string;
  powerKW: FieldValue<number>;
  torqueNm: FieldValue<number>;
  redlineRPM: number;
  idleRPM: number;
}

export interface GearboxComponent {
  id: string;
  label: string;
  ratios: number[];
  source: string;
  confidence: Confidence;
  retrieved: string;
}

export interface Variant {
  id: string;
  label: string;
  years: string;
  engineId: string;
  gearboxId: string;
  finalDriveRatios: FieldValue<number[]>;
  massKg: FieldValue<number>;
  cda: FieldValue<number>;
  wheelRadiusM: number;
  vmaxKmh: FieldValue<number>;
  vmaxOptionKmh: FieldValue<number>;
  claimed0to100: FieldValue<number>;
  note?: string;
}

export interface Generation {
  id: string;
  label: string;
  years: string;
  variants: Variant[];
}

export interface ModelData {
  id: string;
  mark: string;
  model: string;
  generations: Generation[];
}

export interface Measurement {
  modelId: string;
  variantId: string;
  source: string;
  date: string;
  conditions: string | null;
  testMassKg: number | null;
  metric: string;
  value: number;
  unit: string;
  note?: string;
}

export const ENGINES = enginesJson as EngineComponent[];
export const GEARBOXES = gearboxesJson as GearboxComponent[];
export const MODELS: ModelData[] = [audiRs3, mercedesAmgGlc63, bmwM3] as ModelData[];

export function findVariant(modelId: string, variantId: string): { model: ModelData; generation: Generation; variant: Variant } {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) throw new Error(`Tundmatu mudel: ${modelId}`);
  for (const generation of model.generations) {
    const variant = generation.variants.find((v) => v.id === variantId);
    if (variant) return { model, generation, variant };
  }
  throw new Error(`Tundmatu variant: ${modelId}/${variantId}`);
}

/** Assembles a variant + its referenced engine and gearbox into a flat CarSpec for the sim engine. */
export function buildCarSpec(modelId: string, variantId: string): CarSpec {
  const { model, variant } = findVariant(modelId, variantId);
  const engine = ENGINES.find((e) => e.id === variant.engineId);
  if (!engine) throw new Error(`Tundmatu mootor: ${variant.engineId}`);
  const gearbox = GEARBOXES.find((g) => g.id === variant.gearboxId);
  if (!gearbox) throw new Error(`Tundmatu käigukast: ${variant.gearboxId}`);

  return {
    key: model.id,
    short: `${model.mark} ${model.model}`,
    variantId: variant.id,
    variantLabel: `${variant.label} (${variant.years})`,
    powerKW: engine.powerKW.value,
    torqueNm: engine.torqueNm.value,
    massKg: variant.massKg.value,
    cda: variant.cda.value,
    claimed0to100: variant.claimed0to100.value,
    vmaxKmh: variant.vmaxKmh.value,
    vmaxOptionKmh: variant.vmaxOptionKmh.value,
    redlineRPM: engine.redlineRPM,
    idleRPM: engine.idleRPM,
    wheelRadiusM: variant.wheelRadiusM,
    gearRatios: gearbox.ratios,
    finalDriveRatios: variant.finalDriveRatios.value,
  };
}
