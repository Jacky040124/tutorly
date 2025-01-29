"use client";

import { useState, useEffect } from "react";
import { useUser } from '@/hooks/useUser';
import TeacherCalendar from "@/components/calendar/TeacherCalendar";
import TeacherProfileOverlay from "@/components/overlays/TeacherProfileOverlay";
import { useOverlay } from "@/components/providers/OverlayContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserCircle, ChevronUpIcon, Plus } from "lucide-react";
import AddEventOverlay from "@/components/calendar/AddEventOverlay";
import { getTeacherBookings } from "@/services/booking.service";

export default function TeacherDashboard() {
  const { user } = useUser();
  const { t, i18n } = useTranslation("dashboard");
  const [bookings, setBookings] = useState([]);
  const { 
    showTeacherProfileOverlay, 
    setShowTeacherProfileOverlay,
    showAddEventOverlay,
    setShowAddEventOverlay 
  } = useOverlay();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) return;
      
      try {
        const fetchedBookings = await getTeacherBookings(user.uid);
        setBookings(fetchedBookings);
      } catch (error) {
        console.error(`Error fetching bookings: ${error.message}`);
      }
    };

    fetchBookings();
  }, [user]);

  const currentDate = new Date().toLocaleString(i18n.language, { 
    month: "long",
    year: "numeric" 
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("common.pleaseSignIn")}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Welcome Card */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold">{t("teacher.welcome")}</CardTitle>
          <p className="text-gray-500">{t("student.greeting", { name: user?.displayName || user?.nickname })}</p>
        </CardHeader>
      </Card>

      {/* Navigation Bar with Date and Controls */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-base font-semibold">{currentDate}</span>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button
            onClick={() => setShowAddEventOverlay(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            {t("teacher.add")}
          </Button>
          <Button
            onClick={() => setShowTeacherProfileOverlay(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105 rounded-lg"
          >
            <UserCircle className="h-4 w-4" />
            {t("teacher.profile")}
          </Button>
        </div>
      </div>

      {/* Calendar Section */}
      <TeacherCalendar bookings={bookings} />

      {/* Profile Overlay */}
      {showTeacherProfileOverlay && <TeacherProfileOverlay />}

      {/* Add Event Overlay */}
      {showAddEventOverlay && <AddEventOverlay />}

      {/* Debug Information */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="cursor-pointer select-none" onClick={() => setShowDebug(!showDebug)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{t("common.debugInformation")}</CardTitle>
            <ChevronUpIcon className={`h-4 w-4 transition-transform ${showDebug ? "rotate-0" : "rotate-180"}`} />
          </div>
        </CardHeader>
        {showDebug && (
          <CardContent className="text-xs font-mono">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(
                {
                  teacher: user,
                  bookings: bookings,
                  error: error,
                },
                null,
                2
              )}
            </pre>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
