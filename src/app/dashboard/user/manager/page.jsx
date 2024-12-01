"use client";
import { useEffect } from "react";
import { useUser, useBooking, useError, useLoading } from "@/components/providers";
import { fetchAllTeacherBookings } from "@/services/booking.service";
import ErrorMessage from "@/components/common/ErrorMessage";
import BookingList from "@/components/manager/BookingList";

export default function ManagerAccount() {
  const { user, teacherList, fetchTeachers, selectedTeacher, setSelectedTeacher } = useUser();
  const { setFutureBookings } = useBooking();
  const { error, setError } = useError();
  const { isLoading, setIsLoading } = useLoading();

  const Header = () => (
    <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
      <h1 className="text-base font-semibold leading-6 text-gray-900">Booking Management</h1>
      <select
        onChange={(e) => setSelectedTeacher(e.target.value)}
        value={selectedTeacher || ""}
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
    </header>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchTeachers();
      } catch (error) {
        setError(`Error fetching teachers: ${error.message}`);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedTeacher) return;

      setIsLoading(true);
      try {
        const bookings = await fetchAllTeacherBookings(selectedTeacher);
        setFutureBookings(bookings);
      } catch (error) {
        setError(`Error fetching bookings: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedTeacher]);

  if (!user || user.type !== "manager") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Unauthorized access</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {error && <ErrorMessage message={error} />}
      <div className="flex flex-col h-full">
        <Header />
        <BookingList />
      </div>
    </div>
  );
}
