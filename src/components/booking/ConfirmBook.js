
export async function handleBookingConfirmed (booking) {
    try {
        // Create the booking document
        const bookingRef = doc(db, "bookings", `${booking.studentId}_${booking.teacherId}_${Date.now()}`);
        await setDoc(bookingRef, {...booking, status: "confirmed", createdAt: new Date().toISOString()});

        // Update teacher's availability by removing the booked slot
        const updatedAvailability = availability.filter(slot => {
            const slotDate = new Date(slot.date.year, slot.date.month - 1, slot.date.day);
            const bookingDate = new Date(booking.date.year, booking.date.month - 1, booking.date.day);
            
            return !(slotDate.getTime() === bookingDate.getTime() && 
                    slot.startTime === booking.startTime && 
                    slot.endTime === booking.endTime);
        });

        // Update teacher's availability in Firebase
        const teacherRef = doc(db, "users", booking.teacherId);
        await setDoc(teacherRef, { availability: updatedAvailability }, { merge: true });

        // Update student's booking history and balance
        const studentRef = doc(db, "users", booking.studentId);
        await setDoc(studentRef, {
            bookingHistory: arrayUnion(bookingRef.id),
            balance: increment(-booking.price)
        }, { merge: true });

        setShowBookingOverlay(false);
        alert("Booking confirmed successfully!");
        
    } catch (error) {
        console.error("Error confirming booking:", error);
        alert("Failed to confirm booking. Please try again.");
    }
};