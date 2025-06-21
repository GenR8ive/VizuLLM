import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

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

interface PageSize {
  name: string;
  width: number;
  height: number;
  unit: string;
  icon: string;
}

type ExportFormat = 'png' | 'pdf';

// Component registry for dynamic loading
const componentRegistry: Record<string, React.ComponentType<ComponentProps>> = {};

// Register components
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

// Page size presets with icons
const PAGE_SIZES: PageSize[] = [
  { name: 'A4 Portrait', width: 210, height: 297, unit: 'mm', icon: '📄' },
  { name: 'A4 Landscape', width: 297, height: 210, unit: 'mm', icon: '📋' },
  { name: 'A3 Portrait', width: 297, height: 420, unit: 'mm', icon: '📰' },
  { name: 'A3 Landscape', width: 420, height: 297, unit: 'mm', icon: '📊' },
  { name: 'Square', width: 200, height: 200, unit: 'mm', icon: '⬜' },
  { name: 'Custom', width: 210, height: 297, unit: 'mm', icon: '⚙️' }
];

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

  // Export settings
  const [selectedPageSize, setSelectedPageSize] = useState<PageSize>(PAGE_SIZES[0]);
  const [customWidth, setCustomWidth] = useState<number>(210);
  const [customHeight, setCustomHeight] = useState<number>(297);
  const [customUnit, setCustomUnit] = useState<string>('mm');
  const [exportResolution, setExportResolution] = useState<number>(300);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPopover, setShowExportPopover] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);
  const exportPopoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportPopoverRef.current && !exportPopoverRef.current.contains(event.target as Node)) {
        setShowExportPopover(false);
      }
    };

    if (showExportPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportPopover]);

  useEffect(() => {
    const loadVisual = async () => {
      if (!slug) {
        setError('No visual slug provided');
        setLoading(false);
        return;
      }

      try {
        // Load the visuals list
        const response = await fetch('/visuals/list.json');
        if (!response.ok) {
          throw new Error('Failed to load visuals list');
        }

        const visuals: VisualComponent[] = await response.json();
        const foundVisual = visuals.find(v => v.slug === slug);

        if (!foundVisual) {
          throw new Error(`Visual with slug "${slug}" not found`);
        }

        setVisual(foundVisual);

        // Load the component schema
        try {
          const schemaResponse = await fetch(`/${foundVisual.schema}`);
          if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
            setSchema(schemaData);
          }
        } catch (schemaError) {
          console.warn('Failed to load schema:', schemaError);
        }

        // Try to load component from registry first
        if (componentRegistry[slug]) {
          setComponent(() => componentRegistry[slug]);
        } else {
          // Fallback: try to import the component dynamically
          try {
            const componentModule = await import(`/visuals/${slug}/component.tsx`);
            const Component = componentModule.default;
            setComponent(() => Component);
            // Register for future use
            registerComponent(slug, Component);
          } catch (componentError) {
            console.error('Failed to load component:', componentError);
            throw new Error(`Failed to load component: ${componentError}`);
          }
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadVisual();
  }, [slug, onError]);

  // Auto-validate and apply JSON when input changes
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

  const handlePageSizeChange = (pageSize: PageSize) => {
    setSelectedPageSize(pageSize);
    if (pageSize.name === 'Custom') {
      setCustomWidth(pageSize.width);
      setCustomHeight(pageSize.height);
      setCustomUnit(pageSize.unit);
    }
  };

  const handleExport = async () => {
    if (!componentRef.current || !visual) {
      console.log('Export failed: componentRef or visual is null');
      return;
    }

    console.log('Starting export...');
    console.log('Component ref element:', componentRef.current);
    console.log('Component ref dimensions:', componentRef.current.offsetWidth, 'x', componentRef.current.offsetHeight);

    setIsExporting(true);
    setShowExportPopover(false);

    try {
            // Import the export utility
      const { ensureStylesApplied, waitForRender, waitForImages } = await import('../utils/exportUtils');

      // Wait for component to be fully rendered
      await waitForRender(1000);

      // Wait for all images to load
      await waitForImages(componentRef.current);

      // Convert mm to pixels based on resolution
      const mmToPixels = (mm: number, dpi: number) => (mm * dpi) / 25.4;

      const width = selectedPageSize.name === 'Custom' ? customWidth : selectedPageSize.width;
      const height = selectedPageSize.name === 'Custom' ? customHeight : selectedPageSize.height;
      const unit = selectedPageSize.name === 'Custom' ? customUnit : selectedPageSize.unit;

      let pixelWidth: number, pixelHeight: number;

      if (unit === 'mm') {
        pixelWidth = mmToPixels(width, exportResolution);
        pixelHeight = mmToPixels(height, exportResolution);
      } else if (unit === 'in') {
        pixelWidth = width * exportResolution;
        pixelHeight = height * exportResolution;
      } else {
        pixelWidth = width;
        pixelHeight = height;
      }

      console.log('Target dimensions:', pixelWidth, 'x', pixelHeight);

                  // Store original dimensions to restore later
      const originalWidth = componentRef.current.style.width;
      const originalHeight = componentRef.current.style.height;
      const originalMaxWidth = componentRef.current.style.maxWidth;
      const originalMaxHeight = componentRef.current.style.maxHeight;
      const originalMinWidth = componentRef.current.style.minWidth;
      const originalMinHeight = componentRef.current.style.minHeight;
      const originalPadding = componentRef.current.style.padding;
      const originalPosition = componentRef.current.style.position;
      const originalTransform = componentRef.current.style.transform;
      const originalOverflow = componentRef.current.style.overflow;

      try {
        // Convert target dimensions to pixels for rendering
        let renderWidth: number, renderHeight: number;

        if (unit === 'mm') {
          // Convert mm to pixels at 96 DPI for rendering
          renderWidth = (width / 25.4) * 96;
          renderHeight = (height / 25.4) * 96;
        } else if (unit === 'in') {
          // Convert inches to pixels at 96 DPI
          renderWidth = width * 96;
          renderHeight = height * 96;
        } else {
          // Already in pixels
          renderWidth = width;
          renderHeight = height;
        }

        // Temporarily resize the component to target dimensions
        componentRef.current.style.width = `${renderWidth}px`;
        componentRef.current.style.height = `${renderHeight}px`;
        componentRef.current.style.maxWidth = `${renderWidth}px`;
        componentRef.current.style.maxHeight = `${renderHeight}px`;
        componentRef.current.style.minWidth = `${renderWidth}px`;
        componentRef.current.style.minHeight = `${renderHeight}px`;
        componentRef.current.style.padding = '20px';
        componentRef.current.style.boxSizing = 'border-box';
        componentRef.current.style.overflow = 'hidden';
        componentRef.current.style.position = 'relative';
        componentRef.current.style.transform = 'scale(1)';

        // Ensure the component's children also adapt to the new size
        const componentContent = componentRef.current.querySelector('[data-component-content]') as HTMLElement;
        if (componentContent) {
          componentContent.style.width = '100%';
          componentContent.style.height = '100%';
          componentContent.style.maxWidth = '100%';
          componentContent.style.maxHeight = '100%';
        }

        // Force layout recalculation
        componentRef.current.offsetHeight;

        // Wait for component to re-render at new dimensions
        await waitForRender(1500);
        await waitForImages(componentRef.current);

        // Use html2canvas with optimized settings for Tailwind CSS
        const html2canvas = (await import('html2canvas')).default;

        // Prepare the element for capture
        ensureStylesApplied(componentRef.current);

                const componentCanvas = await html2canvas(componentRef.current, {
          backgroundColor: '#ffffff',
          scale: 1, // Use scale 1 since we're already at target size
          useCORS: true,
          allowTaint: true,
          logging: false,
          imageTimeout: 10000,
          removeContainer: true,
          foreignObjectRendering: false,
          width: renderWidth,
          height: renderHeight,
          ignoreElements: (element) => {
            return element.tagName === 'SCRIPT' ||
                   element.tagName === 'STYLE' ||
                   element.classList?.contains('export-ignore');
          },
          onclone: (clonedDoc, element) => {
            if (element) {
              const originalStyleSheets = Array.from(document.styleSheets);
              originalStyleSheets.forEach((sheet) => {
                try {
                  const clonedStyle = clonedDoc.createElement('style');
                  clonedStyle.textContent = Array.from(sheet.cssRules || [])
                    .map(rule => rule.cssText)
                    .join('\n');
                  clonedDoc.head.appendChild(clonedStyle);
                } catch (e) {
                  console.warn('Could not clone stylesheet:', e);
                }
              });

              ensureStylesApplied(element);
            }
          }
        });

        console.log('Canvas captured:', componentCanvas.width, 'x', componentCanvas.height);

        // Check if canvas is empty (white screen issue)
        if (componentCanvas.width === 0 || componentCanvas.height === 0) {
          throw new Error('Canvas capture failed - component may not be visible');
        }

            if (exportFormat === 'png') {
        // PNG Export - component is already rendered at target dimensions
        // Just use the captured canvas directly for higher quality
        const blob = await new Promise<Blob | null>((resolve) => {
          componentCanvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png', 1.0);
        });

        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${visual.slug}-${selectedPageSize.name.toLowerCase().replace(/\s+/g, '-')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log('PNG export completed');
        } else {
          console.error('Failed to create blob for PNG');
        }

            } else if (exportFormat === 'pdf') {
        // PDF Export using @react-pdf/renderer
        const { generatePDF } = await import('../utils/pdfRenderer');

        // Convert canvas to image data with maximum quality
        const imgData = componentCanvas.toDataURL('image/png', 1.0);

        // Prepare page size for PDF renderer
        const pageSize = {
          width: selectedPageSize.name === 'Custom' ? customWidth : selectedPageSize.width,
          height: selectedPageSize.name === 'Custom' ? customHeight : selectedPageSize.height,
          unit: selectedPageSize.name === 'Custom' ? customUnit : selectedPageSize.unit
        };

        const filename = `${visual.slug}-${selectedPageSize.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;

        // Generate PDF using React PDF renderer
        await generatePDF(
          visual.name,
          imgData,
          pageSize,
          filename
        );

        console.log('PDF export completed using @react-pdf/renderer');
      }

            } finally {
        // Restore original component dimensions
        componentRef.current.style.width = originalWidth;
        componentRef.current.style.height = originalHeight;
        componentRef.current.style.maxWidth = originalMaxWidth;
        componentRef.current.style.maxHeight = originalMaxHeight;
        componentRef.current.style.minWidth = originalMinWidth;
        componentRef.current.style.minHeight = originalMinHeight;
        componentRef.current.style.padding = originalPadding;
        componentRef.current.style.position = originalPosition;
        componentRef.current.style.transform = originalTransform;
        componentRef.current.style.overflow = originalOverflow;

        // Force layout recalculation to restore original view
        componentRef.current.offsetHeight;
      }

    } catch (err) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
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
    <div className="flex h-[calc(100vh-65px)] flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 bg-white/80 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">{visual.name}</h1>
            <p className="text-gray-600">{visual.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="mr-1 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {visual.author}
              </span>
              <span className="flex items-center">
                <svg className="mr-1 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {visual.slug}
              </span>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md"
          >
            <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col overflow-hidden lg:flex-row">
        {/* Left Panel - Input */}
        <div className="flex w-full flex-col overflow-hidden bg-white/60 backdrop-blur-sm lg:w-1/2">
          <div className="flex flex-1 flex-col overflow-hidden p-8">
            {/* Schema Section */}
            {schema && (
              <div className="mb-6 flex flex-1 flex-col overflow-hidden">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Schema</h2>
                  <button
                    onClick={copySchemaToClipboard}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                  >
                    {copied ? (
                      <>
                        <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Schema
                      </>
                    )}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <pre className="h-full overflow-auto font-mono text-sm text-gray-700">
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
            )}

            {/* Data Input Section */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Input Data</h2>
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex flex-1 flex-col overflow-hidden">
                  <label htmlFor="json-input" className="mb-2 block text-sm font-medium text-gray-700">
                    JSON Data
                  </label>
                  <textarea
                    id="json-input"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Enter JSON data here based on the schema above..."
                    className="block min-h-0 w-full flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Status Messages */}
                {jsonError && (
                  <div className="mt-4 flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <svg className="mr-3 size-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{jsonError}</p>
                  </div>
                )}
                {userData && !jsonError && (
                  <div className="mt-4 flex items-center rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                    <svg className="mr-3 size-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-green-700">Valid JSON - Component will render with this data</p>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-3 pt-4">
                <button
                  onClick={handleClearData}
                  className="inline-flex items-center rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-700 hover:shadow-md"
                >
                  <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="flex w-full flex-col overflow-hidden bg-white/80 backdrop-blur-sm lg:w-1/2">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="min-h-full rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                    {userData && (
                      <p className="mt-1 text-sm text-gray-600">Rendering with custom data</p>
                    )}
                  </div>

                  {/* Export Button */}
                  <div className="relative" ref={exportPopoverRef}>
                    <button
                      onClick={() => setShowExportPopover(!showExportPopover)}
                      disabled={isExporting || !Component}
                      className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isExporting ? (
                        <>
                          <svg className="mr-2 size-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export
                        </>
                      )}
                    </button>

                    {/* Export Popover */}
                    {showExportPopover && (
                      <div className="absolute right-0 top-full z-10 mt-3 w-96 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Export Settings</h3>
                            <button
                              onClick={handleExport}
                              disabled={isExporting}
                              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:opacity-50"
                            >
                              {isExporting ? 'Exporting...' : 'Export'}
                            </button>
                          </div>

                          {/* Format Selection */}
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Format</label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setExportFormat('png')}
                                className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                                  exportFormat === 'png'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                PNG
                              </button>
                              <button
                                onClick={() => setExportFormat('pdf')}
                                className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                                  exportFormat === 'pdf'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                PDF
                              </button>
                            </div>
                          </div>

                          {/* Page Size Selection */}
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Page Size</label>
                            <div className="grid grid-cols-2 gap-3">
                              {PAGE_SIZES.map((pageSize) => (
                                <button
                                  key={pageSize.name}
                                  onClick={() => handlePageSizeChange(pageSize)}
                                  className={`flex items-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                                    selectedPageSize.name === pageSize.name
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="mr-2 text-lg">{pageSize.icon}</span>
                                  <span className="text-xs">{pageSize.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom Size Controls */}
                          {selectedPageSize.name === 'Custom' && (
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">Width</label>
                                <input
                                  type="number"
                                  value={customWidth}
                                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">Height</label>
                                <input
                                  type="number"
                                  value={customHeight}
                                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">Unit</label>
                                <select
                                  value={customUnit}
                                  onChange={(e) => setCustomUnit(e.target.value)}
                                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                  <option value="mm">mm</option>
                                  <option value="in">inches</option>
                                  <option value="px">pixels</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Resolution Setting - Only for PNG */}
                          {exportFormat === 'png' && (
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700">Resolution (DPI)</label>
                              <select
                                value={exportResolution}
                                onChange={(e) => setExportResolution(Number(e.target.value))}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              >
                                <option value={72}>72 DPI (Screen)</option>
                                <option value={150}>150 DPI (Print)</option>
                                <option value={300}>300 DPI (High Quality)</option>
                                <option value={600}>600 DPI (Professional)</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8" ref={componentRef} data-component-ref>
                {Component ? (
                  <div data-component-content>
                    <Component schema={schema} data={userData} />
                  </div>
                ) : (
                  <div className="flex h-96 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                    <div className="text-center">
                      <svg className="mx-auto size-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Loading Component...
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
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
  );
};

export default VisualRenderer;
