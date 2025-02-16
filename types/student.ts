import { Event } from "./event";

export interface StudentDetails {
  gradeLevel?: string;
  description?: string;
  interests: string[];
  bookingHistory?: any[];
  goals: string[];
  photoURL?: string;
}

export interface Student {
  uid: string;
  type: "student";
  email: string;
  nickname: string;
  createdAt?: string;

  introduction?: string;
  balance: number;

  details: StudentDetails;
  
  events: Event[];
}

export const isStudent = (student: Student): student is Student => {
  return student.type === "student";
};

export const createNewStudent = (email: string, uid: string, nickname: string): Student => {
  return {
    email,
    uid,
    createdAt: new Date().toISOString(),
    type: "student",
    nickname,
    balance: 0,

    details: {
      interests: [],
      goals: [],
      bookingHistory: [],
      gradeLevel: "",
      description: "",
    },

    events: [],
  };
};

// Factory methods
export const createStudentFromData = (userData: any): Student => {
  return {
    email: userData.email,
    uid: userData.uid,
    createdAt: userData.createdAt,
    nickname: userData.nickname,
    type: "student",
    balance: userData.balance ?? 0,

    details: {
      interests: userData.details?.interests ?? [],
      goals: userData.details?.goals ?? [],
      bookingHistory: userData.details?.bookingHistory ?? [],
      gradeLevel: userData.details?.gradeLevel ?? "",
      description: userData.details?.description ?? "",
      photoURL: userData.details?.photoURL ?? "",
    },

    events: userData.events ?? [],
  } as Student;
};
