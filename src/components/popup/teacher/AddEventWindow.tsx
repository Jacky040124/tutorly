"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useTranslations } from "next-intl";
import { useOverlay } from "@/hooks/useOverlay";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useActionState } from "react";
import { addEvent } from "@/app/action";
import { getNumberOfClasses, generateTimeOptions } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AddEventOverlay() {
  const { events, user } = useUser();
  
  if (!user) {
    return <div>User not found. Please try logging in again.</div>;
  }

  const { setShowAddEventOverlay } = useOverlay();
  const { toast } = useToast();
  const t = useTranslations("CalendarOverlay");
  const [date, setDate] = useState<Date>(new Date());
  const [isRepeating, setIsRepeating] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [meetingLinks, setMeetingLinks] = useState("");
  const [maxStudents, setMaxStudents] = useState("1");
  const [state, formAction, isPending] = useActionState(addEvent, { error: null, events: [] });
  const numberOfClass = useRef(getNumberOfClasses(date));
  const timeOptions = generateTimeOptions();

  useEffect(() => {
    if (state.events.length > events.length) {
      toast({
        title: "Success",
        description: isRepeating 
          ? `Successfully created ${numberOfClass.current} classes` 
          : "Successfully created class",
      });
      setShowAddEventOverlay(false);
    }
  }, [state.events.length, events.length, isRepeating, numberOfClass, toast, setShowAddEventOverlay]);

  return (
    <Sheet open={true} onOpenChange={() => setShowAddEventOverlay(false)}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        <form action={formAction} className="space-y-6 py-6">
          <input type="hidden" name="userId" value={user?.uid} />
          <input type="hidden" name="isRepeating" value={isRepeating.toString()} />
          <input type="hidden" name="date" value={date?.toISOString()} />
          <input type="hidden" name="numberOfClasses" value={isRepeating ? numberOfClass.current : 1} />
          <input type="hidden" name="events" value={JSON.stringify(events)} />

          {state.error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md">{state.error}</div>}

          {/* Calendar stays at the top */}
          <div className="space-y-2 w-full">
            <Label>{t("fields.date")}</Label>
            <div className="w-full">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate: Date | undefined) => setDate(newDate ?? new Date())}
                className="rounded-md border w-full"
              />
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label>{t("fields.title")}</Label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("fields.startTime")}</Label>
              <Select name="startTime" value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("fields.endTime")}</Label>
              <Select name="endTime" value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting Links */}
          <div className="space-y-2">
            <Label>{t("fields.meetLink")}</Label>
            <input
              type="text"
              name="meetingLinks"
              value={meetingLinks}
              onChange={(e) => setMeetingLinks(e.target.value)}
              placeholder="Meeting Links"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Max Students */}
          <div className="space-y-2">
            <Label>{t("fields.maxStudents")}</Label>
            <input
              type="number"
              name="maxStudents"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              min="1"
              placeholder="Max Students"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Repeating Event Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label>{t("fields.repeating")}</Label>
              {isRepeating && (
                <div className="text-sm text-muted-foreground">{numberOfClass.current} classes will be generated</div>
              )}
            </div>
            <Switch name="isRepeating" checked={isRepeating} onCheckedChange={setIsRepeating} />
          </div>

          <SheetFooter>
            <Button type="button" onClick={() => setShowAddEventOverlay(false)} variant="outline">
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700">
              {isPending ? t("buttons.saving") : t("buttons.save")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
