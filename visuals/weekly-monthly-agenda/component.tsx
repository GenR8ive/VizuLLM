import React, { useMemo } from 'react';
import { type WeeklyMonthlyAgendaData } from './schema';
import { z } from 'zod';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import sampleData from './sample-data.json';

interface ComponentProps {
  schema: z.ZodSchema | null;
  data?: Record<string, unknown> | null;
}

const WeeklyMonthlyAgenda: React.FC<ComponentProps> = ({ data }) => {
  const agendaData = (data || sampleData) as WeeklyMonthlyAgendaData;
  const { events = [], categories = [], title = 'My Agenda', timePeriod = 'weekly' } = agendaData;

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof events> = {};
    events.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }, [events]);

  // Get category info
  const getCategoryInfo = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName) || { name: categoryName, color: '#6B7280', icon: '📋' };
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <>
      {/* Print and Screen Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Screen styles for preview */
          .print-container {
            background: white;
            color: black;
            font-size: 14px;
            line-height: 1.5;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
          }
          
          .print-header {
            margin-bottom: 30px;
            text-align: center;
          }
          
          .print-day-section {
            margin-bottom: 20px;
          }
          
          .print-event-card {
            border: 1px solid #e5e7eb;
            background: white;
            margin-bottom: 10px;
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .print-day-header {
            background: #f8fafc;
            color: black;
            border: 1px solid #e2e8f0;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 6px;
            font-weight: 600;
          }
          
          .print-category-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 10px;
            flex-shrink: 0;
          }
          
          .print-priority-badge {
            border: 1px solid;
            padding: 3px 8px;
            font-size: 11px;
            border-radius: 4px;
            font-weight: 500;
          }
          
          .print-attendee-tag {
            background: #dbeafe;
            color: #1e40af;
            padding: 3px 8px;
            font-size: 11px;
            border-radius: 4px;
            margin-right: 6px;
            display: inline-block;
          }
          
          .print-time-info {
            font-size: 12px;
            color: #6b7280;
            margin-top: 8px;
          }
          
          .print-description {
            font-size: 12px;
            color: #4b5563;
            margin-top: 6px;
            line-height: 1.4;
          }
          
          .print-location {
            font-size: 12px;
            color: #059669;
          }
          
          .print-completed {
            text-decoration: line-through;
            opacity: 0.6;
          }
          
          .print-summary {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
          
          .print-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
          }

          /* Print styles */
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
            }
            
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .print-container {
              background: white !important;
              color: black !important;
              font-size: 12px !important;
              line-height: 1.4 !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            
            .print-header {
              page-break-after: avoid;
              margin-bottom: 20px !important;
            }
            
            .print-day-section {
              page-break-inside: avoid;
              margin-bottom: 15px !important;
            }
            
            .print-event-card {
              page-break-inside: avoid;
              border: 1px solid #e5e7eb !important;
              background: white !important;
              margin-bottom: 8px !important;
              padding: 8px !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            
            .print-day-header {
              background: #f3f4f6 !important;
              color: black !important;
              border: 1px solid #d1d5db !important;
              padding: 8px 12px !important;
              margin-bottom: 8px !important;
              border-radius: 0 !important;
            }
            
            .print-category-indicator {
              width: 8px !important;
              height: 8px !important;
              margin-right: 8px !important;
            }
            
            .print-priority-badge {
              padding: 2px 6px !important;
              font-size: 10px !important;
            }
            
            .print-attendee-tag {
              padding: 2px 6px !important;
              font-size: 10px !important;
              margin-right: 4px !important;
            }
            
            .print-time-info {
              font-size: 11px !important;
            }
            
            .print-description {
              font-size: 11px !important;
              margin-top: 4px !important;
            }
            
            .print-location {
              font-size: 11px !important;
            }
            
            .print-summary {
              margin-top: 20px !important;
              padding-top: 15px !important;
            }
            
            .print-footer {
              margin-top: 20px !important;
              padding-top: 10px !important;
              font-size: 10px !important;
            }
          }
        `
      }} />

      <div className="print-container">
        {/* Header */}
        <div className="print-header">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-lg capitalize text-gray-600">{timePeriod} Agenda</p>
          <p className="mt-2 text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Events Display - Print Optimized */}
        <div>
          {Object.entries(eventsByDate)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayEvents]) => (
              <div key={date} className="print-day-section">
                <div className="print-day-header">
                  <h2 className="text-lg font-semibold">{formatDate(date)}</h2>
                  <p className="text-sm text-gray-600">{dayEvents.length} events</p>
                </div>
                
                <div>
                  {dayEvents
                    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                    .map(event => {
                      const categoryInfo = getCategoryInfo(event.category);
                      return (
                        <div
                          key={event.id}
                          className={`print-event-card ${
                            event.completed ? 'print-completed' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div 
                              className="print-category-indicator"
                              style={{ backgroundColor: categoryInfo.color }}
                            />
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-lg">{categoryInfo.icon}</span>
                                <h3 className="text-base font-semibold">
                                  {event.title}
                                </h3>
                              </div>
                              
                              {event.description && (
                                <p className="print-description">{event.description}</p>
                              )}
                              
                              <div className="print-time-info flex flex-wrap items-center gap-3">
                                {event.time && (
                                  <span>🕐 {formatTime(event.time)}</span>
                                )}
                                {event.duration && (
                                  <span>⏱️ {formatDuration(event.duration)}</span>
                                )}
                                {event.location && (
                                  <span className="print-location">📍 {event.location}</span>
                                )}
                                <div className={`print-priority-badge ${getPriorityColor(event.priority)}`}>
                                  {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                                </div>
                              </div>
                              
                              {event.attendees && event.attendees.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">👥 </span>
                                  {event.attendees.map((attendee, index) => (
                                    <span
                                      key={index}
                                      className="print-attendee-tag"
                                    >
                                      {attendee}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>

        {/* Summary Section */}
        <div className="print-summary">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Total Events:</strong> {events.length}</p>
              <p><strong>Completed:</strong> {events.filter(e => e.completed).length}</p>
              <p><strong>Pending:</strong> {events.filter(e => !e.completed).length}</p>
            </div>
            <div>
              <p><strong>High Priority:</strong> {events.filter(e => e.priority === 'high').length}</p>
              <p><strong>Medium Priority:</strong> {events.filter(e => e.priority === 'medium').length}</p>
              <p><strong>Low Priority:</strong> {events.filter(e => e.priority === 'low').length}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="print-footer">
          <p>Weekly/Monthly Agenda - {title}</p>
          <p>Page 1 of 1</p>
        </div>
      </div>
    </>
  );
};

// Export for dynamic loading
export default WeeklyMonthlyAgenda;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('weekly-monthly-agenda', WeeklyMonthlyAgenda);
} 