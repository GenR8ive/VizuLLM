---
name: visual-development
description: Create and edit visual components for VizuLLM. Use when building new visuals, editing schemas, components, or sample data under the visuals/ directory. Covers Zod schema patterns, React component structure, Tailwind styling, print-ready layout, and section title localization.
metadata:
  tags: vizullm, visual, component, schema, react, zod, tailwind
---

# Visual Component Development

## Creating a New Visual

Run the generator script:

```bash
npm run generate-visual -- --name "Visual Name" --description "Clear description covering UI and use-cases" --author "github-username"
```

After generation, edit the files inside. Do not change file structure or export defaults.

## File Structure

Every visual has exactly 4 files inside `visuals/<slug>/`:

| File | Purpose |
|---|---|
| `schema.ts` | Zod schema — all data validation |
| `component.tsx` | React component with error handling |
| `sample-data.json` | Realistic data that validates against the schema |
| `metadata.json` | Name, description, author, version |

Do NOT add README, extra sample files, tabs, or accordions.

## Schema Pattern (`schema.ts`)

Use Zod for all validation. Extract reusable helpers to keep the schema concise.

### Section Title Pattern

Every section must support optional `title` and `subtitle` overrides so the LLM can localize them.

**For array sections** — wrap in a `titled()` helper:

```typescript
const Percentage = z.number().min(0).max(100);

const titled = (content: z.ZodTypeAny) =>
  z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    content,
  });

// Usage — clean and short:
elements: titled(z.array(z.object({ element: z.string(), percentage: Percentage }))),
growthAreas: titled(z.array(z.string())),
motto: titled(z.string()),
```

**For object sections** — add `title` / `subtitle` directly as optional fields:

```typescript
executiveSummary: z.object({
  title: z.string().optional(),
  summary: z.string(),
  overallScore: Percentage,
}),
```

**For sub-labels within sections** — add optional title fields:

```typescript
learningPreferences: z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  methods: z.array(z.object({ label: z.string(), percentage: Percentage })),
  learnsBestThrough: z.array(z.string()),
  learnsBestThroughTitle: z.string().optional(),
  strugglesWith: z.array(z.string()),
  strugglesWithTitle: z.string().optional(),
}),
```

### Schema Conciseness Rules

- Extract shared types (`Percentage`, `Degree`) as reusable constants
- Use `titled()` for array/string sections — never repeat `title`/`subtitle`/`content` manually
- Use `.extend({})` on `titled()` when a section needs extra optional fields
- Keep the schema as short as possible — the JSON Schema is copied as an LLM prompt

## Component Pattern (`component.tsx`)

### Required Props Interface

```typescript
interface YourComponentProps {
  schema: typeof YourComponentSchema | null;
  data?: YourComponentData | null;
}
```

### Error Handling

```typescript
let validatedData: YourComponentData;
try {
  validatedData = data
    ? YourComponentSchema.parse(data)
    : YourComponentSchema.parse(sampleData);
} catch (error) {
  console.error('Data validation failed:', error);
  validatedData = YourComponentSchema.parse(sampleData);
}
```

### Using Titles

Read `title` / `subtitle` directly from each section with inline fallbacks:

```tsx
<SectionTitle number={2} title={d.coreTraits.title ?? 'Core Traits'} subtitle={d.coreTraits.subtitle ?? 'Trait visualization'} />
<RadarChart traits={d.coreTraits.content} />
```

No `t()` function, no `resolveTitle` helper — just `section.title ?? 'Default'`.

For sub-labels:

```tsx
<h3>{d.operatingGuide.worksBestWhenTitle ?? 'Works Best When'}</h3>
```

### Component Registration

Always register at the bottom:

```typescript
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('your-slug', YourComponent);
}
```

## Styling Rules

- **Tailwind CSS 3.4.17** only — no inline styles for layout
- **Mobile-first** responsive design
- **Semantic HTML** (`main`, `section`, `header`)
- **ARIA labels** on interactive elements and SVGs
- **Print-ready**: transparent backgrounds, no dynamic UI (tabs, accordions)
- **No VizuLLM branding** on components
- Use `React.memo` for expensive sub-components (charts, SVGs)

## Sample Data (`sample-data.json`)

- Must validate against the schema
- Use realistic, meaningful content — no "Lorem ipsum"
- Array sections go under `content` key:

```json
{
  "coreTraits": {
    "content": [
      { "name": "Creativity", "score": 92 }
    ]
  },
  "motto": {
    "content": "Build first, optimize later."
  }
}
```

## Validation

After creating or editing a visual:

1. Run `npm run update-list` to update the visual list
2. Ensure no lint errors in the component files
3. Run `npx tsc --project tsconfig.json --noEmit` to type-check
