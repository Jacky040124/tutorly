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
  repeatInfo: RepeatInfo;
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
    repeatInfo: {
      repeatGroupId: "",
      repeatIndex: 0,
      totalClasses: 0,
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
  repeatInfo: RepeatInfo;
}

export const createEvent = (data: CreateEventData): Event => {
  const defaultEvent = createEmptyEvent();

  // Create base event with required fields
  const event: Event = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    title: data.title,
    date: {
      ...defaultEvent.date,
      ...data.date,
    },
    repeatInfo: {
      repeatGroupId: data.repeatInfo.repeatGroupId,
      repeatIndex: data.repeatInfo.repeatIndex,
      totalClasses: data.repeatInfo.totalClasses,
    },
    isRecurring: data.isRecurring ?? defaultEvent.isRecurring,
    maxStudents: data.maxStudents ?? defaultEvent.maxStudents,
    enrolledStudentIds: data.enrolledStudentIds,
    status: data.status,
    meeting_link: data.meeting_link,
    price: data.price,
  };

  // Add optional fields only if they are defined
  if (data.lessonNumber) event.lessonNumber = data.lessonNumber;
  if (data.bookingDetails) event.bookingDetails = { ...data.bookingDetails };

  return event;
};
