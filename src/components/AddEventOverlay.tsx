"use client";

import { useState, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { getRepeatingDates } from "@/lib/utils/dateUtils";
import { useTranslations } from "next-intl";
import { isOverlap, CALENDAR_CONFIG, formatDate, generateTimeOptions } from "@/lib/utils/calendarUtil";
import { useNotification } from "@/hooks/useNotification";
import { useOverlay } from "@/hooks/useOverlay";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Event } from "@/types/event";

type DateObject = {
  year: number;
  month: number;
  day: number;
};

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  maxStudents: z.number().min(1, "At least 1 student required"),
  isRepeating: z.boolean(),
  meetingLinks: z.record(z.string().url("Invalid meeting link").or(z.string().length(0))),
});

type FormValues = z.infer<typeof formSchema>;

const createEvents = (
  date: Date | null,
  formData: FormValues,
  isRepeating: boolean,
  repeatDates: DateObject[]
): Event[] => {
  if (!date) return [];
  
  const repeatGroupId = `group_${Date.now()}`;
  
  const createSingleEvent = (
    eventDate: Date | DateObject,
    config?: { groupId: string; index: number; total: number }
  ): Event => {
    // Normalize the date format
    const normalizedDate = eventDate instanceof Date
      ? {
          year: eventDate.getFullYear(),
          month: eventDate.getMonth() + 1,
          day: eventDate.getDate(),
        }
      : eventDate;

    // Create date key for meeting link
    const dateKey = `${normalizedDate.year}-${normalizedDate.month}-${normalizedDate.day}`;

    return {
      date: normalizedDate,
      title: formData.title,
      startTime: parseInt(formData.startTime),
      endTime: parseInt(formData.endTime),
      meeting_link: formData.meetingLinks[dateKey] || "",
      maxStudents: formData.maxStudents,
      enrolledStudentIds: [],
      isRepeating: !!config,
      repeatGroupId: config?.groupId || `single_${Date.now()}`,
      repeatIndex: config?.index || 0,
      totalClasses: config?.total || 1,
    };
  };

  return isRepeating
    ? repeatDates.map((repeatDate, index) =>
        createSingleEvent(repeatDate, {
          groupId: repeatGroupId,
          index,
          total: repeatDates.length,
        })
      )
    : [createSingleEvent(date)];
};

export default function AddEventOverlay() {
  const { availability, updateAvailability } = useUser();
  const { setShowAddEventOverlay } = useOverlay();
  const { showSuccess } = useNotification();
  const t = useTranslations("CalendarOverlay");
  const [date, setDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      startTime: "",
      endTime: "",
      maxStudents: 1,
      isRepeating: false,
      meetingLinks: {},
    },
  });

  const isRepeating = watch("isRepeating");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const timeOptions = useMemo(() => generateTimeOptions(CALENDAR_CONFIG), []);

  const filteredStartTimeOptions = useMemo(() => {
    if (endTime) {
      return timeOptions.filter((option) => parseInt(option.value) < parseInt(endTime));
    }
    return timeOptions;
  }, [timeOptions, endTime]);

  const filteredEndTimeOptions = useMemo(() => {
    if (startTime) {
      return timeOptions.filter((option) => parseInt(option.value) > parseInt(startTime));
    }
    return timeOptions;
  }, [timeOptions, startTime]);

  // Calculate repeating dates when date changes
  const repeatDates = useMemo(() => {
    if (!date || !isRepeating) return [];
    const dates = getRepeatingDates({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    return dates;
  }, [date, isRepeating]);

  const onSubmit = async (data: FormValues) => {
    if (!date) return;
    setIsSubmitting(true);

    try {
      const newEvents = createEvents(date, data, isRepeating, repeatDates);

      if (isOverlap(availability, newEvents)) {
        console.error(t("errors.availabilityOverlap"));
        setIsSubmitting(false);
        return;
      }

      await updateAvailability(newEvents);
      setShowAddEventOverlay(false);
      showSuccess(isRepeating ? t("bulkEventsAddedSuccess", { count: newEvents.length }) : t("eventAddedSuccess"));

    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={true} onOpenChange={() => setShowAddEventOverlay(false)}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
          {/* Calendar stays at the top */}
          <div className="space-y-2 w-full">
            <Label>{t("fields.date")}</Label>
            <div className="w-full">
              <Calendar
                mode="single"
                selected={date || undefined}
                onSelect={(date: Date | undefined) => setDate(date ?? null)}
                className="rounded-md border w-full"
              />
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label>{t("fields.title")}</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={t("fields.titlePlaceholder")}
                  className={errors.title ? "border-red-500" : ""}
                />
              )}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("fields.startTime")}</Label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (endTime && parseInt(endTime) <= parseInt(value)) {
                        setValue("endTime", "");
                      }
                    }}
                  >
                    <SelectTrigger className={errors.startTime ? "border-red-500" : ""}>
                      <SelectValue placeholder={t("fields.selectTime")} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStartTimeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.startTime && <p className="text-sm text-red-500">{errors.startTime.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t("fields.endTime")}</Label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (startTime && parseInt(startTime) >= parseInt(value)) {
                        setValue("startTime", "");
                      }
                    }}
                  >
                    <SelectTrigger className={errors.endTime ? "border-red-500" : ""}>
                      <SelectValue placeholder={t("fields.selectTime")} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEndTimeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.endTime && <p className="text-sm text-red-500">{errors.endTime.message}</p>}
            </div>
          </div>

          {/* Meeting Links */}
          {date && (
            <div className="space-y-4">
              <Label>{t("fields.meetLink")}</Label>
              {isRepeating ? (
                repeatDates.map((repeatDate, index) => {
                  const dateKey = `${repeatDate.year}-${repeatDate.month}-${repeatDate.day}`;
                  return (
                    <div key={dateKey} className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Class {index + 1} - {formatDate(repeatDate)}
                      </Label>
                      <Controller
                        name={`meetingLinks.${dateKey}`}
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="url"
                            placeholder={t("fields.meetLinkPlaceholder")}
                            className={errors.meetingLinks?.[dateKey] ? "border-red-500" : ""}
                          />
                        )}
                      />
                      {errors.meetingLinks?.[dateKey] && (
                        <p className="text-sm text-red-500">{errors.meetingLinks[dateKey]?.message}</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <Controller
                  name={`meetingLinks.${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="url"
                      placeholder={t("fields.meetLinkPlaceholder")}
                      className={
                        errors.meetingLinks?.[`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                  )}
                />
              )}
            </div>
          )}

          {/* Max Students */}
          <div className="space-y-2">
            <Label>{t("fields.maxStudents")}</Label>
            <Controller
              name="maxStudents"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="1"
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  placeholder={t("fields.maxStudentsPlaceholder")}
                  className={errors.maxStudents ? "border-red-500" : ""}
                />
              )}
            />
            {errors.maxStudents && <p className="text-sm text-red-500">{errors.maxStudents.message}</p>}
          </div>

          {/* Repeating Event Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">{isRepeating ? t("fields.repeating") : "Trial Course"}</Label>
                <div className="text-sm text-muted-foreground">
                  {isRepeating ? (
                    date ? (
                      <div className="space-y-1">
                        <p>{t("fields.repeatingClasses", { count: repeatDates.length })}</p>
                        <p className="text-xs">
                          Weekly recurring classes every {date.toLocaleDateString("en-US", { weekday: "long" })}
                        </p>
                      </div>
                    ) : (
                      "Select a date to see the recurring schedule"
                    )
                  ) : (
                    "One-time trial class. Toggle switch for weekly recurring classes."
                  )}
                </div>
              </div>
              <Controller
                name="isRepeating"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-green-600"
                  />
                )}
              />
            </div>
            {isRepeating && date && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <div className="font-medium mb-2">Recurring Schedule:</div>
                <div className="space-y-1">
                  {repeatDates.map((date, index) => (
                    <div key={index} className="text-muted-foreground">
                      Class {index + 1}: {formatDate(date)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <SheetFooter>
            <Button type="button" onClick={() => setShowAddEventOverlay(false)} variant="outline">
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !date} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? t("buttons.saving") : t("buttons.save")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
