import { formatTime } from "@/lib/utils/timeUtils";

/**
 * Sends an email using the SendGrid API
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} content - HTML content of the email
 * @param {Object} options - Additional options (template, attachments, etc)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendMail(to, subject, content, options = {}) {
  console.log('Sending email:', { to, subject });

  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html: content,
        ...options
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return {
      success: true,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export function generateBookingConfirmationEmail(booking, teacherData) {
  const isMultipleBookings = Array.isArray(booking);
  const bookings = isMultipleBookings ? booking : [booking];
  
  const formatBookingDetails = (b) => `
    <li style="margin-bottom: 10px;">
      Date: ${b.date.day}/${b.date.month}/${b.date.year}<br>
      Time: ${formatTime(b.startTime)} - ${formatTime(b.endTime)}<br>
      ${b.link ? `Zoom Link: <a href="${b.link}">${b.link}</a>` : ''}
    </li>
  `;

  return `
    <h1>Booking Confirmation</h1>
    <p>Your booking with ${teacherData.nickname} has been confirmed.</p>
    
    <h2>Booking Details:</h2>
    <ul style="list-style: none; padding: 0;">
      ${bookings.map(formatBookingDetails).join('')}
    </ul>

    <p>Price per lesson: $${teacherData.pricing}</p>
    ${isMultipleBookings ? `<p>Total for ${bookings.length} lessons: $${teacherData.pricing * bookings.length}</p>` : ''}
    
    <p>Please e-transfer the payment to: ${teacherData.email}</p>
    
    <p>Thank you for booking with us!</p>
  `;
}