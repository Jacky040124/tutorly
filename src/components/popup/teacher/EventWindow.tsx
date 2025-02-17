"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { updateEventDetails } from "@/app/[locale]/action";
import { Star } from "lucide-react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Event } from "@/types/event";
import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { Teacher } from "@/types/teacher";
import { UpdateEventDetailsState } from "@/app/[locale]/action";
import { EventStatus } from "@/types/event";
import { useToast } from "@/hooks/use-toast";
import { getUserById } from "@/app/[locale]/action";
import { Student } from "@/types/student";
interface EventWindowProps {
  event?: Event;
  close: (open: boolean) => void;
  show: boolean;
}

const EVENT_STATUS_OPTIONS = ["available", "confirmed", "completed", "cancelled"] as const;

// TODO : fix data refetch after update
export default function EventWindow({ event, close, show }: EventWindowProps) {
  if (!event) return null;
  const { user } = useUser();
  const teacher = user as Teacher;
  const studentid = event.bookingDetails?.studentId;
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(updateEventDetails, {
    message: "",
    error: null,
  } as UpdateEventDetailsState);

  const [student, setStudent] = useState<Student | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(event.status);

  

  const t = useTranslations("EventWindow");

  useEffect(() => {
    async function fetchStudent() {
      const student = await getUserById(studentid as string);
      console.log("student", student);
      setStudent(student as Student);
    }

    if (state.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    } else if (state.message) {
      toast({
        title: "Success",
        description: state.message,
      });
    }

    if (!student) {
      fetchStudent();
    }
  }, [state, toast, student]);

  if (!event) return null;

  const eventDate = new Date(event.date.year, event.date.month - 1, event.date.day);
  const timeString = `${formatTime(event.date.startTime)} - ${formatTime(event.date.endTime)}`;

  return (
    <Dialog open={show} onOpenChange={close}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {eventDate.toLocaleDateString()} {timeString}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="event" value={JSON.stringify(event)} />
          <input type="hidden" name="teacherId" value={teacher.uid} />

          {/* Student Information - Only show if bookingDetails exists */}
          {event.bookingDetails && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-2">
                    <div className="text-sm">
                      {student ? (
                        <div className="flex items-start gap-3">
                          {student.details.photoURL && (
                            <img
                              src={student.details.photoURL}
                              alt={student.nickname}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div className="space-y-1">
                            <p className="font-medium">{student.nickname}</p>
                            {student.details.description && (
                              <p className="text-muted-foreground text-xs">{student.details.description}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        "Loading..."
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Separator />
            </>
          )}

          {/* Event Status and Meeting Link */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("status.label")}</Label>
              <Select
                name="status"
                value={selectedStatus.status}
                onValueChange={(value) => setSelectedStatus({ status: value as EventStatus["status"] })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t(`status.${event.status.status}`)} />
                </SelectTrigger>

                <SelectContent>
                  {EVENT_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t("meetingLink.label")}</Label>
              <Input name="meetingLink" defaultValue={event.meeting_link} placeholder={t("meetingLink.placeholder")} />
            </div>
          </div>

          {/* Homework Section - Always show */}
          {event.status.status !== "available" && (
            <div className="grid gap-2">
              <Label>{t("homework.label")}</Label>
              <Input
                name="homework"
                placeholder={t("homework.placeholder")}
                defaultValue={event.bookingDetails?.homework?.link || ""}
              />
            </div>
          )}

          {/* Feedback Section - Only show if feedback exists */}
          {event.bookingDetails?.feedback && (
            <>
              <Separator />
              <div className="grid gap-4">
                <Label>{t("feedback.label")}</Label>
                <div className="space-y-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (event.bookingDetails?.feedback?.rating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {event.bookingDetails.feedback.comment && (
                    <div className="text-sm text-gray-600">{event.bookingDetails.feedback.comment}</div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setTimeout(() => close(false), 500)}>
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isPending} onClick={() => close(false)}>
              {isPending ? t("buttons.saving") : t("buttons.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
