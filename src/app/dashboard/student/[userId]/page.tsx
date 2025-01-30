"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useBooking } from "@/hooks/useBooking";
import { getStudentBookings } from "@/services/booking.service";
import StudentCalendar from "@/components/StudentCalendar";
import StudentProfileOverlay from "@/components/StudentProfileOverlay";
import { useOverlay } from "@/hooks/useOverlay";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "@/lib/LanguageSwitcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserCircle, Code2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTeachers } from "@/hooks/useTeacher";
import { getWeekBounds } from "@/lib/utils/timeUtils";

interface StudentDashboardProps {
  params: {
    userId: string;
  };
}

export default function StudentDashboard({ params }: StudentDashboardProps) {
  const { user } = useUser();
  const [selectedTeacher, setSelectedTeacher] = useState<string>("default");
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const { teachers } = useTeachers();
  const { setFutureBookings, setBookings, showBookingOverlay, bookings, futureBookings } = useBooking();
  const { showStudentProfileOverlay, setShowStudentProfileOverlay } = useOverlay();
  const t = useTranslations("Dashboard.Student");
  const tCommon = useTranslations("Dashboard.Common");

  // Get the current week's dates based on offset
  const currentWeek = getWeekBounds(weekOffset);
  const startDate = new Date(currentWeek.monday.year, currentWeek.monday.month - 1, currentWeek.monday.day);

  // initialization
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (user?.uid) {
          const allBookings = await getStudentBookings(user.uid);
          const futureBookings = allBookings.filter((booking) => {
            const bookingDate = new Date(booking.date.year, booking.date.month - 1, booking.date.day);
            return bookingDate >= new Date();
          });
          setFutureBookings(futureBookings);
          setBookings(allBookings);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`Error fetching data: ${error.message}`);
        } else {
          console.error("Unknown error:", error);
        }
      }
    };

    fetchInitialData();
  }, [user, showBookingOverlay]);

  const handleSelect = (value: string) => {
    setSelectedTeacher(value);
  };

  // Helper function to find teacher by ID
  const findTeacherById = (teacherId: string) => {
    return teachers.find((teacher) => teacher.uid === teacherId);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{tCommon("pleaseSignIn")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col gap-4 p-4">
      <Card className="rounded-xl shadow-md">
        <CardContent>
          <div className=" p-6 space-y-1">
            <CardTitle className="text-3xl font-semibold text-foreground transition-colors duration-200">
              {selectedTeacher !== "default" && findTeacherById(selectedTeacher)
                ? t("teacherRate", {
                    price: findTeacherById(selectedTeacher)?.pricing,
                  })
                : t("selectTeacherPrompt")}
            </CardTitle>
            <CardDescription className="text-lg">
              {t("greeting")}, {user.nickname}
            </CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-5 w-5 text-muted-foreground animate-pulse" />
              <h1 className="text-base font-semibold text-foreground">
                <time dateTime={startDate.toISOString()}>
                  {startDate.toLocaleString("default", { month: "long" })} {startDate.getFullYear()}
                </time>
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="transition-transform hover:scale-105 duration-200">
                <LanguageSwitcher />
              </div>

              <Button
                onClick={() => setShowStudentProfileOverlay(true)}
                variant="outline"
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105 rounded-lg"
              >
                <UserCircle className="h-4 w-4" />
                <span>{t("profile")}</span>
              </Button>

              <div className="transition-transform hover:scale-105 duration-200">
                <Select value={selectedTeacher} onValueChange={handleSelect}>
                  <SelectTrigger className="w-[200px] rounded-lg">
                    <SelectValue placeholder={t("selectTeacher")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="default">{t("selectTeacher")}</SelectItem>
                    {teachers &&
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.uid} value={teacher.uid}>
                          {teacher.nickname}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StudentCalendar
        selectedTeacher={selectedTeacher === "default" ? -1 : teachers.findIndex((t) => t.uid === selectedTeacher)}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
      />

      <Card className="rounded-xl shadow-md">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="debug" className="border-none">
              <AccordionTrigger className="text-sm hover:no-underline px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Code2 className="h-4 w-4" />
                  <span>{tCommon("debugInformation")}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-[300px] w-full rounded-lg border m-4 p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">User Info:</h3>
                      <pre className="text-xs bg-muted p-2 rounded">
                        {JSON.stringify({ uid: user.uid, nickname: user.nickname }, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Selected Teacher:</h3>
                      <pre className="text-xs bg-muted p-2 rounded">
                        {JSON.stringify(selectedTeacher ? findTeacherById(selectedTeacher) : null, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Future Bookings:</h3>
                      <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(futureBookings, null, 2)}</pre>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">All Bookings:</h3>
                      <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(bookings, null, 2)}</pre>
                    </div>
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {showStudentProfileOverlay && <StudentProfileOverlay />}
    </div>
  );
}
