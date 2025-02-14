import { normalizeToMidnight } from "./timeUtils";
import { Booking } from "@/types/booking";


interface CalendarConfig {
  START_HOUR: number;
  END_HOUR: number;
  HOURS_TO_DISPLAY: number;
  INTERVALS_PER_HOUR: number;
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

export const CALENDAR_CONFIG: CalendarConfig = {
  START_HOUR: 6,
  END_HOUR: 24,
  HOURS_TO_DISPLAY: 18,
  INTERVALS_PER_HOUR: 12,
};



export function isWithinWeek(date: Date, monday: DateObject, sunday: DateObject): boolean {
  return date >= normalizeToMidnight(monday) && date <= normalizeToMidnight(sunday);
}

export function getAdjustedWeekday(date: DateObject): number {
  const day = new Date(date.year, date.month - 1, date.day).getDay();
  return day === 0 ? 7 : day;
}

export function isOverlap(existingEvents: Event[], newEvents: Event[]): boolean {
  const existing = Array.isArray(existingEvents) ? existingEvents : [];
  const events = Array.isArray(newEvents) ? newEvents : [];

  return events.some(newEvent => 
    existing.some(existingEvent => {
      // Skip if dates don't match
      if (
        existingEvent.date.year !== newEvent.date.year ||
        existingEvent.date.month !== newEvent.date.month ||
        existingEvent.date.day !== newEvent.date.day
      ) {
        return false;
      }

      // Check for time overlap
      return (
        (newEvent.startTime >= existingEvent.startTime && newEvent.startTime < existingEvent.endTime) || // New event starts during existing
        (newEvent.endTime > existingEvent.startTime && newEvent.endTime <= existingEvent.endTime) || // New event ends during existing
        (newEvent.startTime <= existingEvent.startTime && newEvent.endTime >= existingEvent.endTime) // New event encompasses existing
      );
    })
  );
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

export const filterBookingsByTime = (bookings: Booking[], showUpcoming: boolean) => {
  return bookings.filter((booking) => {
    const bookingDateTime = new Date(booking.date.year, booking.date.month - 1, booking.date.day, booking.endTime);
    const now = new Date();
    return showUpcoming ? bookingDateTime >= now : bookingDateTime < now;
  });
};

export const convertToCalendarDate = (date: { year: number; month: number; day: number }, hour: number): Date => {
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  const hourStr = String(hour).padStart(2, "0");
  return new Date(`${date.year}-${month}-${day}T${hourStr}:00:00`);
}; 