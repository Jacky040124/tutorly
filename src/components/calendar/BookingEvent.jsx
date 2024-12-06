import React from "react";
import { normalizeToMidnight, formatTime, getWeekBounds } from "@/lib/utils/timeUtils";
import { WEEKDAY_COLUMN_MAPPING, calculateGridPosition, isWithinWeek } from "@/lib/utils/calendarUtil";
import { useCalendar } from "@/components/providers/CalendarContext";

export function BookingEvent({ booking }) {
  try {
    const { weekOffset } = useCalendar();
    const bookingDate = normalizeToMidnight(booking.date);
    const { monday, sunday } = getWeekBounds(weekOffset);

    if (isWithinWeek(bookingDate, monday, sunday)) {
      const bookingDay = new Date(booking.date.year, booking.date.month - 1, booking.date.day).getDay();
      const adjustedWeekday = bookingDay === 0 ? 7 : bookingDay;
      
      const startRow = calculateGridPosition.startRow(booking.startTime);
      const rowSpan = calculateGridPosition.duration(booking.startTime, booking.endTime);

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
              {booking.studentId && (
                <span className="text-red-600 text-[10px] mt-0.5">
                  Booked by {booking.studentNickname || booking.studentId}
                </span>
              )}
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
