import { confirmBooking } from "@/services/booking.service";
import { sendMail, generateBookingConfirmationEmail } from "@/services/mail.service";
import { useUser } from '@/components/providers/UserContext';

// Custom hook to get booking-related data and functions
export function useBookingConfirmation() {
  const { user, updateUserBalance } = useUser();
  
  const handleBookingConfirmed = async (
    booking,
    teacherAvailability,
    setShowBookingOverlay,
    setBookingConfirmed,
    teacherData
  ) => {
    console.log("Starting handleBookingConfirmed with:", {
      userEmail: user?.email,
      bookingDetails: booking,
      hasTeacherAvailability: !!teacherAvailability
    });

    if (!user?.email) {
      console.error("Email sending failed: No user email found");
      throw new Error('User email is required for booking confirmation');
    }

    try {
      console.log("Attempting to confirm booking...");
      const result = await confirmBooking(booking, teacherAvailability);
      console.log("Booking confirmed successfully:", result);

      try {
        console.log("Preparing to send confirmation email to:", user.email);
        const emailContent = generateBookingConfirmationEmail(booking, teacherData);
        console.log("Generated email content:", emailContent);

        await sendMail(
          user.email,
          'Booking Confirmation - MeetYourTutor',
          emailContent
        );
        console.log('Confirmation email sent successfully to:', user.email);
      } catch (emailError) {
        console.error("Email sending failed with error:", {
          error: emailError,
          errorMessage: emailError.message,
          errorStack: emailError.stack,
          recipientEmail: user.email,
          bookingDetails: booking,
          teacherDetails: teacherData
        });
      }

      console.log("Updating UI state...");
      setShowBookingOverlay(false);
      setBookingConfirmed(true);
      
      if (updateUserBalance) {
        console.log("Updating user balance...");
        await updateUserBalance();
        console.log("User balance updated successfully");
      }

      return result;
    } catch (error) {
      console.error("Error in handleBookingConfirmed:", {
        error: error,
        errorMessage: error.message,
        errorStack: error.stack,
        bookingDetails: booking,
        userEmail: user.email
      });
      throw error;
    }
  };

  return { handleBookingConfirmed };
}
