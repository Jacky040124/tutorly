import { useState, useEffect } from "react";
import { useUser } from "@/components/providers/UserContext";
import { useBooking } from "@/components/providers/BookingContext";
import { useError } from "@/components/providers/ErrorContext";
import { normalizeToMidnight, getWeekBounds, calculateSelectedDate, formatTime } from "@/lib/utils/timeUtils";
import { generateWeekDates, WEEKDAY_LABELS } from "@/lib/utils/dateUtils";
import { getTeacherBookings } from "@/services/booking.service";
import BookingOverlay from "./BookingOverlay";

// TODO: Consider Seperate Student Calendar and Teacher Calendar
// TODO: Consider Seperating Event Rendering Component from Calendar Component
export default function Calendar() {
  const { user, selectedTeacher, teacherList } = useUser();
  const {
    setSelectedSlot,
    showBookingOverlay,
    setShowBookingOverlay,
    setFutureBookings,
    bookings,
    setBookings,
    bookingConfirmed,
  } = useBooking();
  const { showError } = useError();

  const [weekOffset, setWeekOffset] = useState(0);
  const userType = user.type;
  const teacherData = userType === "teacher" ? user : teacherList[selectedTeacher];
  const availability = userType === "teacher" ? user.availability : teacherList[selectedTeacher]?.availability;

  useEffect(() => {
    const fetchBookings = async () => {
      if (userType === "teacher" && user?.uid) {
        try {
          const fetchedBookings = await getTeacherBookings(user.uid);
          setBookings(fetchedBookings);

          const currentDate = new Date();
          const future = fetchedBookings.filter((booking) => {
            const bookingDate = new Date(booking.date.year, booking.date.month - 1, booking.date.day);
            return bookingDate >= currentDate;
          });
          setFutureBookings(future);
        } catch (error) {
          console.error("Error fetching bookings:", error);
          showError("Failed to fetch bookings");
        }
      } else if (userType === "student" && teacherData?.uid) {
        try {
          const fetchedBookings = await getTeacherBookings(teacherData.uid);
          console.log("Fetched bookings:", fetchedBookings);
          setBookings(fetchedBookings);
        } catch (error) {
          console.error("Error fetching bookings:", error);
          showError("Failed to fetch bookings");
        }
      }
    };

    fetchBookings();
  }, [userType, user?.uid, teacherData?.uid, bookingConfirmed]);

  const handlePreviousWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };
  const handleNextWeek = () => {
    setWeekOffset((prev) => prev + 1);
  };

  const handleRemove = async (day, startTime, endTime) => {
    const confirmDelete = window.confirm("Do you want to remove this time slot?");

    if (confirmDelete) {
      try {
        const updatedAvailability = availability.filter((event) => {
          const eventDate = new Date(event.date.year, event.date.month - 1, event.date.day);
          const eventDay = eventDate.getDay();
          const adjustedEventDay = eventDay === 0 ? 7 : eventDay;

          return !(adjustedEventDay === day && event.startTime === startTime && event.endTime === endTime);
        });

        await updateAvailability(updatedAvailability);
      } catch (error) {
        console.error("Error removing event:", error);
        setError(`Failed to remove event: ${error.message}`);
      }
    }
  };

  const handleTimeSlotClick = (day, startTime, endTime, isRepeating, totalClasses, link) => {
    if (userType === "student") {
      if (endTime - startTime >= 1) {
        const slot = {
          date: calculateSelectedDate(day, weekOffset),
          startTime: startTime,
          endTime: Math.min(startTime + 1, endTime),
          isRepeating: isRepeating,
          totalClasses: totalClasses,
          link: link,
        };
        setSelectedSlot(slot);
        setShowBookingOverlay(true);
      }
    } else {
      handleRemove(day, startTime, endTime);
    }
  };

  const Events = () => {
    if (!Array.isArray(availability)) {
      return null;
    }

    const { monday, sunday } = getWeekBounds(weekOffset);
    const mondayBound = normalizeToMidnight(monday);
    const sundayBound = normalizeToMidnight(sunday);

    const availabilityEvents = availability.map((event, index) => {
      if (!event?.date?.year || !event?.date?.month || !event?.date?.day) {
        return null;
      }

      try {
        const eventDate = normalizeToMidnight(event.date);

        if (eventDate >= mondayBound && eventDate <= sundayBound) {
          const eventDay = new Date(event.date.year, event.date.month - 1, event.date.day).getDay();
          const adjustedWeekday = eventDay === 0 ? 7 : eventDay;

          return (
            <EventDisplay
              key={`avail_${index}`}
              day={adjustedWeekday}
              endTime={event.endTime}
              startTime={event.startTime}
              isBooking={false}
              isRepeating={event.isRepeating}
              repeatIndex={event.repeatIndex}
              totalClasses={event.totalClasses}
              link={event.link}
            />
          );
        }
        return null;
      } catch (error) {
        console.error("Error processing event:", error);
        return null;
      }
    });

    const bookingEvents = bookings.map((booking, index) => {
      try {
        const bookingDate = normalizeToMidnight(booking.date);

        if (bookingDate >= mondayBound && bookingDate <= sundayBound) {
          const bookingDay = new Date(booking.date.year, booking.date.month - 1, booking.date.day).getDay();
          const adjustedWeekday = bookingDay === 0 ? 7 : bookingDay;

          return (
            <EventDisplay
              key={`booking_${index}`}
              day={adjustedWeekday}
              endTime={booking.endTime}
              startTime={booking.startTime}
              isBooking={true}
              studentId={booking.studentId}
            />
          );
        }
        return null;
      } catch (error) {
        console.error("Error processing booking:", error);
        return null;
      }
    });

    return (
      <ol
        className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
        style={{ gridTemplateRows: "1.75rem repeat(288, minmax(0, 1fr)) auto" }}
      >
        {availabilityEvents}
        {bookingEvents}
      </ol>
    );
  };

  const EventDisplay = ({
    day,
    startTime,
    endTime,
    isBooking,
    studentId,
    isRepeating,
    repeatIndex,
    totalClasses,
    link,
  }) => {
    const startRow = startTime * 12 + 2;
    const EndRows = (endTime - startTime) * 12;

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
        className={`relative mt-px hidden ${WEEKDAY_COLUMN_MAPPING[day]} sm:flex`}
        style={{ gridRow: `${startRow} / span ${EndRows}` }}
      >
        <a
          onClick={() => !isBooking && handleTimeSlotClick(day, startTime, endTime, isRepeating, totalClasses, link)}
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

  const VerticalGrid = () => {
    return (
      <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
        <div className="col-start-1 row-span-full" data-day="Monday"></div>
        <div className="col-start-2 row-span-full" data-day="Tuesday"></div>
        <div className="col-start-3 row-span-full" data-day="Wednesday"></div>
        <div className="col-start-4 row-span-full" data-day="Thursday"></div>
        <div className="col-start-5 row-span-full" data-day="Friday"></div>
        <div className="col-start-6 row-span-full" data-day="Saturday"></div>
        <div className="col-start-7 row-span-full" data-day="Sunday"></div>
        <div className="col-start-8 row-span-full w-8"></div>
      </div>
    );
  };

  const WeekdayHeader = () => {
    const { monday } = getWeekBounds(weekOffset);
    const mondayDate = new Date(monday.year, monday.month - 1, monday.day);
    const weekDates = generateWeekDates(mondayDate);

    return (
      <div className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8">
        <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
          {WEEKDAY_LABELS.mobile.map((day, i) => (
            <button key={i} type="button" className="flex flex-col items-center pb-3 pt-2">
              {day}
              <span
                className={`mt-1 flex h-8 w-8 items-center justify-center font-semibold ${
                  weekDates[i].isToday ? "rounded-full bg-indigo-600 text-white" : "text-gray-900"
                }`}
              >
                {weekDates[i].date}
              </span>
            </button>
          ))}
        </div>

        <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
          <div className="col-end-1 w-14"></div>
          {WEEKDAY_LABELS.full.map((day, i) => (
            <div key={i} className="flex items-center justify-center py-3">
              <span className="flex items-baseline">
                {day}
                <span
                  className={`ml-1.5 ${
                    weekDates[i].isToday
                      ? "flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white"
                      : "items-center justify-center font-semibold text-gray-900"
                  }`}
                >
                  {weekDates[i].date}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Loading States
  if (userType === "teacher" && !user?.uid) {
    return <div>Loading user data...</div>;
  }

  if (userType === "student" && !teacherData?.uid) {
    return <div>Please select a teacher</div>;
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="isolate flex flex-auto flex-col overflow-auto bg-white">
          <div className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full" style={{ width: "165%" }}>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousWeek}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous Week
              </button>
              <button onClick={handleNextWeek} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next Week
              </button>
            </div>
            <WeekdayHeader />

            <div className="flex flex-auto">
              <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100"></div>
              <div className="grid flex-auto grid-cols-1 grid-rows-1">
                <div
                  className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                  style={{
                    gridTemplateRows: "repeat(48, minmax(3.5rem, 1fr))",
                  }}
                >
                  <div className="row-end-1 h-7"></div>
                  <div>
                    {" "}
                    <div className="calendarText">12AM</div>{" "}
                  </div>
                  <div> </div>
                  <div>
                    {" "}
                    <div className="calendarText">1AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">2AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">3AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">4AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">5AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">6AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">7AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">8AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">9AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">10AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">11AM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">12PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">1PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">2PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">3PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">4PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">5PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">6PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">7PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">8PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">9PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">10PM</div>{" "}
                  </div>
                  <div></div>
                  <div>
                    {" "}
                    <div className="calendarText">11PM</div>{" "}
                  </div>
                  <div></div>
                </div>

                <VerticalGrid />

                <Events />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showBookingOverlay && <BookingOverlay />}
    </>
  );
}
