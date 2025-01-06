"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStudentBookings, getTeacherBookings } from "@/services/booking.service";
import { useUser } from "./UserContext";

interface BookingContextType {
  selectedSlot: any | null;
  setSelectedSlot: React.Dispatch<React.SetStateAction<any | null>>;
  showBookingOverlay: boolean;
  setShowBookingOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  futureBookings: any[];
  setFutureBookings: React.Dispatch<React.SetStateAction<any[]>>;
  bookings: any[];
  setBookings: React.Dispatch<React.SetStateAction<any[]>>;
  bookingConfirmed: boolean;
  setBookingConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [futureBookings, setFutureBookings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Fetch bookings when user changes or booking is confirmed
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) return;

      try {
        const fetchedBookings = user.type === 'teacher' 
          ? await getTeacherBookings(user.uid)
          : await getStudentBookings(user.uid);
        
        setBookings(fetchedBookings);

        // Set future bookings
        const now = new Date();
        const future = fetchedBookings.filter((booking: any) => {
          const bookingDate = new Date(booking.date.year, booking.date.month - 1, booking.date.day);
          return bookingDate >= now;
        });
        setFutureBookings(future);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [user, bookingConfirmed]);

  const value = {
    selectedSlot,
    setSelectedSlot,
    showBookingOverlay,
    setShowBookingOverlay,
    futureBookings,
    setFutureBookings,
    bookings,
    setBookings,
    bookingConfirmed,
    setBookingConfirmed,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("booking context not wrapped properly");
  }
  return context;
}