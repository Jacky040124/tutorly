"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";
import { useUser } from "@/components/providers/UserContext";
import TeacherCalendar from "@/components/calendar/TeacherCalendar";
import TeacherProfileOverlay from "@/components/overlays/TeacherProfileOverlay";
import ErrorMessage from "@/components/common/ErrorMessage";
import BookingList from "@/components/calendar/BookingList";
import { getTeacherBookings } from "@/services/booking.service";
import { useError } from "@/components/providers/ErrorContext";
import { useOverlay } from "@/components/providers/OverlayContext";
import { useLoading } from "@/components/providers/LoadingContext";
import { useBooking } from "@/components/providers/BookingContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function TeacherAccount() {
  const { user, updateAvailability, loading: userLoading, availability } = useUser();
  const { error, showError } = useError();
  const { setShowCalendarOverlay, showCalendarOverlay, showTeacherProfileOverlay, setShowTeacherProfileOverlay } =
    useOverlay();
  const { setFutureBookings, setBookings } = useBooking();
  const { setIsLoading } = useLoading();
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid || userLoading) return;

      setIsLoading("teacherData", true);
      try {
        // Fetch availability
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const availabilityData = docSnap.data()?.availability || [];
        updateAvailability(availabilityData);
        console.log("availabilityData :", availabilityData);

        // Fetch bookings
        const bookings = await getTeacherBookings(user.uid);
        setBookings(bookings);
        setFutureBookings(bookings);
        console.log("bookings :", bookings);
      } catch (error) {
        console.error("Error fetching data:", error);
        showError(error.message);
      } finally {
        setIsLoading("teacherData", false);
      }
    };

    if (!userLoading) {
      fetchData();
    }
  }, [user, userLoading, showCalendarOverlay]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Please sign in to access this page</div>
      </div>
    );
  }

  return (
    <>
      <div>
        {error && <ErrorMessage message={error} />}
        <div className="px-6 py-4 space-y-1">
          <h1 className="text-3xl font-semibold text-gray-900">{t("teacher.welcome")}</h1>
          <h2 className="text-lg text-gray-600">
            {t("teacher.greeting")}, {user.nickname}
          </h2>
        </div>
        <div className="flex h-full flex-col">
          <header className="flex flex-none justify-end border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => {
                  setShowCalendarOverlay(true);
                }}
                className="standard-button mr-4"
              >
                {t("teacher.add")}
              </button>
              <button
                onClick={() => {
                  setShowTeacherProfileOverlay(true);
                }}
                className="standard-button mr-4"
              >
                {t("teacher.profile")}
              </button>
            </div>
          </header>
          <TeacherCalendar />
        </div>
        <BookingList />
      </div>
      {showTeacherProfileOverlay && <TeacherProfileOverlay />}
    </>
  );
}
