import { doc, runTransaction, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { sendMail, generateBookingConfirmationEmail } from "./mail.service";
import { Booking } from "../../types/booking";
import { Event } from "../../types/event";

type BookingWithId = Booking & { id: string };

interface TeacherData {
  email: string;
  availability: Event[];
  nickname: string;
  pricing: number;
}

interface FeedbackData {
  rating: number;
  comment: string;
  studentId: string;
}

async function checkForExistingBooking(booking: Booking) {
  const bookingsRef = collection(db, "bookings");
  const q = query(
    bookingsRef,
    where("studentId", "==", booking.studentId),
    where("teacherId", "==", booking.teacherId),
    where("date.year", "==", booking.date.year),
    where("date.month", "==", booking.date.month),
    where("date.day", "==", booking.date.day),
    where("startTime", "==", booking.startTime),
    where("status", "==", "confirmed")
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function confirmBooking(bookings : Booking[], availability: Event[]) {
  try {
    const bookingsArray = Array.isArray(bookings) ? bookings : [bookings];

    // Check for duplicate bookings before starting transaction
    for (const booking of bookingsArray) {
      const hasExistingBooking = await checkForExistingBooking(booking);
      if (hasExistingBooking) {
        throw new Error(`You have already booked this time slot on ${booking.date.day}/${booking.date.month}/${booking.date.year} at ${booking.startTime}:00`);
      }
    }

    return await runTransaction(db, async (transaction) => {
      let updatedAvailability = availability;
      const createdBookings = [];

      for (const booking of bookingsArray) {
        try {
          const enrichedBooking = {
            ...booking,
            link: booking.link || null,
            status: "confirmed",
            createdAt: new Date().toISOString(),
          };

          const bookingRef = doc(
            db,
            "bookings",
            `${booking.studentId}_${booking.teacherId}_${Date.now()}_${booking.lessonNumber || 1}`
          );

          // Find the corresponding availability slot
          const availabilitySlot = updatedAvailability.find(slot => 
            slot.date.year === booking.date.year &&
            slot.date.month === booking.date.month &&
            slot.date.day === booking.date.day &&
            slot.startTime === booking.startTime
          );

          if (!availabilitySlot) {
            throw new Error("Availability slot not found");
          }

          // Add student to enrolledStudentIds
          const updatedSlot = {
            ...availabilitySlot,
            enrolledStudentIds: [...(availabilitySlot.enrolledStudentIds || []), booking.studentId]
          };

          // Update or remove the availability slot based on enrollment
          if (updatedSlot.enrolledStudentIds.length >= (updatedSlot.maxStudents || 1)) {
            // Remove the slot if it's full
            updatedAvailability = updatedAvailability.filter(slot => 
              slot.date.year !== booking.date.year ||
              slot.date.month !== booking.date.month ||
              slot.date.day !== booking.date.day ||
              slot.startTime !== booking.startTime
            );
          } else {
            // Update the slot with new enrolledStudentIds
            updatedAvailability = updatedAvailability.map(slot => 
              slot.date.year === booking.date.year &&
              slot.date.month === booking.date.month &&
              slot.date.day === booking.date.day &&
              slot.startTime === booking.startTime
                ? updatedSlot
                : slot
            );
          }

          transaction.set(bookingRef, enrichedBooking);
          const { id, ...bookingWithoutId } = enrichedBooking;
          createdBookings.push({ id: bookingRef.id, ...bookingWithoutId });
        } catch (error) {
          console.error("Error in booking loop:", error);
          throw error;
        }
      }

      const teacherRef = doc(db, "users", bookingsArray[0].teacherId);
      transaction.set(teacherRef, { availability: updatedAvailability }, { merge: true });

      return {
        message: "Booking(s) confirmed successfully!",
        updatedAvailability,
        bookings: createdBookings,
      };
    });
  } catch (error) {
    console.error("Error in confirmBooking:", {
      error,
      bookings: Array.isArray(bookings) 
        ? bookings.map((b) => ({ ...b, hasLink: !!b.link }))
        : [{ ...(bookings as Booking), hasLink: !!(bookings as Booking).link }],
    });
    throw error;
  }
}

export async function getTeacherBookings(teacherId: string) {
  try {

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("teacherId", "==", teacherId), where("status", "==", "confirmed"));

    const querySnapshot = await getDocs(q);
    const bookings: BookingWithId[] = [];

    querySnapshot.forEach((doc) => {
      const { id, ...bookingData } = doc.data() as Booking;
      bookings.push({ id: doc.id, ...bookingData });
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching teacher bookings:", error);
    return [];
  }
}

export async function getStudentBookings(studentId: string) {
  try {
    console.log("Fetching bookings for student:", studentId);

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("studentId", "==", studentId), where("status", "==", "confirmed"));

    const querySnapshot = await getDocs(q);
    const bookings: BookingWithId[] = [];

    querySnapshot.forEach((doc) => {
      const { id, ...bookingData } = doc.data() as Booking;
      bookings.push({ id: doc.id, ...bookingData });
    });

    console.log("Found student bookings:", bookings);
    return bookings;
  } catch (error) {
    console.error("Error fetching student bookings:", error);
    return [];
  }
}

export async function fetchFutureStudentBookings(studentId: string) {
  try {
    const bookings = await getStudentBookings(studentId);
    const currentDate = new Date();

    // Normalize current date to midnight for comparison
    const normalizedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const futureBookings = bookings
      .filter((booking) => {
        const bookingDate = new Date(
          booking.date.year,
          booking.date.month - 1, // JavaScript months are 0-based
          booking.date.day
        );
        return bookingDate >= normalizedCurrentDate;
      })
      .sort((a, b) => {
        // Sort by date and time
        const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
        const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);

        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
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
  bookings: Booking[],
  teacherAvailability: Event[],
  teacherData: TeacherData,
  userEmail: string,
  setShowBookingOverlay: (show: boolean) => void,
  setBookingConfirmed: (confirmed: boolean) => void
) {
  try {
    const result = await confirmBooking(bookings, teacherAvailability);
    console.log("booking result", result);

    try {
      const emailContent = generateBookingConfirmationEmail(bookings, teacherData);
      await sendMail({
        to: userEmail,
        subject: "Booking Confirmation - MeetYourTutor",
        content: emailContent
      });
      console.log("teacherData.email:", teacherData.email);
      await sendMail({
        to: teacherData.email,
        subject: "Booking Confirmation - MeetYourTutor",
        content: emailContent
      });
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

export async function addFeedback(bookingId: string, feedback: FeedbackData) {
  console.log("Adding feedback:", { bookingId, feedback });

  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(
      bookingRef,
      {
        feedback: {
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          studentId: feedback.studentId,
          meetingId: bookingId,
        },
      },
      { merge: true }
    );

    console.log("Successfully added feedback");
    return true;
  } catch (error) {
    console.error("Error adding feedback:", error);
    throw error;
  }
}

export async function updateFeedback(bookingId: string, feedback: FeedbackData) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(
      bookingRef,
      {
        feedback: {
          rating: feedback.rating,
          comment: feedback.comment,
          studentId: feedback.studentId,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    console.log("Successfully updated feedback");
    return true;
  } catch (error) {
    console.error("Error updating feedback:", error);
    throw error;
  }
}

export async function deleteFeedback(bookingId: string) {
  console.log("Deleting feedback:", { bookingId });

  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(
      bookingRef,
      {
        feedback: null,
      },
      { merge: true }
    );

    console.log("Successfully deleted feedback");
    return true;
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw error;
  }
}

export async function updateBookingStatus(bookingId: string, newStatus: "completed" | "confirmed" | "cancelled") {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(bookingRef, { status: newStatus }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}

export async function updateBookingHomework(bookingId: string, homeworkLink: string) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(
      bookingRef,
      {
        homework: {
          link: homeworkLink,
          addedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    console.log("Successfully updated homework");
    return true;
  } catch (error) {
    console.error("Error updating homework:", error);
    throw error;
  }
}
