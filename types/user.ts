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
  bookingHistory?: any[];
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

// Factory methods
export const createUserFromData = (userData: any): User => {
  const baseUser = {
    email: userData.email,
    uid: userData.uid,
    createdAt: userData.createdAt,
    nickname: userData.nickname,
  };

  if (userData.type === 'student') {
    return {
      ...baseUser,
      type: 'student',
      balance: userData.balance ?? 0,
      interests: userData.interests ?? [],
      goals: userData.goals ?? [],
      bookingHistory: userData.bookingHistory ?? [],
      academicDetails: {
        gradeLevel: userData.academicDetails?.gradeLevel ?? '',
        description: userData.academicDetails?.description ?? '',
      },
    } as Student;
  } else {
    return {
      ...baseUser,
      type: 'teacher',
      description: userData.description ?? '',
      availability: userData.availability ?? [],
      pricing: userData.pricing ?? 0,
      expertise: userData.expertise ?? '',
      education: userData.education ?? '',
      experience: userData.experience ?? '',
      teachingStyle: userData.teachingStyle ?? '',
    } as Teacher;
  }
};

export const createNewStudent = (
  email: string,
  uid: string,
  nickname: string
): Student => {
  return {
    email,
    uid,
    createdAt: new Date().toISOString(),
    type: 'student',
    nickname,
    balance: 0,
    interests: [],
    goals: [],
    bookingHistory: [],
    academicDetails: {
      gradeLevel: '',
      description: '',
    },
  };
};

export const createNewTeacher = (
  email: string,
  uid: string,
): Teacher => {
  return {
    email,
    uid,
    createdAt: new Date().toISOString(),
    type: 'teacher',
    nickname: '',
    description: '',
    availability: [],
    pricing: 0,
    expertise: '',
    education: '',
    experience: '',
    teachingStyle: '',
  };
};
