import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import EventWindow from "@/components/popup/teacher/EventWindow";
import { Event } from "@/types/event";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatTime } from "@/lib/utils";

interface BookingCardProps {
  events: Event[];
}


// TODO : fix data refetch after update
export function BookingCard({ events }: BookingCardProps) {
  const [showEventWindow, setShowEventWindow] = useState(false);
  const t = useTranslations("BookingCard");

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">{t("title")}</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">
                  {new Date(event.date.year, event.date.month - 1, event.date.day).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  {formatTime(event.date.startTime)} - {formatTime(event.date.endTime)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {event.meeting_link && (
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t("buttons.meet")}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 text-sm">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowEventWindow(true)}>
                  {t("event.overview")}
                </Button>
                <EventWindow 
                  event={event} 
                  close={setShowEventWindow}
                  show={showEventWindow}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
