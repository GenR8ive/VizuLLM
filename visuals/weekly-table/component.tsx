import React from 'react';
import { WeeklyTableSchema, type WeeklyTableData } from './schema';
import sampleData from './sample-data.json';

interface WeeklyTableProps {
  schema: typeof WeeklyTableSchema | null;
  data?: WeeklyTableData | null;
}

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<WeeklyTableProps>) => void;
  }
}

const WeeklyTable: React.FC<WeeklyTableProps> = ({ data }) => {
  // Use sample data if no data is provided
  const tableData = (data as WeeklyTableData) || sampleData;

  const days = [
    { key: 'monday', label: 'Mon', full: 'Monday' },
    { key: 'tuesday', label: 'Tue', full: 'Tuesday' },
    { key: 'wednesday', label: 'Wed', full: 'Wednesday' },
    { key: 'thursday', label: 'Thu', full: 'Thursday' },
    { key: 'friday', label: 'Fri', full: 'Friday' },
    { key: 'saturday', label: 'Sat', full: 'Saturday' },
    { key: 'sunday', label: 'Sun', full: 'Sunday' }
  ];

  const getThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'gradient':
        return 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50';
      case 'minimal':
        return 'bg-gray-50';
      case 'colorful':
        return 'bg-gradient-to-br from-pink-50 via-yellow-50 to-green-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className={`min-h-full ${getThemeClasses(tableData.theme)} p-6 print:p-4`}>
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 print:text-2xl">
            {tableData.title || 'Weekly Planner'}
          </h1>
          {tableData.subtitle && (
            <p className="text-lg text-gray-600 print:text-base">
              {tableData.subtitle}
            </p>
          )}
        </div>

        {/* Weekly Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-lg print:shadow-none">
            {/* Header Row */}
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                <th className="min-w-[200px] border border-gray-300 bg-gray-50 p-4 text-left font-bold text-gray-900 print:border-gray-600">
                  <div className="text-sm uppercase tracking-wider text-gray-600">Activities</div>
                </th>
                {days.map((day) => (
                  <th
                    key={day.key}
                    className="min-w-[140px] border border-gray-300 p-4 text-center font-bold text-gray-900 print:border-gray-600"
                  >
                    <div className="text-lg print:text-base">{day.label}</div>
                    <div className="hidden text-xs font-normal text-gray-600 md:block print:hidden">
                      {day.full}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body Rows */}
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25 print:bg-white'}
                >
                  {/* Row Header */}
                  <td
                    className="border border-gray-300 bg-gray-50 p-4 font-medium text-gray-900 print:border-gray-600 print:bg-gray-100"
                    style={{
                      borderLeftColor: row.color || '#e5e7eb',
                      borderLeftWidth: '4px',
                      borderLeftStyle: 'solid'
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {row.icon && (
                        <span className="shrink-0 text-2xl print:text-xl">{row.icon}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 text-sm font-semibold text-gray-900">
                          {row.label}
                        </h4>
                        {row.time && (
                          <p className="mb-1 text-xs text-gray-600">{row.time}</p>
                        )}
                        {row.category && (
                          <span className=" inline-block rounded-full bg-gray-200 p-2 py-1 text-xs text-gray-700 print:bg-gray-300">
                            {row.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Day Cells */}
                  {days.map((day) => {
                    const item = tableData.items?.[day.key as keyof typeof tableData.items]?.[row.id];
                    const itemColor = row.color;

                    return (
                      <td
                        key={`${row.id}-${day.key}`}
                        className="border border-gray-300 bg-white p-3 align-top print:border-gray-600"
                        style={itemColor && item ? {
                          borderTopColor: itemColor,
                          borderTopWidth: '3px',
                          borderTopStyle: 'solid'
                        } : {}}
                      >
                        {item ? (
                          <div className="min-h-[80px] space-y-2 print:min-h-[60px]">
                            {/* Content */}
                            <p className="text-sm font-medium leading-tight text-gray-900 print:text-xs">
                              {item.content}
                            </p>

                            {/* Notes */}
                            {item.notes && (
                              <p className="border-t border-gray-200 pt-2 text-xs italic text-gray-600 print:border-gray-400">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex h-20 items-center justify-center print:h-16">
                            <span className="text-xs text-gray-400">—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Export for dynamic loading
export default WeeklyTable;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('weekly-table', WeeklyTable);
}
