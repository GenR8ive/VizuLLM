import React, { useMemo } from "react";
import {
  SheetMusicNotationSchema,
  type SheetMusicNotationData,
  type Bar,
  type Staff,
  type NoteDuration,
  type ClefType,
  type InstrumentGroup,
  type SystemBreak,
} from "./schema";
import sampleData from "./sample-data.json";

interface SheetMusicNotationProps {
  schema: typeof SheetMusicNotationSchema | null;
  data?: SheetMusicNotationData | null;
}

// Constants for rendering
const STAFF_LINE_SPACING = 8;
const STAFF_HEIGHT = STAFF_LINE_SPACING * 4;
const NOTE_HEAD_WIDTH = 10;
const NOTE_HEAD_HEIGHT = 7;
const STAFF_MARGIN_X = 40;
const BAR_LINE_HEIGHT = STAFF_HEIGHT + 10;
const CLEF_WIDTH = 30;
const TIME_SIGNATURE_WIDTH = 24;
const NOTE_SPACING = 28;
const SYSTEM_SPACING = 80; // Space between staff systems
const MAX_SYSTEM_WIDTH = 720; // Max width before wrapping
const MIN_BARS_PER_SYSTEM = 2;

// Note positions on staff (0 = bottom line, positive = up)
const NOTE_POSITIONS: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

// Calculate note Y position relative to staff center
const getNoteYPosition = (pitch: string, clef: ClefType): number => {
  const noteLetter = pitch.match(/[A-G]/)?.[0] || "C";
  const octave = parseInt(pitch.match(/[0-8]/)?.[0] || "4");

  let octaveOffset: number;
  let baseOffset: number;

  if (clef === "treble") {
    octaveOffset = (octave - 4) * 7;
    baseOffset = -5;
  } else if (clef === "bass") {
    octaveOffset = (octave - 3) * 7;
    baseOffset = 5;
  } else {
    octaveOffset = (octave - 4) * 7;
    baseOffset = 0;
  }

  return baseOffset + octaveOffset + NOTE_POSITIONS[noteLetter];
};

// Get note head fill color
const getNoteHeadFill = (duration: NoteDuration, isRest: boolean): string => {
  if (isRest) return "currentColor";
  return duration === "whole" || duration === "half" ? "none" : "currentColor";
};

// Get note stem height and direction
const getStemInfo = (yPosition: number, duration: NoteDuration) => {
  if (duration === "whole") return null;
  const direction = yPosition < 2 ? "up" : "down";
  const height = duration === "half" ? 28 : 32;
  return { direction, height };
};

// Get ledger lines needed for a note
const getLedgerLines = (yPosition: number): number[] => {
  const lines: number[] = [];
  if (yPosition < -1) {
    for (let i = -2; i >= yPosition; i -= 2) lines.push(i);
  } else if (yPosition > 9) {
    for (let i = 10; i <= yPosition; i += 2) lines.push(i);
  }
  return lines;
};

// Calculate system breaks based on available width and max bars per system
const calculateSystemBreaks = (
  totalBars: number,
  maxBarsPerSystem?: number,
  manualBreaks?: SystemBreak[],
): number[][] => {
  const systems: number[][] = [];
  let currentSystem: number[] = [];

  // Sort manual breaks
  const sortedBreaks =
    manualBreaks?.sort((a, b) => a.afterBar - b.afterBar) || [];
  let nextBreakIndex = 0;

  for (let i = 0; i < totalBars; i++) {
    currentSystem.push(i);

    // Check for manual break
    const shouldBreak = sortedBreaks[nextBreakIndex]?.afterBar === i;
    // Check for max bars per system
    const maxBarsReached =
      maxBarsPerSystem && currentSystem.length >= maxBarsPerSystem;
    // Check for system width limit (rough estimate: ~100px per bar)
    const widthExceeded =
      currentSystem.length >= MIN_BARS_PER_SYSTEM &&
      currentSystem.length * 80 + 100 > MAX_SYSTEM_WIDTH;

    if (shouldBreak || maxBarsReached || widthExceeded || i === totalBars - 1) {
      systems.push([...currentSystem]);
      currentSystem = [];
      if (shouldBreak) nextBreakIndex++;
    }
  }

  if (currentSystem.length > 0) {
    systems.push(currentSystem);
  }

  return systems;
};

// Component for a brace (piano)
const Brace: React.FC<{ x: number; y1: number; y2: number }> = ({
  x,
  y1,
  y2,
}) => (
  <path
    d={`M${x},${y1} Q${x - 8},${(y1 + y2) / 2} ${x},${y2} Q${x + 5},${
      (y1 + y2) / 2
    } ${x},${y1}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  />
);

// Component for a bracket (orchestra/choir)
const Bracket: React.FC<{ x: number; y1: number; y2: number }> = ({
  x,
  y1,
  y2,
}) => (
  <>
    <line x1={x} y1={y1} x2={x} y2={y2} stroke="currentColor" strokeWidth={2} />
    <line
      x1={x}
      y1={y1}
      x2={x + 8}
      y2={y1}
      stroke="currentColor"
      strokeWidth={1}
    />
    <line
      x1={x}
      y1={y2}
      x2={x + 8}
      y2={y2}
      stroke="currentColor"
      strokeWidth={1}
    />
  </>
);

// Component for rendering a bar with notes
const BarComponent: React.FC<{
  bar: Bar;
  x: number;
  width: number;
  barIndex: number;
  staff: Staff;
  showMeasureNumbers?: boolean;
  isFirstBar: boolean;
}> = ({ bar, x, width, barIndex, staff, showMeasureNumbers, isFirstBar }) => {
  return (
    <g>
      {/* Measure number */}
      {showMeasureNumbers && barIndex > 0 && barIndex % 5 === 0 && (
        <text
          x={x + width / 2}
          y={-10}
          fontSize={8}
          fill="currentColor"
          textAnchor="middle"
        >
          {barIndex + 1}
        </text>
      )}

      {/* Bar line */}
      {!isFirstBar && (
        <line
          x1={x}
          y1={-2}
          x2={x}
          y2={BAR_LINE_HEIGHT}
          stroke="currentColor"
          strokeWidth={1}
        />
      )}

      {/* Special barlines */}
      {bar.barline === "repeat-end" && (
        <>
          <line
            x1={x + width - 4}
            y1={-2}
            x2={x + width - 4}
            y2={BAR_LINE_HEIGHT}
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <line
            x1={x + width - 8}
            y1={-2}
            x2={x + width - 8}
            y2={BAR_LINE_HEIGHT}
            stroke="currentColor"
            strokeWidth={0.5}
          />
          <circle cx={x + width - 2} cy={12} r={1.5} fill="currentColor" />
          <circle cx={x + width - 2} cy={22} r={1.5} fill="currentColor" />
        </>
      )}
      {bar.barline === "end" && (
        <>
          <line
            x1={x + width - 4}
            y1={-2}
            x2={x + width - 4}
            y2={BAR_LINE_HEIGHT}
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <line
            x1={x + width - 8}
            y1={-2}
            x2={x + width - 8}
            y2={BAR_LINE_HEIGHT}
            stroke="currentColor"
            strokeWidth={0.5}
          />
        </>
      )}
      {bar.barline === "double" && (
        <>
          <line
            x1={x + width - 4}
            y1={-2}
            x2={x + width - 4}
            y2={BAR_LINE_HEIGHT}
            stroke="currentColor"
            strokeWidth={1}
          />
          <line
            x1={x + width - 8}
            y1={-2}
            x2={x + width - 8}
            y2={BAR_LINE_HEIGHT}
            stroke="currentColor"
            strokeWidth={1}
          />
        </>
      )}

      {/* Notes */}
      {bar.notes.map((note, noteIndex) => {
        if (!note.pitch && !note.isRest) return null;
        const noteX = x + 12 + noteIndex * NOTE_SPACING;

        if (note.isRest) {
          return (
            <g key={noteIndex} transform={`translate(${noteX}, 0)`}>
              {note.duration === "whole" && (
                <rect
                  x={-6}
                  y={14}
                  width={12}
                  height={4}
                  fill="currentColor"
                  rx={1}
                />
              )}
              {note.duration === "half" && (
                <rect
                  x={-5}
                  y={14}
                  width={10}
                  height={3}
                  fill="currentColor"
                  rx={0.5}
                />
              )}
              {note.duration === "quarter" && (
                <path d="M-2,18 L2,6 L6,6 L2,18 Z" fill="currentColor" />
              )}
              {note.duration === "eighth" && (
                <path
                  d="M-2,20 L2,8 L6,8 L2,20 Z M2,8 L8,4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )}
              {note.duration === "sixteenth" && (
                <path
                  d="M-2,20 L2,8 L6,8 L2,20 Z M2,8 L8,4 M0,14 L6,10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )}
              {note.dotted && (
                <circle cx={10} cy={16} r={1.5} fill="currentColor" />
              )}
            </g>
          );
        }

        const yPosition = note.pitch
          ? getNoteYPosition(note.pitch, staff.clef)
          : 0;
        const noteY = (4 - yPosition / 2) * STAFF_LINE_SPACING;
        const stemInfo = getStemInfo(yPosition, note.duration);
        const ledgerLines = getLedgerLines(yPosition);

        return (
          <g key={noteIndex} transform={`translate(${noteX}, ${noteY})`}>
            {ledgerLines.map((linePos, lineIndex) => (
              <line
                key={lineIndex}
                x1={-8}
                y1={(linePos / 2) * STAFF_LINE_SPACING - noteY}
                x2={8}
                y2={(linePos / 2) * STAFF_LINE_SPACING - noteY}
                stroke="currentColor"
                strokeWidth={0.5}
              />
            ))}

            <ellipse
              cx={0}
              cy={0}
              rx={NOTE_HEAD_WIDTH / 2}
              ry={NOTE_HEAD_HEIGHT / 2}
              fill={getNoteHeadFill(note.duration, false)}
              stroke="currentColor"
              strokeWidth={0.8}
              transform="rotate(-15, 0, 0)"
            />

            {stemInfo && (
              <line
                x1={stemInfo.direction === "up" ? 4 : -4}
                y1={0}
                x2={stemInfo.direction === "up" ? 4 : -4}
                y2={
                  stemInfo.direction === "up"
                    ? -stemInfo.height
                    : stemInfo.height
                }
                stroke="currentColor"
                strokeWidth={1}
              />
            )}

            {(note.duration === "eighth" || note.duration === "sixteenth") &&
              stemInfo && (
                <path
                  d={
                    stemInfo.direction === "up"
                      ? `M4,${-stemInfo.height} Q10,${
                          -stemInfo.height + 4
                        } 10,${-stemInfo.height + 12}`
                      : `M-4,${stemInfo.height} Q-10,${
                          stemInfo.height - 4
                        } -10,${stemInfo.height - 12}`
                  }
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              )}

            {note.duration === "sixteenth" && stemInfo && (
              <path
                d={
                  stemInfo.direction === "up"
                    ? `M4,${-stemInfo.height + 6} Q10,${
                        -stemInfo.height + 10
                      } 10,${-stemInfo.height + 18}`
                    : `M-4,${stemInfo.height - 6} Q-10,${
                        stemInfo.height - 10
                      } -10,${stemInfo.height - 18}`
                }
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
            )}

            {note.accidental && (
              <text
                x={-14}
                y={2}
                fontSize={14}
                fill="currentColor"
                textAnchor="middle"
              >
                {note.accidental === "sharp"
                  ? "♯"
                  : note.accidental === "flat"
                    ? "♭"
                    : "♮"}
              </text>
            )}

            {note.dotted && (
              <circle cx={8} cy={-1} r={1.5} fill="currentColor" />
            )}
            {note.tieToNext && (
              <path
                d="M4,0 Q10,-6 16,0"
                fill="none"
                stroke="currentColor"
                strokeWidth={0.8}
              />
            )}
            {note.lyrics && (
              <text
                x={0}
                y={20}
                fontSize={8}
                fill="currentColor"
                textAnchor="middle"
              >
                {note.lyrics}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

// Component for rendering a staff with specific bars
const StaffSystem: React.FC<{
  staff: Staff;
  staffIndex: number;
  systemIndex: number;
  barIndices: number[];
  showMeasureNumbers?: boolean;
  isFirstSystem: boolean;
}> = ({
  staff,
  staffIndex,
  systemIndex,
  barIndices,
  showMeasureNumbers,
  isFirstSystem,
}) => {
  const staffY =
    systemIndex * SYSTEM_SPACING + staffIndex * (STAFF_HEIGHT + 20);

  let currentX = STAFF_MARGIN_X + 20; // Extra space for brace/bracket

  // Add space for clef and key/time signatures (only on first system or after breaks)
  const showSignatures = isFirstSystem || systemIndex === 0;

  if (showSignatures) {
    currentX += CLEF_WIDTH + 8;
    if (staff.keySignature) {
      currentX +=
        ((staff.keySignature.sharps || 0) + (staff.keySignature.flats || 0)) *
          10 +
        8;
    }
    if (staff.timeSignature) {
      currentX += TIME_SIGNATURE_WIDTH + 16;
    }
  }

  // Calculate bar widths
  const barData = barIndices
    .map((barIndex, idx) => {
      const bar = staff.bars[barIndex];
      if (!bar) return null;

      const notesWidth = bar.notes.length * NOTE_SPACING;
      const barWidth = Math.max(notesWidth + 24, 70);
      const x = currentX;
      currentX += barWidth;

      return { bar, barIndex, x, width: barWidth, isFirstBar: idx === 0 };
    })
    .filter(Boolean);

  const totalWidth = currentX + STAFF_MARGIN_X;

  return (
    <g transform={`translate(0, ${staffY})`}>
      {/* Staff lines */}
      {[0, 1, 2, 3, 4].map((line) => (
        <line
          key={line}
          x1={STAFF_MARGIN_X + 20}
          y1={line * STAFF_LINE_SPACING}
          x2={totalWidth - STAFF_MARGIN_X}
          y2={line * STAFF_LINE_SPACING}
          stroke="currentColor"
          strokeWidth={0.5}
        />
      ))}

      {/* Staff label */}
      {staff.label && (
        <text
          x={25}
          y={-8}
          fontSize={9}
          fontStyle="italic"
          fill="currentColor"
          textAnchor="start"
        >
          {staff.label}
        </text>
      )}

      {/* Clef, Key & Time signatures (only on first system) */}
      {showSignatures && (
        <>
          {/* Clef */}
          <g transform={`translate(${STAFF_MARGIN_X + 20}, 0)`}>
            {staff.clef === "treble" && (
              <image
                href="/visuals/sheet-music-notation/assets/treble_clef.svg"
                x="-5"
                y="-8"
                width="28"
                height="45"
                preserveAspectRatio="xMidYMid meet"
              />
            )}
            {staff.clef === "bass" && (
              <image
                href="/visuals/sheet-music-notation/assets/bass_clef.svg"
                x="0"
                y="2"
                width="22"
                height="30"
                preserveAspectRatio="xMidYMid meet"
              />
            )}
            {staff.clef === "alto" && (
              <image
                href="/visuals/sheet-music-notation/assets/alto_clef.svg"
                x="0"
                y="-5"
                width="24"
                height="40"
                preserveAspectRatio="xMidYMid meet"
              />
            )}
          </g>

          {/* Key Signature */}
          {staff.keySignature && (
            <g
              transform={`translate(${
                STAFF_MARGIN_X + 20 + CLEF_WIDTH + 8
              }, 0)`}
            >
              {staff.keySignature.sharps && staff.keySignature.sharps > 0 && (
                <>
                  {staff.keySignature.sharps >= 1 && (
                    <text
                      x={0}
                      y={14}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♯
                    </text>
                  )}
                  {staff.keySignature.sharps >= 2 && (
                    <text
                      x={8}
                      y={6}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♯
                    </text>
                  )}
                  {staff.keySignature.sharps >= 3 && (
                    <text
                      x={16}
                      y={18}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♯
                    </text>
                  )}
                  {staff.keySignature.sharps >= 4 && (
                    <text
                      x={24}
                      y={10}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♯
                    </text>
                  )}
                  {staff.keySignature.sharps >= 5 && (
                    <text
                      x={32}
                      y={22}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♯
                    </text>
                  )}
                  {staff.keySignature.sharps >= 6 && (
                    <text
                      x={40}
                      y={14}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♯
                    </text>
                  )}
                  {staff.keySignature.sharps >= 7 && (
                    <text
                      x={48}
                      y={26}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♯
                    </text>
                  )}
                </>
              )}
              {staff.keySignature.flats && staff.keySignature.flats > 0 && (
                <>
                  {staff.keySignature.flats >= 1 && (
                    <text
                      x={0}
                      y={22}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♭
                    </text>
                  )}
                  {staff.keySignature.flats >= 2 && (
                    <text
                      x={8}
                      y={14}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♭
                    </text>
                  )}
                  {staff.keySignature.flats >= 3 && (
                    <text
                      x={16}
                      y={26}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♭
                    </text>
                  )}
                  {staff.keySignature.flats >= 4 && (
                    <text
                      x={24}
                      y={18}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♭
                    </text>
                  )}
                  {staff.keySignature.flats >= 5 && (
                    <text
                      x={32}
                      y={30}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♭
                    </text>
                  )}
                  {staff.keySignature.flats >= 6 && (
                    <text
                      x={40}
                      y={22}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♭
                    </text>
                  )}
                  {staff.keySignature.flats >= 7 && (
                    <text
                      x={48}
                      y={34}
                      fontSize={16}
                      fill="currentColor"
                      textAnchor="middle"
                    >
                      ♭
                    </text>
                  )}
                </>
              )}
            </g>
          )}

          {/* Time Signature */}
          {staff.timeSignature && (
            <g
              transform={`translate(${
                STAFF_MARGIN_X +
                20 +
                CLEF_WIDTH +
                8 +
                ((staff.keySignature?.sharps || 0) +
                  (staff.keySignature?.flats || 0)) *
                  10 +
                8
              }, 0)`}
            >
              <text
                x={0}
                y={14}
                fontSize={16}
                fontWeight="bold"
                fill="currentColor"
                textAnchor="middle"
              >
                {staff.timeSignature.numerator}
              </text>
              <text
                x={0}
                y={30}
                fontSize={16}
                fontWeight="bold"
                fill="currentColor"
                textAnchor="middle"
              >
                {staff.timeSignature.denominator}
              </text>
            </g>
          )}
        </>
      )}

      {/* Bars */}
      {barData.map(
        (data) =>
          data && (
            <BarComponent
              key={data.barIndex}
              bar={data.bar}
              x={data.x}
              width={data.width}
              barIndex={data.barIndex}
              staff={staff}
              showMeasureNumbers={showMeasureNumbers}
              isFirstBar={data.isFirstBar}
            />
          ),
      )}

      {/* Final barline */}
      <line
        x1={totalWidth - STAFF_MARGIN_X}
        y1={-2}
        x2={totalWidth - STAFF_MARGIN_X}
        y2={BAR_LINE_HEIGHT}
        stroke="currentColor"
        strokeWidth={1}
      />
    </g>
  );
};

// Main component
const SheetMusicNotation: React.FC<SheetMusicNotationProps> = ({ data }) => {
  let validatedData: SheetMusicNotationData;
  try {
    validatedData = data
      ? SheetMusicNotationSchema.parse(data)
      : SheetMusicNotationSchema.parse(sampleData);
  } catch (error) {
    console.error("Data validation failed:", error);
    validatedData = SheetMusicNotationSchema.parse(sampleData);
  }

  // Calculate system breaks
  const maxBarCount = Math.max(
    ...validatedData.staves.map((s) => s.bars.length),
  );
  const systemBreaks = useMemo(
    () =>
      calculateSystemBreaks(
        maxBarCount,
        validatedData.maxBarsPerSystem,
        validatedData.systemBreaks,
      ),
    [maxBarCount, validatedData.maxBarsPerSystem, validatedData.systemBreaks],
  );

  // Calculate dimensions
  const { svgWidth, svgHeight } = useMemo(() => {
    const systemCount = systemBreaks.length;
    const staffCount = validatedData.staves.length;
    const height =
      systemCount * SYSTEM_SPACING + staffCount * (STAFF_HEIGHT + 20) + 100;
    return { svgWidth: 800, svgHeight: height };
  }, [systemBreaks.length, validatedData.staves.length]);

  return (
    <div className="mx-auto w-full max-w-4xl bg-transparent p-8 print:p-4">
      {/* Title area */}
      <div className="mb-6 text-center print:mb-4">
        {validatedData.title && (
          <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
            {validatedData.title}
          </h1>
        )}
        {validatedData.subtitle && (
          <h2 className="mt-2 text-xl text-gray-700 print:text-lg">
            {validatedData.subtitle}
          </h2>
        )}
        <div className="mt-4 flex items-center justify-center gap-8 text-sm text-gray-600 print:text-xs">
          {validatedData.composer && (
            <span>Composer: {validatedData.composer}</span>
          )}
          {validatedData.arranger && (
            <span>Arranger: {validatedData.arranger}</span>
          )}
        </div>
        {validatedData.tempo && (
          <div className="mt-4 text-sm text-gray-700 print:text-xs">
            <span className="font-medium">Tempo: </span>
            {validatedData.tempo.text ||
              `${validatedData.tempo.noteValue} = ${validatedData.tempo.bpm}`}
          </div>
        )}
      </div>

      {/* Sheet music SVG */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full print:w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Sheet music: ${validatedData.title}`}
      >
        <g transform="translate(0, 40)" className="text-gray-900">
          {/* Render each system */}
          {systemBreaks.map((barIndices, systemIndex) => {
            const isFirstSystem = systemIndex === 0;

            return (
              <g key={systemIndex}>
                {/* Render staves for this system */}
                {validatedData.staves.map((staff, staffIndex) => (
                  <StaffSystem
                    key={`${systemIndex}-${staffIndex}`}
                    staff={staff}
                    staffIndex={staffIndex}
                    systemIndex={systemIndex}
                    barIndices={barIndices}
                    showMeasureNumbers={validatedData.showMeasureNumbers}
                    isFirstSystem={isFirstSystem}
                  />
                ))}

                {/* Render braces/brackets for instrument groups */}
                {validatedData.instrumentGroups?.map((group, groupIndex) => {
                  const firstStaffY =
                    systemIndex * SYSTEM_SPACING +
                    group.staffIndices[0] * (STAFF_HEIGHT + 20);
                  const lastStaffIndex =
                    group.staffIndices[group.staffIndices.length - 1];
                  const lastStaffY =
                    systemIndex * SYSTEM_SPACING +
                    lastStaffIndex * (STAFF_HEIGHT + 20) +
                    STAFF_HEIGHT;

                  return group.bracket ? (
                    <Bracket
                      key={groupIndex}
                      x={STAFF_MARGIN_X + 5}
                      y1={firstStaffY}
                      y2={lastStaffY}
                    />
                  ) : (
                    <Brace
                      key={groupIndex}
                      x={STAFF_MARGIN_X + 8}
                      y1={firstStaffY}
                      y2={lastStaffY}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

// Export for dynamic loading
export default SheetMusicNotation;

// Register component for dynamic loading
if (typeof window !== "undefined" && window.__registerVisualComponent) {
  // @ts-expect-error - Type incompatibility between component props
  window.__registerVisualComponent("sheet-music-notation", SheetMusicNotation);
}
