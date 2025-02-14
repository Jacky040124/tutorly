"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@/hooks/useUser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { updateBookingStatus } from "@/app/action";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { filterBookingsByTime, convertToCalendarDate } from "@/lib/utils/calendarUtil";
import { Booking } from "@/types/booking";
import { fetchUserNickname } from "@/services/user.service";
import { useTranslations } from "next-intl";
import { Teacher } from "@/types/user";
import { EventClickArg } from '@fullcalendar/core';
import TeacherProfileWindow from "@/components/popup/teacher/ProfileWindow";


// Import plugins statically
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';

// Add custom styles
const calendarStyles = `
.fc-timegrid-slot {
  height: 48px !important;
}
.fc-timegrid-event {
  background-color: #3B82F6 !important;
  border: none !important;
  padding: 2px !important;
}
.fc-timegrid-event .fc-event-main {
  padding: 2px !important;
}
.fc-timegrid-event .fc-event-time {
  font-size: 0.75rem !important;
  font-weight: 500 !important;
}
.fc-timegrid-event .fc-event-title {
  font-size: 0.75rem !important;
}
.fc-theme-standard td, .fc-theme-standard th {
  border-color: #e5e7eb !important;
}
`;

const FullCalendar = dynamic(() => 
  import('@fullcalendar/react').then((mod) => {
    // Inject custom styles
    const style = document.createElement('style');
    style.textContent = calendarStyles;
    document.head.appendChild(style);
    return mod.default;
  }), 
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    ),
  }
);

export default function TeacherCalendar({ bookings }: { bookings: Booking[] }) {
  const calendarRef = useRef<any>(null);
  const { user, availability, removeAvailability } = useUser();
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [studentNames, setStudentNames] = useState<{ [key: string]: string }>({});
  const [slotToDelete, setSlotToDelete] = useState<any | null>(null);

  const t = useTranslations("Dashboard.Common");
  const tCalendar = useTranslations("Calendar");
  const tStudent = useTranslations("Dashboard.Student");

  const handleBookingStatusChange = useCallback(
    async (bookingId: string, newStatus: "completed" | "confirmed" | "cancelled") => {
      try {
        await updateBookingStatus(bookingId, newStatus);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error updating booking status: ${error.message}`);
        }
      }
    },
    []
  );

  // Fetch student names
  useEffect(() => {
    const fetchNames = async () => {
      if (!user?.uid) return;

      try {
        const names: { [key: string]: string } = {};
        for (const booking of bookings) {
          if (!studentNames[booking.studentId]) {
            const nickname = await fetchUserNickname(booking.studentId);
            if (nickname) {
              names[booking.studentId] = nickname;
            }
          }
        }
        if (Object.keys(names).length > 0) {
          setStudentNames((prev) => ({ ...prev, ...names }));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error fetching student names: ${error.message}`);
        }
      }
    };

    fetchNames();
  }, [user?.uid, bookings, studentNames]);

  // Filter bookings based on upcoming/past
  const filteredBookings = filterBookingsByTime(bookings, showUpcoming);

  // Convert availability to events
  const availabilityEvents = ((user as Teacher)?.availability?.map((slot, index) => ({
    id: `availability_${index}`,
    title: "Available",
    start: convertToCalendarDate(slot.date, slot.startTime),
    end: convertToCalendarDate(slot.date, slot.endTime),
    backgroundColor: '#10B981',
    borderColor: '#059669',
    extendedProps: {
      ...slot,
      isAvailability: true,
      type: 'availability'
    }
  })) || []);

  // Convert bookings to events
  const bookingEvents = bookings.map((booking) => ({
    id: booking.id,
    title: booking.title || "Booked",
    start: convertToCalendarDate(booking.date, booking.startTime),
    end: convertToCalendarDate(booking.date, booking.endTime),
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    extendedProps: {
      ...booking,
      meeting_link: booking.link || "",
      maxStudents: 1,
      enrolledStudentIds: [],
      isRepeating: !!booking.bulkId,
      repeatGroupId: booking.bulkId || `single_${booking.id}`,
      repeatIndex: booking.lessonNumber || 0,
      totalClasses: booking.totalLessons || 1,
      type: 'booking'
    }
  }));

  const handleEventClick = useCallback((info: EventClickArg) => {
    if (info.event.extendedProps.type === 'availability') {
      setSlotToDelete(info.event);
    }
  }, []);

  const handleToday = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
    }
  }, []);

  const handlePrev = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
    }
  }, []);

  const handleNext = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
    }
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!slotToDelete) return;

    try {
      const eventData = slotToDelete;

      if (eventData.extendedProps) {
        await removeAvailability(eventData.extendedProps);
      } else {
        const startDate = new Date(eventData.start);

        const slotToRemove = availability.find((slot) => {
          return (
            slot.date.year === startDate.getFullYear() &&
            slot.date.month === startDate.getMonth() + 1 &&
            slot.date.day === startDate.getDate() &&
            slot.startTime === startDate.getHours() &&
            slot.endTime === new Date(eventData.end).getHours()
          );
        });

        if (slotToRemove) {
          await removeAvailability(slotToRemove);
        }
      }
    } catch (error) {
      console.error("Failed to remove time slot");
    } finally {
      setSlotToDelete(null);
    }
  }, [slotToDelete, removeAvailability, availability]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <Card className="lg:col-span-9 rounded-xl shadow-md">
        <CardContent className="p-4 h-[800px]">
          <div className="h-full flex flex-col">
            <div className="flex justify-between p-4 border-b">
              <div className="space-x-2">
                <button
                  onClick={handleToday}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                >
                  Today
                </button>
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div ref={calendarRef}>
                <FullCalendar
                  plugins={[timeGridPlugin, dayGridPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridWeek,timeGridDay",
                  }}
                  slotMinTime="06:00:00"
                  slotMaxTime="22:00:00"
                  events={[...availabilityEvents, ...bookingEvents]}
                  eventClick={handleEventClick}
                  editable={false}
                  height="100%"
                  allDaySlot={false}
                  slotDuration="01:00:00"
                  slotLabelFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: false,
                  }}
                  dayHeaderFormat={{
                    weekday: "short",
                    month: "numeric",
                    day: "numeric",
                    omitCommas: true,
                  }}
                  eventTimeFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: false,
                  }}
                  expandRows={true}
                  stickyHeaderDates={true}
                  firstDay={1}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Card - Takes up 3 columns on large screens */}
      <Card className="lg:col-span-3 rounded-xl shadow-md">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle className="text-lg font-medium">{tStudent("title")}</CardTitle>
              <CardDescription>{showUpcoming ? tStudent("status.upcoming") : tStudent("status.past")}</CardDescription>
            </div>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming" onClick={() => setShowUpcoming(true)}>
                  {tStudent("tabs.upcoming")}
                </TabsTrigger>
                <TabsTrigger value="past" onClick={() => setShowUpcoming(false)}>
                  {tStudent("tabs.past")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[700px]">
            {filteredBookings.length > 0 ? (
              <div className="space-y-3">
                {filteredBookings.map((booking, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.date.year, booking.date.month - 1, booking.date.day).toLocaleDateString(
                            "en-US",
                            { weekday: "long", month: "short", day: "numeric" }
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.startTime}:00 - {booking.endTime}:00
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.link && (
                          <a
                            href={booking.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {tStudent("buttons.meet")}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {tStudent("student")}: {studentNames[booking.studentId] || "Loading..."}
                        </Badge>
                        {!showUpcoming && (
                          <Select
                            value={booking.status}
                            onValueChange={(value) =>
                              handleBookingStatusChange(booking.id, value as "completed" | "confirmed" | "cancelled")
                            }
                          >
                            <SelectTrigger className="w-[130px] h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">{tStudent("status.confirmed")}</SelectItem>
                              <SelectItem value="completed">{tStudent("status.completed")}</SelectItem>
                              <SelectItem value="cancelled">{tStudent("status.cancelled")}</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    {!showUpcoming && (
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <div className="flex items-center gap-2">
                          {!booking.homework && (
                            <TeacherProfileWindow bookingId={booking.id} t={t} tStudent={tStudent} />
                          )}

                          {booking.feedback ? (
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7">
                                    <Star className="h-3 w-3 mr-1" />
                                    {tStudent("buttons.viewFeedback")}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{tStudent("feedback.title")}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-1">
                                      <span>{tStudent("feedback.rating")}:</span>
                                      <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              booking.feedback?.rating
                                                ? i < booking.feedback.rating
                                                  ? "text-yellow-400 fill-current"
                                                  : "text-gray-300"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    {booking.feedback.comment && (
                                      <div>
                                        <span className="font-medium">{tStudent("feedback.comment")}:</span>
                                        <p className="text-sm mt-1">{booking.feedback.comment}</p>
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                      <p>
                                        {tStudent("feedback.created")}:{" "}
                                        {new Date(booking.feedback.createdAt).toLocaleDateString()}
                                      </p>
                                      {booking.feedback.updatedAt && (
                                        <p>
                                          {tStudent("feedback.updated")}:{" "}
                                          {new Date(booking.feedback.updatedAt).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      booking.feedback?.rating
                                        ? i < booking.feedback.rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {tStudent("feedback.none")}
                              </span>
                            </div>
                          )}
                        </div>
                        {booking.bulkId && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {booking.lessonNumber} {tStudent("lessonCount.of")} {booking.totalLessons}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                {showUpcoming ? tStudent("noUpcoming") : tStudent("noPast")}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!slotToDelete} onOpenChange={(open) => !open && setSlotToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("calendarOverlay.removeSlot.title")}</DialogTitle>
          </DialogHeader>
          <p>{t("calendarOverlay.removeSlot.confirmation")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotToDelete(null)}>
              {t("calendarOverlay.buttons.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t("calendarOverlay.buttons.remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
