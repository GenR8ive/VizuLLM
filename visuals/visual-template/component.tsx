import React from 'react';
import { YourComponentSchema, type YourComponentData } from './schema';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const YourComponent: React.FC<YourComponentProps> = ({ data }) => {
  // TODO: Implement your component UI here
  return (
    <div>
      
    </div>
  );
};

// Export for dynamic loading
export default YourComponent;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('your-component-slug', YourComponent);
} 