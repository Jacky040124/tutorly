import { useState, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { getRepeatingDates } from "@/lib/utils/dateUtils.ts";
import { useTranslation } from "react-i18next";
import { 
  checkOverlap, 
  CALENDAR_CONFIG, 
  formatDate, 
  generateTimeOptions,
  isValidEvent 
} from "@/lib/utils/calendarUtil";
import { useBooking } from "@/components/providers";
import { useNotification } from "@/components/providers/NotificationContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddEventOverlay() {
  const { availability, updateAvailability } = useUser();
  const { setShowAddEventOverlay } = useOverlay();
  const { showSuccess } = useNotification();
  const { t } = useTranslation("common");
  const { bookings } = useBooking();

  // Basic event fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLinks, setMeetingLinks] = useState({});
  
  // Student enrollment fields
  const [maxStudents, setMaxStudents] = useState(1);
  
  // Repeating event fields
  const [isRepeating, setIsRepeating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate repeating dates when date changes
  const repeatDates = useMemo(() => {
    if (!date || !isRepeating) return [];
    const dates = getRepeatingDates({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    });
    console.log('Calculated repeat dates:', dates);
    return dates;
  }, [date, isRepeating]);

  // Initialize meeting links when repeat dates change
  const initializeMeetingLinks = (dates) => {
    const newLinks = {};
    dates.forEach((date, index) => {
      const dateKey = `${date.year}-${date.month}-${date.day}`;
      if (!meetingLinks[dateKey]) {
        newLinks[dateKey] = "";
      } else {
        newLinks[dateKey] = meetingLinks[dateKey];
      }
    });
    console.log('Initialized meeting links:', newLinks);
    setMeetingLinks(newLinks);
  };

  // Update meeting links when repeat dates change
  useMemo(() => {
    if (isRepeating && repeatDates.length > 0) {
      initializeMeetingLinks(repeatDates);
    } else {
      setMeetingLinks({});
    }
  }, [repeatDates, isRepeating]);

  const isValid = () => {
    const valid = isValidEvent({
      title,
      date,
      startTime,
      endTime,
      maxStudents,
      meetingLinks,
      isRepeating
    });
    console.log('Form validation:', { valid, formState: { title, date, startTime, endTime, maxStudents, meetingLinks, isRepeating }});
    return valid;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Starting save process...');

    try {
      const newEvents = [];
      
      if (isRepeating) {
        console.log('Creating repeating events...');
        console.log('Repeat dates:', repeatDates);
        
        const repeatGroupId = `group_${Date.now()}`;
        
        // Create an event for each date in the repeating sequence
        repeatDates.forEach((repeatDate, index) => {
          const dateKey = `${repeatDate.year}-${repeatDate.month}-${repeatDate.day}`;
          const event = {
            date: repeatDate,
            startTime: parseInt(startTime),
            endTime: parseInt(endTime),
            meeting_link: meetingLinks[dateKey],
            title: title,
            maxStudents: parseInt(maxStudents),
            enrolledStudentIds: [],
            isRepeating: true,
            repeatGroupId,
            repeatIndex: index,
            totalClasses: repeatDates.length,
            createdAt: new Date().toISOString(),
          };
          console.log(`Creating event ${index + 1}/${repeatDates.length}:`, event);
          newEvents.push(event);
        });
      } else {
        console.log('Creating single event...');
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const event = {
          date: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
          },
          startTime: parseInt(startTime),
          endTime: parseInt(endTime),
          meeting_link: meetingLinks[dateKey],
          title: title,
          maxStudents: parseInt(maxStudents),
          enrolledStudentIds: [],
          isRepeating: false,
          createdAt: new Date().toISOString(),
        };
        console.log('Single event:', event);
        newEvents.push(event);
      }

      console.log('All new events:', newEvents);
      console.log('Current availability:', availability);
      console.log('Current bookings:', bookings);

      const existingEvents = [...(availability || []), ...(bookings || [])];
      
      // Check for overlaps with all new events
      for (const event of newEvents) {
        const { hasOverlap, conflictingEvent } = checkOverlap(existingEvents, event);
        console.log('Overlap check for event:', { event, hasOverlap, conflictingEvent });
        
        if (hasOverlap) {
          console.error(t('calendarOverlay.errors.availabilityOverlap'));
          setIsSubmitting(false);
          return;
        }
      }

      // If no overlaps, proceed with adding all events
      console.log('No overlaps found, updating availability with:', newEvents);
      await updateAvailability(newEvents);
      setShowAddEventOverlay(false);
      showSuccess(isRepeating ? 
        t("calendarOverlay.bulkEventsAddedSuccess", { count: newEvents.length }) : 
        t("calendarOverlay.eventAddedSuccess")
      );
    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeOptions = useMemo(() => generateTimeOptions(CALENDAR_CONFIG), []);

  return (
    <Sheet open={true} onOpenChange={() => setShowAddEventOverlay(false)}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t("calendarOverlay.title")}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label>{t("calendarOverlay.fields.title")}</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("calendarOverlay.fields.titlePlaceholder")}
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>{t("calendarOverlay.fields.date")}</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("calendarOverlay.fields.startTime")}</Label>
              <Select 
                value={startTime} 
                onValueChange={setStartTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("calendarOverlay.fields.selectTime")} />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("calendarOverlay.fields.endTime")}</Label>
              <Select 
                value={endTime} 
                onValueChange={setEndTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("calendarOverlay.fields.selectTime")} />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting Links */}
          <div className="space-y-4">
            <Label>{t("calendarOverlay.fields.meetLink")}</Label>
            {isRepeating ? (
              repeatDates.map((repeatDate, index) => {
                const dateKey = `${repeatDate.year}-${repeatDate.month}-${repeatDate.day}`;
                return (
                  <div key={dateKey} className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Class {index + 1} - {formatDate(repeatDate)}
                    </Label>
                    <Input
                      type="url"
                      value={meetingLinks[dateKey] || ""}
                      onChange={(e) => {
                        setMeetingLinks(prev => ({
                          ...prev,
                          [dateKey]: e.target.value
                        }));
                      }}
                      placeholder={t("calendarOverlay.fields.meetLinkPlaceholder")}
                    />
                  </div>
                );
              })
            ) : (
              date && (
                <Input
                  type="url"
                  value={meetingLinks[`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`] || ""}
                  onChange={(e) => {
                    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    setMeetingLinks(prev => ({
                      ...prev,
                      [dateKey]: e.target.value
                    }));
                  }}
                  placeholder={t("calendarOverlay.fields.meetLinkPlaceholder")}
                />
              )
            )}
          </div>

          {/* Max Students */}
          <div className="space-y-2">
            <Label>{t("calendarOverlay.fields.maxStudents")}</Label>
            <Input
              type="number"
              min="1"
              value={maxStudents}
              onChange={(e) => setMaxStudents(parseInt(e.target.value))}
              placeholder={t("calendarOverlay.fields.maxStudentsPlaceholder")}
            />
          </div>

          {/* Repeating Event Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t("calendarOverlay.fields.repeating")}
              </Label>
              <div className="text-sm text-muted-foreground">
                {isRepeating && date ? 
                  `Will create ${repeatDates.length} classes this month` : 
                  "Toggle to repeat weekly for remaining weeks in the month"}
              </div>
            </div>
            <Switch
              checked={isRepeating}
              onCheckedChange={setIsRepeating}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={() => setShowAddEventOverlay(false)}
            variant="outline"
          >
            {t("calendarOverlay.buttons.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid() || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? t("calendarOverlay.buttons.saving") : t("calendarOverlay.buttons.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
