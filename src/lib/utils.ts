import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Event } from "@/types/event";

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

export function formatTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    eventId: string;
    status: string;
  };
}

export const adaptToCalendarEvent = (event: Event): CalendarEvent => {
  const startDate = new Date(event.date.year, event.date.month - 1, event.date.day);
  startDate.setHours(Math.floor(event.date.startTime / 60));
  startDate.setMinutes(event.date.startTime % 60);

  const endDate = new Date(event.date.year, event.date.month - 1, event.date.day);
  endDate.setHours(Math.floor(event.date.endTime / 60));
  endDate.setMinutes(event.date.endTime % 60);

  return {
    title: event.title,
    start: startDate,
    end: endDate,
    extendedProps: {
      eventId: event.id,
      status: event.status.status,
    }
  };
};

export function parseCommaSeparatedValue(value: string): string[] {
  return value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

export function handleTagInput(
  e: React.KeyboardEvent<HTMLInputElement>,
  currentTags: string[],
  setTags: (tags: string[]) => void
) {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    const value = (e.target as HTMLInputElement).value.trim();
    if (value && !currentTags.includes(value)) {
      setTags([...currentTags, value]);
      (e.target as HTMLInputElement).value = "";
    }
  }
}
