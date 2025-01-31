import startOfWeek from 'date-fns/startOfWeek';
import addDays from 'date-fns/addDays';
import getDate from 'date-fns/getDate';
import isSameDay from 'date-fns/isSameDay';
import addWeeks from 'date-fns/addWeeks';

// ... other utility functions ...

export interface DateObject {
  year: number;
  month: number;
  day: number;
}

export interface WeekDate {
  date: number;
  isToday: boolean;
}

export interface WeekBounds {
  monday: DateObject;
  sunday: DateObject;
}

export interface GridPositions {
  startRow: number;
  spanRows: number;
}

export function normalizeToMidnight(date: Date | DateObject): Date {
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

export function getAdjustedWeekday(eventDate: Date | DateObject, weekOffset: number = 0): number {
    // Get the Monday of the current week being viewed
    const today = new Date();
    const monday = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
    
    // Convert eventDate to a Date object if it's not already
    const date = eventDate instanceof Date ? eventDate : 
                 new Date(eventDate.year, eventDate.month - 1, eventDate.day);
    
    // Get the day of the week (0-6, where 0 is Sunday)
    const day = date.getDay();
    
    // Convert to 1-7 where 1 is Monday and 7 is Sunday
    return day === 0 ? 7 : day;
}


export function generateWeekDates(monday: Date): WeekDate[] {
    return Array(7).fill(null).map((_, i) => ({
        date: getDate(addDays(monday, i)),
        isToday: isSameDay(addDays(monday, i), new Date())
    }));
}


export function getWeekBounds(weekOffset: number): WeekBounds {
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

export const timeToDecimal = (time: string): number | null => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
};

export const formatTime = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = (time % 1) * 60;
    return `${hours}:${minutes === 0 ? '00' : minutes}`;
}; 


export function calculateSelectedDate(day: number, weekOffset: number): DateObject {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(monday.getDate() - monday.getDay() + 1 + (weekOffset * 7));
    
    const selectedDate = new Date(monday);
    selectedDate.setDate(monday.getDate() + (day - 1));
    
    return {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate()
    };
}


export const calculateGridPositions = (startTime: number, endTime: number): GridPositions => {
    const startRow = (startTime * 12) + 2;
    const spanRows = (endTime - startTime) * 12;
    return { startRow, spanRows };
};
