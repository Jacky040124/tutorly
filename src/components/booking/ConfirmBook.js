import { confirmBooking } from '@/services/booking.service';

export async function handleBookingConfirmed(booking, teacherAvailability, setShowBookingOverlay, userBalance) {
    try {
        const result = await confirmBooking(booking, teacherAvailability, userBalance);
        setShowBookingOverlay(false);
        alert(result.message);
    } catch (error) {
        console.error("Error confirming booking:", error);
        alert(error.message);
    }
}