import React, { useState } from 'react';
import { CheckListSchema, type CheckListData } from './schema';
import sampleData from './sample-data.json';

// Type for component registration

interface CheckListProps {
  schema: typeof CheckListSchema | null;
  data?: CheckListData | null;
}

const CheckList: React.FC<CheckListProps> = ({ data }) => {
  const validatedData = CheckListSchema.parse(data || sampleData);
  
  // State to track checked items
  const [checkedItems, setCheckedItems] = useState<Set<number>>(
    new Set(validatedData.items.map((item, index) => item.isCompleted ? index : -1).filter(i => i !== -1))
  );

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Color schemes
  const colorSchemes = {
    blue: { primary: 'bg-blue-500', secondary: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    green: { primary: 'bg-green-500', secondary: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    purple: { primary: 'bg-purple-500', secondary: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    pink: { primary: 'bg-pink-500', secondary: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    orange: { primary: 'bg-orange-500', secondary: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    red: { primary: 'bg-red-500', secondary: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  };

  const colors = colorSchemes[validatedData.theme?.primaryColor || 'blue'];
  const showEmojis = validatedData.theme?.showEmojis ?? true;

  // Priority indicators
  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (index: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-white p-6 print:p-4">
      {/* Header */}
      <div className={`mb-6 rounded-lg p-4 ${colors.secondary} ${colors.border} border`}>
        <div className="mb-2 flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${colors.text} print:text-2xl`}>
            {showEmojis && '📋 '}{validatedData.title}
          </h1>
          {validatedData.header?.showDate && (
            <div className="text-sm text-gray-600 print:text-xs">
              {currentDate}
            </div>
          )}
        </div>
        
        {validatedData.subtitle && (
          <p className={`text-lg ${colors.text} opacity-80 print:text-base`}>
            {validatedData.subtitle}
          </p>
        )}
        
        {validatedData.header?.customHeader && (
          <p className="mt-2 text-sm text-gray-600 print:text-xs">
            {validatedData.header.customHeader}
          </p>
        )}
        
        {validatedData.header?.showAuthor && validatedData.header?.author && (
          <p className="mt-1 text-sm text-gray-600 print:text-xs">
            Created by: {validatedData.header.author}
          </p>
        )}
      </div>

      {/* Checklist Items */}
      <div className="mb-6 space-y-3">
        {validatedData.items.map((item, index) => {
          const isChecked = checkedItems.has(index);
          return (
            <div 
              key={index}
              className={`rounded-lg border-2 p-4 transition-all duration-200 ${
                isChecked 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } print:break-inside-avoid`}
            >
              <div className="flex items-start space-x-3">
                {/* Interactive Checkbox */}
                <button
                  onClick={() => handleCheckboxToggle(index)}
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isChecked 
                      ? `${colors.primary} border-transparent ${
                          validatedData.theme?.primaryColor === 'blue' ? 'focus:ring-blue-500' :
                          validatedData.theme?.primaryColor === 'green' ? 'focus:ring-green-500' :
                          validatedData.theme?.primaryColor === 'purple' ? 'focus:ring-purple-500' :
                          validatedData.theme?.primaryColor === 'red' ? 'focus:ring-red-500' :
                          'focus:ring-blue-500'
                        }` 
                      : 'border-gray-300 hover:border-gray-400 focus:ring-gray-500'
                  } print:pointer-events-none`}
                  aria-label={`Toggle ${item.text}`}
                >
                  {isChecked && (
                    <svg className="size-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    {showEmojis && item.emoji && (
                      <span className="text-lg">{item.emoji}</span>
                    )}
                    <span className={`font-medium ${
                      isChecked 
                        ? 'text-gray-500 line-through' 
                        : 'text-gray-900'
                    } print:text-sm`}>
                      {item.text}
                    </span>
                    {item.priority && (
                      <span className="text-sm">{getPriorityIndicator(item.priority)}</span>
                    )}
                  </div>
                  
                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {item.category && (
                      <span className={`rounded-full p-2 py-1 ${colors.secondary} ${colors.text}`}>
                        {item.category}
                      </span>
                    )}
                    {item.dueDate && (
                      <span className="rounded-full bg-yellow-100 p-2 py-1 text-yellow-800">
                        📅 {item.dueDate}
                      </span>
                    )}
                    {item.priority && (
                      <span className="rounded-full bg-red-100 p-2 py-1 text-red-800">
                        {item.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {item.notes && (
                    <p className="mt-2 text-sm italic text-gray-600 print:text-xs">
                      💭 {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={`mt-8 rounded-lg p-4 ${colors.secondary} ${colors.border} border print:mt-4`}>
        {validatedData.footer?.customFooter && (
          <p className="text-center text-sm text-gray-600 print:text-xs">
            {validatedData.footer.customFooter}
          </p>
        )}
      </div>

      {/* Print Footer */}
      {validatedData.printSettings?.showPrintDate && (
        <div className="mt-6 text-center text-xs text-gray-500 print:mt-4">
          Printed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

// Export for dynamic loading
export default CheckList;
