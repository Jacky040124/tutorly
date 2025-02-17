"use client";

import { useParams } from "next/navigation";
import { useTeachers } from "@/hooks/useTeacher";
import { Teacher } from "@/types/teacher";
import Calendar from "@/components/popup/student/Calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { bookEvent } from "@/app/[locale]/action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Event } from "@/types/event";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/lib/utils";


export default function Store() {
  const { userId, teacherId } = useParams();
  const { getTeacherById } = useTeachers();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const teacher: Teacher | undefined = getTeacherById(teacherId as string);

  if (!teacher) {
    return <div>Teacher not found</div>;
  }

  const handleEventClick = async (info: any) => {
    const eventId = info.event.extendedProps.eventId;
    const event = teacher.events.find((event) => event.id === eventId);
    console.log("status", info.event.extendedProps.status);
    if (event) {
      setSelectedEvent(event);
      setIsDialogOpen(true);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedEvent) {
      try {
        await bookEvent(selectedEvent, teacherId as string, userId as string);
        toast({
          title: "Success",
          description: "Class booked successfully!",
        });
        setIsDialogOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to book class",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-4 space-y-4">
      <Card className="overflow-hidden">
        <div className="md:grid md:grid-cols-[280px,1fr] md:min-h-[280px]">
          {/* Left Column - Photo and Basic Info */}
          <div className="p-6 bg-muted/10">
            <div className="relative w-40 h-40 mx-auto mb-4 rounded-lg overflow-hidden">
              <Image
                src={teacher.details.photoURL || "/default-avatar.png"}
                alt={teacher.details.nickname}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{teacher.details.nickname}</h2>
              <p className="text-lg text-muted-foreground mb-3">${teacher.details.pricing}/hour</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {teacher.details.expertise.split(",").map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold text-lg">About</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.description || teacher.details.introduction || "No description provided"}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg">Education</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.education || "No education information provided"}
                  </p>
                </section>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold text-lg">Teaching Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.experience || "No experience information provided"}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg">Teaching Style</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.teachingStyle || "No teaching style information provided"}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="h-[800px]">
        <Calendar teacher={teacher} handleEventClick={handleEventClick} />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription asChild>
              {selectedEvent && (
                <div className="space-y-2 mt-2">
                  <div>
                    <strong>Class:</strong> {selectedEvent.title}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedEvent.status.status}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedEvent.isRecurring ? "Repeating" : "One-time"}
                  </div>
                  <div>
                    <strong>Date:</strong>{" "}
                    {`${selectedEvent.date.month}/${selectedEvent.date.day}/${selectedEvent.date.year}`}
                  </div>
                  <div>
                    <strong>Time:</strong>{" "}
                    {`${formatTime(selectedEvent.date.startTime)} - ${formatTime(selectedEvent.date.endTime)}`}
                  </div>
                  <div>
                    <strong>Price:</strong> ${selectedEvent.price}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
