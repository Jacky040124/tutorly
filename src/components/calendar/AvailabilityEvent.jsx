import React from 'react';
import { normalizeToMidnight } from '@/lib/utils/timeUtils';
import { getWeekBounds } from "@/lib/utils/timeUtils"; 
import { useCalendar } from "@/components/providers/CalendarContext";
import { formatTime } from "@/lib/utils/timeUtils";
import { calculateGridPosition } from "@/lib/utils/calendarUtil";

export function AvailabilityEvent({ event, onRemove }) {
    console.log("event", event);
  try {
    const { weekOffset } = useCalendar();
    const { monday, sunday } = getWeekBounds(weekOffset);
    const eventDate = normalizeToMidnight(event.date);
    
    if (eventDate >= normalizeToMidnight(monday) && eventDate <= normalizeToMidnight(sunday)) {
      const eventDay = new Date(event.date.year, event.date.month - 1, event.date.day).getDay();
      const adjustedWeekday = eventDay === 0 ? 7 : eventDay;
      
      const startRow = calculateGridPosition.startRow(event.startTime);
      const rowSpan = calculateGridPosition.duration(event.startTime, event.endTime);

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
          data-testid={`time-slot-${event.startTime}`}
        >
          <a
            onClick={() => onRemove && onRemove(
              adjustedWeekday, 
              event.startTime, 
              event.endTime, 
              event.isRepeating, 
              event.totalClasses,
              event.link
            )}
            className={`group absolute inset-1 flex flex-col overflow-y-auto rounded-lg 
              ${event.endTime - event.startTime >= 1 ? "bg-green-50 hover:bg-green-100" : "bg-gray-50"}
              ${event.isRepeating ? "border-l-4 border-green-500" : ""}
              p-2 text-xs leading-5`}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <time className="text-gray-600" dateTime={`2022-01-15T${event.startTime}:00`}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </time>
                {event.isRepeating && (
                  <span className="text-green-600 text-[10px] font-medium">
                    {event.repeatIndex + 1}/{event.totalClasses}
                  </span>
                )}
              </div>
              {event.isRepeating && (
                <span className="text-green-600 text-[10px] mt-0.5">Recurring Class</span>
              )}
            </div>
          </a>
        </li>
      );
    }
  } catch (error) {
    console.error("Error processing event:", error);
    return null;
  }
  return null;
}
