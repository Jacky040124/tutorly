export type EventDate = {
  day: number;    // The day of the month
  month: number;  // The month (1-12)
  year: number;   // The full year
};

export type Event = {
  title: string;
  date: EventDate;
  startTime: number; // Start hour of the event (0-23)
  endTime: number; // End hour of the event (0-23)
  meeting_link: string; // Zoom meeting link for the event

  maxStudents: number; // Maximum number of students allowed to enroll
  enrolledStudentIds: string[]; // Array of student IDs who have enrolled

  isRepeating: boolean; // Whether this is a repeating event
  repeatGroupId: string; // Unique identifier for repeating events group
  repeatIndex: number; // Index of this event in the repeating sequence
  totalClasses: number; // Total number of classes in repeating sequence
};

export type CalendarEvent = {
  id: string;           // Unique identifier for the event
  calendarId: string;   // ID of the calendar this event belongs to
  title: string;        // Display title of the event
  category: string;     // Event category (e.g., "time")
  start: Date;         // Start date and time
  end: Date;           // End date and time
  isReadOnly: boolean;  // Whether the event can be modified
  raw: Event;          // Raw event data
};

export {};

