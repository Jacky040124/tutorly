"use client";

import { useState, useEffect } from "react";
import { useUser, useBooking, useError } from "@/components/providers";
import { normalizeToMidnight, getWeekBounds, calculateSelectedDate, formatTime } from "@/lib/utils/timeUtils";
import { generateWeekDates, WEEKDAY_LABELS } from "@/lib/utils/dateUtils";
import { getTeacherBookings, getStudentBookings } from "@/services/booking.service";
import BookingOverlay from "./BookingOverlay";
import { CALENDAR_CONFIG, TOTAL_INTERVALS, calculateGridPosition } from "@/lib/utils/calendarUtil";
import { useTranslation } from 'react-i18next';

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

// TODO: Breaks down Calendar component, ensure Single Responsibility, cut down to display only [no more than 200 lines]
export default function Calendar() {
  const { user, selectedTeacher, teacherList, updateAvailability, userLoading } = useUser();
  console.log('Calendar mounted with:', { 
    userType: user?.type, 
    userId: user?.uid,
    selectedTeacher,
    teacherData: teacherList[selectedTeacher]
  });

  const {
    setSelectedSlot,
    showBookingOverlay,
    setShowBookingOverlay,
    setFutureBookings,
    bookings,
    setBookings,
    bookingConfirmed,
  } = useBooking();

  // TODO: Improve state management by moving calendar specific state in a calendarContext
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState([]);

  const { showError } = useError();
  const { monday } = getWeekBounds(weekOffset);
  const mondayDate = new Date(monday.year, monday.month - 1, monday.day);

  const userType = user.type;
  const teacherData = userType === "teacher" ? user : teacherList[selectedTeacher];
  const currentAvailability = userType === "teacher" ? user.availability : teacherList[selectedTeacher]?.availability;

  //TODO: try to combine them
  useEffect(() => {
    if (currentAvailability) {
      // Force re-render when availability changes
      const updatedEvents = currentAvailability.map((event, index) => ({
        ...event,
        key: `avail_${index}_${event.startTime}_${event.endTime}`
      }));
      setEvents(updatedEvents);
    }
  }, [currentAvailability, bookingConfirmed]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid || userLoading) return;

      try {
        let fetchedBookings;
        if (user.type === 'teacher') {
          fetchedBookings = await getTeacherBookings(user.uid);
        } else if (user.type === 'student' && selectedTeacher) {
          fetchedBookings = await getStudentBookings(user.uid);
        }
        
        if (fetchedBookings) {
          setBookings(fetchedBookings);
        }
      } catch (error) {
        showError('Failed to fetch bookings');
        throw error;
      }
    };

    fetchBookings().catch(error => {
      console.error('Error in fetchBookings:', error);
    });
  }, [user, selectedTeacher, userLoading]);

  const handleRemove = async (day, startTime, endTime) => {
    const confirmDelete = window.confirm("Do you want to remove this time slot?");

    if (confirmDelete) {
      try {
        const updatedAvailability = currentAvailability.filter((event) => {
          const eventDate = new Date(event.date.year, event.date.month - 1, event.date.day);
          const eventDay = eventDate.getDay();
          const adjustedEventDay = eventDay === 0 ? 7 : eventDay;

          return !(adjustedEventDay === day && event.startTime === startTime && event.endTime === endTime);
        });

        await updateAvailability(updatedAvailability);
        // Force immediate UI update
        setEvents(updatedAvailability.map((event, index) => ({
          ...event,
          key: `avail_${index}_${event.startTime}_${event.endTime}`
        })));
      } catch (error) {
        console.error("Error removing event:", error);
        showError(`Failed to remove event: ${error.message}`);
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

  const handleAddEvent = async (newEvent) => {
    try {
      // Create a new array with the updated availability
      const updatedAvailability = [...currentAvailability, newEvent];
      
      // Update the database first
      await updateAvailability(updatedAvailability);
      
      // No need to manually set events - let the useEffect handle it
      // The useEffect will trigger when currentAvailability updates
    } catch (error) {
      console.error("Error adding event:", error);
      showError(`Failed to add event: ${error.message}`);
    }
  };

  // TODO: refactor Events into seperate classes
  const Events = () => {
    if (!Array.isArray(currentAvailability)) {
      return null;
    }

    const { monday, sunday } = getWeekBounds(weekOffset);
    const mondayBound = normalizeToMidnight(monday);
    const sundayBound = normalizeToMidnight(sunday);

    const availabilityEvents = events.map((event) => {
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
              key={event.key}
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
        style={{
          gridTemplateRows: `1.75rem repeat(${TOTAL_INTERVALS}, minmax(0, 1fr)) auto`,
        }}
      >
        {availabilityEvents}
        {bookingEvents}
      </ol>
    );
  };

  // TODO: resolve prop drilling in event display
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
    const startRow = calculateGridPosition.startRow(startTime);
    const rowSpan = calculateGridPosition.duration(startTime, endTime);

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
        style={{ gridRow: `${startRow} / span ${rowSpan}` }}
        data-testid={`time-slot-${startTime}`}
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

  const WeekdayHeader = () => {
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

  const TimeLabels = () => {
    const timeSlots = [];
    for (let hour = CALENDAR_CONFIG.START_HOUR; hour < CALENDAR_CONFIG.END_HOUR; hour++) {
      const displayHour = hour % 12 || 12;
      const ampm = hour >= 12 ? "PM" : "AM";

      timeSlots.push(
        <div key={hour}>
          <div className="calendarText">{`${displayHour}${ampm}`}</div>
        </div>,
        <div key={`${hour}-half`}></div>
      );
    }
    return timeSlots;
  };

  const { t } = useTranslation('common');

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="isolate flex flex-auto flex-col overflow-auto bg-white">
          <div className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full" style={{ width: "165%" }}>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('calendar.navigation.previousWeek')}
              </button>
              <h1 className="text-base font-semibold leading-6 text-gray-900">
                <time dateTime={mondayDate.toISOString().slice(0, 7)}>
                  {t(`calendar.months.${mondayDate.toLocaleString("default", { month: "long" }).toLowerCase()}`)} {mondayDate.getFullYear()}
                </time>
              </h1>
              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('calendar.navigation.nextWeek')}
              </button>
            </div>{" "}
            <WeekdayHeader />
            <div className="flex flex-auto">
              <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100"></div>
              <div className="grid flex-auto grid-cols-1 grid-rows-1">
                <div
                  className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                  style={{
                    gridTemplateRows: `repeat(${CALENDAR_CONFIG.HOURS_TO_DISPLAY * 2}, minmax(3.5rem, 1fr))`,
                  }}
                >
                  <div className="row-end-1 h-7"></div>
                  <TimeLabels />
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
