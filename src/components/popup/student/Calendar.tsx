import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Teacher } from "@/types/teacher";
import { adaptToCalendarEvent } from "@/lib/utils";
import { renderEventContent } from "@/lib/utils";
import { useParams } from "next/navigation";


export default function Calendar({ teacher, handleEventClick}: { teacher: Teacher, handleEventClick: (info: any) => void }) {
  const events = teacher.events;
  const calendarEvents = events.map(adaptToCalendarEvent);
  const { locale } = useParams();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 min-h-[700px]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        themeSystem="standard"
        allDaySlot={false}
        height="auto"
        locale={locale}
        initialView="timeGridWeek"
        events={calendarEvents}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
      />
    </div>
  );
}
