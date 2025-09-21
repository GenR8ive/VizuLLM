import React from 'react';
import { DailyMeetingReportSchema, type DailyMeetingReportData } from './schema';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import sampleData from './sample-data.json';

interface DailyMeetingReportProps {
  schema: typeof DailyMeetingReportSchema | null;
  data?: DailyMeetingReportData | null;
}

// Extend Window interface for global function
declare global {
  interface Window {
    __registerVisualComponent: (slug: string, component: React.ComponentType<DailyMeetingReportProps>) => void;
  }
}

const DailyMeetingReport: React.FC<DailyMeetingReportProps> = ({ data }) => {
  let validatedData: DailyMeetingReportData;
  try {
    if (data) {
      validatedData = DailyMeetingReportSchema.parse(data);
    } else {
      validatedData = DailyMeetingReportSchema.parse(sampleData);
    }
  } catch (error) {
    console.error('Data validation failed:', error);
    validatedData = DailyMeetingReportSchema.parse(sampleData);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'late': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'postponed': return 'text-orange-600 bg-orange-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white print:p-0 print:max-w-none">
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {validatedData.meetingInfo.title}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Date:</span> {validatedData.meetingInfo.date}
          </div>
          <div>
            <span className="font-semibold">Time:</span> {validatedData.meetingInfo.time}
          </div>
          <div>
            <span className="font-semibold">Duration:</span> {validatedData.meetingInfo.duration}
          </div>
          <div>
            <span className="font-semibold">Location:</span> {validatedData.meetingInfo.location}
          </div>
          {validatedData.meetingInfo.meetingType && (
            <div>
              <span className="font-semibold">Type:</span> {validatedData.meetingInfo.meetingType}
            </div>
          )}
          {validatedData.meetingInfo.facilitator && (
            <div>
              <span className="font-semibold">Facilitator:</span> {validatedData.meetingInfo.facilitator}
            </div>
          )}
        </div>
      </header>

      {/* Attendees Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
          Attendees ({validatedData.attendees.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validatedData.attendees.map((attendee, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
                {attendee.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendee.status)}`}>
                    {attendee.status}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {attendee.role && <div><span className="font-medium">Role:</span> {attendee.role}</div>}
                {attendee.department && <div><span className="font-medium">Department:</span> {attendee.department}</div>}
                {attendee.email && <div><span className="font-medium">Email:</span> {attendee.email}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agenda Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
          Agenda
        </h2>
        <div className="space-y-3">
          {validatedData.agenda.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.item}</h3>
                {item.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {item.presenter && <div><span className="font-medium">Presenter:</span> {item.presenter}</div>}
                {item.duration && <div><span className="font-medium">Duration:</span> {item.duration}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Decisions Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
          Key Decisions
        </h2>
        <div className="space-y-4">
          {validatedData.keyDecisions.map((decision, index) => (
            <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{decision.decision}</h3>
              {decision.rationale && (
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Rationale:</span> {decision.rationale}
                </div>
              )}
              {decision.impact && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Impact:</span> {decision.impact}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Action Items Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
          Action Items
        </h2>
        <div className="space-y-3">
          {validatedData.actionItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.task}</h3>
                <div className="flex gap-2">
                  {item.priority && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                      {getPriorityIcon(item.priority)} {item.priority}
                    </span>
                  )}
                  {item.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-medium">Assignee:</span> {item.assignee}</div>
                {item.dueDate && <div><span className="font-medium">Due Date:</span> {item.dueDate}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
          Next Steps
        </h2>
        <div className="space-y-3">
          {validatedData.nextSteps.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{step.step}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                {step.owner && <div><span className="font-medium">Owner:</span> {step.owner}</div>}
                {step.timeline && <div><span className="font-medium">Timeline:</span> {step.timeline}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notes Section */}
      {validatedData.notes && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            Additional Notes
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{validatedData.notes}</p>
          </div>
        </section>
      )}

      {/* Attachments Section */}
      {validatedData.attachments && validatedData.attachments.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            Attachments
          </h2>
          <div className="space-y-2">
            {validatedData.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  📎
                </div>
                <div>
                  <div className="font-medium text-gray-900">{attachment.name}</div>
                  {attachment.type && (
                    <div className="text-sm text-gray-500">{attachment.type}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Follow-up Meeting Section */}
      {validatedData.followUpMeeting && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            Follow-up Meeting
          </h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${validatedData.followUpMeeting.scheduled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {validatedData.followUpMeeting.scheduled ? 'Scheduled' : 'Not Scheduled'}
              </span>
            </div>
            {validatedData.followUpMeeting.scheduled && (
              <div className="text-sm text-gray-600 space-y-1">
                {validatedData.followUpMeeting.date && (
                  <div><span className="font-medium">Date:</span> {validatedData.followUpMeeting.date}</div>
                )}
                {validatedData.followUpMeeting.time && (
                  <div><span className="font-medium">Time:</span> {validatedData.followUpMeeting.time}</div>
                )}
                {validatedData.followUpMeeting.agenda && (
                  <div><span className="font-medium">Agenda:</span> {validatedData.followUpMeeting.agenda}</div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-300 text-sm text-gray-500 text-center">
        <p>Meeting report generated on {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

// Export for dynamic loading
export default DailyMeetingReport;

// Register component for dynamic loading
if (typeof window !== 'undefined' && window.__registerVisualComponent) {
  window.__registerVisualComponent('daily-meeting-report', DailyMeetingReport);
} 