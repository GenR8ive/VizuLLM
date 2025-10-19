# Contributing to VizuLLM

Thank you for your interest in contributing to VizuLLM! This guide will help you create new visual components using our Zod-based schema system.

## 🚀 Quick Start

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install` or `pnpm install`
3. **Start development server**: `npm run dev`
4. **Generate a visual**: `npm run generate-visual` (recommended)
5. **Or create manually** following the template structure
6. **Test your component** and submit a pull request

## 📁 Component Structure

Each component should follow this structure:

```
visuals/your-component-name/
├── component.tsx      # Main React component
├── schema.ts          # Zod schema definition
├── sample-data.json   # Sample data for testing
└── metadata.json      # Component information.
```

## 🛠️ Creating a New Component

### Option 1: Using the Component Generator (Recommended)

The easiest way to create a new component is using our automated generator:

```bash
npm run generate-visual
```

This interactive script will:
- Ask for component details (name, description, author, category)
- Generate all necessary files from the template
- Update the component registry automatically
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
✅ Generated schema.ts
✅ Generated component.tsx
✅ Generated sample-data.json
✅ Generated metadata.json
✅ Updated visuals/list.json

🎉 Visual generated successfully!

📁 Next steps:
1. Navigate to: visuals/invoice-generator/
2. Customize the schema in schema.ts
3. Implement your visual in component.tsx
4. Update sample-data.json with realistic data
5. Test your visual: npm run dev
6. Visit: http://localhost:5173/visual/invoice-generator
```

### Option 2: Manual Creation

### Step 1: Define Your Schema (`schema.ts`)

```typescript
import { z } from 'zod';

// Define your data structure using Zod
export const YourComponentSchema = z.object({
  // Required fields
  title: z.string().min(1, "Title is required"),
  
  // Optional fields with defaults
  subtitle: z.string().optional(),
  
  // Complex objects
  items: z.array(z.object({
    name: z.string(),
    value: z.number().positive(),
    description: z.string().optional(),
  })),
  
  // Nested objects
  theme: z.object({
    primaryColor: z.enum(['blue', 'green', 'purple', 'red']).default('blue'),
    fontSize: z.number().min(12).max(48).default(16),
    showBorder: z.boolean().default(true),
  }).optional(),
  
  // Conditional fields
  metadata: z.object({
    author: z.string(),
    date: z.string().datetime().optional(),
  }).optional(),
});

// Export the TypeScript type
export type YourComponentData = z.infer<typeof YourComponentSchema>;

// Export component metadata
export const componentMetadata = {
  name: 'Your Component Name',
  description: 'Brief description of what this component does',
  author: 'your-username',
} as const;
```

### Step 2: Create Your Component (`component.tsx`)

```typescript
import React from 'react';
import { YourComponentSchema, type YourComponentData } from './schema';
import sampleData from './sample-data.json';

interface YourComponentProps {
  schema: typeof YourComponentSchema | null;
  data?: YourComponentData | null;
}

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<YourComponentProps>) => void;
  }
}

const YourComponent: React.FC<YourComponentProps> = ({ data }) => {
  // Validate and parse data using Zod schema
  let validatedData: YourComponentData;
  
  try {
    if (data) {
      validatedData = YourComponentSchema.parse(data);
    } else {
      validatedData = YourComponentSchema.parse(sampleData);
    }
  } catch (error) {
    console.error('Data validation failed:', error);
    // Fallback to sample data if validation fails
    validatedData = YourComponentSchema.parse(sampleData);
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
export default YourComponent;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('your-component-slug', YourComponent);
}
```

### Step 3: Create Sample Data (`sample-data.json`)

```json
{
  "title": "Sample Component",
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

### Step 4: Update Components List

Add your component to `visuals/list.json`:

```json
{
  "name": "Your Component Name",
  "slug": "your-component-slug",
  "author": "your-username",
  "description": "Brief description of what this component does"
}
```

## 🎨 Design Guidelines

### Styling
- Use **Tailwind CSS** for all styling
- Follow **responsive design** principles
- Ensure **accessibility** with proper ARIA labels
- Use **semantic HTML** elements

### Typography
- Use **rem** or **em** units for font sizes
- Maintain **readable line heights** (1.5-1.7)
- Ensure **proper contrast ratios**

## 🧪 Testing Your Component

1. **Start the dev server**: `npm run dev`
2. **Navigate to your component**: `/visual/your-component-slug`
3. **Test with sample data** - should render correctly
4. **Test with invalid data** - should show fallback
5. **Test responsive behavior** - mobile, tablet, desktop
6. **Test print functionality** - should print cleanly
7. **Test accessibility** - keyboard navigation, screen readers

## 🚀 Submitting Your Component

1. **Create a new branch**: `git checkout -b feature/your-component-name`
2. **Add your files**: `git add visuals/your-component-name/`
3. **Update the list**: `git add visuals/list.json`
4. **Commit your changes**: `git commit -m "Add your-component-name component"`
5. **Push to your fork**: `git push origin feature/your-component-name`
6. **Create a pull request** with:
   - Clear description of what the component does
   - Screenshots or GIFs showing the component
   - Any special considerations or dependencies

---

Thank you for contributing to VizuLLM! 🎉 
