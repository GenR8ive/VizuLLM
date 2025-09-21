import React from 'react';

interface VisualizationItem {
  name: string;
  slug: string;
  author: string;
  tags?: string[];
  description: string;
  schema: string;
  componentPath: string;
  createdAt?: number;
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

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="group relative cursor-pointer">
      {/* Main Card */}
      <div onClick={handleClick} className="relative h-full overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-bleu_de_france-500/10">

        {/* Card Content */}
        <div className="relative p-7">
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
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gunmetal-600">
            {item.description}
          </p>

          {/* Date */}
          {item.createdAt && (
            <div className="mb-6 flex items-center space-x-2">
              <svg className="size-4 text-gunmetal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-gunmetal-500">
                {formatDate(item.createdAt)}
              </span>
            </div>
          )}

        </div>

        {/* Corner accent */}
        <div className="absolute right-0 top-0 size-24 -translate-y-12 translate-x-12 rounded-full bg-gradient-to-br from-saffron-200/40 to-keppel-200/40 blur-3xl transition-all duration-700 group-hover:-translate-y-10 group-hover:translate-x-10 group-hover:from-saffron-300/50 group-hover:to-keppel-300/50" />
      </div>
    </div>
  );
};

export default VisualizationCard;
