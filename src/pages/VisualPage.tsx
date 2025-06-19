import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const VisualPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('transformer');
  const [selectedLayer, setSelectedLayer] = useState(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Model Visualization
          </h1>
          <p className="mt-2 text-gray-600">
            Explore and visualize language model architectures and behaviors
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-200"
        >
          <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Controls Panel */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Visualization Controls
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="model-select" className="mb-2 block text-sm font-medium text-gray-700">
              Model Type
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="transformer">Transformer</option>
              <option value="bert">BERT</option>
              <option value="gpt">GPT</option>
              <option value="t5">T5</option>
            </select>
          </div>

          <div>
            <label htmlFor="layer-select" className="mb-2 block text-sm font-medium text-gray-700">
              Layer ({selectedLayer}/12)
            </label>
            <input
              type="range"
              id="layer-select"
              min="1"
              max="12"
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(parseInt(e.target.value))}
              className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Visualization Type
            </label>
            <div className="flex space-x-4">
              <button className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Attention
              </button>
              <button className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200">
                Weights
              </button>
              <button className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200">
                Flow
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedModel.toUpperCase()} - Layer {selectedLayer} Attention Visualization
          </h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 transition-colors hover:text-gray-600">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 transition-colors hover:text-gray-600">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Placeholder Visualization */}
        <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <svg className="mx-auto size-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Visualization Loading
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Interactive {selectedModel} model visualization will appear here
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500">
                <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Load Visualization
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100">
                <svg className="size-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Parameters</p>
              <p className="text-lg font-semibold text-gray-900">175B</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="flex size-8 items-center justify-center rounded-lg bg-green-100">
                <svg className="size-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Accuracy</p>
              <p className="text-lg font-semibold text-gray-900">94.2%</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100">
                <svg className="size-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Latency</p>
              <p className="text-lg font-semibold text-gray-900">125ms</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100">
                <svg className="size-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tokens/sec</p>
              <p className="text-lg font-semibold text-gray-900">1.2K</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualPage;
