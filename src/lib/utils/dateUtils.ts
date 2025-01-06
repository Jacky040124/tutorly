import { addDays, getDate, isSameDay } from 'date-fns';

interface WeekDate {
  date: number;
  isToday: boolean;
}

interface DateObject {
  year: number;
  month: number;
  day: number;
}

export const WEEKDAY_LABELS = {
    full: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    mobile: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
};

export const generateWeekDates = (mondayDate: Date): WeekDate[] => {
    return Array(7).fill(null).map((_, index) => {
        const date = addDays(mondayDate, index);
        return {
            date: getDate(date),
            isToday: isSameDay(date, new Date())
        };
    });
};

export const getRepeatingDates = (baseDate: DateObject): DateObject[] => {
  const dates: DateObject[] = [];
  const currentMonth = baseDate.month;
  let currentDate = new Date(baseDate.year, baseDate.month - 1, baseDate.day);
  
  // Keep adding weeks until we either hit 4 dates or leave current month
  while (dates.length < 4) {
    const nextDate: DateObject = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate()
    };
    
    // Stop if we've moved to next month
    if (nextDate.month !== currentMonth) break;
    
    dates.push(nextDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return dates;
};