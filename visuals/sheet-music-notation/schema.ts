import { z } from "zod";

// Note pitch type - accepts both "#A4" and "A#4" formats
export const NotePitchSchema = z
  .string()
  .regex(/^([#bn]?[A-G]|[A-G][#bn]?)[0-8]$/);

// Note duration type
export const NoteDurationSchema = z.enum([
  "whole",
  "half",
  "quarter",
  "eighth",
  "sixteenth",
  "thirty-second",
]);

// Clef type
export const ClefTypeSchema = z.enum(["treble", "bass", "alto"]);

// Time signature schema
export const TimeSignatureSchema = z.object({
  numerator: z.number().int().min(1).max(32),
  denominator: z.number().int().min(1).max(64),
});

// Key signature schema
export const KeySignatureSchema = z.object({
  sharps: z.number().int().min(0).max(7).optional(),
  flats: z.number().int().min(0).max(7).optional(),
});

// Musical note schema
export const NoteSchema = z.object({
  pitch: NotePitchSchema.optional(), // Optional for rests
  duration: NoteDurationSchema,
  isRest: z.boolean().optional(),
  dotted: z.boolean().optional(),
  accidental: z.enum(["sharp", "flat", "natural"]).optional(),
  tieToNext: z.boolean().optional(),
  lyrics: z.string().optional(),
});

// Bar/measure schema
export const BarSchema = z.object({
  notes: z.array(NoteSchema),
  barline: z
    .enum(["single", "double", "end", "repeat-start", "repeat-end"])
    .optional(),
});

// Staff/schema
export const StaffSchema = z.object({
  clef: ClefTypeSchema,
  keySignature: KeySignatureSchema.optional(),
  timeSignature: TimeSignatureSchema.optional(),
  bars: z.array(BarSchema),
  label: z.string().optional(),
});

// Dynamic marking schema
export const DynamicSchema = z.object({
  position: z.enum(["start", "middle", "end"]).optional(),
  value: z.enum(["ppp", "pp", "p", "mp", "mf", "f", "ff", "fff"]),
});

// Tempo marking schema
export const TempoSchema = z.object({
  noteValue: z.enum(["quarter", "eighth", "half"]),
  bpm: z.number().int().min(1).max(999),
  text: z.string().optional(),
});

// Instrument group schema (for grouping staves like piano, choir, etc.)
export const InstrumentGroupSchema = z.object({
  name: z.string(),
  staffIndices: z.array(z.number()), // Which staves belong to this group
  bracket: z.boolean().optional(), // Use bracket instead of brace
});

// System/Page break schema
export const SystemBreakSchema = z.object({
  afterBar: z.number(), // Bar index after which to break
  newPage: z.boolean().optional(), // Start new page
});

// Main Sheet Music schema
export const SheetMusicNotationSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  composer: z.string().optional(),
  arranger: z.string().optional(),
  tempo: TempoSchema.optional(),
  dynamics: DynamicSchema.optional(),
  staves: z.array(StaffSchema).min(1),
  instrumentGroups: z.array(InstrumentGroupSchema).optional(), // For piano, choir, orchestra
  systemBreaks: z.array(SystemBreakSchema).optional(), // For long pieces
  showMeasureNumbers: z.boolean().optional(),
  pageSize: z.enum(["a4", "letter"]).optional(),
  maxBarsPerSystem: z.number().int().min(1).max(20).optional(), // Auto-break after N bars
  pageOrientation: z.enum(["portrait", "landscape"]).optional(),
});

// Export types
export type NotePitch = z.infer<typeof NotePitchSchema>;
export type NoteDuration = z.infer<typeof NoteDurationSchema>;
export type ClefType = z.infer<typeof ClefTypeSchema>;
export type TimeSignature = z.infer<typeof TimeSignatureSchema>;
export type KeySignature = z.infer<typeof KeySignatureSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type Bar = z.infer<typeof BarSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type Dynamic = z.infer<typeof DynamicSchema>;
export type Tempo = z.infer<typeof TempoSchema>;
export type InstrumentGroup = z.infer<typeof InstrumentGroupSchema>;
export type SystemBreak = z.infer<typeof SystemBreakSchema>;
export type SheetMusicNotationData = z.infer<typeof SheetMusicNotationSchema>;

export default SheetMusicNotationSchema;
