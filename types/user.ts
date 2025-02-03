import { Event } from './event';

interface BaseUser {
  uid: string;
  email: string;
  photoURL?: string;
  nickname: string;
  type: "teacher" | "student";
  createdAt?: string;
  introduction?: string;
}
// TODO: availability by definition is a list of evnents
export interface Teacher extends BaseUser {
  type: 'teacher';
  description: string;
  expertise: string;
  education: string;
  experience: string;
  teachingStyle: string;
  availability: Event[];
  pricing: number;
}

export interface Student extends BaseUser {
  type: "student";
  balance: number;
  interests: string[];
  goals: string[];
  bookingHistory?: any[]; // Consider creating a BookingRecord type
  academicDetails?: {
    gradeLevel?: string;
    description?: string;
  };
}

export type User = Teacher | Student;

// Type guards
export const isTeacher = (user: User): user is Teacher => {
  return user.type === 'teacher';
}

export const isStudent = (user: User): user is Student => {
  return user.type === 'student';
}
