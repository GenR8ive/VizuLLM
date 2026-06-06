import { z } from 'zod';

// ── Enums ──
export const ZodiacSign = z.enum([
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]);

export const PlanetName = z.enum([
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'North Node', 'Chiron',
]);

export const AspectType = z.enum([
  'conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx',
]);

export const ElementType = z.enum(['Fire', 'Earth', 'Air', 'Water']);
export const ModalityType = z.enum(['Cardinal', 'Fixed', 'Mutable']);

// ── Helpers ──
const Percentage = z.number().min(0).max(100);
const Degree = z.number().min(0).max(359);
const titled = (content: z.ZodTypeAny) =>
  z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    content,
  });

// ── Schema ──
export const CosmicBlueprintSchema = z.object({
  subjectName: z.string(),

  birthInfo: z.object({
    coverTitle: z.string().optional(),
    bornTitle: z.string().optional(),
    generatedByTitle: z.string().optional(),
    date: z.string(),
    time: z.string(),
    location: z.string(),
  }),

  executiveSummary: z.object({
    title: z.string().optional(),
    dominantEnergyTitle: z.string().optional(),
    summary: z.string(),
    dominantEnergy: z.string(),
  }),

  elements: titled(z.array(z.object({ element: ElementType, percentage: Percentage }))),

  modalities: titled(z.array(z.object({ modality: ModalityType, percentage: Percentage }))),

  planetPositions: titled(z.array(z.object({
    planet: PlanetName, symbol: z.string(), sign: ZodiacSign,
    house: z.number().min(1).max(12), degree: Degree,
  }))).extend({ houseTitle: z.string().optional() }),

  zodiacWheel: z.object({
    title: z.string().optional(), subtitle: z.string().optional(),
    ascendant: ZodiacSign, midheaven: ZodiacSign,
    houses: z.array(z.object({ sign: ZodiacSign, startDegree: Degree })).length(12),
  }),

  aspects: titled(z.array(z.object({
    planet1: PlanetName, planet2: PlanetName, type: AspectType,
    angle: z.number(), description: z.string().optional(),
  }))),

  planetaryStrengths: titled(z.array(z.object({ planet: PlanetName, score: Percentage }))),

  houseAnalysis: titled(z.array(z.object({
    house: z.number().min(1).max(12), title: z.string(),
    sign: ZodiacSign, description: z.string(),
  })).length(12)).extend({ houseTitle: z.string().optional() }),

  personalityThemes: titled(z.array(z.object({ title: z.string(), description: z.string() }))),

  relationshipStyle: titled(z.array(z.object({ icon: z.string(), title: z.string(), description: z.string() }))),

  careerTendencies: titled(z.array(z.object({ area: z.string(), score: Percentage }))),

  growthAreas: titled(z.array(z.string())),

  cosmicTimeline: titled(z.array(z.object({ year: z.number(), theme: z.string(), description: z.string() }))),

  compatibilitySnapshot: titled(z.array(z.object({ signType: z.string(), score: Percentage }))),

  aiReflection: titled(z.string()),

  disclaimer: z.object({
    title: z.string().optional(),
    birthDataAccuracyTitle: z.string().optional(),
    chartCalculationTitle: z.string().optional(),
    interpretationTitle: z.string().optional(),
    disclaimerText: z.string().optional(),
    dataAccuracy: Percentage,
    chartCalculation: z.string(),
    interpretation: z.string(),
  }),
});

export type CosmicBlueprintData = z.infer<typeof CosmicBlueprintSchema>;
export default CosmicBlueprintSchema;
