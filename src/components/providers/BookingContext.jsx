"use client"

import { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [futureBookings, setFutureBookings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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