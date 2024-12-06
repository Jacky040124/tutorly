import React from "react";
import { normalizeToMidnight, formatTime, getWeekBounds } from "@/lib/utils/timeUtils";
import { calculateGridPosition, isWithinWeek } from "@/lib/utils/calendarUtil";
import { useCalendar } from "@/components/providers/CalendarContext";
import { useUser } from "@/components/providers/UserContext";
import { useTranslation } from "react-i18next";

export function BookingEvent({ booking }) {
  const { weekOffset } = useCalendar();
  const { user } = useUser();
  const { t } = useTranslation();

  try {
    if (!booking?.date) {
      return null;
    }

    const bookingDate = new Date(booking.date.year, booking.date.month - 1, booking.date.day);
    const weekDay = bookingDate.getDay();
    const adjustedWeekday = weekDay === 0 ? 7 : weekDay;

    const { monday, sunday } = getWeekBounds(weekOffset);

    if (isWithinWeek(bookingDate, monday, sunday)) {
      const startRow = calculateGridPosition.startRow(booking.startTime);
      const rowSpan = calculateGridPosition.duration(booking.startTime, booking.endTime);

      const WEEKDAY_COLUMN_MAPPING = {
        1: "sm:col-start-1", // Monday
        2: "sm:col-start-2", // Tuesday
        3: "sm:col-start-3", // Wednesday
        4: "sm:col-start-4", // Thursday
        5: "sm:col-start-5", // Friday
        6: "sm:col-start-6", // Saturday
        7: "sm:col-start-7", // Sunday
      };

      return (
        <li
          className={`relative mt-px hidden ${WEEKDAY_COLUMN_MAPPING[adjustedWeekday]} sm:flex`}
          style={{ gridRow: `${startRow} / span ${rowSpan}` }}
          data-testid={`booking-slot-${booking.startTime}`}
        >
          <div
            className={`group absolute inset-1 flex flex-col overflow-y-auto rounded-lg 
              bg-red-50 cursor-default
              p-2 text-xs leading-5`}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <time className="text-gray-600" dateTime={`2022-01-15T${booking.startTime}:00`}>
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </time>
                {booking.bulkId && (
                  <span className="text-red-600 text-[10px] font-medium">
                    {booking.lessonNumber}/{booking.totalLessons}
                  </span>
                )}
              </div>
              <span className="text-red-600 text-[10px] mt-0.5">
                YOUR BOOKING
              </span>
              {booking.link && (
                <a 
                  href={booking.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 text-[10px] mt-1 hover:underline"
                >
                  Join Meeting
                </a>
              )}
            </div>
          </div>
        </li>
      );
    }
  } catch (error) {
    console.error("Error processing booking:", error);
    return null;
  }
  return null;
}
