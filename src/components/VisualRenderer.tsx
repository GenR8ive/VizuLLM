import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

interface VisualComponent {
  name: string;
  slug: string;
  author: string;
  description: string;
  preview: string;
  schema: string;
  componentPath: string;
}

interface VisualRendererProps {
  onError?: (error: string) => void;
}

interface ComponentProps {
  schema: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
}

// Component registry for dynamic loading
const componentRegistry: Record<string, React.ComponentType<ComponentProps>> = {};

const registerComponent = (slug: string, component: React.ComponentType<ComponentProps>) => {
  componentRegistry[slug] = component;
};

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<ComponentProps>) => void;
  }
}

// Export for components to use
window.__registerVisualComponent = registerComponent;

const VisualRenderer: React.FC<VisualRendererProps> = ({ onError }) => {
  const { slug } = useParams<{ slug: string }>();
  
  const [visual, setVisual] = useState<VisualComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [Component, setComponent] = useState<React.ComponentType<ComponentProps> | null>(null);
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close full screen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isFullScreen && fullScreenRef.current && !fullScreenRef.current.contains(event.target as Node)) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when full screen is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);

  useEffect(() => {
    const loadVisual = async () => {
      if (!slug) {
        setError('No visual slug provided');
        setLoading(false);
        return;
      }

      try {
        // Load visual metadata
        const visualsResponse = await fetch('/visuals/list.json');
        if (!visualsResponse.ok) {
          throw new Error('Failed to load visuals list');
        }
        const visuals = await visualsResponse.json();
        const visualData = visuals.find((v: VisualComponent) => v.slug === slug);

        if (!visualData) {
          throw new Error(`Visual component '${slug}' not found`);
        }

        setVisual(visualData);

        // Load schema
        try {
          const schemaResponse = await fetch(`/visuals/${slug}/schema.json`);
          if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
            setSchema(schemaData);
          }
        } catch (schemaError) {
          console.warn('Failed to load schema:', schemaError);
        }

        // Load component
        try {
          const componentModule = await import(`/visuals/${slug}/component.tsx`);
          const Component = componentModule.default;
          setComponent(() => Component);
        } catch (componentError) {
          console.error('Failed to load component:', componentError);
          throw new Error(`Failed to load component for '${slug}'`);
        }

        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setLoading(false);
        onError?.(errorMessage);
      }
    };

    loadVisual();
  }, [slug, onError]);

  // Parse JSON input
  useEffect(() => {
    if (!jsonInput.trim()) {
      setUserData(null);
      setJsonError(null);
      return;
    }

    try {
      const parsedData = JSON.parse(jsonInput);
      setUserData(parsedData);
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON format. Please check your input.');
      setUserData(null);
    }
  }, [jsonInput]);

  const handleClearData = () => {
    setUserData(null);
    setJsonInput('');
    setJsonError(null);
  };

  const copySchemaToClipboard = async () => {
    if (!schema) return;

    try {
      // Extract only properties and required fields
      const simplifiedSchema = {
        properties: schema.properties || {},
        required: schema.required || []
      };

      const prompt = `Output as JSON following this schema:\n\n${JSON.stringify(simplifiedSchema, null, 2)}`;

      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  const reactToPrintFn = useReactToPrint({ contentRef: componentRef });
  
  const handlePrint = () => {
    if (!componentRef.current || !visual) {
      console.log('Print failed: componentRef or visual is null');
      return;
    }

    console.log('Starting print...');
    setIsPrinting(true);
    reactToPrintFn();
    
    // Reset printing state after a short delay
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading visual component...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
            <svg className="size-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Visual</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!visual) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Visual component not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-65px)] flex-col overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 lg:overflow-hidden">
        {/* Header */}
        <div className="z-40 shrink-0 border-b border-white/20 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-2">
                <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                  {visual.name}
                </h1>
                <p className="text-sm font-medium text-slate-600 sm:text-base">{visual.description}</p>
                <div className="flex flex-col space-y-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0 sm:text-sm">
                  <span className="flex items-center">
                    <div className="mr-2 size-2 rounded-full bg-blue-500"></div>
                    {visual.author}
                  </span>
                  <span className="flex items-center">
                    <div className="mr-2 size-2 rounded-full bg-purple-500"></div>
                    {visual.slug}
                  </span>
                </div>
              </div>
              <Link
                to="/"
                className="group inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-slate-800 hover:to-slate-600 hover:shadow-xl sm:w-auto"
              >
                <svg className="mr-2 size-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto flex max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:flex-row lg:overflow-hidden lg:px-8">
          <div className="grid h-full gap-8 lg:grid-cols-2">
            {/* Left Panel - Input */}
            <div className="flex h-full flex-col space-y-6  pb-8">
              {/* Schema Section */}
              {schema && (
                <div className="shrink-0 overflow-hidden rounded-3xl bg-white/80 shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
                  <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Schema</h2>
                      <button
                        onClick={copySchemaToClipboard}
                        className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:w-auto"
                      >
                        {copied ? (
                          <>
                            <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Schema
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="overflow-hidden rounded-2xl p-4 shadow-inner">
                      <pre className="h-48 overflow-auto font-mono text-xs text-gray-400 sm:text-sm">
                       
                        {(() => {
                          const simplifiedSchema = {
                            properties: schema.properties || {},
                            required: schema.required || []
                          };
                          return JSON.stringify(simplifiedSchema, null, 2);
                        })()}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Input Section */}
              <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white/80 shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
                <div className="shrink-0 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-emerald-50/50 px-6 py-4">
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Input Data</h2>
                </div>
                <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-6">
                  <div className="flex flex-1 flex-col">
                    <label htmlFor="json-input" className="mb-3 block text-sm font-semibold text-slate-700">
                      JSON Data
                    </label>
                    <textarea
                      id="json-input"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder="Enter JSON data here based on the schema above..."
                      className="flex-1 resize-none rounded-2xl border-0 bg-slate-50 p-4 text-sm text-slate-900 shadow-inner transition-all duration-300 placeholder:text-slate-500 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Status Messages */}
                  {jsonError && (
                    <div className="flex shrink-0 items-start rounded-2xl border border-red-200/50 bg-gradient-to-r from-red-50 to-red-100/50 p-4 shadow-lg">
                      <div className="mr-3 mt-0.5 size-5 shrink-0 rounded-full bg-red-500 p-1">
                        <svg className="size-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-red-800">{jsonError}</p>
                    </div>
                  )}
                  {userData && !jsonError && (
                    <div className="flex shrink-0 items-start rounded-2xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 shadow-lg">
                      <div className="mr-3 mt-0.5 size-5 shrink-0 rounded-full bg-emerald-500 p-1">
                        <svg className="size-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-emerald-800">Valid JSON - Component will render with this data</p>
                    </div>
                  )}

                  {/* Clear Data Button */}
                  {userData && (
                    <button
                      onClick={handleClearData}
                      className="group inline-flex w-full shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-slate-400 hover:bg-slate-50 hover:shadow-xl"
                    >
                      <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Data
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Output */}
            <div className="flex h-full flex-col space-y-6 overflow-hidden pb-8">
              <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white/80 shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
                <div className="shrink-0 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-purple-50/50 px-6 py-4">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Preview</h2>
                      {userData && (
                        <p className="mt-1 text-sm font-medium text-purple-600">Rendering with custom data</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                      {/* Full Screen Button */}
                      <button
                        onClick={toggleFullScreen}
                        disabled={!Component}
                        className="group inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-slate-700 hover:to-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
                      >
                        <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="hidden sm:inline">Full Screen</span>
                        <span className="sm:hidden">Full</span>
                      </button>

                      {/* PDF Button */}
                      <button
                        onClick={handlePrint}
                        disabled={isPrinting || !Component}
                        className="group inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
                      >
                        {isPrinting ? (
                          <>
                            <svg className="mr-2 size-4 animate-spin transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Printing...</span>
                            <span className="sm:hidden">Printing</span>
                          </>
                        ) : (
                          <>
                            <svg className="mr-2 size-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col overflow-auto p-6" ref={componentRef} data-component-ref>
                  {Component ? (
                    <div className="flex-1 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-inner ring-1 ring-slate-200/50" data-component-content>
                      <Component schema={schema} data={userData} />
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100/50">
                      <div className="text-center">
                        <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 p-3 shadow-lg sm:size-16">
                          <svg className="size-full text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
                          Loading Component...
                        </h3>
                        <p className="mt-2 text-sm font-medium text-slate-600">
                          {visual.name} is being loaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative size-full overflow-auto p-2 sm:p-4 lg:p-8">
            {/* Close Button */}
            <button
              onClick={toggleFullScreen}
              className="absolute right-2 top-2 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:right-4 sm:top-4 sm:p-3"
            >
              <svg className="size-5 sm:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Component Content */}
            <div className="flex h-full items-center justify-center">
              <div className="max-h-full max-w-full overflow-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6 lg:p-8" ref={fullScreenRef}>
                {Component ? (
                  <div data-component-content>
                    <Component schema={schema} data={userData} />
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center sm:h-96">
                    <div className="text-center">
                      <p className="text-gray-600">Component not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-white/70 sm:bottom-4">
              <p className="text-xs sm:text-sm">Press ESC or click outside to exit full screen</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisualRenderer;
