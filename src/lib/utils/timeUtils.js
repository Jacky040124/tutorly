import { 
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
    getDay,
    startOfWeek, 
    addDays, 
    getDate, 
    isSameDay,
    addWeeks
} from 'date-fns';

// ... other utility functions ...

/**
 * Normalizes a date to midnight (00:00:00.000)
 * @param {Object} date - Date object with year, month, day properties
 * @param {number} date.year - Full year
 * @param {number} date.month - Month (1-12)
 * @param {number} date.day - Day of month
 * @returns {Date} Date object normalized to midnight
 */
export function normalizeToMidnight(date) {
    // If date is already a Date object, use it directly
    if (date instanceof Date) {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0, 0, 0, 0
        );
    }
    
    // If date is an object with year, month, day properties
    return new Date(
        date.year,
        date.month - 1, // JavaScript months are 0-based
        date.day,
        0, 0, 0, 0
    );
}

/**
 * Converts day number to adjusted weekday (0-6 to 1-7)
 * @param {Date} date - Date object
 * @returns {number} Adjusted weekday where Monday is 1 and Sunday is 7
 */
export function getAdjustedWeekday(date) {
    const weekday = getDay(date);
    return weekday === 0 ? 7 : weekday;
}

/**
 * Generates an array of dates for a week starting from a given Monday
 * @param {Date} monday - The Monday that starts the week
 * @returns {Array<{date: number, isToday: boolean}>} Array of date objects
 */
export function generateWeekDates(monday) {
    return Array(7).fill(null).map((_, i) => ({
        date: getDate(addDays(monday, i)),
        isToday: isSameDay(addDays(monday, i), new Date())
    }));
}

/**
 * Gets the week bounds (monday and sunday) for a given week offset
 * @param {number} weekOffset - Number of weeks to offset from current week
 * @returns {{monday: Date, sunday: Date}} Monday and Sunday dates
 */
export function getWeekBounds(weekOffset) {
    const today = new Date();
    const monday = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
    const sunday = addDays(monday, 6);
    
    return {
        monday: {
            year: monday.getFullYear(),
            month: monday.getMonth() + 1, // Convert back to 1-based month
            day: monday.getDate()
        },
        sunday: {
            year: sunday.getFullYear(),
            month: sunday.getMonth() + 1, // Convert back to 1-based month
            day: sunday.getDate()
        }
    };
}

/**
 * Converts time string (HH:MM) to decimal hours
 * @param {string} time - Time in HH:MM format
 * @returns {number|null} Decimal hours or null if no time provided
 */
export const timeToDecimal = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
};

/**
 * Converts decimal time to HH:MM format
 * @param {number} time - Time in decimal format (e.g., 14.5 for 14:30)
 * @returns {string} Time in HH:MM format
 */
export const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours}:${minutes === 0 ? '00' : minutes}`;
}; 

export const handleTimeSlotClick = () => {
    // stab
}