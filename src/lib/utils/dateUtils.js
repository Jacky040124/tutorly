import {addDays, getDate, isSameDay,} from 'date-fns';

export const WEEKDAY_COLUMN_MAPPING = {
    1: 'sm:col-start-1',  // Monday
    2: 'sm:col-start-2',  // Tuesday
    3: 'sm:col-start-3',  // Wednesday
    4: 'sm:col-start-4',  // Thursday
    5: 'sm:col-start-5',  // Friday
    6: 'sm:col-start-6',  // Saturday
    7: 'sm:col-start-7'   // Sunday
}; 

export const WEEKDAY_LABELS = {
    full: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    mobile: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
};

export const generateWeekDates = (mondayDate) => {
    return Array(7).fill(null).map((_, index) => {
        const date = addDays(mondayDate, index);
        return {
            date: getDate(date),
            isToday: isSameDay(date, new Date())
        };
    });
};