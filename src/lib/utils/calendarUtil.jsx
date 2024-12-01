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
