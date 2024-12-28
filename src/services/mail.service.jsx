import { formatTime } from "@/lib/utils/timeUtils";

/**
 * Sends an email using the Resend API
 * @param {Object} params - Email parameters
 * @param {string} params.content - The email content
 * @param {string} params.from - Sender email address
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject line
 * @returns {Promise} Response from the email API
 */
export async function sendMail({ content, from, to, subject }) {
    console.log('Attempting to send email:', { to, subject });
    
    try {
        const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                content,
                from: from || "onboarding@resend.dev",
                to,
                subject
            }),
        });

        const data = await response.json();
        console.log('Email API response:', data);
        
        if (!response.ok) {
            console.error('Email API error:', data);
            throw new Error(data.error || 'Failed to send email');
        }

        console.log('Email sent successfully');
        return data;

    } catch (error) {
        console.error("sendMail error:", error);
        throw error;
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