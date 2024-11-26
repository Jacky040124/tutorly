import {
  doc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function confirmBooking(bookings, availability, userBalance) {
  console.log('Starting booking confirmation:', {
    bookingsCount: Array.isArray(bookings) ? bookings.length : 1,
    availabilityCount: availability.length
  });

  try {
    const bookingsArray = Array.isArray(bookings) ? bookings : [bookings];
    console.log('Processing bookings:', bookingsArray);

    return await runTransaction(db, async (transaction) => {
      console.log('Started Firestore transaction');
      let updatedAvailability = availability;

      for (const booking of bookingsArray) {
        console.log('Processing booking:', booking);
        updatedAvailability = filterOutBookedSlot(updatedAvailability, booking);
      }

      console.log('Updating Firestore');
      for (const booking of bookingsArray) {
        const bookingRef = doc(
          db,
          "bookings",
          `${booking.studentId}_${booking.teacherId}_${Date.now()}_${
            booking.lessonNumber || 1
          }`
        );
        transaction.set(bookingRef, booking);
      }

      const teacherRef = doc(db, "users", bookingsArray[0].teacherId);
      transaction.set(
        teacherRef,
        { availability: updatedAvailability },
        { merge: true }
      );

      return {
        success: true,
        message: "Booking(s) confirmed successfully!",
        updatedAvailability,
      };
    });
  } catch (error) {
    console.error('Booking confirmation failed:', error);
    throw error;
  }
}

function filterOutBookedSlot(availability, booking) {
  // If this is part of a bulk booking, check all slots in the series
  if (booking.bulkId) {
    const totalWeeks = booking.totalLessons;
    const bookingDates = Array.from({ length: totalWeeks }, (_, index) => ({
      year: booking.date.year,
      month: booking.date.month,
      day: booking.date.day + index * 7,
    }));

    return availability.filter((slot) => {
      // Check if this slot conflicts with any date in the series
      return !bookingDates.some(
        (date) =>
          slot.date.year === date.year &&
          slot.date.month === date.month &&
          slot.date.day === date.day &&
          parseFloat(slot.startTime) === parseFloat(booking.startTime)
      );
    });
  }

  // Regular single booking logic
  return availability.filter((slot) => {
    const datesMatch =
      slot.date.year === booking.date.year &&
      slot.date.month === booking.date.month &&
      slot.date.day === booking.date.day;

    if (!datesMatch) return true;

    const startTimeMatch =
      parseFloat(slot.startTime) === parseFloat(booking.startTime);

    return !(datesMatch && startTimeMatch);
  });
}

export async function getTeacherBookings(teacherId) {
  try {
    console.log("Fetching bookings for teacher:", teacherId);

    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("teacherId", "==", teacherId),
      where("status", "==", "confirmed")
    );

    const querySnapshot = await getDocs(q);
    const bookings = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("Found bookings:", bookings);
    return bookings;
  } catch (error) {
    console.error("Error fetching teacher bookings:", error);
    return [];
  }
}

function validateBulkBookingAvailability(bookingsArray, availability) {
  for (const booking of bookingsArray) {
    const availableSlot = availability.some(
      (slot) =>
        slot.date.year === booking.date.year &&
        slot.date.month === booking.date.month &&
        slot.date.day === booking.date.day &&
        parseFloat(slot.startTime) === parseFloat(booking.startTime)
    );

    if (!availableSlot) {
      throw new Error(
        `Time slot not available: ${booking.date.day}/${booking.date.month}/${booking.date.year} at ${booking.startTime}:00`
      );
    }
  }
  return true;
}

export async function createConference() {
  const request = {
    displayName: "Project Kickoff",
    description: "Initial project planning meeting",
    conferenceDetails: {
      duration: 60, // in minutes
      scheduledTime: "2024-12-01T10:00:00Z",
    },
  };
  const response = await conferenceClient.createConference(request);
  console.log("Conference created:", response);
}
