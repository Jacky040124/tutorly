"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useBooking } from "@/hooks/useBooking";
import BookingOverlay from "./popup/student/BookingWindow";
import FeedbackOverlay from "@/components/popup/FeedbackWinfow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { deleteFeedback } from "@/app/action";
import { useTeachers } from "@/hooks/useTeacher";
import { Booking } from "@/types/booking";

// Import plugins statically
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';

const FullCalendar = dynamic(() => 
  import('@fullcalendar/react').then((mod) => mod.default), 
  { ssr: false }
);

interface StudentCalendarProps {
  selectedTeacher: number;
  weekOffset: number;
  setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
}

export default function StudentCalendar({ selectedTeacher, weekOffset, setWeekOffset }: StudentCalendarProps) {
  const calendarRef = useRef<any>(null);
  const { teachers } = useTeachers();
  const { setSelectedSlot, showBookingOverlay, setShowBookingOverlay, bookings, setBookings } = useBooking();
  const [showUpcoming, setShowUpcoming] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState("");

  // Get the selected teacher data
  const selectedTeacherData = selectedTeacher >= 0 ? teachers[selectedTeacher] : null;

  // Helper function to find teacher by ID
  const findTeacherById = (teacherId: string) => {
    return teachers.find((teacher) => teacher.uid === teacherId);
  };

  // Convert teacher availability to calendar events
  const availabilityEvents = selectedTeacherData?.availability?.map((slot) => ({
    id: `${slot.date.year}_${slot.date.month}_${slot.date.day}_${slot.startTime}`,
    title: "Available",
    start: new Date(slot.date.year, slot.date.month - 1, slot.date.day, slot.startTime),
    end: new Date(slot.date.year, slot.date.month - 1, slot.date.day, slot.endTime),
    backgroundColor: '#10B981',
    borderColor: '#059669',
    extendedProps: {
      isRepeating: slot.isRepeating,
      totalClasses: slot.totalClasses,
      link: slot.link,
      date: slot.date,
      startTime: slot.startTime,
      type: 'availability'
    }
  })) || [];

  // Convert bookings to calendar events
  const bookingEvents = bookings.map((booking) => ({
    id: booking.id,
    title: booking.title || `Class with ${findTeacherById(booking.teacherId)?.nickname || "Unknown Teacher"}`,
    start: new Date(booking.date.year, booking.date.month - 1, booking.date.day, booking.startTime),
    end: new Date(booking.date.year, booking.date.month - 1, booking.date.day, booking.endTime),
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    extendedProps: {
      link: booking.link,
      teacherId: booking.teacherId,
      type: 'booking'
    }
  }));

  const handleEventClick = useCallback((info: any) => {
    if (info.event.extendedProps.type === 'availability' && selectedTeacherData) {
      const slot = selectedTeacherData.availability.find(
        (s) =>
          s.date.year === info.event.extendedProps.date.year &&
          s.date.month === info.event.extendedProps.date.month &&
          s.date.day === info.event.extendedProps.date.day &&
          s.startTime === info.event.extendedProps.startTime
      );

      if (slot) {
        setSelectedSlot({
          ...slot,
          title: `Class with ${selectedTeacherData.nickname}`,
        });
        setShowBookingOverlay(true);
      }
    }
  }, [selectedTeacherData, setSelectedSlot, setShowBookingOverlay]);

  const handleDeleteFeedback = useCallback(async (booking: Booking) => {
    if (booking.feedback) {
      setFeedbackToDelete(booking.id);
    }
  }, []);

  const confirmDeleteFeedback = useCallback(async () => {
    if (!feedbackToDelete) return;

    try {
      await deleteFeedback(feedbackToDelete);
      // Update local state
      const updatedBookings = bookings.map((b) => (b.id === feedbackToDelete ? { ...b, feedback: undefined } : b));
      setBookings(updatedBookings);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback. Please try again.");
    } finally {
      setFeedbackToDelete("");
    }
  }, [feedbackToDelete, bookings, setBookings]);

  // Filter bookings based on upcoming/past
  const filteredBookings = bookings.filter((booking) => {
    const bookingDateTime = new Date(booking.date.year, booking.date.month - 1, booking.date.day, booking.endTime);
    const now = new Date();
    return showUpcoming ? bookingDateTime >= now : bookingDateTime < now;
  });

  const template = {
    time(event: any) {
      // Convert to Date object if it isn't already
      const date: any = new Date(event.start);

      // Check if date is valid before formatting
      const formattedDate = !isNaN(date)
        ? date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "";

      const isBooking = event.calendarId === "bookings";
      const bgColor = isBooking ? "bg-blue-500" : "bg-emerald-500";

      // Add trial class label for non-repeating events
      const isTrialClass = !event.raw?.isRepeating;
      const title = isTrialClass ? "Trial Class" : event.title;

      return `
        <div class="px-2 py-1.5 ${bgColor} flex flex-col min-h-[70px]">
          <div class="flex items-start justify-between">
            <div class="flex flex-col flex-1">
              <div class="text-sm font-medium text-white">${title}</div>
              <div class="text-xs text-white/90">${formattedDate}</div>
              <div class="text-xs text-white/90">${new Date(event.start).getHours()}:00 - ${new Date(
        event.end
      ).getHours()}:00</div>
            </div>
            ${
              event.raw?.link
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
    popupDetailBody({
      schedule,
    }: {
      schedule: { start: Date; end: Date; raw?: { link?: string }; title: string; calendarId: string };
    }) {
      const startDate = new Date(schedule.start);
      const endDate = new Date(schedule.end);
      const day = startDate.toLocaleString("default", { weekday: "long" });
      const date = startDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const isBooking = schedule.calendarId === "bookings";
      const textColor = isBooking ? "text-blue-800" : "text-emerald-800";
      const iconColor = isBooking ? "text-blue-600" : "text-emerald-600";

      return `
        <div class="p-4">
          <div class="text-lg font-medium ${textColor} mb-2">${schedule.title}</div>
          <div class="text-sm text-gray-600 space-y-2">
            <div>${day}, ${date}</div>
            <div>${startDate.getHours()}:00 - ${endDate.getHours()}:00</div>
            ${
              schedule.raw?.link
                ? `<div class="flex items-center ${iconColor}">
                <svg class="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Online via Zoom
              </div>`
                : ""
            }
          </div>
        </div>
      `;
    },
  };

  const handleToday = useCallback(() => {
    setWeekOffset(0);
    calendarRef.current?.getInstance()?.today();
  }, [setWeekOffset]);

  const handlePrev = useCallback(() => {
    setWeekOffset((prev: number) => prev - 1);
    calendarRef.current?.getInstance()?.prev();
  }, [setWeekOffset]);

  const handleNext = useCallback(() => {
    setWeekOffset((prev: number) => prev + 1);
    calendarRef.current?.getInstance()?.next();
  }, [setWeekOffset]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Calendar Card - Takes up 9 columns on large screens */}
        <Card className="lg:col-span-9 rounded-xl shadow-md ">
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
                <FullCalendar
                  plugins={[timeGridPlugin, dayGridPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay'
                  }}
                  slotMinTime="06:00:00"
                  slotMaxTime="22:00:00"
                  events={[...availabilityEvents, ...bookingEvents]}
                  eventClick={handleEventClick}
                  editable={false}
                  height="100%"
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
                <CardTitle className="text-lg font-medium">Your Classes</CardTitle>
                <CardDescription>{showUpcoming ? "Upcoming" : "Past"} classes</CardDescription>
              </div>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming" onClick={() => setShowUpcoming(true)}>
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger value="past" onClick={() => setShowUpcoming(false)}>
                    Past
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
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Teacher: {selectedTeacherData?.nickname || "Unknown Teacher"}</Badge>
                        </div>
                        {booking.bulkId && (
                          <div className="text-xs text-gray-500">
                            Class {booking.lessonNumber}/{booking.totalLessons}
                          </div>
                        )}
                      </div>
                      {!showUpcoming && (
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <div className="flex items-center gap-2">
                            {booking.homework ? (
                              <a
                                href={booking.homework.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Homework
                              </a>
                            ) : (
                              <span className="text-xs text-gray-500">No homework assigned yet</span>
                            )}
                            {booking.homework?.addedAt && (
                              <span className="text-xs text-gray-500">
                                Added {new Date(booking.homework.addedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Feedback Section */}
                      {!showUpcoming && (
                        <div className="mt-3 border-t pt-2">
                          {booking.feedback ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        booking.feedback?.rating && star <= booking.feedback.rating
                                          ? "text-yellow-500 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => setSelectedBooking(booking)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-blue-600 hover:text-blue-700"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteFeedback(booking)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              {booking.feedback.comment && (
                                <p className="text-sm text-gray-600">{booking.feedback.comment}</p>
                              )}
                              {booking.feedback?.updatedAt && (
                                <p className="text-xs text-gray-500">
                                  Last updated: {new Date(booking.feedback.updatedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Button
                              onClick={() => setSelectedBooking(booking)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Add Feedback
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">No {showUpcoming ? "upcoming" : "past"} classes</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {showBookingOverlay && <BookingOverlay selectedTeacher={selectedTeacher} />}
        {selectedBooking && (
          <FeedbackOverlay
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onFeedbackSubmitted={() => {
              // Update local state to reflect the changes
              const updatedBookings = [...bookings];
              setBookings(updatedBookings);
            }}
          />
        )}
      </div>

      <Dialog open={!!feedbackToDelete} onOpenChange={(open) => !open && setFeedbackToDelete("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackToDelete("")}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFeedback}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
