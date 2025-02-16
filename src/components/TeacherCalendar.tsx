import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useUser } from "@/hooks/useUser";
import { Teacher } from "@/types/teacher";
import { adaptToCalendarEvent } from "@/lib/utils";
export default function TeacherCalendar() {
  const { user } = useUser();
  const teacher = user as Teacher;

  const events = teacher.events;
  const calendarEvents = events.map(adaptToCalendarEvent);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        themeSystem="standard"
        height="100%"
        initialView="timeGridWeek"
        events={calendarEvents}
      />
    </div>
  );
}
