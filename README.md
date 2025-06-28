# VizuLLM - Visual Component Library for LLM Outputs

A modern, type-safe visual component library built with React, TypeScript, and Zod schemas. Transform your LLM outputs into beautiful, printable visualizations with just a few clicks.

## ✨ What is VizuLLM?

VizuLLM provides pre-defined visual components that can render LLM outputs into beautiful, professional visualizations. Whether you need to create schedules, documents, charts, or any other visual representation of your LLM data, VizuLLM makes it easy with its schema-based approach.

## 🚀 How to Use

### For End Users

1. **Browse Components**: Visit the home page to see all available visual components
2. **Find Your Need**: Select the component that best fits your visualization requirements
3. **Copy Schema**: Click the "Copy Schema as Prompt" button to get the JSON schema
4. **Use with LLM**: 
   - Go to your preferred LLM (ChatGPT, Claude, etc.)
   - Describe what you want to visualize
   - Paste the schema you copied from VizuLLM
   - Ask the LLM to generate data in that format
5. **Visualize**: Copy the LLM's JSON output and paste it into VizuLLM
6. **Export**: Your visualization is ready to print or download as PDF!

### Example Workflow

```
1. Choose "Weekly Timetable" component
2. Copy the schema prompt
3. Ask LLM: "Create a weekly schedule for a software developer"
4. Paste the schema: "Generate data in this format: { schema here }"
5. Copy LLM's JSON response
6. Paste into VizuLLM → Beautiful timetable ready to print!
```

## 🛠️ For Developers - Creating New Components

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/VizuLLM.git
cd VizuLLM

# Install dependencies
npm install

# Create a new visual component
npm run create-visual
```

The script will guide you through:
- **Visual Name**: What to call your component
- **Description**: What it does
- **GitHub Username**: For attribution

### Component Structure

Each component consists of:

- **`component.tsx`** - The React component that renders your visualization
- **`schema.ts`** - Zod schema defining the expected JSON input format
- **`sample-data.json`** - Sample data for preview and testing
- **`metadata.json`** - Component metadata (auto-filled, editable)

### Example Component

```typescript
// schema.ts
import { z } from 'zod';

export const MyVisualSchema = z.object({
  title: z.string().min(1, "Title is required"),
  items: z.array(z.object({
    name: z.string(),
    value: z.number().positive(),
  })),
  theme: z.object({
    primaryColor: z.enum(['blue', 'green', 'purple']).default('blue'),
  }).optional(),
});

export type MyVisualData = z.infer<typeof MyVisualSchema>;
```

```typescript
// component.tsx
import React from 'react';
import { MyVisualSchema, type MyVisualData } from './schema';

const MyVisual: React.FC<{ data?: MyVisualData }> = ({ data }) => {
  const validatedData = MyVisualSchema.parse(data || sampleData);
  
  return (
    <div className="p-6">
      <h1>{validatedData.title}</h1>
      {validatedData.items.map((item, index) => (
        <div key={index}>
          <span>{item.name}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
};
```

### Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Component Management
npm run create-visual # Create new component
npm run update-list   # Update component registry

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run test         # Run tests
```

## 📊 Available Components

### Schedule & Planning
- **Weekly Timetable** - Class schedules, work shifts, appointments
- **Weekly/Monthly Agenda** - Event calendars, program scheduling

### Documents & Reports
- **Cover Letter** - Job application templates
- **Invoice (Modern)** - Professional billing documents

### Data Visualization
- **Coming Soon** - Charts, graphs, analytics dashboards

### Creative & Design
- **Coming Soon** - Cards, presentations, infographics

## 🎨 Design System

### Color Schemes
- **Blue** - Professional, trustworthy
- **Green** - Growth, success  
- **Purple** - Creative, innovative
- **Red** - Attention, urgency

### Typography & Layout
- **Responsive Design**: Works on all devices
- **Print Optimized**: Clean layouts for PDF export
- **Accessible**: WCAG compliant components

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Quick Contribution Steps

1. **Fork** the repository
2. **Clone** and install dependencies
3. **Create** a new component: `npm run create-visual`
4. **Develop** your component following the template
5. **Test** thoroughly on different devices
6. **Submit** a pull request

### Component Guidelines

- ✅ Use TypeScript and Zod schemas for type safety
- ✅ Follow responsive design principles
- ✅ Ensure accessibility compliance
- ✅ Optimize for print functionality
- ✅ Include comprehensive documentation
- ✅ Add proper error handling
- ✅ Test with various data inputs

### Updating the Component List

The component list updates automatically on deployment, but if you need to refresh it locally:

```bash
npm run update-list
```

## 📁 Project Structure

```
VizuLLM/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   └── utils/             # Utility functions
├── visuals/               # Visual components
│   ├── component-template/ # Template for new components
│   ├── weekly-timetable/  # Example component
│   └── list.json          # Component registry
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/VizuLLM/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/VizuLLM/discussions)
- **Questions**: [GitHub Discussions](https://github.com/your-username/VizuLLM/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** - UI library
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation
- **React To Print** - PDF export

---

**Made with ❤️ by the VizuLLM community**