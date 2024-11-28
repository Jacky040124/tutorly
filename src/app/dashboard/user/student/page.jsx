"use client";
import { useEffect } from "react";
import { useUser } from "@/components/providers/UserContext";
import { useLoading } from "@/components/providers/LoadingContext";
import { useError } from "@/components/providers/ErrorContext";
import { useBooking } from "@/components/providers/BookingContext";
import { fetchFutureStudentBookings } from "@/services/booking.service";
import Calendar from "@/components/calendar/Calendar";
import ErrorMessage from "@/components/common/ErrorMessage";
import FutureBookings from "@/components/calendar/FutureBookings";

export default function StudentAccount() {
  const { user, teacherList, fetchTeachers, selectedTeacher, setSelectedTeacher } = useUser();
  const {setIsLoading} = useLoading();
  const {error, setError} = useError();
  const {setFutureBookings} = useBooking();

  const Header = () => {
    return (
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime="2022-01">
            {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()}
          </time>
        </h1>

        <div>
          <select
            onChange={(e) => setSelectedTeacher(e.target.value)}
            value={selectedTeacher}
            className="rounded-md border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <option value="">Select a Teacher</option>
            {teacherList &&
              Object.entries(teacherList).map(([id, teacher]) => (
                <option key={id} value={id}>
                  {teacher.nickname}
                </option>
              ))}
          </select>
        </div>
      </header>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.uid) {
          setIsLoading(false);
          return;
        }

        const bookings = await fetchFutureStudentBookings(user.uid);
        setFutureBookings(bookings);
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    fetchTeachers();
  }, []);

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
      <h1>
        {selectedTeacher && teacherList[selectedTeacher]
          ? `${teacherList[selectedTeacher].nickname}'s rate is ${teacherList[selectedTeacher].pricing} dollars per hour`
          : "Select a teacher"}
      </h1>
      <Header />
      <div className="flex h-full flex-col">
        <Calendar />
        <FutureBookings />
      </div>
    </div>
  );
}
