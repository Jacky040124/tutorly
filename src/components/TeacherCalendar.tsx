"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import { useUser } from '@/hooks/useUser';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Plus, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { updateBookingStatus, updateBookingHomework } from "@/services/booking.service";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { filterBookingsByTime } from "@/utils/calendarUtils";
import { Booking } from "@/types/booking";
import { CalendarEvent } from "@/types/event";
import { useTranslations } from 'next-intl';

const Calendar = dynamic<any>(() => import('@toast-ui/react-calendar').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
    </div>
  ),
});

type CalendarInstance = {
  getInstance: () => {
    today: () => void;
    prev: () => void;
    next: () => void;
    changeView: (view: string) => void;
  };
};

type EventClickData = {
  event: CalendarEvent;
};

export default function TeacherCalendar({ bookings }: { bookings: Booking[] }) {
  const calendarRef = useRef<CalendarInstance | null>(null);
  const { user, availability, removeAvailability, fetchUserNickname } = useUser();
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [studentNames, setStudentNames] = useState<{ [key: string]: string }>({});
  const [homeworkLink, setHomeworkLink] = useState("");
  const [slotToDelete, setSlotToDelete] = useState<CalendarEvent | null>(null);

  const t = useTranslations('Dashboard.Common');
  const tCalendar = useTranslations('Calendar');
  const tStudent = useTranslations('Dashboard.Student');

  const handleBookingStatusChange = async (bookingId: string, newStatus: "completed" | "confirmed" | "cancelled") => {
    try {
      await updateBookingStatus(bookingId, newStatus);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating booking status: ${error.message}`);
      }
    }
  };

  const handleHomeworkSubmit = async (bookingId: string) => {
    try {
      await updateBookingHomework(bookingId, homeworkLink);
      setHomeworkLink(""); // Reset input
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating homework: ${error.message}`);
      }
    }
  };

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
        setStudentNames(prev => ({ ...prev, ...names }));
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error fetching student names: ${error.message}`);
        }
      }
    };

    fetchNames();
  }, [user, bookings]);

  // Filter bookings based on upcoming/past
  const filteredBookings = filterBookingsByTime(bookings, showUpcoming);

  const calendars = [
    {
      id: "availability",
      name: "Available Slots",
      backgroundColor: "#10B981",
      borderColor: "#059669",
      dragBackgroundColor: "#A7F3D0",
      color: "#065F46",
    },
    {
      id: "bookings",
      name: "Booked Classes",
      backgroundColor: "#3B82F6",
      borderColor: "#2563EB",
      dragBackgroundColor: "#BFDBFE",
      color: "#1E40AF",
    },
  ];

  // Convert availability to events
  const availabilityEvents =
    user?.type === "teacher" ? user.availability?.map((slot) => {
      const year = slot.date.year;
      const month = String(slot.date.month).padStart(2, "0");
      const day = String(slot.date.day).padStart(2, "0");

      const start = `${year}-${month}-${day}T${String(slot.startTime).padStart(2, "0")}:00:00`;
      const end = `${year}-${month}-${day}T${String(slot.endTime).padStart(2, "0")}:00:00`;

      return {
        id: slot.createdAt,
        calendarId: "availability",
        title: "Available",
        category: "time",
        start,
        end,
        isReadOnly: true,
        raw: {
          ...slot,
          isAvailability: true,
        },
      };
    }) || [] : [];

  // Convert bookings to events
  const bookingEvents = bookings.map((booking) => {
    const year = booking.date.year;
    const month = String(booking.date.month).padStart(2, "0");
    const day = String(booking.date.day).padStart(2, "0");

    const start = `${year}-${month}-${day}T${String(booking.startTime).padStart(2, "0")}:00:00`;
    const end = `${year}-${month}-${day}T${String(booking.endTime).padStart(2, "0")}:00:00`;

    return {
      id: booking.id,
      calendarId: "bookings",
      title: booking.title || "Booked",
      category: "time",
      start,
      end,
      isReadOnly: true,
      raw: {
        ...booking,
        isBooking: true,
      },
    };
  });

  const events = [...availabilityEvents, ...bookingEvents];

  const template = {
    time(event: CalendarEvent) {
      const date = new Date(event.start);
      const formattedDate = !isNaN(date.getTime())
        ? date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "";

      const isBooking = event.calendarId === "bookings";
      const bgColor = isBooking ? "bg-blue-500" : "bg-emerald-500";

      return `
        <div class="px-2 py-1.5 ${bgColor} flex flex-col min-h-[70px]">
          <div class="flex items-start justify-between">
            <div class="flex flex-col flex-1">
              <div class="text-sm font-medium text-white">${event.title}</div>
              <div class="text-xs text-white/90">${formattedDate}</div>
              <div class="text-xs text-white/90">${new Date(event.start).getHours()}:00 - ${new Date(
        event.end
      ).getHours()}:00</div>
            </div>
            ${
              event.raw?.meeting_link
                ? `<div class="text-xs text-white/90 flex items-center ml-2">
                <svg class="inline-block w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>`
                : ""
            }
          </div>
        </div>
      `;
    },
  };

  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getInstance().today();
    }
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getInstance().prev();
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getInstance().next();
    }
  };

  const handleEventClick = async (event: EventClickData) => {
    // Only allow deletion of availability slots
    if (event.event.calendarId === "availability") {
      setSlotToDelete(event.event);
    }
  };

  const handleConfirmDelete = async () => {
    if (!slotToDelete) return;

    try {
      const eventData = slotToDelete;

      if (eventData.raw) {
        await removeAvailability(eventData.raw);
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Calendar Card - Takes up 9 columns on large screens */}
      <Card className="lg:col-span-9 rounded-xl shadow-md">
        <CardContent className="p-4 h-[800px]">
          <div className="h-full flex flex-col">
            <div className="flex justify-between p-4 border-b">
              <div className="space-x-2">
                <Button onClick={handleToday} variant="outline" size="sm">
                  {tCalendar("navigation.today")}
                </Button>
                <Button onClick={handlePrev} variant="outline" size="sm">
                  {tCalendar("navigation.previousWeek")}
                </Button>
                <Button onClick={handleNext} variant="outline" size="sm">
                  {tCalendar("navigation.nextWeek")}
                </Button>
              </div>
              <Select
                defaultValue="week"
                onValueChange={(value) => calendarRef.current?.getInstance().changeView(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('fields.placeholder.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{tCalendar("view.week")}</SelectItem>
                  <SelectItem value="day">{tCalendar("view.day")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-auto">
              <Calendar
                ref={calendarRef}
                height="100%"
                view="week"
                week={{
                  startDayOfWeek: 1,
                  hourStart: 6,
                  hourEnd: 22,
                  taskView: false,
                  eventView: ["time"],
                }}
                calendars={calendars}
                events={events}
                isReadOnly={true}
                template={template}
                onClickEvent={handleEventClick}
                theme={{
                  common: {
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    holiday: { color: "#059669" },
                    saturday: { color: "#059669" },
                    dayName: { color: "#059669" },
                    today: { color: "#059669" },
                    gridSelection: { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                  },
                  week: {
                    dayName: {
                      borderLeft: "1px solid #e5e7eb",
                      backgroundColor: "white",
                      color: "#374151",
                      fontWeight: "600",
                    },
                    timeGrid: {
                      borderRight: "1px solid #e5e7eb",
                    },
                    timeGridLeft: {
                      fontSize: "12px",
                      backgroundColor: "white",
                      color: "#374151",
                      fontWeight: "500",
                    },
                    today: {
                      backgroundColor: "rgba(16, 185, 129, 0.05)",
                      color: "#059669",
                    },
                    weekend: {
                      backgroundColor: "rgba(16, 185, 129, 0.02)",
                    },
                    nowIndicatorLabel: {
                      color: "#059669",
                    },
                    nowIndicatorPast: {
                      border: "1px dashed #10B981",
                    },
                    nowIndicatorBullet: {
                      backgroundColor: "#10B981",
                    },
                    nowIndicatorLine: {
                      border: "1px solid #10B981",
                    },
                  },
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Card - Takes up 3 columns on large screens */}
      <Card className="lg:col-span-3 rounded-xl shadow-md">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle className="text-lg font-medium">{tStudent('title')}</CardTitle>
              <CardDescription>
                {showUpcoming ? tStudent('status.upcoming') : tStudent('status.past')}
              </CardDescription>
            </div>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming" onClick={() => setShowUpcoming(true)}>
                  {tStudent('tabs.upcoming')}
                </TabsTrigger>
                <TabsTrigger value="past" onClick={() => setShowUpcoming(false)}>
                  {tStudent('tabs.past')}
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
                            {tStudent('buttons.meet')}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {tStudent('student')}: {studentNames[booking.studentId] || "Loading..."}
                        </Badge>
                        {!showUpcoming && (
                          <Select
                            value={booking.status}
                            onValueChange={(value) => handleBookingStatusChange(booking.id, value as "completed" | "confirmed" | "cancelled")}
                          >
                            <SelectTrigger className="w-[130px] h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">{tStudent('status.confirmed')}</SelectItem>
                              <SelectItem value="completed">{tStudent('status.completed')}</SelectItem>
                              <SelectItem value="cancelled">{tStudent('status.cancelled')}</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    {!showUpcoming && (
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <div className="flex items-center gap-2">
                          {booking.homework ? (
                            <a
                              href={booking.homework.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {tStudent('buttons.viewHomework')}
                            </a>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7">
                                  <Plus className="h-3 w-3 mr-1" />
                                  {tStudent('buttons.uploadHomework')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{tStudent('buttons.uploadHomework')}</DialogTitle>
                                </DialogHeader>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder={t('fields.placeholder.enter')}
                                    value={homeworkLink}
                                    onChange={(e) => setHomeworkLink(e.target.value)}
                                  />
                                  <Button onClick={() => handleHomeworkSubmit(booking.id)}>
                                    {t('calendarOverlay.buttons.save')}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {booking.feedback ? (
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7">
                                    <Star className="h-3 w-3 mr-1" />
                                    {tStudent('buttons.viewFeedback')}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{tStudent('feedback.title')}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-1">
                                      <span>{tStudent('feedback.rating')}:</span>
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
                                        <span className="font-medium">{tStudent('feedback.comment')}:</span>
                                        <p className="text-sm mt-1">{booking.feedback.comment}</p>
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                      <p>{tStudent('feedback.created')}: {new Date(booking.feedback.createdAt).toLocaleDateString()}</p>
                                      {booking.feedback.updatedAt && (
                                        <p>{tStudent('feedback.updated')}: {new Date(booking.feedback.updatedAt).toLocaleDateString()}</p>
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
                                {tStudent('feedback.none')}
                              </span>
                            </div>
                          )}
                        </div>
                        {booking.bulkId && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {booking.lessonNumber} {tStudent('lessonCount.of')} {booking.totalLessons}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                {showUpcoming ? tStudent('noUpcoming') : tStudent('noPast')}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!slotToDelete} onOpenChange={(open) => !open && setSlotToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('calendarOverlay.removeSlot.title')}</DialogTitle>
          </DialogHeader>
          <p>{t('calendarOverlay.removeSlot.confirmation')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotToDelete(null)}>
              {t('calendarOverlay.buttons.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t('calendarOverlay.buttons.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
