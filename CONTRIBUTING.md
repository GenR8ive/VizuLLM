# Contributing to VizuLLM

Thank you for your interest in contributing to VizuLLM! This guide will help you create new **document renderers** for the schema-driven rendering engine.

## 🎯 What You're Building

VizuLLM is **not a generic UI component library**. It's a **schema-driven rendering engine** that transforms structured LLM outputs into deterministic documents and visual artifacts.

When you contribute to VizuLLM, you're creating a **document renderer** that:

1. **Defines a schema contract** - A Zod schema that LLMs can generate data for
2. **Renders deterministically** - The same JSON input always produces the same output
3. **Produces real artifacts** - Documents that can be printed, exported, or used in production

### The VizuLLM Workflow

```
LLM generates JSON → Schema validates data → Renderer produces document
```

Your contribution adds a new **document type** that LLMs can reliably generate.

### What Makes a Good Renderer?

✅ **Good examples:**
- Invoices, receipts, contracts
- Timetables, schedules, calendars
- Reports, guides, manuals
- Diagrams, charts, timelines
- Certificates, badges, cards

❌ **Not suitable:**
- Generic UI components (buttons, forms, modals)
- Interactive applications
- Components without clear schema contracts
- Anything that doesn't produce a finished artifact

## 🚀 Quick Start

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install` or `pnpm install`
3. **Start development server**: `npm run dev`
4. **Generate a renderer**: `npm run generate-visual` (recommended)
5. **Or create manually** following the template structure
6. **Test your renderer** and submit a pull request

## 📁 Document Renderer Structure

Each document renderer should follow this structure:

```
visuals/your-document-name/
├── component.tsx      # React renderer component
├── schema.ts          # Zod schema contract
├── sample-data.json   # Example LLM output
└── metadata.json      # Renderer metadata
```

## 🛠️ Creating a New Document Renderer

### Option 1: Using the Renderer Generator (Recommended)

The easiest way to create a new document renderer is using our automated generator:

```bash
npm run generate-visual
```

This interactive script will:
- Ask for document renderer details (name, description, author, category)
- Generate all necessary files from the template
- Create the schema contract for LLM integration
- Update the renderer registry automatically
- Provide next steps and guidance

**Example usage:**
```bash
$ npm run generate-visual

🎨 VizuLLM Visual Generator

Visual name (e.g., "Invoice Generator"): Invoice Generator
Visual description: Professional invoice template with company branding
Your GitHub username: your-username

📋 Visual Details:
Name: Invoice Generator
Author: your-username
Description: Professional invoice template with company branding

Proceed with generation? (y/N): y

✅ Created directory: visuals/invoice-generator/
✅ Generated schema.ts (schema contract for LLMs)
✅ Generated component.tsx (document renderer)
✅ Generated sample-data.json (example LLM output)
✅ Generated metadata.json
✅ Updated visuals/list.json

🎉 Document renderer generated successfully!

📁 Next steps:
1. Navigate to: visuals/invoice-generator/
2. Define the schema contract in schema.ts
3. Implement the renderer in component.tsx
4. Update sample-data.json with realistic LLM output
5. Test your renderer: npm run dev
6. Visit: http://localhost:5173/visual/invoice-generator
```

### Option 2: Manual Creation

### Step 1: Define Your Schema Contract (`schema.ts`)

The schema is the **contract** between the LLM and your renderer. It defines exactly what data the LLM must generate.

```typescript
import { z } from 'zod';

// Define the data contract that LLMs will generate
export const YourDocumentSchema = z.object({
  // Required fields - LLM must provide these
  title: z.string().min(1, "Title is required"),
  
  // Optional fields with defaults
  subtitle: z.string().optional(),
  
  // Complex objects - nested data structures
  items: z.array(z.object({
    name: z.string(),
    value: z.number().positive(),
    description: z.string().optional(),
  })),
  
  // Nested objects with defaults
  theme: z.object({
    primaryColor: z.enum(['blue', 'green', 'purple', 'red']).default('blue'),
    fontSize: z.number().min(12).max(48).default(16),
    showBorder: z.boolean().default(true),
  }).optional(),
  
  // Metadata fields
  metadata: z.object({
    author: z.string(),
    date: z.string().datetime().optional(),
  }).optional(),
});

// Export the TypeScript type for use in your renderer
export type YourDocumentData = z.infer<typeof YourDocumentSchema>;

// Export renderer metadata
export const rendererMetadata = {
  name: 'Your Document Name',
  description: 'Brief description of what this document renderer produces',
  author: 'your-username',
} as const;
```

### Step 2: Create Your Renderer (`component.tsx`)

The renderer takes validated JSON data and produces a deterministic visual output.

```typescript
import React from 'react';
import { YourDocumentSchema, type YourDocumentData } from './schema';
import sampleData from './sample-data.json';

interface YourDocumentRendererProps {
  schema: typeof YourDocumentSchema | null;
  data?: YourDocumentData | null;
}

// Extend Window interface for dynamic loading
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<YourDocumentRendererProps>) => void;
  }
}

const YourDocumentRenderer: React.FC<YourDocumentRendererProps> = ({ data }) => {
  // Validate and parse LLM-generated data using the schema contract
  let validatedData: YourDocumentData;
  
  try {
    if (data) {
      validatedData = YourDocumentSchema.parse(data);
    } else {
      validatedData = YourDocumentSchema.parse(sampleData);
    }
  } catch (error) {
    console.error('Schema validation failed:', error);
    // Fallback to sample data if LLM output is invalid
    validatedData = YourDocumentSchema.parse(sampleData);
  }

  const { title, subtitle, items, theme, metadata } = validatedData;
  const primaryColor = theme?.primaryColor || 'blue';
  const fontSize = theme?.fontSize || 16;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 
          className="text-3xl font-bold text-gray-900"
          style={{ fontSize: `${fontSize * 1.5}px` }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
        )}
        {metadata && (
          <div className="mt-4 text-sm text-gray-500">
            <span>By {metadata.author}</span>
            {metadata.date && (
              <span className="ml-4">{new Date(metadata.date).toLocaleDateString()}</span>
            )}
          </div>
        )}
      </header>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
              theme?.showBorder !== false ? 'border-gray-200' : 'border-transparent'
            } ${
              primaryColor === 'blue' ? 'bg-blue-50 hover:border-blue-300' :
              primaryColor === 'green' ? 'bg-green-50 hover:border-green-300' :
              primaryColor === 'purple' ? 'bg-purple-50 hover:border-purple-300' :
              primaryColor === 'red' ? 'bg-red-50 hover:border-red-300' :
              'bg-gray-50 hover:border-gray-300'
            }`}
          >
            <h3 
              className="font-semibold mb-2 text-gray-900"
              style={{ fontSize: `${fontSize}px` }}
            >
              {item.name}
            </h3>
            <p 
              className={`text-2xl font-bold ${
                primaryColor === 'blue' ? 'text-blue-600' :
                primaryColor === 'green' ? 'text-green-600' :
                primaryColor === 'purple' ? 'text-purple-600' :
                primaryColor === 'red' ? 'text-red-600' :
                'text-gray-600'
              }`}
              style={{ fontSize: `${fontSize * 1.25}px` }}
            >
              {item.value}
            </p>
            {item.description && (
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Export for dynamic loading
export default YourDocumentRenderer;

// Register renderer for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('your-document-slug', YourDocumentRenderer);
}
```

### Step 3: Create Sample LLM Output (`sample-data.json`)

This file represents what an LLM would generate based on your schema contract.

```json
{
  "title": "Sample Document",
  "subtitle": "This is a sample subtitle",
  "items": [
    {
      "name": "Item 1",
      "value": 100,
      "description": "Description for item 1"
    },
    {
      "name": "Item 2",
      "value": 200,
      "description": "Description for item 2"
    },
    {
      "name": "Item 3",
      "value": 300,
      "description": "Description for item 3"
    }
  ],
  "theme": {
    "primaryColor": "blue",
    "fontSize": 16,
    "showBorder": true
  },
  "metadata": {
    "author": "Your Name",
    "date": "2024-01-01T00:00:00.000Z"
  }
}
```

### Step 4: Update Renderer Registry

Add your document renderer to `visuals/list.json`:

```json
{
  "name": "Your Document Name",
  "slug": "your-document-slug",
  "author": "your-username",
  "description": "Brief description of what this renderer produces"
}
```

## 🎨 Design Guidelines

### Styling
- Use **Tailwind CSS** for all styling
- Follow **responsive design** principles
- Ensure **accessibility** with proper ARIA labels
- Use **semantic HTML** elements
- **Print-friendly** - documents should render cleanly when printed

### Typography
- Use **rem** or **em** units for font sizes
- Maintain **readable line heights** (1.5-1.7)
- Ensure **proper contrast ratios**
- Choose fonts appropriate for the document type

### Document Quality
- **Deterministic rendering** - same input always produces same output
- **Professional appearance** - suitable for real-world use
- **Complete artifacts** - produce finished, usable documents
- **Schema-driven** - all content comes from validated data

## 🧪 Testing Your Renderer

1. **Start the dev server**: `npm run dev`
2. **Navigate to your renderer**: `/visual/your-document-slug`
3. **Test with sample data** - should render correctly
4. **Test schema validation** - try invalid data, should show fallback
5. **Test with LLM output** - paste actual LLM-generated JSON
6. **Test responsive behavior** - mobile, tablet, desktop
7. **Test print functionality** - should print cleanly as a document
8. **Test accessibility** - keyboard navigation, screen readers
9. **Verify determinism** - same input produces identical output

## 🚀 Submitting Your Renderer

1. **Create a new branch**: `git checkout -b feature/your-document-name`
2. **Add your files**: `git add visuals/your-document-name/`
3. **Update the registry**: `git add visuals/list.json`
4. **Commit your changes**: `git commit -m "Add your-document-name renderer"`
5. **Push to your fork**: `git push origin feature/your-document-name`
6. **Create a pull request** with:
   - Clear description of what document type this renders
   - Example of the schema contract
   - Screenshots showing the rendered output
   - Example LLM prompt that generates valid data
   - Any special considerations or dependencies

---

Thank you for contributing to VizuLLM! 🎉
