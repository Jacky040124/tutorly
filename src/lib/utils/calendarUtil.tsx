import { EventContentArg } from "@fullcalendar/core";

interface CalendarConfig {
  START_HOUR: number;
  END_HOUR: number;
  HOURS_TO_DISPLAY: number;
  INTERVALS_PER_HOUR: number;
}

interface DateObject {
  year: number;
  month: number;
  day: number;
}

interface Event {
  date: DateObject;
  startTime: number;
  endTime: number;
  studentId?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}


export function isOverlap(existingEvents: Event[], newEvents: Event[]): boolean {
  const existing = Array.isArray(existingEvents) ? existingEvents : [];
  const events = Array.isArray(newEvents) ? newEvents : [];

  return events.some(newEvent => 
    existing.some(existingEvent => {
      // Skip if dates don't match
      if (
        existingEvent.date.year !== newEvent.date.year ||
        existingEvent.date.month !== newEvent.date.month ||
        existingEvent.date.day !== newEvent.date.day
      ) {
        return false;
      }

      // Check for time overlap
      return (
        (newEvent.startTime >= existingEvent.startTime && newEvent.startTime < existingEvent.endTime) || // New event starts during existing
        (newEvent.endTime > existingEvent.startTime && newEvent.endTime <= existingEvent.endTime) || // New event ends during existing
        (newEvent.startTime <= existingEvent.startTime && newEvent.endTime >= existingEvent.endTime) // New event encompasses existing
      );
    })
  );
}

export const generateTimeOptions = (config: CalendarConfig) => {
  const options = [];
  for (let hour = config.START_HOUR; hour < config.END_HOUR; hour++) {
    const displayHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    options.push({
      value: hour.toString(),
      label: `${displayHour}:00 ${ampm}`
    });
  }
  return options;
};


export const renderEventContent = (eventInfo: EventContentArg) => {
  const status = eventInfo.event.extendedProps.status;

  return (
    <div className="flex items-center gap-1 p-1">
      <span>{eventInfo.event.title}</span>
      <span>[{status.charAt(0).toUpperCase() + status.slice(1)}]</span>
    </div>
  );
}; 