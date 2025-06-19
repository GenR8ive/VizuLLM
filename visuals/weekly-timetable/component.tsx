import React from 'react';
import sampleData from './sample-data.json';
interface WeeklyTimetableProps {
  schema: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
}

interface TimeSlotData {
  [key: string]: string;
}

interface DayData {
  [key: string]: TimeSlotData;
}

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<WeeklyTimetableProps>) => void;
  }
}

const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({ data }) => {
  // Use user data if provided, otherwise use default data
  const timetableData = data?.subjects as DayData || sampleData;
  const days = (data?.days as string[]) || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = (data?.timeSlots as string[]) || ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Time
              </th>
              {days.map((day) => (
                <th key={day} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {timeSlots.map((time) => (
              <tr key={time}>
                <td className="whitespace-nowrap bg-gray-50 px-6 py-4 text-sm font-medium text-gray-900">
                  {time}
                </td>
                {days.map((day) => {
                  const subject = timetableData[day]?.[time];
                  const isLunch = subject === 'Lunch';
                  return (
                    <td key={`${day}-${time}`} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <div className={`rounded-lg p-2 text-center ${
                        isLunch 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {subject || '-'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Export for dynamic loading
export default WeeklyTimetable;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('weekly-timetable', WeeklyTimetable);
} 