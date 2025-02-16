export interface Homework {
  link: string;
  addedAt: string;
}

export interface Feedback {
  rating?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RepeatInfo {
  repeatGroupId: string; // Unique identifier for repeating events group
  repeatIndex: number; // Index of this event in the repeating sequence
  totalClasses: number; // Total number of classes in repeating sequence
}

export interface BookingDetails {
  studentId: string;
  teacherId: string;
  repeatInfo?: RepeatInfo;
  homework?: Homework;
  feedback?: Feedback;
}

export interface EventDate {
  day: number;
  month: number;
  year: number;
  startTime: number;
  endTime: number;
}

export interface EventStatus {
  status: "completed" | "confirmed" | "cancelled" | "available";
}

export interface Event {
  id: string;
  title: string;
  bulkId?: string;
  createdAt: string;
  date: EventDate;
  isRecurring: boolean;
  maxStudents: number;
  enrolledStudentIds: string[];
  status: EventStatus;
  meeting_link: string;
  price: number;

  lessonNumber?: number;
  bookingDetails?: BookingDetails;
}

const createEmptyEvent = (): Event => {
  return {
    id: "",
    title: "",
    createdAt: new Date().toISOString(),
    date: {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
      startTime: 0,
      endTime: 0,
    },
    isRecurring: false,
    maxStudents: 1,
    enrolledStudentIds: [],
    status: { status: "available" },
    meeting_link: "",
    price: 0,
  };
};

export interface CreateEventData {
  title: string;
  bulkId?: string;
  date: EventDate;
  isRecurring?: boolean;
  maxStudents?: number;
  enrolledStudentIds: string[];
  status: EventStatus;
  meeting_link: string;
  price: number;
  lessonNumber?: number;
  bookingDetails?: BookingDetails;
}

export const createEvent = (data: CreateEventData): Event => {
  const defaultEvent = createEmptyEvent();

  const bookingDetails = data.bookingDetails
    ? {
        ...defaultEvent.bookingDetails,
        ...data.bookingDetails,
      }
    : undefined;

  return {
    ...defaultEvent,
    ...data,
    date: {
      ...defaultEvent.date,
      ...data.date,
    },
    bookingDetails,
    createdAt: new Date().toISOString(), // Always use current timestamp
    id: crypto.randomUUID(), // Generate a unique ID
  };
};
