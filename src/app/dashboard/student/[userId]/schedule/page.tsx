"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Student } from "@/types/student";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { adaptToCalendarEvent } from "@/lib/utils";

interface StudentDashboardProps {
  params: {
    userId: string;
  };
}

export default function StudentSchedule({ params }: StudentDashboardProps) {
  const { user } = useUser();
  const student = user as Student;
  const t = useTranslations("Dashboard.Student.schedule");
  const tCommon = useTranslations("Dashboard.Common");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{tCommon("pleaseSignIn")}</div>
      </div>
    );
  }

  const events = student.events;
  const calendarEvents = events.map(adaptToCalendarEvent);

  return (
    <div className="flex flex-col gap-6 p-4 h-screen">
      {/* Welcome Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
      </Card>

      {/* Calendar */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          themeSystem="standard"
          height="100%"
          initialView="timeGridWeek"
          events={calendarEvents}
          buttonText={{
            today: t("calendar.today"),
            week: t("calendar.week"),
            day: t("calendar.day")
          }}
        />
      </div>
    </div>
  );
}
