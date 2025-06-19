import React from 'react';
import sampleData from './sample-data.json';

interface CalendarProps {
  schema: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  priority: string;
  color: string;
}

interface CalendarData {
  title: string;
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  organization: {
    name: string;
    logo: string;
    contact: string;
  };
  events: CalendarEvent[];
  timeSlots: string[];
  weekDays: string[];
  theme: {
    primaryGradient: string;
    eventColors: {
      meeting: string;
      training: string;
      workshop: string;
      default: string;
    };
    showTimeSlots: boolean;
    showWeekends: boolean;
  };
}

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<CalendarProps>) => void;
  }
}

const WeeklyMonthlyCalendar: React.FC<CalendarProps> = ({ data }) => {
  // Use user data if provided, otherwise use default data
  const calendarData = data && typeof data === 'object' ? (data as unknown as CalendarData) : sampleData;

  // Helper function to get events for a specific date
  const getEventsForDate = (date: string) => {
    return calendarData.events.filter(event => event.date === date);
  };

  // Helper function to get events for a specific date and time slot
  const getEventsForDateAndTime = (date: string, timeSlot: string) => {
    return calendarData.events.filter(event => 
      event.date === date && 
      event.startTime <= timeSlot && 
      event.endTime > timeSlot
    );
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to get day name from date
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Generate dates for the period
  const generateDates = (): string[] => {
    const dates: string[] = [];
    const start = new Date(calendarData.startDate);
    const end = new Date(calendarData.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const dates = generateDates();

  // Render weekly view
  const renderWeeklyView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700">
              Time
            </th>
            {dates.map(date => (
              <th key={date} className="border border-gray-300 bg-gray-50 px-4 py-2 text-center text-sm font-medium text-gray-700">
                <div>{getDayName(date)}</div>
                <div className="text-xs text-gray-500">{formatDate(date)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarData.timeSlots.map(timeSlot => (
            <tr key={timeSlot}>
              <td className="border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                {timeSlot}
              </td>
              {dates.map(date => {
                const events = getEventsForDateAndTime(date, timeSlot);
                return (
                  <td key={`${date}-${timeSlot}`} className="min-h-[60px] border border-gray-300 px-2 py-1 text-black" >
                    {events.map(event => (
                      <div
                        key={event.id}
                        className={`mb-1 rounded px-2 py-1 text-xs font-medium text-black`}
                      >
                        <div className="font-semibold text-black">{event.title}</div>
                        <div className="text-xs opacity-75">{event.startTime} - {event.endTime}</div>
                        {event.location && (
                          <div className="text-xs opacity-75">📍 {event.location}</div>
                        )}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render monthly view
  const renderMonthlyView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {calendarData.weekDays.map(day => (
        <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {dates.map(date => {
        const events = getEventsForDate(date);
        const dayName = getDayName(date);
        const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
        
        return (
          <div
            key={date}
            className={`min-h-[120px] border border-gray-200 p-2 ${
              isWeekend && !calendarData.theme.showWeekends ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">
              {new Date(date).getDate()}
            </div>
            <div className="mt-1 space-y-1">
              {events.map(event => (
                <div
                  key={event.id}
                  className={`rounded px-2 py-1 text-xs font-medium text-black`}
                >
                  <div className="truncate font-semibold">{event.title}</div>
                  {event.startTime && (
                    <div className="text-xs opacity-75">{event.startTime}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-lg bg-white p-6 shadow-lg">
      {/* Header */}
      <div className={`bg-gradient-to-r ${calendarData.theme.primaryGradient} p-8 text-black`}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">{calendarData.title}</h1>
            <p className="mt-2 text-black opacity-90">
              {formatDate(calendarData.startDate)} - {formatDate(calendarData.endDate)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-black">{calendarData.organization.logo}</div>
            <div className="mt-1 text-black opacity-90">{calendarData.organization.name}</div>
            <div className="text-sm text-black opacity-75">{calendarData.organization.contact}</div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-8">
        {calendarData.period === 'weekly' ? renderWeeklyView() : renderMonthlyView()}
      </div>

      {/* Event Legend */}
      <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Event Categories</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className={`mr-2 size-4 rounded ${calendarData.theme.eventColors.meeting}`}></div>
            <span className="text-sm text-gray-700">Meetings</span>
          </div>
          <div className="flex items-center">
            <div className={`mr-2 size-4 rounded ${calendarData.theme.eventColors.training}`}></div>
            <span className="text-sm text-gray-700">Training</span>
          </div>
          <div className="flex items-center">
            <div className={`mr-2 size-4 rounded ${calendarData.theme.eventColors.workshop}`}></div>
            <span className="text-sm text-gray-700">Workshops</span>
          </div>
          <div className="flex items-center">
            <div className={`mr-2 size-4 rounded ${calendarData.theme.eventColors.default}`}></div>
            <span className="text-sm text-gray-700">Other</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-8 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>Generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Total Events: {calendarData.events.length}</p>
        </div>
      </div>
    </div>
  );
};

// Export for dynamic loading
export default WeeklyMonthlyCalendar;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('weekly-monthly-calendar', WeeklyMonthlyCalendar);
} 