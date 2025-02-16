"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@/hooks/useUser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateBookingStatus } from "@/app/action";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { filterBookingsByTime, convertToCalendarDate } from "@/lib/utils/calendarUtil";
import { useTranslations } from "next-intl";
import { Teacher } from "@/types/teacher";
import { EventClickArg } from "@fullcalendar/core";
import { BookingCard } from "@/components/BookingCard";
import { Event } from "@/types/event";

// Import plugins statically
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";

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

const FullCalendar = dynamic(
  () =>
    import("@fullcalendar/react").then((mod) => {
      // Inject custom styles
      const style = document.createElement("style");
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

export default function TeacherCalendar({ events }: { events: Event[] }) {
  const calendarRef = useRef<any>(null);
  const { user, removeEvents } = useUser();
  const [showUpcoming, setShowUpcoming] = useState(true);
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

  // Filter bookings based on upcoming/past
  const filteredEvents = filterBookingsByTime(events, showUpcoming);

  // Convert availability to events
  const availabilityEvents =
    (user as Teacher)?.events?.map((slot, index) => ({
      id: `availability_${index}`,
      title: "Available",
      start: convertToCalendarDate(slot.date, slot.date.startTime),
      end: convertToCalendarDate(slot.date, slot.date.endTime),
      backgroundColor: "#10B981",
      borderColor: "#059669",
      extendedProps: {
        ...slot,
        isAvailability: true,
        type: "availability",
      },
    })) || [];

  // Convert bookings to events
  const bookingEvents = events.map((event: Event) => ({
    id: event.id,
    title: event.title || "Booked",
    start: convertToCalendarDate(event.date, event.date.startTime),
    end: convertToCalendarDate(event.date, event.date.endTime),
    backgroundColor: "#3B82F6",
    borderColor: "#2563EB",
    extendedProps: {
      ...event,
      meeting_link: event.meeting_link || "",
      maxStudents: 1,
      enrolledStudentIds: [],
      isRepeating: !!event.bulkId,
      repeatGroupId: event.bulkId || `single_${event.id}`,
      repeatIndex: event.lessonNumber || 0,
      totalClasses: event.bookingDetails?.repeatInfo?.totalClasses || 1,
      type: "booking",
    },
  }));

  const handleEventClick = useCallback((info: EventClickArg) => {
    if (info.event.extendedProps.type === "availability") {
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
        await removeEvents(eventData.extendedProps);
      } else {
        const startDate = new Date(eventData.start);

        const slotToRemove = events.find((slot) => {
          return (
            slot.date.year === startDate.getFullYear() &&
            slot.date.month === startDate.getMonth() + 1 &&
            slot.date.day === startDate.getDate() &&
            slot.date.startTime === startDate.getHours() &&
            slot.date.endTime === new Date(eventData.end).getHours()
          );
        });

        if (slotToRemove) {
          await removeEvents(slotToRemove);
        }
      }
    } catch (error) {
      console.error("Failed to remove time slot");
    } finally {
      setSlotToDelete(null);
    }
  }, [slotToDelete, removeEvents, events]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* calendar card */}
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
            {filteredEvents.length > 0 ? (
              <div className="space-y-3">
                {filteredEvents.map((booking, index) => (
                  <BookingCard key={index} events={booking} />
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
