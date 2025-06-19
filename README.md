# VisuLLM - Visual Component Renderer

A React-based visual component renderer that dynamically loads and displays visual components using path parameters with support for custom JSON data input.

## Features

- **Dynamic Component Loading**: Load visual components based on URL slugs
- **Path Parameter Routing**: Access components via `/v/visual-slug` URLs
- **Custom JSON Data Input**: Insert structured JSON data to customize component rendering
- **Schema Support**: Each component can have a JSON schema for configuration
- **Sample Data Generation**: Auto-generate sample data based on component schemas
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5174`

## Usage

### Viewing Visual Components

1. **Home Page**: Visit the home page to see all available visual components
2. **Direct Access**: Navigate directly to a component using the URL pattern:
   - `/v/weekly-timetable` - Weekly class schedule
   - `/v/invoice-modern` - Modern invoice template

### Adding Custom Data

1. **Click "Add Data"**: On any visual component page, click the "Add Data" button
2. **Enter JSON**: Paste or type your JSON data in the text area
3. **Apply Data**: Click "Apply Data" to render the component with your custom data
4. **Generate Sample**: Use "Generate Sample" to create sample data based on the component's schema
5. **Clear Data**: Use "Clear" to remove custom data and return to default rendering

### Available Visual Components

1. **Weekly Timetable** (`/v/weekly-timetable`)
   - Displays a weekly class schedule
   - Customizable time slots and subjects
   - Color-coded for different activities
   - **Sample Data Structure**:
     ```json
     {
       "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
       "timeSlots": ["09:00", "10:00", "11:00", "12:00", "13:00"],
       "subjects": {
         "Monday": {
           "09:00": "Mathematics",
           "10:00": "Physics",
           "11:00": "Chemistry"
         }
       }
     }
     ```

2. **Modern Invoice** (`/v/invoice-modern`)
   - Professional invoice template
   - Gradient header design
   - Itemized billing with totals
   - **Sample Data Structure**:
     ```json
     {
       "invoiceNumber": "INV-2024-001",
       "date": "2024-01-15",
       "company": {
         "name": "Your Company",
         "address": "123 Business St",
         "city": "City, State 12345"
       },
       "client": {
         "name": "Client Name",
         "address": "456 Client Ave",
         "city": "Client City, CC 67890"
       },
       "items": [
         {
           "description": "Service Description",
           "quantity": 10,
           "unit": "hours",
           "rate": 100,
           "amount": 1000
         }
       ],
       "subtotal": 1000,
       "tax": 100,
       "total": 1100
     }
     ```

## Project Structure

```
src/
├── components/
│   ├── VisualRenderer.tsx      # Main component renderer with JSON input
│   ├── Router.tsx              # Routing configuration
│   └── ...
├── pages/
│   ├── VisualViewerPage.tsx    # Page wrapper for visual renderer
│   └── ...
└── ...

visuals/
├── list.json                   # List of all available visuals
├── weekly-timetable/
│   ├── component.tsx           # Weekly timetable component
│   ├── schema.json            # Component schema
│   ├── sample-data.json       # Sample data for users
│   └── preview.png            # Preview image
└── invoice-modern/
    ├── component.tsx           # Invoice component
    ├── schema.json            # Component schema
    ├── sample-data.json       # Sample data for users
    └── preview.png            # Preview image
```

## Adding New Visual Components

1. **Create Component Directory**: Add a new folder in `visuals/` with your component name
2. **Create Component File**: Add `component.tsx` with your React component that accepts `data` prop
3. **Add Schema**: Create `schema.json` to define the component's data structure
4. **Add Sample Data**: Create `sample-data.json` with example data for users
5. **Add Preview**: Include a `preview.png` image
6. **Update List**: Add your component to `visuals/list.json`

### Component Template

```tsx
import React from 'react';

interface YourComponentProps {
  schema: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
}

const YourComponent: React.FC<YourComponentProps> = ({ schema, data }) => {
  // Use data if provided, otherwise use default data
  const componentData = data || defaultData;

  return (
    <div>
      {/* Your component content using componentData */}
      {data && (
        <div>
          <h4>Using Custom Data:</h4>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default YourComponent;
```

### List Entry Format

```json
{
  "name": "Your Component Name",
  "slug": "your-component-slug",
  "author": "Your Name",
  "description": "Brief description of your component",
  "preview": "visuals/your-component/preview.png",
  "schema": "visuals/your-component/schema.json",
  "componentPath": "visuals/your-component/component.tsx"
}
```

## JSON Data Input Features

### Supported Actions

- **Apply Data**: Parse and apply JSON data to the component
- **Generate Sample**: Create sample data based on the component's schema
- **Clear Data**: Remove custom data and return to default rendering
- **Validation**: Automatic JSON validation with error messages

### Data Persistence

- Custom data is stored in component state during the session
- Data persists when navigating between different sections of the component
- Data is cleared when navigating to a different component

### Error Handling

- Invalid JSON format detection
- Clear error messages for malformed data
- Graceful fallback to default data on errors

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.