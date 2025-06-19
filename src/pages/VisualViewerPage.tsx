import React from 'react';
import VisualRenderer from '../components/VisualRenderer';

const VisualViewerPage: React.FC = () => {
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