import { calculateGridPosition, WEEKDAY_COLUMN_MAPPING } from "@/lib/utils/calendarUtil";
import { formatTime } from "@/lib/utils/timeUtils";

export const EventDisplay = ({
  day,
  startTime,
  endTime,
  isBooking,
  studentId,
  isRepeating,
  repeatIndex,
  totalClasses,
  link,
  onRemove,
}) => {
  console.log("event:", repeatInde);
  const startRow = calculateGridPosition.startRow(startTime);
  const rowSpan = calculateGridPosition.duration(startTime, endTime);

  


  const handleClick = () => {
    if (!isBooking && onRemove) {
      onRemove(day, startTime, endTime, isRepeating, totalClasses, link);
    }
  };

  return (
    <li
      className={`relative mt-px hidden ${WEEKDAY_COLUMN_MAPPING[day]} sm:flex`}
      style={{ gridRow: `${startRow} / span ${rowSpan}` }}
      data-testid={`time-slot-${startTime}`}
    >
      <a
        onClick={handleClick}
        className={`group absolute inset-1 flex flex-col overflow-y-auto rounded-lg 
            ${
              isBooking
                ? "bg-red-50 cursor-default"
                : endTime - startTime >= 1
                ? "bg-green-50 hover:bg-green-100"
                : "bg-gray-50"
            } 
            ${isRepeating && !isBooking ? "border-l-4 border-green-500" : ""}
            p-2 text-xs leading-5`}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <time className="text-gray-600" dateTime={`2022-01-15T${startTime}:00`}>
              {formatTime(startTime)} - {formatTime(endTime)}
            </time>
            {isRepeating && !isBooking && (
              <span className="text-green-600 text-[10px] font-medium">
                {repeatIndex + 1}/{totalClasses}
              </span>
            )}
          </div>
          {isBooking && studentId && <span className="text-red-600 text-[10px] mt-0.5">Booked</span>}
          {isRepeating && !isBooking && <span className="text-green-600 text-[10px] mt-0.5">Recurring Class</span>}
        </div>
      </a>
    </li>
  );
};
