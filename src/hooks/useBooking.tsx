"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStudentBookings, getTeacherBookings } from "@/services/booking.service";
import { useUser } from "./useUser";
import { Booking } from "@/types/booking";

interface BookingContextType {
  selectedSlot: any | null;
  setSelectedSlot: React.Dispatch<React.SetStateAction<any | null>>;
  showBookingOverlay: boolean;
  setShowBookingOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  futureBookings: Booking[];
  setFutureBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  bookingConfirmed: boolean;
  setBookingConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
}

const BookingContext = createContext<BookingContextType>({} as BookingContextType);

export function BookingProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
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

export function useBooking(): BookingContextType {
  const context: BookingContextType = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("booking context not wrapped properly");
  }
  return context;
}