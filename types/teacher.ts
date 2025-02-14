import { Event } from "./event";

export interface TeacherDetails {
  nickname: string;
  photoURL?: string;
  introduction?: string;
  description: string;
  expertise: string;
  education: string;
  experience: string;
  teachingStyle: string;
  pricing: number;
}

export interface Teacher {
  uid: string;
  email: string;
  type: "teacher";
  createdAt?: string;

  details: TeacherDetails;

  events: Event[];
}

// Type guards
export const isTeacher = (teacher: Teacher): teacher is Teacher => {
  return teacher.type === "teacher";
};

// Factory methods
export const createTeacherFromData = (userData: any): Teacher => {
  return {
    email: userData.email,
    uid: userData.uid,
    createdAt: userData.createdAt,
    type: "teacher",

    details: {
      nickname: userData.details?.nickname || "",
      photoURL: userData.details?.photoURL || "",
      introduction: userData.details?.introduction || "",
      description: userData.details?.description || "",
      pricing: userData.details?.pricing || 0,
      expertise: userData.details?.expertise || "",
      education: userData.details?.education || "",
      experience: userData.details?.experience || "",
      teachingStyle: userData.details?.teachingStyle || "",
    },

    events: userData.events || [],
  } as Teacher;
};

export const createNewTeacher = (email: string, uid: string): Teacher => {
  return {
    email: email,
    uid: uid,
    createdAt: new Date().toISOString(),
    type: "teacher",

    details: {
      nickname: "",
      description: "",
      pricing: 0,
      expertise: "",
      education: "",
      experience: "",
      teachingStyle: "",
    },

    events: [],
  } as Teacher
};
