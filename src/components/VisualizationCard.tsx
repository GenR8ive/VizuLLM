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

  return (
    <div className="group relative cursor-pointer">
      {/* Main Card */}
      <div className="relative h-full overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-bleu_de_france-500/10">

        {/* Gradient Overlay Background */}
        <div className="from-bleu_de_france-25 to-keppel-25 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Preview Image */}
        <div className="from-gunmetal-50 relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br to-gunmetal-100">
          <img
            src={item.preview}
            alt={`Preview of ${item.name}`}
            className="size-full object-cover transition-all duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDE5MFYxMzVIMTc1VjEyMFpNMTc1IDE1MEgxOTBWMTY1SDE3NVYxNTBaTTIwNSAxMjBIMjIwVjEzNUgyMDVWMTIwWk0yMDUgMTUwSDIyMFYxNjVIMjA1VjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
            }}
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gunmetal-900/5 via-transparent to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100" />

          {/* Floating Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="absolute bottom-4 right-4 flex size-11 translate-y-2 items-center justify-center rounded-2xl bg-white/95 opacity-0 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-2xl group-hover:translate-y-0 group-hover:opacity-100"
          >
            <svg className="size-5 text-bleu_de_france-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Card Content */}
        <div className="relative p-7" onClick={handleClick}>
          {/* Header */}
          <div className="mb-4">
            <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gunmetal-800 transition-colors duration-300 group-hover:text-bleu_de_france-700">
              {item.name}
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex size-7 items-center justify-center rounded-xl bg-gradient-to-br from-bleu_de_france-500 to-keppel-600 shadow-lg">
                <span className="text-xs font-bold text-white">
                  {item.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-gunmetal-600">
                {item.author}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gunmetal-600">
            {item.description}
          </p>

          {/* Bottom Section */}
          <div className="flex justify-end">
            {/* Modern CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="group/btn relative overflow-hidden rounded-2xl bg-gradient-to-r from-bleu_de_france-600 to-bleu_de_france-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-bleu_de_france-700 hover:to-bleu_de_france-800 hover:shadow-xl hover:shadow-bleu_de_france-500/25 focus:outline-none focus:ring-4 focus:ring-bleu_de_france-500/20"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Use Template</span>
                <svg className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* Button shimmer effect */}
              <div className="absolute inset-0 -left-2 -top-2 h-full w-0 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-all duration-700 group-hover/btn:w-full" />
            </button>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute right-0 top-0 size-24 -translate-y-12 translate-x-12 rounded-full bg-gradient-to-br from-saffron-200/40 to-keppel-200/40 blur-3xl transition-all duration-700 group-hover:-translate-y-10 group-hover:translate-x-10 group-hover:from-saffron-300/50 group-hover:to-keppel-300/50" />
      </div>
    </div>
  );
};

export default VisualizationCard;
