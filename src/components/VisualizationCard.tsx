import React from 'react';

interface VisualizationItem {
  name: string;
  slug: string;
  author: string;
  tags?: string[];
  description: string;
  preview: string;
  schema: string;
  componentPath: string;
}

interface VisualizationCardProps {
  item: VisualizationItem;
  onSelect?: (item: VisualizationItem) => void;
}

const VisualizationCard: React.FC<VisualizationCardProps> = ({ item, onSelect }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking on author
    window.open(`https://github.com/${item.author}`, '_blank');
  };

  return (
    <div className="group relative cursor-pointer">
      {/* Main Card */}
      <div className="relative h-full overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-bleu_de_france-500/10">

        {/* Card Content */}
        <div className="relative p-7" onClick={handleClick}>
          {/* Header */}
          <div className="mb-4">
            <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gunmetal-800 transition-colors duration-300 group-hover:text-bleu_de_france-700">
              {item.name}
            </h3>
            <div
              className="flex cursor-pointer items-center space-x-3 transition-opacity duration-200 hover:opacity-80"
              onClick={handleAuthorClick}
            >
              <div className="flex size-7 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-bleu_de_france-500 to-keppel-600 shadow-lg">
                <img
                  src={`https://github.com/${item.author}.png`}
                  alt={`${item.author}'s GitHub avatar`}
                  className="size-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-xs font-bold text-white">
                  {item.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-gunmetal-600 transition-colors duration-200 hover:text-bleu_de_france-600">
                {item.author}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gunmetal-600">
            {item.description}
          </p>

        </div>

        {/* Corner accent */}
        <div className="absolute right-0 top-0 size-24 -translate-y-12 translate-x-12 rounded-full bg-gradient-to-br from-saffron-200/40 to-keppel-200/40 blur-3xl transition-all duration-700 group-hover:-translate-y-10 group-hover:translate-x-10 group-hover:from-saffron-300/50 group-hover:to-keppel-300/50" />
      </div>
    </div>
  );
};

export default VisualizationCard;
