export interface Event {
  id: string;
  title: string;
  bulkId?: string;
  createdAt: string;
  date: {
    day: number;
    month: number;
    year: number;
    startTime: number;
    endTime: number;
  };
  isRecurring: boolean;
  maxStudents: number;
  enrolledStudentIds: string[];

  status: "completed" | "confirmed" | "cancelled" | "available";
  lessonNumber?: number;
  meeting_link: string;
  price: number;

  bookingDetails?: {
    studentId: string;
    teacherId: string;

    repeatInfo?: {
      repeatGroupId: string; // Unique identifier for repeating events group
      repeatIndex: number; // Index of this event in the repeating sequence
      totalClasses: number; // Total number of classes in repeating sequence
    };

    homework?: {
      link: string;
      addedAt: string;
    };

    feedback?: {
      rating?: number;
      comment?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

export const createEmptyEvent = (): Event => {
  return {
    id: '',
    title: '',
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
    status: 'available',
    meeting_link: '',
    price: 0
  };
};

export interface CreateEventData {
  title?: string;
  date?: {
    day?: number;
    month?: number;
    year?: number;
    startTime?: number;
    endTime?: number;
  };
  maxStudents?: number;
  price?: number;
  meeting_link?: string;
  isRecurring?: boolean;
  bulkId?: string;
  lessonNumber?: number;
}

export const createEvent = (data: CreateEventData): Event => {
  const defaultEvent = createEmptyEvent();
  
  return {
    ...defaultEvent,
    ...data,
    date: {
      ...defaultEvent.date,
      ...data.date
    },
    createdAt: new Date().toISOString(), // Always use current timestamp
    id: crypto.randomUUID() // Generate a unique ID
  };
};



