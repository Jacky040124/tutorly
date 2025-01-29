export interface Booking {
  id: string;
  bulkId?: string;
  createdAt: string;
  date: {
    day: number;
    month: number;
    year: number;
  };
  endTime: number;
  lessonNumber?: number;
  link: string;
  price: number;
  startTime: number;
  status: "completed" | "confirmed" | "cancelled";
  studentId: string;
  teacherId: string;
  totalLessons?: number;
  title?: string;
  homework?: {
    link: string;
    addedAt: string;
  };
  feedback?: {
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    studentId: string;
    meetingId: string;
  };
}
