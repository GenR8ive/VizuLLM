import React from 'react';
import { type CoverLetterData } from './schema';
import sampleData from './sample-data.json';
import { z } from 'zod';

interface ComponentProps {
  schema: z.ZodSchema | null;
  data?: Record<string, unknown> | null;
}

const CoverLetter: React.FC<ComponentProps> = ({ data }) => {
  // Use sample data if no data is provided
  const coverLetterData = (data as CoverLetterData) || sampleData;

  return (
    <div className="h-full bg-white p-8">
      <div className="mx-auto h-full bg-white print:shadow-none">
        {/* Header Section */}
        <div className="mb-6 border-b-2 border-gray-300 pb-6">
          <div className="flex items-start justify-between">
            {/* Personal Information */}
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                {coverLetterData.fullName}
              </h1>
              <div className="space-y-1 text-sm text-gray-600">
                {coverLetterData.email && <p>{coverLetterData.email}</p>}
                {coverLetterData.phone && <p>{coverLetterData.phone}</p>}
              </div>
            </div>
            
            {/* Date */}
            <div className="text-sm text-gray-600">
              {coverLetterData.date}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="mb-6">
          <div className="space-y-1 text-sm text-gray-600">
            <p className="font-semibold">{coverLetterData.companyName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 text-base leading-relaxed">
          <div className="text-justify">
            {coverLetterData.content.split('\n').map((line, index) => (
              <p key={index} className={line.trim() === '' ? 'mb-4' : 'mb-2'}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export for dynamic loading
export default CoverLetter;
