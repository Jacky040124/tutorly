import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Teacher, Student } from "@/types/user";

interface AcademicDetails {
  gradeLevel: string;
  description: string;
}

interface TeacherProfileUpdate {
  nickname?: string;
  introduction?: string;
  expertise?: string;
  education?: string;
  experience?: string;
  teachingStyle?: string;
}

interface StudentProfileUpdate {
  nickname?: string;
  introduction?: string;
  interests?: string;
  goals?: string;
}

export async function updateTeacherProfile(userId: string, profileData: TeacherProfileUpdate) {
  try {
    // First verify the user exists and is a teacher
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userSnap.data() as Teacher;
    if (userData.type !== 'teacher') {
      throw new Error("User is not a teacher");
    }

    // Update the profile data
    await setDoc(userRef, {
      ...profileData,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Failed to update teacher profile:", error);
    throw error instanceof Error 
      ? error 
      : new Error("Failed to update teacher profile");
  }
}

export async function updateStudentAcademicDetails(userId: string, academicDetails: AcademicDetails) {
  console.log("Updating academic details:", { userId, academicDetails });
  
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      academicDetails: {
        gradeLevel: academicDetails.gradeLevel,
        description: academicDetails.description,
        lastUpdated: new Date().toISOString()
      }
    }, { merge: true });

    console.log("Successfully updated academic details");
    return true;
  } catch (error : any) {
    throw new Error(`Failed to update academic details: ${error.message}`);
  }
}

export async function updateStudentProfile(userId: string, profileData: StudentProfileUpdate) {
  try {
    // First verify the user exists and is a student
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userSnap.data() as Student;
    if (userData.type !== 'student') {
      throw new Error("User is not a student");
    }

    // Update the profile data
    await setDoc(userRef, {
      ...profileData,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Failed to update student profile:", error);
    throw error instanceof Error 
      ? error 
      : new Error("Failed to update student profile");
  }
}
