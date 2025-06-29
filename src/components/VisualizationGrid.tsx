import React, { useState, useMemo } from 'react';
import VisualizationCard from './VisualizationCard';

interface VisualizationItem {
  name: string;
  slug: string;
  author: string;
  tags?: string[];
  description: string;
  schema: string;
  componentPath: string;
}

interface VisualizationGridProps {
  items: VisualizationItem[];
  onItemSelect?: (item: VisualizationItem) => void;
}

const VisualizationGrid: React.FC<VisualizationGridProps> = ({ items, onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [items, searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gunmetal-800">
          Visualization Templates
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gunmetal-600">
          Discover and use beautiful visualization templates created by our community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative mx-auto max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="size-5 text-gunmetal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search templates by name, description, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-2xl bg-white py-4 pl-12 pr-4 text-sm shadow-md transition-all duration-200 placeholder:text-gunmetal-400 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-bleu_de_france-500/20"
          />
          {searchTerm && (
            <button
              onClick={clearFilters}
              className="absolute inset-y-0 right-0 flex items-center pr-4"
            >
              <svg className="size-5 text-gunmetal-400 transition-colors hover:text-gunmetal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Status */}
        {searchTerm && (
          <div className="flex items-center justify-center">
            <div className="bg-bleu_de_france-50 inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium text-bleu_de_france-700 shadow-sm">
              <span>Searching for: <b>{searchTerm}</b></span>
              <button
                onClick={clearFilters}
                className="ml-2 text-bleu_de_france-600 transition-colors hover:text-bleu_de_france-800"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gunmetal-800">
            Templates
          </h2>
          <div className="inline-flex items-center rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-gunmetal-700 shadow-sm">
            {filteredItems.length} of {items.length}
          </div>
        </div>

        {filteredItems.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gunmetal-600">Sort by:</span>
            <select className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gunmetal-700 shadow-md transition-all hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-bleu_de_france-500/20">
              <option>Recently Added</option>
              <option>Name A-Z</option>
              <option>Author</option>
              <option>Most Popular</option>
            </select>
          </div>
        )}
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add New Template Card */}
          <a
            href="https://github.com/GenR8ive/VizuLLM/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="from-saffron-50 group relative overflow-hidden rounded-3xl border-2 border-dashed border-saffron-300 bg-gradient-to-br to-saffron-100 p-6 shadow-md transition-all duration-500 hover:-translate-y-2 hover:border-saffron-400 hover:shadow-2xl hover:shadow-saffron-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-saffron-400/10 to-keppel-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

            <div className="relative z-10 flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron-500 to-keppel-600 shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <svg className="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gunmetal-800 transition-colors group-hover:text-gunmetal-900">
                  Add New Template
                </h3>
                <p className="text-sm leading-relaxed text-gunmetal-600">
                  Contribute to the community by creating your own visualization template
                </p>
              </div>

              <div className="inline-flex items-center space-x-2 text-sm font-medium text-saffron-700 transition-colors group-hover:text-saffron-800">
                <span>Learn how to contribute</span>
                <svg className="size-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>

          {filteredItems.map((item) => (
            <VisualizationCard
              key={item.slug}
              item={item}
              onSelect={onItemSelect}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gunmetal-50 mb-6 rounded-3xl p-6 shadow-md">
            <svg className="mx-auto size-16 text-gunmetal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-.974-5.709-2.291" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gunmetal-800">No templates found</h3>
          <p className="mb-6 max-w-md text-center text-gunmetal-600">
            We couldn&apos;t find any templates matching your search. Try adjusting your search terms.
          </p>
          {searchTerm && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center rounded-2xl bg-bleu_de_france-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-bleu_de_france-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-bleu_de_france-500/20"
            >
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualizationGrid;
