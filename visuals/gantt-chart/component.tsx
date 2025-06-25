import React, { useMemo, useRef, useEffect } from 'react';
import { GanttChartSchema, type GanttChartData } from './schema';
import sampleData from './sample-data.json';
import { Gantt } from 'wx-react-gantt';
import "wx-react-gantt/dist/gantt.css";

interface GanttChartProps {
  schema: typeof GanttChartSchema | null;
  data?: GanttChartData | null;
}

// Extend Window interface for global function

// Task interface for wx-react-gantt
interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  type: 'task' | 'milestone';
  level: number;
  parentId?: string;
  expanded: boolean;
  dependencies: string[];
  customColor: string;
  assignee?: string;
  milestone: boolean;
}

// Print-friendly color palette
const TASK_COLORS = [
  '#1E40AF', // Blue
  '#DC2626', // Red
  '#059669', // Green
  '#D97706', // Orange
  '#7C3AED', // Purple
  '#BE185D', // Pink
  '#0891B2', // Cyan
  '#65A30D', // Lime
  '#F97316', // Orange variant
  '#6B7280', // Gray
];

const GanttChart: React.FC<GanttChartProps> = ({ data }) => {
  const chartData = data || (sampleData as GanttChartData);
  const ganttRef = useRef<HTMLDivElement>(null);

  // Transform data for wx-react-gantt
  const transformedData = useMemo((): GanttTask[] => {
    return chartData.tasks.map((task, index) => ({
      id: task.id,
      name: task.name,
      start: task.startDate,
      end: task.endDate,
      progress: task.progress,
      type: task.type,
      level: task.level,
      parentId: task.parentId,
      expanded: task.expanded,
      dependencies: task.dependencies || [],
      // Custom properties for styling
      customColor: task.color || TASK_COLORS[index % TASK_COLORS.length],
      assignee: task.assignee,
      milestone: task.milestone
    }));
  }, [chartData.tasks]);

  // Gantt chart configuration
  const ganttConfig = useMemo(() => ({
    // Read-only mode
    readonly: true,
    
    // Display options
    showProgress: chartData.showProgress,
    showWeekends: chartData.showWeekends,
    showToday: chartData.displayOptions?.showToday ?? true,
    showWeekNumbers: chartData.displayOptions?.showWeekNumbers ?? false,
    showTaskNames: chartData.displayOptions?.showTaskNames ?? true,
    showDependencies: chartData.displayOptions?.showDependencies ?? true,
    
    // Styling
    rowHeight: chartData.displayOptions?.rowHeight ?? 40,
    columnWidth: chartData.displayOptions?.columnWidth ?? 30,
    
    // Custom styling for print
    customStyles: {
      taskBar: {
        borderRadius: '4px',
        border: '2px solid',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        '@media print': {
          borderRadius: '2px',
          border: '1px solid',
          boxShadow: 'none'
        }
      },
      milestone: {
        borderRadius: '50%',
        border: '3px solid',
        '@media print': {
          border: '2px solid'
        }
      }
    },
    
    // Event handlers (disabled for read-only)
    onTaskClick: () => {},
    onTaskDoubleClick: () => {},
    onTaskRightClick: () => {},
    onDateChange: () => {},
    onProgressChange: () => {},
    onDependencyChange: () => {},
    
    // Custom renderers for better print support
    renderTaskBar: (task: GanttTask) => {
      const color = task.customColor || TASK_COLORS[0];
      const isMilestone = task.milestone || task.type === 'milestone';
      
      if (isMilestone) {
        return (
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: color,
              border: `2px solid ${color}`,
              borderRadius: '50%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        );
      }
      
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: color,
            border: `2px solid ${color}`,
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Progress indicator */}
          {task.progress > 0 && chartData.showProgress && (
            <div
              style={{
                width: `${task.progress}%`,
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.3)',
                position: 'absolute',
                left: 0,
                top: 0
              }}
            />
          )}
          
          {/* Task name inside bar */}
          {chartData.displayOptions?.showTaskNames && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '8px',
                transform: 'translateY(-50%)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 'calc(100% - 16px)'
              }}
            >
              {task.name}
            </div>
          )}
        </div>
      );
    },
    
    renderTaskList: (task: GanttTask) => {
      return (
        <div style={{ padding: '4px 8px' }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '2px'
          }}>
            {task.name}
          </div>
          {task.assignee && (
            <div style={{ 
              fontSize: '10px', 
              color: '#666',
              marginBottom: '2px'
            }}>
              {task.assignee}
            </div>
          )}
          <div style={{ 
            fontSize: '10px', 
            color: '#888'
          }}>
            {task.progress}% complete
          </div>
        </div>
      );
    }
  }), [chartData, transformedData]);

  // Handle print functionality
  useEffect(() => {
    const handlePrint = () => {
      if (ganttRef.current) {
        // Trigger print when component is ready
        setTimeout(() => {
          window.print();
        }, 100);
      }
    };

    // Add print event listener
    window.addEventListener('beforeprint', handlePrint);
    
    return () => {
      window.removeEventListener('beforeprint', handlePrint);
    };
  }, []);

  if (!transformedData.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 print:text-black">
        No tasks to display
      </div>
    );
  }

  return (
    <div className="w-full bg-white print:bg-white">
      {/* Header */}
      <div className="mb-4 sm:mb-6 print:mb-4 print:break-inside-avoid">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl print:text-2xl print:text-black">
          {chartData.title}
        </h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base print:text-gray-800">
          {chartData.startDate && chartData.endDate && (
            <>
              {new Date(chartData.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })} - {new Date(chartData.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </>
          )}
        </p>
      </div>

      {/* Gantt Chart Container */}
      <div className="overflow-auto rounded-lg border border-gray-200 print:overflow-visible print:rounded-none print:border-gray-400">
        <div 
          ref={ganttRef}
          className="gantt-container print:break-inside-avoid"
                    style={{
            minHeight: `${transformedData.length * (chartData.displayOptions?.rowHeight || 40) + 100}px`
          }}
        >
          <Gantt
            data={transformedData}
            config={ganttConfig}
          />
        </div>
      </div>

      {/* Legend */}
      {chartData.printOptions?.showLegend && (
      <div className="mt-4 sm:mt-6 print:mt-4 print:break-inside-avoid">
          <h3 className="mb-2 text-base font-semibold text-gray-900 sm:mb-3 sm:text-lg print:mb-2 print:text-black">
            Legend
          </h3>
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
                <div className="mr-2 size-4 rounded-full border-2 bg-yellow-400 print:mr-1 print:border-yellow-700 print:bg-yellow-500"></div>
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
              {transformedData.map((task) => (
              <div key={task.id} className="flex items-center">
                <div
                  className="mr-2 h-3 w-4 shrink-0 rounded border print:mr-1 print:border"
                  style={{
                      backgroundColor: task.customColor,
                      borderColor: task.customColor
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
      )}

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              margin: 0.5in;
              size: ${chartData.printOptions?.orientation || 'landscape'};
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

            /* Hide scrollbars in print */
            .gantt-container {
              overflow: visible !important;
            }

            /* Adjust font sizes for print */
            .gantt-container {
              font-size: ${chartData.printOptions?.fontSize === 'small' ? '10px' : 
                         chartData.printOptions?.fontSize === 'large' ? '14px' : '12px'} !important;
            }
          }

          /* Custom styles for wx-react-gantt */
          .gantt-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          /* Ensure proper spacing in print */
          @media print {
            .gantt-container > div {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `
      }} />
    </div>
  );
};

// Export for dynamic loading
export default GanttChart;
