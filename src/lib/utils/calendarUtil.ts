import { normalizeToMidnight } from "./timeUtils";

interface CalendarConfig {
  START_HOUR: number;
  END_HOUR: number;
  HOURS_TO_DISPLAY: number;
  INTERVALS_PER_HOUR: number;
}

interface TimeSlot {
  hour: number;
  displayHour: number;
  ampm: string;
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

interface OverlapResult {
  hasOverlap: boolean;
  type: 'booking' | 'availability' | null;
  conflictingEvent: Event | null;
}

export const CALENDAR_CONFIG: CalendarConfig = {
  START_HOUR: 6,
  END_HOUR: 24,
  HOURS_TO_DISPLAY: 18,
  INTERVALS_PER_HOUR: 12,
};

export const TOTAL_INTERVALS = CALENDAR_CONFIG.HOURS_TO_DISPLAY * CALENDAR_CONFIG.INTERVALS_PER_HOUR;
export const HEADER_OFFSET = 2;

export const calculateGridPosition = {
  startRow: (hour: number): number => 
    (hour - CALENDAR_CONFIG.START_HOUR) * CALENDAR_CONFIG.INTERVALS_PER_HOUR + HEADER_OFFSET,
  duration: (startTime: number, endTime: number): number => 
    (endTime - startTime) * CALENDAR_CONFIG.INTERVALS_PER_HOUR,
};

export const generateTimeLabels = (): TimeSlot[] => {
  const timeSlots: TimeSlot[] = [];
  for (let hour = CALENDAR_CONFIG.START_HOUR; hour < CALENDAR_CONFIG.END_HOUR; hour++) {
    const displayHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    timeSlots.push({ hour, displayHour, ampm });
  }
  return timeSlots;
};

export function isWithinWeek(date: Date, monday: DateObject, sunday: DateObject): boolean {
  return date >= normalizeToMidnight(monday) && date <= normalizeToMidnight(sunday);
}

export function getAdjustedWeekday(date: DateObject): number {
  const day = new Date(date.year, date.month - 1, date.day).getDay();
  return day === 0 ? 7 : day;
}

export function checkOverlap(existingEvents: Event[], newEvent: Event): OverlapResult {
  // Combine both availability and bookings into one array if they're passed separately
  const allEvents = Array.isArray(existingEvents) ? existingEvents : [];

  for (const existingEvent of allEvents) {
    // Skip if dates don't match
    if (
      existingEvent.date.year !== newEvent.date.year ||
      existingEvent.date.month !== newEvent.date.month ||
      existingEvent.date.day !== newEvent.date.day
    ) {
      continue;
    }

    // Check for time overlap
    const hasTimeOverlap = (
      (newEvent.startTime >= existingEvent.startTime && newEvent.startTime < existingEvent.endTime) || // New event starts during existing
      (newEvent.endTime > existingEvent.startTime && newEvent.endTime <= existingEvent.endTime) || // New event ends during existing
      (newEvent.startTime <= existingEvent.startTime && newEvent.endTime >= existingEvent.endTime) // New event encompasses existing
    );

    if (hasTimeOverlap) {
      // Determine if it's a booking or availability conflict
      const isBooking = 'studentId' in existingEvent || existingEvent.status === 'confirmed';
      return {
        hasOverlap: true,
        type: isBooking ? 'booking' : 'availability',
        conflictingEvent: existingEvent
      };
    }
  }

  return {
    hasOverlap: false,
    type: null,
    conflictingEvent: null
  };
}

export const formatDate = (date: DateObject): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.month - 1]} ${date.day}`;
};

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

export const isValidEvent = (event: {
  title?: string,
  date?: Date | null,
  startTime?: string,
  endTime?: string,
  maxStudents?: number,
  meetingLinks?: Record<string, string>,
  isRepeating?: boolean
}): boolean => {
  const { title, date, startTime, endTime, maxStudents, meetingLinks, isRepeating } = event;

  if (!title || !date || !startTime || !endTime) return false;
  if (parseInt(startTime) >= parseInt(endTime)) return false;
  if (!maxStudents || maxStudents < 1) return false;
  
  if (!meetingLinks) return false;

  if (isRepeating) {
    return Object.values(meetingLinks).every(link => link.trim() !== "");
  } else {
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    return meetingLinks[dateKey]?.trim() !== "";
  }
};