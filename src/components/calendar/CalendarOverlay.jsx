import { useState } from "react";
import { useUser, useError, useOverlay } from "@/components/providers";
import DayField from "@/components/calendar/DayField";
import ErrorMessage from "@/components/common/ErrorMessage";
import { timeToDecimal } from "@/lib/utils/timeUtils";
import { InputField, ToggleField } from "@/components/common/Fields";
import { getRepeatingDates } from "@/lib/utils/dateUtils";
import { ZoomService } from "@/services/zoom.service";
import { useTranslation } from "react-i18next";
import { checkOverlap } from "@/lib/utils/calendarUtil";
import { useBooking } from "@/components/providers";

export default function CalendarOverlay({ onEventAdded }) {
  const { user, availability, updateAvailability } = useUser();
  const { setShowCalendarOverlay } = useOverlay();
  const [date, setDate] = useState(null);
  const [start, setStart] = useState("");
  const { error, showError } = useError();
  const { t } = useTranslation("common");
  const { bookings } = useBooking();

  const [end, setEnd] = useState("");
  const [isRepeating, setIsRepeating] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();

    console.log("repeating:", isRepeating);

    const startDecimal = timeToDecimal(start);
    const endDecimal = timeToDecimal(end);

    // Field validations
    if (!date || !start || !end) {
      showError(t("calendarOverlay.errors.fillAllFields"));
      return;
    } else if (startDecimal >= endDecimal) {
      showError(t("calendarOverlay.errors.endTimeLater"));
      return;
    }

    const repeatGroupId = isRepeating ? `repeat_${Date.now()}` : null;
    const dates = isRepeating ? getRepeatingDates(date) : [date];

    try {
      const newEvents = await Promise.all(
        dates.map(async (eventDate, index) => {
          try {
            const meetingRequest = {
              teacherId: user.uid,
              date: eventDate,
              startTime: startDecimal,
              endTime: endDecimal,
            };

            const meeting = await ZoomService.createMeeting(meetingRequest);

            return {
              date: eventDate,
              startTime: startDecimal,
              endTime: endDecimal,
              isRepeating,
              repeatGroupId,
              repeatIndex: isRepeating ? index : null,
              totalClasses: isRepeating ? dates.length : null,
              link: meeting.link,
            };
          } catch (error) {
            console.error("Failed to create Zoom meeting:", error);
            return null;
          }
        })
      );

      const validEvents = newEvents.filter((event) => event !== null);

      const existingEvents = [...availability, ...bookings];

      for (const event of validEvents) {
        const { hasOverlap, type } = checkOverlap(existingEvents, event);
        
        if (hasOverlap) {
          const errorKey = type === 'booking' 
            ? 'calendarOverlay.errors.bookingOverlap'
            : 'calendarOverlay.errors.availabilityOverlap';
          
          showError(t(errorKey));
          return;
        }
      }

      await onEventAdded(validEvents);
      setShowCalendarOverlay(false);
    } catch (error) {
      showError(`Error saving events: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      {error && <ErrorMessage message={error} />}
      <div>
        <div className="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0"></div>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <div className="pointer-events-auto w-screen max-w-md">
                  <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-grren-700 px-4 py-6 sm:px-6 flex items-center justify-between">
                        <h2 className="text-base font-semibold leading-6 text-white" id="slide-over-title">
                          New Event
                        </h2>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            onClick={() => setShowCalendarOverlay(false)}
                            type="button"
                            className="rounded-md bg-grren-700 text-grren-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          >
                            <span className="sr-only">Close panel</span>
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pb-5 pt-6">
                            <DayField
                              onChange={(e) => {
                                setDate(e);
                              }}
                              value={date}
                            />
                            <InputField
                              onChange={(e) => {
                                setStart(e.target.value);
                              }}
                              name="Start Time"
                              value={start}
                            />
                            <InputField
                              onChange={(e) => {
                                setEnd(e.target.value);
                              }}
                              name="End Time"
                              value={end}
                            />
                            <ToggleField
                              onChange={(e) => setIsRepeating((prev) => !prev)}
                              name="Repeating"
                              value={isRepeating}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        onClick={() => setShowCalendarOverlay(false)}
                        type="button"
                        className="overlay-button-secondary"
                      >
                        Cancel
                      </button>
                      <button onClick={handleSave} type="submit" className="ml-4 overlay-button-primary">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
