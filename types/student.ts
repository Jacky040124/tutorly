import { Event } from "./event";

export interface Student {
  uid: string;
  type: "student";
  email: string;
  nickname: string;
  createdAt?: string;

  photoURL?: string;
  introduction?: string;
  balance: number;

  details: {
    gradeLevel?: string;
    description?: string;
    interests: string[];
    bookingHistory?: any[];
    goals: string[];
  };
  
  Events: Event[];
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

    Events: [],
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
      interests: userData.interests ?? [],
      goals: userData.goals ?? [],
      bookingHistory: userData.bookingHistory ?? [],
      gradeLevel: userData.academicDetails?.gradeLevel ?? "",
      description: userData.academicDetails?.description ?? "",
    },

    Events: userData.Events,
  } as Student;
};
