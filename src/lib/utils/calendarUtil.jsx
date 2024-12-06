import { normalizeToMidnight } from "./timeUtils";

export const CALENDAR_CONFIG = {
  START_HOUR: 6, // Calendar starts at 6 AM
  END_HOUR: 24, // Calendar ends at 12 AM
  HOURS_TO_DISPLAY: 18, // 18 hours (6 AM to 12 AM)
  INTERVALS_PER_HOUR: 12,
};

export const TOTAL_INTERVALS = CALENDAR_CONFIG.HOURS_TO_DISPLAY * CALENDAR_CONFIG.INTERVALS_PER_HOUR;
export const HEADER_OFFSET = 2;

export const calculateGridPosition = {
  startRow: (hour) => (hour - CALENDAR_CONFIG.START_HOUR) * CALENDAR_CONFIG.INTERVALS_PER_HOUR + HEADER_OFFSET,
  duration: (startTime, endTime) => (endTime - startTime) * CALENDAR_CONFIG.INTERVALS_PER_HOUR,
};

export const generateTimeLabels = () => {
  const timeSlots = [];
  for (let hour = CALENDAR_CONFIG.START_HOUR; hour < CALENDAR_CONFIG.END_HOUR; hour++) {
    const displayHour = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";

    timeSlots.push({
      hour: hour,
      displayHour: displayHour,
      ampm: ampm,
    });
  }
  return timeSlots;
};

export function isWithinWeek(date, monday, sunday) {
  return date >= normalizeToMidnight(monday) && date <= normalizeToMidnight(sunday);
}

export function getAdjustedWeekday(date) {
  const day = new Date(date.year, date.month - 1, date.day).getDay();
  return day === 0 ? 7 : day;
}

export const TimeLabels = () => {
  const timeSlots = generateTimeLabels();
  return timeSlots
    .map(({ hour, label }) => [
      <div key={hour}>
        <div className="calendarText">{label}</div>
      </div>,
      <div key={`${hour}-half`}></div>,
    ])
    .flat();
};

export const checkOverlap = (existingEvents, newEvent) => {
  // Combine both availability and bookings into one array if they're passed separately
  const allEvents = Array.isArray(existingEvents) ? existingEvents : [];

  for (let i = 0; i < allEvents.length; i++) {
    const curEvent = allEvents[i];

    // Skip if dates don't match
    if (
      curEvent.date.year !== newEvent.date.year ||
      curEvent.date.month !== newEvent.date.month ||
      curEvent.date.day !== newEvent.date.day
    ) {
      continue;
    }

    // Check for time overlap
    if (
      (newEvent.startTime >= curEvent.startTime && newEvent.startTime < curEvent.endTime) ||
      (newEvent.endTime > curEvent.startTime && newEvent.endTime <= curEvent.endTime) ||
      (newEvent.startTime <= curEvent.startTime && newEvent.endTime >= curEvent.endTime)
    ) {
      return {
        hasOverlap: true,
        type: curEvent.studentId ? 'booking' : 'availability'
      };
    }
  }

  return {
    hasOverlap: false,
    type: null
  };
};