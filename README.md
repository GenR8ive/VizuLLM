# VisuLLM - Visual Component Library

A modern, type-safe visual component library built with React, TypeScript, and Zod schemas. Create beautiful, customizable visual components with full type safety and validation.

## ✨ Features

- **🔒 Type Safety**: Built with TypeScript and Zod schemas for runtime validation
- **🎨 Modern UI**: Beautiful, responsive components using Tailwind CSS
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **🖨️ Print Ready**: All components are optimized for printing
- **⚡ Dynamic Loading**: Components load dynamically for better performance
- **🔧 Easy Customization**: Simple JSON data input with schema validation
- **📊 Multiple Categories**: Schedule, document, data, creative, and utility components

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/VisuLLM.git
cd VisuLLM

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

### Usage

1. **Browse Components**: Visit the home page to see all available components
2. **Select a Component**: Click on any component to view it
3. **Customize Data**: Input your JSON data in the left panel
4. **Preview**: See your component render in real-time
5. **Export**: Print to PDF or view in full screen

## 📁 Project Structure

```
VisuLLM/
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

## 🛠️ Creating Components

VisuLLM uses a **Zod-based schema system** for type safety and validation. Each component consists of:

- **`component.tsx`** - React component with TypeScript
- **`schema.ts`** - Zod schema definition
- **`sample-data.json`** - Sample data for testing
- **`preview.png`** - Preview image

### Example Component

```typescript
// schema.ts
import { z } from 'zod';

export const MyComponentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  items: z.array(z.object({
    name: z.string(),
    value: z.number().positive(),
  })),
  theme: z.object({
    primaryColor: z.enum(['blue', 'green', 'purple']).default('blue'),
  }).optional(),
});

export type MyComponentData = z.infer<typeof MyComponentSchema>;
```

```typescript
// component.tsx
import React from 'react';
import { MyComponentSchema, type MyComponentData } from './schema';

const MyComponent: React.FC<{ data?: MyComponentData }> = ({ data }) => {
  const validatedData = MyComponentSchema.parse(data || sampleData);
  
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

## 📊 Available Components

### Schedule Components
- **Weekly Timetable** - Class schedule with customizable time slots
- **Weekly/Monthly Calendar** - Event calendar with program scheduling

### Document Components
- **Invoice (Modern)** - Professional invoice with company branding
- **Cover Letter** - Job application cover letter template

### Data Components
- **Coming Soon** - Charts, tables, and analytics components

### Creative Components
- **Coming Soon** - Cards, presentations, and graphics

### Utility Components
- **Coming Soon** - Tools, calculators, and converters

## 🎨 Design System

### Color Schemes
- **Blue** - Professional, trustworthy
- **Green** - Growth, success
- **Purple** - Creative, innovative
- **Red** - Attention, urgency

### Typography
- **Font Family**: System fonts with fallbacks
- **Font Sizes**: Responsive scale (12px - 48px)
- **Line Heights**: Readable ratios (1.5 - 1.7)

### Spacing
- **Consistent Grid**: 4px base unit
- **Responsive**: Mobile-first approach
- **Print Optimized**: Clean layouts for PDF export

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Modern browser with ES6+ support

### Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run test         # Run tests
```

### Adding New Components

1. **Generate Visual**: `npm run generate-visual` (recommended)
2. **Or copy template**: Use `visuals/component-template/` as a starting point
3. **Define Schema**: Create your Zod schema in `schema.ts`
4. **Build Component**: Implement your React component
5. **Add Sample Data**: Create `sample-data.json` for testing
6. **Update Registry**: Add to `visuals/list.json` (auto-generated)
7. **Test**: Verify functionality and responsiveness
8. **Document**: Add README and examples

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information.

### Quick Contribution Steps

1. **Fork** the repository
2. **Create** a feature branch
3. **Add** your component following the template
4. **Test** thoroughly
5. **Submit** a pull request

### Component Guidelines

- ✅ Use TypeScript and Zod schemas
- ✅ Follow responsive design principles
- ✅ Ensure accessibility compliance
- ✅ Optimize for print functionality
- ✅ Include comprehensive documentation
- ✅ Add proper error handling

## 📝 Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to create components
- **[Component Template](visuals/component-template/)** - Template for new components
- **[API Reference](docs/api.md)** - Component API documentation
- **[Design System](docs/design-system.md)** - Design guidelines and patterns

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/VisuLLM/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/VisuLLM/discussions)
- **Questions**: [GitHub Discussions](https://github.com/your-username/VisuLLM/discussions)

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

**Made with ❤️ by the VisuLLM community**