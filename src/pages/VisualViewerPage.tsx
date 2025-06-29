import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VisualRenderer from '../components/VisualRenderer';
import { formatVisualTitle } from '../utils';
import visuals from '../../visuals/list.json';

interface VisualComponent {
  name: string;
  slug: string;
  author: string;
  description: string;
  schema: string;
  componentPath: string;
}

const VisualViewerPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Set dynamic title based on visual name
  useEffect(() => {
    if (slug) {
      const visualData = visuals.find((v: VisualComponent) => v.slug === slug);
      if (visualData) {
        document.title = formatVisualTitle(visualData.name);
      } else {
        document.title = 'Visual Not Found - VizuLLM';
      }
    }
  }, [slug]);

  const handleError = (error: string) => {
    console.error('Visual renderer error:', error);
  };

  return (
    <div className="w-full">
      <VisualRenderer onError={handleError} />
    </div>
  );
};

export default VisualViewerPage; 