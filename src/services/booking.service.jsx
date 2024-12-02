import {
  doc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendMail, generateBookingConfirmationEmail } from "@/services/mail.service";

export async function confirmBooking(bookings, availability) {
  console.log("confirmBooking received bookings:", {
    bookings,
    hasLink: Array.isArray(bookings) ? 
      bookings.map(b => !!b.link) : 
      !!bookings.link,
    actualLinks: Array.isArray(bookings) ?
      bookings.map(b => b.link) :
      bookings.link
  });

  try {
    const bookingsArray = Array.isArray(bookings) ? bookings : [bookings];

    return await runTransaction(db, async (transaction) => {
      let updatedAvailability = availability;

      for (const booking of bookingsArray) {
        console.log("Processing booking in transaction:", {
          bookingId: booking.studentId,
          hasLink: !!booking.link,
          link: booking.link
        });

        try {
          const enrichedBooking = {
            ...booking,
            link: booking.link || null
          };

          console.log("Created enriched booking:", {
            hasLink: !!enrichedBooking.link,
            link: enrichedBooking.link
          });

          const bookingRef = doc(
            db,
            "bookings",
            `${booking.studentId}_${booking.teacherId}_${Date.now()}_${
              booking.lessonNumber || 1
            }`
          );

          transaction.set(bookingRef, enrichedBooking);
          console.log("Saved booking to Firestore:", {
            ref: bookingRef.path,
            hasLink: !!enrichedBooking.link
          });

          updatedAvailability = filterOutBookedSlot(
            updatedAvailability,
            booking
          );
        } catch (error) {
          console.error("Error in booking loop:", error);
          throw error;
        }
      }

      const teacherRef = doc(db, "users", bookingsArray[0].teacherId);
      transaction.set(
        teacherRef,
        { availability: updatedAvailability },
        { merge: true }
      );

      return {
        message: "Booking(s) confirmed successfully!",
        updatedAvailability,
      };
    });
  } catch (error) {
    console.error("Error in confirmBooking:", {
      error,
      bookings: Array.isArray(bookings) ? 
        bookings.map(b => ({ ...b, hasLink: !!b.link })) : 
        { ...bookings, hasLink: !!bookings.link }
    });
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

export async function fetchFutureBookings(teacherId) {
  try {
    const bookings = await getTeacherBookings(teacherId);
    const currentDate = new Date();
    
    // Normalize current date to midnight for comparison
    const normalizedCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const futureBookings = bookings.filter(booking => {
      const bookingDate = new Date(
        booking.date.year,
        booking.date.month - 1, // JavaScript months are 0-based
        booking.date.day
      );
      return bookingDate >= normalizedCurrentDate;
    }).sort((a, b) => {
      // Sort by date and time
      const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
      const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.startTime - b.startTime;
    });

    return futureBookings;
  } catch (error) {
    console.error("Error fetching future bookings:", error);
    throw error;
  }
}

export async function getStudentBookings(studentId) {
  try {
    console.log("Fetching bookings for student:", studentId);

    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("studentId", "==", studentId),
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

    console.log("Found student bookings:", bookings);
    return bookings;
  } catch (error) {
    console.error("Error fetching student bookings:", error);
    return [];
  }
}

export async function fetchFutureStudentBookings(studentId) {
  try {
    const bookings = await getStudentBookings(studentId);
    const currentDate = new Date();
    
    // Normalize current date to midnight for comparison
    const normalizedCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const futureBookings = bookings.filter(booking => {
      const bookingDate = new Date(
        booking.date.year,
        booking.date.month - 1, // JavaScript months are 0-based
        booking.date.day
      );
      return bookingDate >= normalizedCurrentDate;
    }).sort((a, b) => {
      // Sort by date and time
      const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
      const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.startTime - b.startTime;
    });

    return futureBookings;
  } catch (error) {
    console.error("Error fetching future student bookings:", error);
    throw error;
  }
}

export async function handleBookingConfirmed(
  booking,
  teacherAvailability,
  teacherData,
  userEmail,
  setShowBookingOverlay,
  setBookingConfirmed
) {
  try {
    const result = await confirmBooking(booking, teacherAvailability);
    
    try {
      const emailContent = generateBookingConfirmationEmail(booking, teacherData);
      await sendMail(userEmail, "Booking Confirmation - MeetYourTutor", emailContent);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    setShowBookingOverlay(false);
    setBookingConfirmed(true);
    return result;
  } catch (error) {
    console.error("Booking confirmation failed:", error);
    throw error;
  }
}

export async function fetchAllTeacherBookings(teacherId) {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("teacherId", "==", teacherId),
      orderBy("date.year", "desc"),
      orderBy("date.month", "desc"),
      orderBy("date.day", "desc"),
      orderBy("startTime", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching teacher bookings:", error);
    throw error;
  }
}

export async function addFeedback(bookingId, feedback) {
  console.log("Adding feedback:", { bookingId, feedback });
  
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(bookingRef, {
      feedback: {
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studentId: feedback.studentId,
        meetingId: bookingId
      }
    }, { merge: true });

    console.log("Successfully added feedback");
    return true;
  } catch (error) {
    console.error("Error adding feedback:", error);
    throw error;
  }
}

export async function updateFeedback(bookingId, feedback) {
  console.log("Updating feedback:", { bookingId, feedback });
  
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(bookingRef, {
      feedback: {
        ...feedback,
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });

    console.log("Successfully updated feedback");
    return true;
  } catch (error) {
    console.error("Error updating feedback:", error);
    throw error;
  }
}

export async function deleteFeedback(bookingId) {
  console.log("Deleting feedback:", { bookingId });
  
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(bookingRef, {
      feedback: null
    }, { merge: true });

    console.log("Successfully deleted feedback");
    return true;
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw error;
  }
}