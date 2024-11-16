import { doc, setDoc, arrayUnion, increment, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function confirmBooking(booking, availability, userBalance) {
    try {
        if (userBalance < booking.price) {
            throw new Error("Insufficient balance to make this booking");
        }

        console.log('Booking data:', {
            teacherId: booking.teacherId,
            teacherIdType: typeof booking.teacherId,
            studentId: booking.studentId,
            studentIdType: typeof booking.studentId
        });

        return await runTransaction(db, async (transaction) => {
            const bookingRef = doc(db, "bookings", `${booking.studentId}_${booking.teacherId}_${Date.now()}`);
            const teacherRef = doc(db, "users", booking.teacherId);
            const studentRef = doc(db, "users", booking.studentId);

            // Get current teacher document
            const teacherDoc = await transaction.get(teacherRef);
            if (!teacherDoc.exists()) {
                throw new Error("Teacher not found - ID: " + booking.teacherId);
            }

            const teacherData = teacherDoc.data();
            console.log('Teacher document found:', teacherData);

            const updatedAvailability = filterOutBookedSlot(teacherData.availability, booking);
            
            console.log("Current teacher data:", teacherData);
            console.log("Updated availability:", updatedAvailability);

            // Update teacher document
            transaction.set(teacherRef, {
                ...teacherData,
                availability: updatedAvailability
            }, { merge: true });

            // Create booking
            transaction.set(bookingRef, {
                ...booking, 
                status: "confirmed", 
                createdAt: new Date().toISOString()
            });

            // Update student
            transaction.update(studentRef, {
                bookingHistory: arrayUnion(bookingRef.id),
                balance: increment(-booking.price)
            });

            return {
                success: true, 
                message: "Booking confirmed successfully!",
                updatedAvailability
            };
        });
    } catch (error) {
        console.error("Error confirming booking:", error);
        throw error;
    }
}

function filterOutBookedSlot(availability, booking) {
    console.log('Initial booking data:', booking);
    
    return availability.filter(slot => {
        // Ensure dates match
        const datesMatch = 
            slot.date.year === booking.date.year &&
            slot.date.month === booking.date.month &&
            slot.date.day === booking.date.day;
            
        if (!datesMatch) return true; // Keep slots on different dates
        
        // Only compare start times
        const startTimeMatch = parseFloat(slot.startTime) === parseFloat(booking.startTime);
        
        console.log('Comparing slot:', {
            slot,
            datesMatch,
            startTimeMatch,
            slotStartTime: slot.startTime,
            bookingStartTime: booking.startTime,
            match : datesMatch && startTimeMatch
        });

        // Return true to keep slots that DON'T match
        return !(datesMatch && startTimeMatch);
    });
}

export async function getTeacherBookings(teacherId) {
    try {
        console.log("Fetching bookings for teacher:", teacherId);
        
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, 
            where("teacherId", "==", teacherId),
            where("status", "==", "confirmed")
        );
        
        const querySnapshot = await getDocs(q);
        const bookings = [];
        
        querySnapshot.forEach((doc) => {
            bookings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log("Found bookings:", bookings);
        return bookings;
    } catch (error) {
        console.error("Error fetching teacher bookings:", error);
        return [];
    }
}

