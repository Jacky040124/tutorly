interface BaseUser {
  uid: string;
  email: string | null;
  photoURL?: string;
  nickname: string;
  type: "teacher" | "student";
  createdAt?: string;
}

export interface Teacher extends BaseUser {
  type: 'teacher';
  description: string;
  introduction?: string;
  expertise?: string;
  education?: string;
  experience?: string;
  teachingStyle?: string;
  availability: any[]; // TODO: Define availability type
  pricing: number;
}

export interface Student extends BaseUser {
  type: "student";
  balance: number;
  introduction: string;
  interests: string;
  goals: string;
  bookingHistory?: any[]; // Optional booking history
  academicDetails?: {
    gradeLevel?: string;
    description?: string;
  };
}

export type User = Teacher | Student;
