import { Booking } from "@/types/booking";

export const filterBookingsByTime = (bookings: Booking[], showUpcoming: boolean) => {
  return bookings.filter(booking => {
    const bookingDateTime = new Date(
      booking.date.year, 
      booking.date.month - 1, 
      booking.date.day,
      booking.endTime
    );
    const now = new Date();
    return showUpcoming ? bookingDateTime >= now : bookingDateTime < now;
  });
}; 