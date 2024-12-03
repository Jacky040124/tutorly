"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";
import { useUser } from "@/components/providers/UserContext";
import Calendar from "@/components/calendar/Calendar";
import CalendarOverlay from "@/components/calendar/CalendarOverlay";
import TeacherProfileOverlay from "@/components/overlays/TeacherProfileOverlay";
import ErrorMessage from "@/components/common/ErrorMessage";
import BookingList from "@/components/calendar/BookingList";
import { fetchAllTeacherBookings } from "@/services/booking.service";
import { useError } from "@/components/providers/ErrorContext";
import { useOverlay } from "@/components/providers/OverlayContext";
import { useLoading } from "@/components/providers/LoadingContext";
import { useBooking } from "@/components/providers/BookingContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from 'react-i18next';


export default function TeacherAccount() {
  const { user, updateAvailability, loading: userLoading } = useUser();
  const { error, showError} = useError();
  const { showCalendarOverlay, setShowCalendarOverlay, showTeacherProfileOverlay, setShowTeacherProfileOverlay } = useOverlay();
  const {setFutureBookings, setBookings} = useBooking();
  const {setIsLoading} = useLoading();
  const { i18n, t } = useTranslation('dashboard');

  const Header = () => {
    return (
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
              console.log("TeacherProfile button clicked, showTeacherProfileOverlay:", showTeacherProfileOverlay);
            }}
            className="standard-button mr-4"
          >
            {t("teacher.profile")}
          </button>
        </div>
      </header>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      setIsLoading("teacherData", true);
      try {
        // Fetch availability
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const availabilityData = docSnap.data()?.availability || [];
        updateAvailability(availabilityData);

        // Fetch all bookings instead of just future ones
        const bookings = await fetchAllTeacherBookings(user.uid);
        setFutureBookings(bookings);
        setBookings(bookings);
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
  }, [user, userLoading]);

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
        <h2>
          {t("teacher.greeting")}, {user.nickname}
        </h2>
        <h1>{t("teacher.welcome")}</h1>
        <div className="flex h-full flex-col">
          <Header />
          <Calendar />
        </div>
        <BookingList />
      </div>
      {showCalendarOverlay && <CalendarOverlay />}
      {showTeacherProfileOverlay && <TeacherProfileOverlay />}
    </>
  );
}
