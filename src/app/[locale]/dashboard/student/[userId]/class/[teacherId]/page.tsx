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
import { useTranslations } from "next-intl";


// TODO: Add translations
export default function Store() {
  const { userId, teacherId } = useParams();
  const { getTeacherById } = useTeachers();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("Dashboard.Student.Class");
  const teacher: Teacher | undefined = getTeacherById(teacherId as string);

  if (!teacher) {
    return <div>{t("teacherNotFound")}</div>;
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
          description: t("bookingSuccess"),
        });
        setIsDialogOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : t("bookingError"),
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
                  <h3 className="font-semibold text-lg">{t("teacherProfile.about")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.description || teacher.details.introduction || t("noDescription")}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg">{t("teacherProfile.education")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.education || t("noEducation")}
                  </p>
                </section>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold text-lg">{t("teacherProfile.experience")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.experience || t("noExperience")}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg">{t("teacherProfile.teachingStyle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.teachingStyle || t("noTeachingStyle")}
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
            <DialogTitle>{t("confirmBooking.title")}</DialogTitle>
            <DialogDescription asChild>
              {selectedEvent && (
                <div className="space-y-2 mt-2">
                  <div>
                    <strong>{t("confirmBooking.class")}:</strong> {selectedEvent.title}
                  </div>
                  <div>
                    <strong>{t("confirmBooking.status")}:</strong> {selectedEvent.status.status}
                  </div>
                  <div>
                    <strong>{t("confirmBooking.type")}:</strong>{" "}
                    {selectedEvent.isRecurring ? t("confirmBooking.repeating") : t("confirmBooking.oneTime")}
                  </div>
                  <div>
                    <strong>{t("confirmBooking.date")}:</strong>{" "}
                    {`${selectedEvent.date.month}/${selectedEvent.date.day}/${selectedEvent.date.year}`}
                  </div>
                  <div>
                    <strong>{t("confirmBooking.time")}:</strong>{" "}
                    {`${formatTime(selectedEvent.date.startTime)} - ${formatTime(selectedEvent.date.endTime)}`}
                  </div>
                  <div>
                    <strong>{t("confirmBooking.price")}:</strong> ${selectedEvent.price}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("confirmBooking.buttons.cancel")}
            </Button>
            <Button onClick={handleConfirmBooking}>
              {t("confirmBooking.buttons.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
