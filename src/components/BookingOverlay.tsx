"use client";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useBooking } from "@/hooks/useBooking";
import { formatTime } from "@/utils/timeUtils";
import { handleBookingConfirmed } from "@/services/booking.service";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Clock, User, CreditCard, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTeachers } from "@/hooks/useTeacher";
import { Booking } from "@/types/booking";
import { Teacher } from "@/types/user";

export default function BookingOverlay(prop: { selectedTeacher: number }) {
  const { selectedSlot, setShowBookingOverlay, setBookingConfirmed } = useBooking();
  const { user } = useUser();
  const { teachers } = useTeachers();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showTeacherDetails, setShowTeacherDetails] = useState<boolean>(false);
  const teacher: Teacher = teachers[prop.selectedTeacher];

  const handleClose = () => {
    setShowBookingOverlay(false);
  };

  // helper
  const createBookingObject = () => {
    console.log("Selected slot with link:", selectedSlot);

    const baseBooking: Omit<Booking, 'id'> = {
      studentId: user!.uid,
      teacherId: teacher.uid,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.startTime + 1,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      price: teacher.pricing,
      link: selectedSlot.meeting_link || '',
      title: selectedSlot.title || '',
      date: {
        day: selectedSlot.date.day,
        month: selectedSlot.date.month,
        year: selectedSlot.date.year
      }
    };

    console.log("Created booking object:", baseBooking);

    // Single booking
    if (!selectedSlot.totalClasses) {
      return {
        ...baseBooking,
        date: selectedSlot.date,
      };
    }

    // Bulk booking
    const bulkId: string = `bulk_${Date.now()}_${user!.uid}`;
    return Array.from({ length: selectedSlot.totalClasses }, (_, index) => ({
      ...baseBooking,
      date: {
        ...selectedSlot.date,
        day: selectedSlot.date.day + index * 7,
      },
      bulkId,
      lessonNumber: index + 1,
      totalLessons: selectedSlot.totalClasses,
    }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      if (user) {
        const bookings = createBookingObject() as Array<Omit<Booking, 'id'>>;
        await handleBookingConfirmed(
          bookings as any,
          teacher.availability,
          {
            email: teacher.email || '',
            availability: teacher.availability,
            nickname: teacher.nickname,
            pricing: teacher.pricing
          },
          user.email,
          setShowBookingOverlay,
          setBookingConfirmed
        );
      }
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={true} onOpenChange={() => setShowBookingOverlay(false)}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader className="space-y-1 mb-6">
          <SheetTitle>Confirm Booking</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mr-6 pr-6">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardContent className="pt-6 space-y-6">
                <button
                  onClick={() => setShowTeacherDetails(!showTeacherDetails)}
                  className="flex items-center justify-between w-full text-base hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span>Teacher: {teacher?.nickname}</span>
                  </div>
                  {showTeacherDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>

                {showTeacherDetails && (
                  <div className="border-t pt-4 space-y-4">
                    {teacher?.introduction && (
                      <div className="space-y-1">
                        <h4 className="font-medium">Introduction</h4>
                        <p className="text-sm text-muted-foreground">{teacher?.introduction}</p>
                      </div>
                    )}
                    {teacher?.expertise && (
                      <div className="space-y-1">
                        <h4 className="font-medium">Expertise</h4>
                        <p className="text-sm text-muted-foreground">{teacher?.expertise}</p>
                      </div>
                    )}
                    {teacher?.education && (
                      <div className="space-y-1">
                        <h4 className="font-medium">Education</h4>
                        <p className="text-sm text-muted-foreground">{teacher?.education}</p>
                      </div>
                    )}
                    {teacher?.experience && (
                      <div className="space-y-1">
                        <h4 className="font-medium">Experience</h4>
                        <p className="text-sm text-muted-foreground">{teacher?.experience}</p>
                      </div>
                    )}
                    {teacher?.teachingStyle && (
                      <div className="space-y-1">
                        <h4 className="font-medium">Teaching Style</h4>
                        <p className="text-sm text-muted-foreground">{teacher?.teachingStyle}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5" />
                  <span>
                    Date: {selectedSlot.date.day}/{selectedSlot.date.month}/{selectedSlot.date.year}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <span>
                    Time: {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.startTime + 1)}
                  </span>
                </div>

                <div className="flex items-center gap-3 border-t pt-4">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Price per lesson: ${teacher?.pricing}</p>
                    {selectedSlot.totalClasses && (
                      <p className="text-primary mt-1">
                        Total for {selectedSlot.totalClasses} lessons: $
                        {teacher?.pricing * selectedSlot.totalClasses}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert variant="default" className="bg-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p>
                  <span className="font-semibold">Payment Notice:</span> Online payment is currently under development.
                  Please e-transfer the lesson fee to your teacher at:
                </p>
                <p className="font-medium mt-1">lolzman2005@gmail.com</p>
              </AlertDescription>
            </Alert>

            {selectedSlot.totalClasses && (
              <Alert className="bg-primary/10 text-primary border-primary/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Bulk Booking: {selectedSlot.totalClasses} lessons</p>
                    <p>Total Price: ${teacher?.pricing * selectedSlot.totalClasses}</p>
                    <p className="text-sm opacity-90">Weekly lessons for {selectedSlot.totalClasses} weeks</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <div className="py-3">
          <SheetFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBookingOverlay(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Confirming..." : "Confirm Booking"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
