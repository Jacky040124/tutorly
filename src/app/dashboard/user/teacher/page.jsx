"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/UserContext";
import Calendar from "@/components/calendar/Calendar";
import CalendarOverlay from "@/components/calendar/CalendarOverlay";
import TeacherProfileOverlay from "@/components/overlays/TeacherProfileOverlay";
import ErrorMessage from "@/components/common/ErrorMessage";
import FutureBookings from "@/components/calendar/FutureBookings";
import { fetchFutureBookings } from "@/services";

export default function TeacherAccount() {
  const { user, availability, updateAvailability } = useUser();
  const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
  const [showTeacherProfileOverlay, setShowTeacherProfileOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { loading: userLoading } = useUser();
  const [error, setError] = useState();
  const [futureBookings, setFutureBookings] = useState([]);

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
        setIsLoading(false);
      }
    };

    if (!userLoading) {
      fetchData();
    }
  }, [user, userLoading]);

  if (userLoading || isLoading) {
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

        {showCalendarOverlay && <CalendarOverlay setShowOverlay={setShowCalendarOverlay} />}
        {showTeacherProfileOverlay && <TeacherProfileOverlay setShowOverlay={setShowTeacherProfileOverlay} />}
      </div>
      <FutureBookings bookings={futureBookings} />
    </div>
  );
}
