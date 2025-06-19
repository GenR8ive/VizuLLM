import VisualizationGrid from 'components/VisualizationGrid';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import visuals from '../../visuals/list.json';

interface VisualizationItem {
  name: string;
  slug: string;
  author: string;
  description: string;
  preview: string;
  schema: string;
  componentPath: string;
  tags?: string[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleVisualSelect = (item: VisualizationItem) => {
    navigate(`/v/${item.slug}`);
  };

  return (
    <div>
      <VisualizationGrid items={visuals as VisualizationItem[]} onItemSelect={handleVisualSelect} />
    </div>
  );
};

export default HomePage;
