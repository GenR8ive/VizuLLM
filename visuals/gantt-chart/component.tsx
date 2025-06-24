import React, { useMemo } from 'react';
import { GanttChartSchema, type GanttChartData } from './schema';
import sampleData from './sample-data.json';

interface GanttChartProps {
  schema: typeof GanttChartSchema | null;
  data?: GanttChartData | null;
}

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<GanttChartProps>) => void;
  }
}

// Print-friendly color palette with good contrast
const TASK_COLORS = [
  '#1E40AF', // Blue
  '#DC2626', // Red
  '#059669', // Green
  '#D97706', // Orange
  '#7C3AED', // Purple
  '#BE185D', // Pink
  '#0891B2', // Cyan
  '#65A30D', // Lime
  '#DC2626', // Red variant
  '#1F2937', // Gray
];

const GanttChart: React.FC<GanttChartProps> = ({ data }) => {
  const chartData = data || (sampleData as GanttChartData);

  // Calculate timeline dates
  const { timelineDates, totalDays } = useMemo(() => {
    if (!chartData.tasks.length) return { timelineDates: [] as Date[], totalDays: 0 };

    const startDate = new Date(
      chartData.startDate ||
      Math.min(...chartData.tasks.map(task => new Date(task.startDate).getTime()))
    );
    const endDate = new Date(
      chartData.endDate ||
      Math.max(...chartData.tasks.map(task => new Date(task.endDate).getTime()))
    );

    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (chartData.showWeekends || (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      timelineDates: dates,
      totalDays: dates.length
    };
  }, [chartData]);

  // Calculate task position and width
  const getTaskStyle = (task: GanttChartData['tasks'][0]) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);

    const startIndex = timelineDates.findIndex(date =>
      date.toDateString() === taskStart.toDateString()
    );
    const endIndex = timelineDates.findIndex(date =>
      date.toDateString() === taskEnd.toDateString()
    );

    if (startIndex === -1 || endIndex === -1) return { left: '0%', width: '0%' };

    const left = (startIndex / totalDays) * 100;
    const width = ((endIndex - startIndex + 1) / totalDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Get task color with fallback to palette
  const getTaskColor = (task: GanttChartData['tasks'][0], index: number) => {
    return task.color || TASK_COLORS[index % TASK_COLORS.length];
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Calculate task duration in days
  const getTaskDuration = (task: GanttChartData['tasks'][0]) => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Generate month headers
  const monthHeaders = useMemo(() => {
    const months = new Map<string, { month: string; startIndex: number; count: number }>();
    timelineDates.forEach((date, index) => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!months.has(monthKey)) {
        months.set(monthKey, {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          startIndex: index,
          count: 1
        });
      } else {
        months.get(monthKey)!.count++;
      }
    });
    return Array.from(months.values());
  }, [timelineDates]);

  if (!chartData.tasks.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 print:text-black">
        No tasks to display
      </div>
    );
  }

  return (
    <div className="w-full bg-white print:bg-white">
      {/* Header */}
      <div className="mb-4 sm:mb-6 print:mb-4">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl print:text-2xl print:text-black">
          {chartData.title}
        </h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base print:text-gray-800">
          {timelineDates.length > 0 && formatDate(timelineDates[0])} - {timelineDates.length > 0 && formatDate(timelineDates[timelineDates.length - 1])}
        </p>
      </div>

      {/* Mobile Notice */}
      <div className="mb-4 rounded-lg bg-blue-50 p-3 sm:hidden print:hidden">
        <p className="text-xs text-blue-700">
          Swipe horizontally to view the full timeline →
        </p>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 print:overflow-visible print:rounded-none print:border-gray-400">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="border-b border-gray-200 bg-gray-50 print:border-gray-400 print:bg-gray-100">
            {/* Month Headers */}
            <div className="relative flex h-8 border-b border-gray-200 print:border-gray-300">
              <div className="w-48 shrink-0 border-r border-gray-200 bg-gray-100 sm:w-56 lg:w-64 xl:w-80 print:w-72 print:border-gray-400 print:bg-gray-200"></div>
              <div className="relative flex-1">
                {monthHeaders.map((month, index) => (
                  <div
                    key={index}
                    className="absolute top-0 flex h-full items-center justify-center border-r border-gray-200 text-xs font-medium text-gray-700 sm:text-sm print:border-gray-300 print:text-black"
                    style={{
                      left: `${(month.startIndex / totalDays) * 100}%`,
                      width: `${(month.count / totalDays) * 100}%`
                    }}
                  >
                    {month.month}
                  </div>
                ))}
              </div>
            </div>

            {/* Day Headers */}
            <div className="flex h-8">
              <div className="flex w-48 shrink-0 items-center border-r border-gray-200 bg-gray-100 px-2 sm:w-56 sm:px-3 lg:w-64 lg:px-4 xl:w-80 print:w-72 print:border-gray-400 print:bg-gray-200">
                <span className="text-xs font-medium text-gray-700 sm:text-sm print:text-black">Tasks</span>
              </div>
              <div className="flex flex-1">
                {timelineDates.map((date, index) => (
                  <div
                    key={index}
                    className={`flex h-full min-w-0 flex-1 items-center justify-center border-r border-gray-200 text-xs print:border-gray-300 ${
                      date.getDay() === 0 || date.getDay() === 6
                        ? 'bg-gray-100 print:bg-gray-200'
                        : 'bg-white print:bg-white'
                    }`}
                    title={formatDate(date)}
                  >
                    <span className="text-gray-600 print:text-black">
                      {date.getDate()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-gray-200 print:divide-gray-400">
            {chartData.tasks.map((task, taskIndex) => {
              const taskStyle = getTaskStyle(task);
              const taskColor = getTaskColor(task, taskIndex);
              const duration = getTaskDuration(task);
              return (
                <div key={task.id} className="flex h-14 sm:h-16 print:h-14">
                  {/* Task Info */}
                  <div className="flex w-48 shrink-0 items-center border-r border-gray-200 bg-white px-2 sm:w-56 sm:px-3 lg:w-64 lg:px-4 xl:w-80 print:w-72 print:border-gray-400 print:bg-white">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-900 sm:text-sm print:text-black" title={task.name}>
                        <div className="line-clamp-2 sm:line-clamp-1">
                          {task.name}
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-500 sm:gap-2 print:text-gray-700">
                        {task.assignee && (
                          <span className="rounded bg-gray-100 px-1 py-0.5 text-xs sm:px-2 sm:py-1 print:bg-gray-200" title={task.assignee}>
                            <span className="hidden sm:inline">{task.assignee}</span>
                            <span className="sm:hidden">{task.assignee.split(' ')[0]}</span>
                          </span>
                        )}
                        <span className="text-gray-400 print:text-gray-600">
                          {duration}d
                        </span>
                        {task.progress > 0 && chartData.showProgress && (
                          <span className="font-medium text-gray-600 print:text-gray-800">
                            {task.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative flex-1 bg-white print:bg-white">
                    {/* Task Bar */}
                    <div
                      className="absolute top-2 flex h-10 items-center rounded border shadow-sm sm:top-3 print:top-2 print:h-10 print:rounded-sm print:border-2 print:shadow-none"
                      style={{
                        ...taskStyle,
                        backgroundColor: taskColor,
                        borderColor: taskColor,
                        minWidth: '8px'
                      }}
                    >
                      {/* Progress Bar */}
                      {chartData.showProgress && task.progress > 0 && (
                        <div
                          className="h-full rounded-l bg-white bg-opacity-40 print:rounded-l-sm print:bg-opacity-50"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      )}

                      {/* Milestone Indicator */}
                      {task.milestone && (
                        <div
                          className="absolute -right-1 -top-1 size-3 rotate-45 border-2 bg-yellow-400 sm:-right-2 sm:-top-2 sm:size-4 print:size-4 print:border-2 print:border-yellow-700 print:bg-yellow-500"
                          style={{ borderColor: '#92400e' }}
                        ></div>
                      )}

                      {/* Task Label Inside Bar */}
                      <div className="flex-1 px-1 text-xs font-medium text-white sm:px-2 lg:px-3 print:px-2 print:text-white">
                        <div className="truncate">
                          <span className="hidden sm:inline">
                            {task.name.length > 20 ? `${task.name.substring(0, 17)}...` : task.name}
                          </span>
                          <span className="sm:hidden">
                            {task.name.length > 10 ? `${task.name.substring(0, 7)}...` : task.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Weekend Background */}
                    {timelineDates.map((date, dateIndex) => {
                      if (date.getDay() === 0 || date.getDay() === 6) {
                        return (
                          <div
                            key={dateIndex}
                            className="absolute top-0 h-full border-r border-gray-100 bg-gray-50 print:border-gray-200 print:bg-gray-100"
                            style={{
                              left: `${(dateIndex / totalDays) * 100}%`,
                              width: `${(1 / totalDays) * 100}%`
                            }}
                          ></div>
                        );
                      }
                      return null;
                    })}

                    {/* Vertical Day Lines */}
                    {timelineDates.map((_, dateIndex) => (
                      <div
                        key={dateIndex}
                        className="absolute top-0 h-full border-r border-gray-100 print:border-gray-200"
                        style={{ left: `${((dateIndex + 1) / totalDays) * 100}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 print:mt-4 print:break-inside-avoid">
        <h3 className="mb-2 text-base font-semibold text-gray-900 sm:mb-3 sm:text-lg print:mb-2 print:text-black">Legend</h3>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-2 print:gap-2 print:text-xs">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-6 rounded bg-gray-400 print:mr-1 print:bg-gray-600"></div>
              <span className="text-gray-700 print:text-black">Task Duration</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-4 rounded border border-gray-400 bg-white bg-opacity-40 print:mr-1 print:bg-opacity-50"></div>
              <span className="text-gray-700 print:text-black">Progress</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div
                className="mr-2 size-4 rotate-45 border-2 bg-yellow-400 print:mr-1 print:border-yellow-700 print:bg-yellow-500"
                style={{ borderColor: '#92400e' }}
              ></div>
              <span className="text-gray-700 print:text-black">Milestone</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 size-4 rounded border border-gray-300 bg-gray-100 print:mr-1 print:border-gray-400 print:bg-gray-200"></div>
              <span className="text-gray-700 print:text-black">Weekend</span>
            </div>
          </div>
        </div>

        {/* Task Color Reference */}
        <div className="mt-4 print:mt-3">
          <h4 className="mb-2 text-sm font-medium text-gray-800 print:text-black">Task Colors</h4>
          <div className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:text-xs">
            {chartData.tasks.map((task, index) => (
              <div key={task.id} className="flex items-center">
                <div
                  className="mr-2 h-3 w-4 shrink-0 rounded border print:mr-1 print:border"
                  style={{
                    backgroundColor: getTaskColor(task, index),
                    borderColor: getTaskColor(task, index)
                  }}
                ></div>
                <span className="truncate text-gray-700 print:text-black" title={task.name}>
                  <span className="hidden sm:inline">
                    {task.name.length > 15 ? `${task.name.substring(0, 12)}...` : task.name}
                  </span>
                  <span className="sm:hidden">
                    {task.name.length > 10 ? `${task.name.substring(0, 7)}...` : task.name}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              margin: 0.5in;
              size: landscape;
            }

            .print\\:break-inside-avoid {
              break-inside: avoid;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Ensure task bars are visible in print */
            [style*="backgroundColor"] {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }

          /* Custom utility for line clamping */
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }

          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        `
      }} />
    </div>
  );
};

// Export for dynamic loading
export default GanttChart;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('gantt-chart', GanttChart);
}
