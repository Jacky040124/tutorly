"use client";

import { useState, useEffect } from "react";
import { useUser, useBooking, useError, useOverlay } from "@/components/providers";
import { getWeekBounds, calculateSelectedDate } from "@/lib/utils/timeUtils";
import { generateWeekDates, WEEKDAY_LABELS } from "@/lib/utils/dateUtils";
import { getStudentBookings } from "@/services/booking.service";
import BookingOverlay from "./BookingOverlay";
import { CALENDAR_CONFIG, TOTAL_INTERVALS } from "@/lib/utils/calendarUtil";
import { useTranslation } from "react-i18next";
import CalendarOverlay from "./CalendarOverlay";
import { AvailabilityEvent } from "./AvailabilityEvent";
import { BookingEvent } from "./BookingEvent";
import { useCalendar } from "../providers/CalendarContext";

export default function Calendar() {
  const { user, selectedTeacher, teacherList, userLoading } = useUser();
  const { setSelectedSlot, showBookingOverlay, setShowBookingOverlay, bookings, setBookings } = useBooking();
  const { showCalendarOverlay } = useOverlay();
  const { weekOffset, setWeekOffset } = useCalendar();
  const { showError } = useError();

  const { t } = useTranslation("common");
  const { monday } = getWeekBounds(weekOffset);
  const mondayDate = new Date(monday.year, monday.month - 1, monday.day);
  const teacherData = teacherList[selectedTeacher];
  const [availabilityToDisplay, setAvailabilityToDisplay] = useState([]);
  const weekDates = generateWeekDates(mondayDate);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid || userLoading) return;

      try {
        let fetchedBookings;
        if (selectedTeacher) {
          fetchedBookings = await getStudentBookings(user.uid);
        }

        if (fetchedBookings) {
          setBookings(fetchedBookings);
        }
      } catch (error) {
        showError("Failed to fetch bookings");
        throw error;
      }
    };

    setAvailabilityToDisplay(teacherData?.availability || []);
    fetchBookings().catch((error) => {
      console.error("Error in fetchBookings:", error);
    });
  }, [user, selectedTeacher, userLoading]);

  const handleTimeSlotClick = (day, startTime, endTime, isRepeating, totalClasses, link) => {
    const slot = {
      date: calculateSelectedDate(day, weekOffset),
      startTime: startTime,
      endTime: Math.min(startTime + 1, endTime),
      isRepeating: isRepeating,
      totalClasses: totalClasses,
      link: link,
    };
    console.log("link:", slot.link);
    setSelectedSlot(slot);
    setShowBookingOverlay(true);
  };

  const availabilityEvents = availabilityToDisplay.map((event) => {
    const eventKey = `${event.date.year}_${event.date.month}_${event.date.day}_${event.startTime}`;
    return <AvailabilityEvent key={eventKey} event={event} onRemove={handleTimeSlotClick} />;
  });


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
                {t("calendar.navigation.previousWeek")}
              </button>
              <h1 className="text-base font-semibold leading-6 text-gray-900">
                <time dateTime={mondayDate.toISOString().slice(0, 7)}>
                  {t(`calendar.months.${mondayDate.toLocaleString("default", { month: "long" }).toLowerCase()}`)}{" "}
                  {mondayDate.getFullYear()}
                </time>
              </h1>
              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("calendar.navigation.nextWeek")}
              </button>
            </div>{" "}
            <div className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8">
              <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                {WEEKDAY_LABELS.mobile.map((day, i) => (
                  <button key={i} type="button" className="flex flex-col items-center pb-3 pt-2">
                    {day}
                    <span
                      className={`mt-1 flex h-8 w-8 items-center justify-center font-semibold ${
                        weekDates[i].isToday ? "rounded-full bg-green-600 text-white" : "text-gray-900"
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
                            ? "flex h-8 w-8 items-center justify-center rounded-full bg-green-600 font-semibold text-white"
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
                <ol
                  className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
                  style={{
                    gridTemplateRows: `1.75rem repeat(${TOTAL_INTERVALS}, minmax(0, 1fr)) auto`,
                  }}
                >
                  {availabilityEvents}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showBookingOverlay && <BookingOverlay />}
      {showCalendarOverlay && <CalendarOverlay onEventAdded={handleAddEvent} />}
    </>
  );
}
