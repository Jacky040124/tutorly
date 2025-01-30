import { useState, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { getRepeatingDates } from "@/lib/utils/dateUtils";
import { useTranslations } from 'next-intl';
import { 
  checkOverlap, 
  CALENDAR_CONFIG, 
  formatDate, 
  generateTimeOptions,
  isValidEvent 
} from "@/lib/utils/calendarUtil";
import { useBooking } from "@/hooks/useBooking";
import { useNotification } from "@/hooks/useNotification";
import { useOverlay } from "@/hooks/useOverlay";
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
  const t = useTranslations('CalendarOverlay');
  const { bookings } = useBooking();

  // Basic event fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  
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
  const initializeMeetingLinks = (dates: Array<{ year: number; month: number; day: number }>) => {
    const newLinks: Record<string, string> = {};
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

  const handleSave = async (e: React.FormEvent) => {
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
            maxStudents: maxStudents,
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
        if (!date) return;
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
          maxStudents: parseInt(maxStudents.toString()),
          enrolledStudentIds: [],
          isRepeating: false,
          repeatGroupId: `single_${Date.now()}`,
          repeatIndex: 0,
          totalClasses: 1,
          createdAt: new Date().toISOString(),
        };
        console.log('Single event:', event);
        newEvents.push(event);
      }

      console.log('All new events:', newEvents);
      console.log('Current availability:', availability);
      console.log('Current bookings:', bookings);

      // Only check overlaps against availability
      const existingAvailability = availability || [];
      
      // Check for overlaps with all new events
      for (const event of newEvents) {
        const { hasOverlap, conflictingEvent } = checkOverlap(existingAvailability, event);
        console.log('Overlap check for event:', { event, hasOverlap, conflictingEvent });
        
        if (hasOverlap) {
          console.error(t('errors.availabilityOverlap'));
          setIsSubmitting(false);
          return;
        }
      }

      // If no overlaps, proceed with adding all events
      console.log('No overlaps found, updating availability with:', newEvents);
      await updateAvailability(newEvents);
      setShowAddEventOverlay(false);
      showSuccess(isRepeating ? 
        t('bulkEventsAddedSuccess', { count: newEvents.length }) : 
        t('eventAddedSuccess')
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
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label>{t('fields.title')}</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('fields.titlePlaceholder')}
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>{t('fields.date')}</Label>
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={(date: Date | undefined) => setDate(date ?? null)}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('fields.startTime')}</Label>
              <Select 
                value={startTime} 
                onValueChange={setStartTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('fields.selectTime')} />
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
              <Label>{t('fields.endTime')}</Label>
              <Select 
                value={endTime} 
                onValueChange={setEndTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('fields.selectTime')} />
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
            <Label>{t('fields.meetLink')}</Label>
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
                      placeholder={t('fields.meetLinkPlaceholder')}
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
                  placeholder={t('fields.meetLinkPlaceholder')}
                />
              )
            )}
          </div>

          {/* Max Students */}
          <div className="space-y-2">
            <Label>{t('fields.maxStudents')}</Label>
            <Input
              type="number"
              min="1"
              value={maxStudents}
              onChange={(e) => setMaxStudents(parseInt(e.target.value))}
              placeholder={t('fields.maxStudentsPlaceholder')}
            />
          </div>

          {/* Repeating Event Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                {t('fields.repeating')}
              </Label>
              <div className="text-sm text-muted-foreground">
                {isRepeating && date ? 
                  t('fields.repeatingClasses', { count: repeatDates.length }) : 
                  t('fields.repeatingDescription')}
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
            {t('buttons.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid() || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? t('buttons.saving') : t('buttons.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
