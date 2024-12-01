import { useState } from "react";
import { useUser, useError, useOverlay } from "@/components/providers";
import DayField from "@/components/calendar/DayField";
import ErrorMessage from "@/components/common/ErrorMessage";
import { timeToDecimal } from "@/lib/utils/timeUtils";
import { InputField, ToggleField } from "@/components/common/Fields";
import { getRepeatingDates } from "@/lib/utils/dateUtils";
import { ZoomService } from "@/services/zoom.service";

// onEventAdded is an optional prop
export default function CalendarOverlay() {
    const { user, availability, updateAvailability } = useUser();
    const { setShowCalendarOverlay } = useOverlay();


  const [date, setDate] = useState(null);
  const [start, setStart] = useState("");
  const {error, setError} = useError();

  const [end, setEnd] = useState("");
  const [isRepeating, setiIsRepeating] = useState(false);
  

  const handleCancel = () => {
    setShowCalendarOverlay(false);
  };
  const handleDate = (e) => {
    setDate(e);
  };
  const handleStart = (e) => {
    setStart(e.target.value);
  };
  const handleEnd = (e) => {
    setEnd(e.target.value);
  };
  const handleRepeating = (e) => {
    setiIsRepeating((prev) => !prev);
  };

  const checkOverlap = (availability, newEvent) => {
    for (let i = 0; i < availability.length; i++) {
      const curEvent = availability[i];

      if (
        curEvent.date.year === newEvent.date.year &&
        curEvent.date.month === newEvent.date.month &&
        curEvent.date.day === newEvent.date.day
      ) {
        if (
          (newEvent.startTime >= curEvent.startTime &&
            newEvent.startTime < curEvent.endTime) ||
          (newEvent.endTime > curEvent.startTime &&
            newEvent.endTime <= curEvent.endTime) ||
          (newEvent.startTime <= curEvent.startTime &&
            newEvent.endTime >= curEvent.endTime)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const startDecimal = timeToDecimal(start);
    const endDecimal = timeToDecimal(end);
    
    // Field validations
    if (!date || !start || !end) {
      setError("Please fill in all fields");
      return;
    } else if (startDecimal >= endDecimal) {
      setError("End time must be later than start time");
      return;
    }

    const repeatGroupId = isRepeating ? `repeat_${Date.now()}` : null;
    const dates = isRepeating ? getRepeatingDates(date) : [date];

    try {
      // Create Zoom meetings for each event
      const newEvents = await Promise.all(dates.map(async (eventDate, index) => {
        try {
          const meetingRequest = {
            teacherId: user.uid,
            date: eventDate,
            startTime: startDecimal,
            endTime: endDecimal
          };
          
          const meeting = await ZoomService.createMeeting(meetingRequest);
          console.log("Created Zoom meeting with link:", meeting.link);
          
          return {
            date: eventDate,
            startTime: startDecimal,
            endTime: endDecimal,
            isRepeating,
            repeatGroupId,
            repeatIndex: isRepeating ? index : null,
            totalClasses: isRepeating ? dates.length : null,
            link: meeting.link
          };
        } catch (error) {
          console.error("Failed to create Zoom meeting:", error);
          // If Zoom meeting creation fails, continue without the link
          return {
            date: eventDate,
            startTime: startDecimal,
            endTime: endDecimal,
            isRepeating,
            repeatGroupId,
            repeatIndex: isRepeating ? index : null,
            totalClasses: isRepeating ? dates.length : null,
            link: null
          };
        }
      }));


      // Overlap check
      const hasOverlap = newEvents.some(event => checkOverlap(availability, event));
      if (hasOverlap) {
        setError("One or more time slots overlap with existing events");
        return;
      }

      await updateAvailability([...availability, ...newEvents]);
      setShowCalendarOverlay(false);
    } catch (error) {
      console.error("Error saving events:", error);
      setError(`Error saving events: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      {error && <ErrorMessage message={error} />}
      <div>
        <div
          className="relative z-10"
          aria-labelledby="slide-over-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0"></div>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <div className="pointer-events-auto w-screen max-w-md">
                  <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-grren-700 px-4 py-6 sm:px-6 flex items-center justify-between">
                        <h2
                          className="text-base font-semibold leading-6 text-white"
                          id="slide-over-title"
                        >
                          New Event
                        </h2>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            onClick={handleCancel}
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
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pb-5 pt-6">
                            <DayField onChange={handleDate} value={date} />
                            <InputField
                              onChange={handleStart}
                              name="Start Time"
                              value={start}
                            />
                            <InputField
                              onChange={handleEnd}
                              name="End Time"
                              value={end}
                            />
                            <ToggleField
                              onChange={handleRepeating}
                              name="Repeating"
                              value={isRepeating}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        onClick={handleCancel}
                        type="button"
                        className="overlay-button-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        type="submit"
                        className="ml-4 overlay-button-primary"
                      >
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
