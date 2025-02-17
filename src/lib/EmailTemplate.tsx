import { Content } from "next/font/google";

type EmailTemplateProps = {
  teacherData: {
    nickname: string;
    pricing: number;
    email: string;
  };
  bookings: any[];
  formatBookingDetails: (booking: any) => string;
  isMultipleBookings: boolean;
};

type EmailContentProps = {
  content: string;
};

export const ConfirmationEmailTemplate: React.FC<Readonly<EmailContentProps>> = ({ content }) => {
  return (
    <div>
      <h1>Booking Confirmation</h1>
      {content}
    </div>
  );
};

export const FeedbackEmailTemplate: React.FC<Readonly<EmailContentProps>> = ({ content }) => {
  return (
    <div>
      <h1>Feedback received</h1>
      {content}
    </div>
  );
};
