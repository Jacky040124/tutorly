"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";
import { useUser } from "@/components/providers/UserContext";
import Calendar from "@/components/calendar/Calendar";
import CalendarOverlay from "@/components/calendar/CalendarOverlay";
import TeacherProfileOverlay from "@/components/overlays/TeacherProfileOverlay";
import ErrorMessage from "@/components/common/ErrorMessage";
import FutureBookings from "@/components/calendar/FutureBookings";
import { fetchFutureBookings } from "@/services";
import { useError } from "@/components/providers/ErrorContext";
import { useOverlay } from "@/components/providers/OverlayContext";
import { useLoading } from "@/components/providers/LoadingContext";
import { useBooking } from "@/components/providers/BookingContext";


export default function TeacherAccount() {
  const { user, updateAvailability, loading: userLoading } = useUser();
  const { error, setError} = useError();
  const { showCalendarOverlay, setShowCalendarOverlay, showTeacherProfileOverlay, setShowTeacherProfileOverlay } =
    useOverlay();
  const {setFutureBookings} = useBooking();
  const {isLoading, setIsLoading} = useLoading();

  const Header = () => {
    return (
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime="2022-01">
            {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()}
          </time>
        </h1>

        <div>
          <button onClick={() => setShowTeacherProfileOverlay(true)} type="button" className="standard-button">
            Profile
          </button>

          <button onClick={() => setShowCalendarOverlay(true)} type="button" className="standard-button">
            Add event
          </button>
        </div>
      </header>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      setIsLoading('teacherData', true);
      try {
        // Fetch availability
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const availabilityData = docSnap.data()?.availability || [];
        updateAvailability(availabilityData);

        // Fetch future bookings
        const bookings = await fetchFutureBookings(user.uid);
        setFutureBookings(bookings);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading("teacherData", false);
      }
    };

    if (!userLoading) {
      fetchData();
    }
  }, [user, userLoading]);

  if (userLoading || isLoading('teacherData')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
      <h2>Hi, {user.nickname}</h2>
      <h1>Who&apos;s ready to maximise shareholder value?</h1>
      <div className="flex h-full flex-col">
        <Header />
        <Calendar />
        {showCalendarOverlay && <CalendarOverlay />}
        {showTeacherProfileOverlay && <TeacherProfileOverlay />}
      </div>
      <FutureBookings />
    </div>
  );
}
