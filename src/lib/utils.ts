import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DateObject {
  year: number;
  month: number;
  day: number;
}

export const getNumberOfClasses = (date: Date | null): number => {
    if (!date) return 0;

  const dates: DateObject[] = [];
  const currentMonth = date.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  let currentDate = new Date(date);

  // Keep adding weeks until we either hit 4 dates or leave current month
  while (dates.length < 4) {
    const nextDate: DateObject = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };

    // Stop if we've moved to next month
    if (nextDate.month !== currentMonth) break;

    dates.push(nextDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return dates.length;
};

interface EventDateTime {
  day: number;
  month: number;
  year: number;
  startTime: number;
  endTime: number;
}

export const parseEventDateTime = (date: string, startTime: string, endTime: string): EventDateTime => {
  const dateObj = new Date(date);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  return {
    day: dateObj.getDate(),
    month: dateObj.getMonth() + 1,
    year: dateObj.getFullYear(),
    startTime: startHour * 60 + startMinute,
    endTime: endHour * 60 + endMinute,
  };
};

export const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      options.push(time);
    }
  }
  return options;
};
