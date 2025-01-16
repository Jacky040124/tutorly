"use client";

import { useEffect, useRef, useState } from 'react';
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import { useUser } from '@/components/providers';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Plus, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLoading } from "@/components/providers/LoadingContext";
import { useError } from "@/components/providers/ErrorContext";
import { getTeacherBookings, updateBookingStatus, updateBookingHomework } from "@/services/booking.service";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { filterBookingsByTime } from "@/lib/utils/calendarUtils";

export default function TeacherCalendar() {
  const calendarRef = useRef(null);
  const { user, availability, removeAvailability, fetchUserNickname } = useUser();
  const { setIsLoading } = useLoading();
  const { showError } = useError();
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [studentNames, setStudentNames] = useState({});
  const [homeworkLink, setHomeworkLink] = useState("");
  const [slotToDelete, setSlotToDelete] = useState(null);

  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      setIsLoading(true);
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      );
    } catch (error) {
      showError(`Error updating booking status: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeworkSubmit = async (bookingId) => {
    try {
      setIsLoading(true);
      await updateBookingHomework(bookingId, homeworkLink);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { 
                ...booking, 
                homework: { 
                  link: homeworkLink, 
                  addedAt: new Date().toISOString() 
                } 
              }
            : booking
        )
      );
      setHomeworkLink(""); // Reset input
    } catch (error) {
      showError(`Error updating homework: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bookings and student names
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) {
        console.log("No user UID available");
        return;
      }

      try {
        setIsLoading(true);
        const fetchedBookings = await getTeacherBookings(user.uid);
        setBookings(fetchedBookings);

        // Fetch student names
        const names = {};
        for (const booking of fetchedBookings) {
          if (!studentNames[booking.studentId]) {
            names[booking.studentId] = await fetchUserNickname(booking.studentId);
          }
        }
        setStudentNames(prev => ({ ...prev, ...names }));
      } catch (error) {
        showError(`Error fetching bookings: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, availability]);

  // Filter bookings based on upcoming/past
  const filteredBookings = filterBookingsByTime(bookings, showUpcoming);

  const calendars = [
    {
      id: 'availability',
      name: 'Available Slots',
      backgroundColor: '#10B981',
      borderColor: '#059669',
      dragBackgroundColor: '#A7F3D0',
      color: '#065F46',
    },
    {
      id: 'bookings',
      name: 'Booked Classes',
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      dragBackgroundColor: '#BFDBFE',
      color: '#1E40AF',
    }
  ];

  // Convert availability to events
  const availabilityEvents = user?.availability?.map((slot) => {
    const year = slot.date.year;
    const month = String(slot.date.month).padStart(2, '0');
    const day = String(slot.date.day).padStart(2, '0');
    
    const start = `${year}-${month}-${day}T${String(slot.startTime).padStart(2, '0')}:00:00`;
    const end = `${year}-${month}-${day}T${String(slot.endTime).padStart(2, '0')}:00:00`;

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
      }
    };
  }) || [];

  // Convert bookings to events
  const bookingEvents = bookings.map((booking) => {
    const year = booking.date.year;
    const month = String(booking.date.month).padStart(2, '0');
    const day = String(booking.date.day).padStart(2, '0');
    
    const start = `${year}-${month}-${day}T${String(booking.startTime).padStart(2, '0')}:00:00`;
    const end = `${year}-${month}-${day}T${String(booking.endTime).padStart(2, '0')}:00:00`;

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
      }
    };
  });

  const events = [...availabilityEvents, ...bookingEvents];

  const template = {
    time(event) {
      const date = new Date(event.start);
      const formattedDate = !isNaN(date) ? date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }) : '';
      
      const isBooking = event.calendarId === 'bookings';
      const bgColor = isBooking ? 'bg-blue-500' : 'bg-emerald-500';
      
      return `
        <div class="px-2 py-1.5 ${bgColor} flex flex-col min-h-[70px]">
          <div class="flex items-start justify-between">
            <div class="flex flex-col flex-1">
              <div class="text-sm font-medium text-white">${event.title}</div>
              <div class="text-xs text-white/90">${formattedDate}</div>
              <div class="text-xs text-white/90">${new Date(event.start).getHours()}:00 - ${new Date(event.end).getHours()}:00</div>
            </div>
            ${event.raw?.link ? 
              `<div class="text-xs text-white/90 flex items-center ml-2">
                <svg class="inline-block w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>` 
              : ''}
          </div>
        </div>
      `;
    }
  };

  const handleToday = () => {
    calendarRef.current.getInstance().today();
  };

  const handlePrev = () => {
    calendarRef.current.getInstance().prev();
  };

  const handleNext = () => {
    calendarRef.current.getInstance().next();
  };

  const handleEventClick = async (event) => {
    // Only allow deletion of availability slots
    if (event.event.calendarId === 'availability') {
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
      showError("Failed to remove time slot");
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
                  Today
                </Button>
                <Button onClick={handlePrev} variant="outline" size="sm">
                  Previous
                </Button>
                <Button onClick={handleNext} variant="outline" size="sm">
                  Next
                </Button>
              </div>
              <Select
                defaultValue="week"
                onValueChange={(value) => calendarRef.current.getInstance().changeView(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
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
              <CardTitle className="text-lg font-medium">Bookings</CardTitle>
              <CardDescription>Your {showUpcoming ? "upcoming" : "past"} bookings</CardDescription>
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
                        <Badge variant="outline">Student: {studentNames[booking.studentId] || 'Loading...'}</Badge>
                        {!showUpcoming && (
                          <Select
                            value={booking.status}
                            onValueChange={(value) => handleBookingStatusChange(booking.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
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
                              View Homework
                            </a>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Homework
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Homework Link</DialogTitle>
                                </DialogHeader>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Enter homework link"
                                    value={homeworkLink}
                                    onChange={(e) => setHomeworkLink(e.target.value)}
                                  />
                                  <Button onClick={() => handleHomeworkSubmit(booking.id)}>Add</Button>
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
                                    View Feedback
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Student Feedback</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-1">
                                      <span>Rating:</span>
                                      <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star 
                                            key={i} 
                                            className={`h-4 w-4 ${i < booking.feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    {booking.feedback.comment && (
                                      <div>
                                        <span className="font-medium">Comment:</span>
                                        <p className="text-sm mt-1">{booking.feedback.comment}</p>
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                      <p>Created: {new Date(booking.feedback.createdAt).toLocaleDateString()}</p>
                                      {booking.feedback.updatedAt && (
                                        <p>Last updated: {new Date(booking.feedback.updatedAt).toLocaleDateString()}</p>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${i < booking.feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                No feedback yet
                              </span>
                            </div>
                          )}
                        </div>
                        {booking.isRepeating && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {booking.currentClass}/{booking.totalClasses}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">No {showUpcoming ? "upcoming" : "past"} bookings</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Dialog open={!!slotToDelete} onOpenChange={(open) => !open && setSlotToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Time Slot</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove this time slot?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
