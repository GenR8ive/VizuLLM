import React from 'react';
import {
  GuideDocumentationSchema,
  type GuideDocumentationData,
  type SectionData,
  type SubsectionData,
  type ContentBlockData,
  type CodeBlockData,
  type ListData,
  type CalloutData,
  type StepData,
  type PrerequisiteData,
  type RelatedResourceData,
} from './schema.ts';
import sampleData from './sample-data.json';

interface GuideDocumentationProps {
  schema: typeof GuideDocumentationSchema | null;
  data?: GuideDocumentationData | null;
}

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<GuideDocumentationProps>) => void;
  }
}

// Helper function to get callout colors
const getCalloutColors = (type: string) => {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    tip: 'bg-purple-50 border-purple-200 text-purple-900',
    note: 'bg-gray-50 border-gray-200 text-gray-900',
  };
  return colors[type as keyof typeof colors] || colors.note;
};

const getCalloutIcon = (type: string) => {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
    tip: '💡',
    note: '📝',
  };
  return icons[type as keyof typeof icons] || '📝';
};

// Code block component
const CodeBlock: React.FC<{ codeBlock: CodeBlockData }> = ({ codeBlock }) => (
  <div className="my-4 overflow-hidden rounded-lg border border-gray-300 bg-gray-900">
    {codeBlock.filename && (
      <div className="border-b border-gray-700 bg-gray-800 px-4 py-2 text-xs text-gray-400">
        {codeBlock.filename}
      </div>
    )}
    <pre className="overflow-x-auto p-4">
      <code className={`text-sm text-gray-100 ${codeBlock.language ? `language-${codeBlock.language}` : ''}`}>
        {codeBlock.code}
      </code>
    </pre>
  </div>
);

// List component
const List: React.FC<{ list: ListData }> = ({ list }) => {
  const ListTag = list.type === 'ordered' ? 'ol' : 'ul';
  const listStyle = list.type === 'ordered' ? 'list-decimal' : 'list-disc';

  return (
    <ListTag className={`my-4 ml-6 space-y-2 ${listStyle}`}>
      {list.items.map((item, index) => {
        if (typeof item === 'string') {
          return (
            <li key={index} className="text-gray-700">
              {item}
            </li>
          );
        } else {
          return (
            <li key={index} className="text-gray-700">
              {item.text}
              {item.subItems && item.subItems.length > 0 && (
                <ul className="ml-6 mt-2 list-disc space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex} className="text-gray-600 text-sm">
                      {subItem}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        }
      })}
    </ListTag>
  );
};

// Callout component
const Callout: React.FC<{ callout: CalloutData }> = ({ callout }) => (
  <div className={`my-4 rounded-lg border-l-4 p-4 ${getCalloutColors(callout.type)}`}>
    <div className="flex items-start">
      <span className="mr-2 text-xl">{getCalloutIcon(callout.type)}</span>
      <div className="flex-1">
        {callout.title && (
          <h4 className="mb-1 font-semibold">{callout.title}</h4>
        )}
        <p className="text-sm leading-relaxed">{callout.content}</p>
      </div>
    </div>
  </div>
);

// Steps component
const Steps: React.FC<{ steps: StepData[] }> = ({ steps }) => (
  <div className="my-6 space-y-6">
    {steps.map((step, index) => (
      <div key={index} className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {step.number ?? index + 1}
          </div>
        </div>
        <div className="flex-1">
          {step.title && (
            <h4 className="mb-2 font-semibold text-gray-900">{step.title}</h4>
          )}
          <p className="mb-3 text-gray-700">{step.description}</p>
          {step.code && <CodeBlock codeBlock={step.code} />}
          {step.image && (
            <div className="my-3">
              <img
                src={step.image}
                alt={step.imageAlt || step.title || `Step ${index + 1}`}
                className="rounded-lg border border-gray-300"
              />
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Content block renderer
const ContentBlock: React.FC<{ block: ContentBlockData }> = ({ block }) => {
  switch (block.type) {
    case 'paragraph':
      return <p className="my-4 leading-relaxed text-gray-700">{block.content}</p>;
    case 'code':
      return <CodeBlock codeBlock={block.content as CodeBlockData} />;
    case 'list':
      return <List list={block.content as ListData} />;
    case 'callout':
      return <Callout callout={block.content as CalloutData} />;
    case 'image':
      return (
        <div className="my-6">
          <img
            src={block.content.url || block.content}
            alt={block.content.alt || ''}
            className="w-full rounded-lg border border-gray-300"
          />
          {block.content.caption && (
            <p className="mt-2 text-center text-sm text-gray-500">{block.content.caption}</p>
          )}
        </div>
      );
    case 'heading':
      const HeadingTag = `h${block.content.level || 3}` as 'h3' | 'h4' | 'h5' | 'h6';
      const headingClasses = {
        h3: 'text-2xl font-bold mt-8 mb-4 text-gray-900',
        h4: 'text-xl font-semibold mt-6 mb-3 text-gray-900',
        h5: 'text-lg font-semibold mt-4 mb-2 text-gray-900',
        h6: 'text-base font-semibold mt-3 mb-2 text-gray-900',
      };
      return (
        <HeadingTag className={headingClasses[HeadingTag] || headingClasses.h3}>
          {block.content.text}
        </HeadingTag>
      );
    case 'steps':
      return <Steps steps={block.content as StepData[]} />;
    default:
      return null;
  }
};

// Subsection component
const Subsection: React.FC<{ subsection: SubsectionData; level?: number }> = ({
  subsection,
  level = 3,
}) => {
  const HeadingTag = `h${Math.min(level + 1, 6)}` as 'h3' | 'h4' | 'h5' | 'h6';
  const headingClasses = {
    h3: 'text-xl font-semibold mt-8 mb-4 text-gray-900',
    h4: 'text-lg font-semibold mt-6 mb-3 text-gray-900',
    h5: 'text-base font-semibold mt-4 mb-2 text-gray-900',
    h6: 'text-sm font-semibold mt-3 mb-2 text-gray-900',
  };

  return (
    <div className="mb-6">
      <HeadingTag id={subsection.id} className={headingClasses[HeadingTag] || headingClasses.h4}>
        {subsection.title}
      </HeadingTag>
      {subsection.content && (
        <div>
          {subsection.content.map((block, index) => (
            <ContentBlock key={index} block={block} />
          ))}
        </div>
      )}
      {subsection.subsections && subsection.subsections.length > 0 && (
        <div className="ml-4 mt-4 border-l-2 border-gray-200 pl-6">
          {subsection.subsections.map((sub, index) => (
            <Subsection key={index} subsection={sub} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Section component
const Section: React.FC<{ section: SectionData }> = ({ section }) => (
  <section id={section.id} className="mb-12 scroll-mt-8">
    <h2 className="mb-4 text-3xl font-bold text-gray-900">{section.title}</h2>
    {section.description && (
      <p className="mb-6 text-lg text-gray-600">{section.description}</p>
    )}
    {section.content && (
      <div>
        {section.content.map((block, index) => (
          <ContentBlock key={index} block={block} />
        ))}
      </div>
    )}
    {section.subsections && section.subsections.length > 0 && (
      <div className="mt-6">
        {section.subsections.map((subsection, index) => (
          <Subsection key={index} subsection={subsection} level={3} />
        ))}
      </div>
    )}
  </section>
);

// Prerequisite component
const Prerequisite: React.FC<{ prerequisite: PrerequisiteData }> = ({ prerequisite }) => (
  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
    <h4 className="mb-2 font-semibold text-blue-900">{prerequisite.title}</h4>
    {prerequisite.description && (
      <p className="mb-2 text-sm text-blue-800">{prerequisite.description}</p>
    )}
    {prerequisite.items && prerequisite.items.length > 0 && (
      <ul className="ml-6 list-disc space-y-1 text-sm text-blue-800">
        {prerequisite.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )}
  </div>
);

// Related resource component
const RelatedResource: React.FC<{ resource: RelatedResourceData }> = ({ resource }) => {
  const getTypeIcon = (type?: string) => {
    const icons = {
      article: '📄',
      video: '🎥',
      documentation: '📚',
      tutorial: '🎓',
      tool: '🛠️',
      other: '🔗',
    };
    return icons[type as keyof typeof icons] || '🔗';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start">
        <span className="mr-3 text-2xl">{getTypeIcon(resource.type)}</span>
        <div className="flex-1">
          {resource.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline"
            >
              {resource.title}
            </a>
          ) : (
            <h4 className="font-semibold text-gray-900">{resource.title}</h4>
          )}
          {resource.description && (
            <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
          )}
          {resource.type && (
            <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
              {resource.type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component
const GuideDocumentation: React.FC<GuideDocumentationProps> = ({ data }) => {
  let validatedData: GuideDocumentationData;
  try {
    if (data) {
      validatedData = GuideDocumentationSchema.parse(data);
    } else {
      validatedData = GuideDocumentationSchema.parse(sampleData);
    }
  } catch (error) {
    console.error('Data validation failed:', error);
    validatedData = GuideDocumentationSchema.parse(sampleData);
  }

  const getDifficultyColor = (difficulty?: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-yellow-100 text-yellow-800',
      expert: 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="mx-auto max-w-4xl bg-white p-8">
      {/* Header */}
      <header className="mb-8 border-b border-gray-200 pb-8">
        <div className="mb-4">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">{validatedData.title}</h1>
          {validatedData.subtitle && (
            <p className="text-xl text-gray-600">{validatedData.subtitle}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {validatedData.author && (
            <span>
              <span className="font-medium">Author:</span> {validatedData.author}
            </span>
          )}
          {validatedData.version && (
            <span>
              <span className="font-medium">Version:</span> {validatedData.version}
            </span>
          )}
          {validatedData.lastUpdated && (
            <span>
              <span className="font-medium">Last Updated:</span> {validatedData.lastUpdated}
            </span>
          )}
          {validatedData.category && (
            <span className="rounded bg-gray-100 px-2 py-1">{validatedData.category}</span>
          )}
          {validatedData.difficulty && (
            <span className={`rounded px-2 py-1 ${getDifficultyColor(validatedData.difficulty)}`}>
              {validatedData.difficulty}
            </span>
          )}
          {validatedData.estimatedTime && (
            <span>
              <span className="font-medium">⏱️</span> {validatedData.estimatedTime}
            </span>
          )}
        </div>

        {/* Tags */}
        {validatedData.tags && validatedData.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {validatedData.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {validatedData.description && (
          <p className="mb-6 leading-relaxed text-gray-700">{validatedData.description}</p>
        )}

        {/* Prerequisites */}
        {validatedData.prerequisites && validatedData.prerequisites.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Prerequisites</h3>
            <div className="space-y-3">
              {validatedData.prerequisites.map((prereq, index) => (
                <Prerequisite key={index} prerequisite={prereq} />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Table of Contents */}
      {validatedData.sections && validatedData.sections.length > 0 && (
        <nav className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Table of Contents</h3>
          <ol className="space-y-2">
            {validatedData.sections.map((section, index) => (
              <li key={index} className="text-gray-700">
                <a
                  href={`#${section.id || `section-${index}`}`}
                  className="text-blue-600 hover:underline"
                >
                  {index + 1}. {section.title}
                </a>
                {section.subsections && section.subsections.length > 0 && (
                  <ol className="ml-6 mt-2 space-y-1 text-sm">
                    {section.subsections.map((subsection, subIndex) => (
                      <li key={subIndex}>
                        <a
                          href={`#${subsection.id || `subsection-${index}-${subIndex}`}`}
                          className="text-blue-600 hover:underline"
                        >
                          {index + 1}.{subIndex + 1} {subsection.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Main Content - Sections */}
      <main>
        {validatedData.sections.map((section, index) => (
          <Section key={index} section={section} />
        ))}
      </main>

      {/* Related Resources */}
      {validatedData.relatedResources && validatedData.relatedResources.length > 0 && (
        <aside className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-2xl font-semibold text-gray-900">Related Resources</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {validatedData.relatedResources.map((resource, index) => (
              <RelatedResource key={index} resource={resource} />
            ))}
          </div>
        </aside>
      )}

      {/* Footer */}
      {validatedData.footer && (
        <footer className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          {validatedData.footer}
        </footer>
      )}
    </div>
  );
};

// Export for dynamic loading
export default GuideDocumentation;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('guide-documentation', GuideDocumentation);
}

