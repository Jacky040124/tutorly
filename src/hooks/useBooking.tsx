"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStudentBookings, getTeacherBookings } from "@/services/booking.service";
import { useUser } from "@/hooks/useUser";
import { Booking } from "@/types/booking";

interface BookingContextType {
  selectedSlot: any | null;
  setSelectedSlot: React.Dispatch<React.SetStateAction<any | null>>;
  showBookingOverlay: boolean;
  setShowBookingOverlay: React.Dispatch<React.SetStateAction<boolean>>;
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