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

export const WEEKDAY_COLUMN_MAPPING = {
  1: "sm:col-start-1", // Monday
  2: "sm:col-start-2", // Tuesday
  3: "sm:col-start-3", // Wednesday
  4: "sm:col-start-4", // Thursday
  5: "sm:col-start-5", // Friday
  6: "sm:col-start-6", // Saturday
  7: "sm:col-start-7", // Sunday
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

  export const checkOverlap = (availability, newEvent) => {
    for (let i = 0; i < availability.length; i++) {
      const curEvent = availability[i];

      if (
        curEvent.date.year === newEvent.date.year &&
        curEvent.date.month === newEvent.date.month &&
        curEvent.date.day === newEvent.date.day
      ) {
        if (
          (newEvent.startTime >= curEvent.startTime && newEvent.startTime < curEvent.endTime) ||
          (newEvent.endTime > curEvent.startTime && newEvent.endTime <= curEvent.endTime) ||
          (newEvent.startTime <= curEvent.startTime && newEvent.endTime >= curEvent.endTime)
        ) {
          return true;
        }
      }
    }
    return false;
  };