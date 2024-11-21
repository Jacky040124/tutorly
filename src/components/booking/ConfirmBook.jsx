import { confirmBooking } from '@/services/booking.service';

export async function handleBookingConfirmed(booking, teacherAvailability, setShowBookingOverlay, userBalance, setBookingConfirmed, updateUserBalance) {
    try {
        const result = await confirmBooking(booking, teacherAvailability, userBalance);
        setShowBookingOverlay(false);
        setBookingConfirmed(prev => !prev);
        
        // Update local user balance state
        const newBalance = userBalance - booking.price;
        await updateUserBalance(newBalance);
        
        alert(result.message);
    } catch (error) {
        console.error("Error confirming booking:", error);
        alert(error.message);
    }
}