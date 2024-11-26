import { confirmBooking } from "@/services/booking.service";

// TODO : Reactivate balance system after strip API plugged in
export async function handleBookingConfirmed(
  booking,
  teacherAvailability,
  setShowBookingOverlay,
  userBalance,
  setBookingConfirmed,
  updateUserBalance
) {
  try {
    const result = await confirmBooking(
      booking,
      teacherAvailability,
      userBalance
    );
    setShowBookingOverlay(false);
    setBookingConfirmed((prev) => !prev);

    // Create custom alert message with meet link
    const message = `
Booking Confirmed!
${result.message}

Meeting Details:
${
  Array.isArray(booking)
    ? booking
        .map(
          (b, i) => `
Lesson ${i + 1}:
Date: ${b.date.day}/${b.date.month}/${b.date.year}
Time: ${b.startTime}:00 - ${b.endTime}:00
Meet Link: ${b.meetLink || "Not available"}
`
        )
        .join("\n")
    : `
Date: ${booking.date.day}/${booking.date.month}/${booking.date.year}
Time: ${booking.startTime}:00 - ${booking.endTime}:00
Meet Link: ${booking.meetLink || "Not available"}
`
}`;

    alert(message);
  } catch (error) {
    console.error("Error confirming booking:", error);
    alert(error.message);
  }
}
