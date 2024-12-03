"use client";

import { useEffect } from "react";
import { useUser, useLoading, useError, useBooking, useOverlay } from "@/components/providers/index";
import { fetchFutureStudentBookings, getStudentBookings } from "@/services/booking.service";
import BookingList from "@/components/calendar/BookingList";
import Calendar from "@/components/calendar/Calendar";
import StudentProfileOverlay from "@/components/overlays/StudentProfileOverlay";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ErrorMessage  from "@/components/common/ErrorMessage";
import { useTranslation } from "react-i18next";

export default function StudentAccount() {
  const { user, teacherList, fetchTeachers, selectedTeacher, setSelectedTeacher } = useUser();
  const { setIsLoading } = useLoading();
  const { error, showError } = useError();
  const { setFutureBookings, setBookings } = useBooking();
  const { showStudentProfileOverlay, setShowStudentProfileOverlay } = useOverlay();
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchTeachers();

        if (user?.uid) {
          const bookings = await fetchFutureStudentBookings(user.uid);
          setFutureBookings(bookings);
          setBookings(bookings);
        }
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid || !selectedTeacher) return;

      try {
        setIsLoading(true);
        const allBookings = await getStudentBookings(user.uid);
        const futureBookings = allBookings.filter((booking) => {
          const bookingDate = new Date(booking.date.year, booking.date.month - 1, booking.date.day);
          return bookingDate >= new Date();
        });

        setFutureBookings(futureBookings);
        setBookings(allBookings);
      } catch (error) {
        showError(`Error fetching bookings: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedTeacher, user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Please sign in to access this page</div>
      </div>
    );
  }

  return (
    <div>
      {error && <ErrorMessage message={error} />}
      <h2>
        {t("student.greeting")}, {user.nickname}
      </h2>
      <h1>
        {selectedTeacher && teacherList[selectedTeacher]
          ? `${teacherList[selectedTeacher].nickname}${t("student.teacherRate", {
              price: teacherList[selectedTeacher].pricing,
            })}`
          : t("student.selectTeacherPrompt")}
      </h1>
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button onClick={() => setShowStudentProfileOverlay(true)} className="standard-button mr-4">
            {t("student.profile")}
          </button>
          <select
            onChange={(e) => setSelectedTeacher(e.target.value)}
            value={selectedTeacher}
            className="rounded-md border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <option value="">{t("student.selectTeacher")}</option>
            {teacherList &&
              Object.entries(teacherList).map(([id, teacher]) => (
                <option key={id} value={id}>
                  {teacher.nickname}
                </option>
              ))}
          </select>
        </div>
      </header>
      <div className="flex h-full flex-col">
        <Calendar />
        <BookingList />
      </div>
      {showStudentProfileOverlay && <StudentProfileOverlay />}
    </div>
  );
}
