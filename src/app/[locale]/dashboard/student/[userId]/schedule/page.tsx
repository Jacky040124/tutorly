"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Student } from "@/types/student";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { adaptToCalendarEvent, formatTime } from "@/lib/utils";
import { Event } from "@/types/event";
import { useActionState } from "react";
import { addFeedback, getUserById } from "@/app/[locale]/action";

interface EventWindowProps {
  event: Event;
  show: boolean;
  onClose: () => void;
  student: Student;
}

function StudentEventWindow({ event, show, onClose, student }: EventWindowProps) {
  const { user, setUser } = useUser();
  const [rating, setRating] = useState<number>(event.bookingDetails?.feedback?.rating || 0);
  const [feedbackText, setFeedbackText] = useState<string>(event.bookingDetails?.feedback?.comment || "");
  const [state, formAction, isPending] = useActionState(addFeedback, { message: "", error: null });
  const t = useTranslations("Dashboard.Student.Schedule.StudentEventWindow");

  const eventDate = new Date(event.date.year, event.date.month - 1, event.date.day);
  const timeString = `${formatTime(event.date.startTime)} - ${formatTime(event.date.endTime)}`;

  async function handleFormAction(formData: FormData) {
    formAction(formData);
    const newUser = await getUserById(student.uid);
    setUser(newUser as Student);
  }

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("title")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {eventDate.toLocaleDateString()} • {timeString}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Meeting Link */}
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-4 p-0">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t("status.label")}</span>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  {t(`status.${event.status}`)}
                </span>
              </div>

              {event.meeting_link && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t("meetingLink.label")}</span>
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                    onClick={() => window.open(event.meeting_link, "_blank")}
                  >
                    {t("buttons.joinMeeting")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Homework Section */}
          {event.status.status !== "available" && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{t("homework.label")}</h3>
                {event.bookingDetails?.homework ? (
                  <div className="space-y-2">
                    <a
                      href={event.bookingDetails.homework.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {t("homework.view")}
                    </a>
                    <div className="text-xs text-muted-foreground">
                      {t("homework.added", {
                        date: new Date(event.bookingDetails.homework.addedAt).toLocaleDateString(),
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("homework.none")}</p>
                )}
              </div>
            </>
          )}

          {/* Feedback Section */}

          <Separator className="my-4" />
          <form action={handleFormAction} className="space-y-4">
            <input type="hidden" name="event" value={JSON.stringify(event)} />
            <input type="hidden" name="rating" value={rating} />
            <input type="hidden" name="comment" value={feedbackText} />
            <input type="hidden" name="studentId" value={student.uid} />

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{t("feedback.label")}</h3>
                {/* Google Forms Feedback Link */}
                <a
                  href="https://forms.gle/V8ojbczM52iqzBLD6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Feedback Form
                </a>
                {/* <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 transition-colors ${
                        star <= rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-200"
                      }`}
                    >
                      <Star className="h-5 w-5" fill={star <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div> */}
              </div>

              {/* <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t("feedback.placeholder")}
                className="min-h-[100px] resize-none"
              /> */}

              {state.error && (
                <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  {typeof state.error === "string" ? state.error : "An error occurred"}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("buttons.cancel")}
                </Button>
                <Button type="submit" disabled={!rating || isPending} className="bg-blue-600 hover:bg-blue-700">
                  {isPending ? t("buttons.saving") : t("buttons.saveFeedback")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function StudentSchedule() {
  const { user } = useUser();
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const t = useTranslations("Dashboard.Student.Schedule");
  
  // Add null checks with fallback empty array
  const student = user as Student;
  const events = student?.events || [];
  const calendarEvents = events.map(adaptToCalendarEvent);

  const handleEventClick = (info: any) => {
    const eventId = info.event.extendedProps.eventId;
    const event = events.find((event) => event.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowEventDetails(true);
    }
  };

  // loading state
  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 h-screen">
      {/* Welcome Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
      </Card>

      {/* Calendar */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          themeSystem="standard"
          height="100%"
          initialView="timeGridWeek"
          events={calendarEvents}
          eventClick={handleEventClick}
          allDaySlot={false}
          buttonText={{
            today: t("calendar.today"),
            week: t("calendar.week"),
            day: t("calendar.day"),
          }}
        />
      </div>

      {/* Event Details Window */}
      {selectedEvent && showEventDetails && (
        <StudentEventWindow
          event={selectedEvent}
          show={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          student={student}
        />
      )}
    </div>
  );
}
