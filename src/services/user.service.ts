import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Teacher, Student } from "@/types/user";

interface StudentProfileUpdate {
  nickname?: string;
  introduction?: string;
  interests?: string;
  goals?: string;
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
    if (userData.type !== "student") {
      throw new Error("User is not a student");
    }

    // Update the profile data
    await setDoc(
      userRef,
      {
        ...profileData,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Failed to update student profile:", error);
    throw error instanceof Error ? error : new Error("Failed to update student profile");
  }
}

export async function fetchTeachers(): Promise<Teacher[]> {
  const teachers: Teacher[] = [];

  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    const docData = doc.data();

    if (docData.type === "teacher") {
      const teacher: Teacher = {
        uid: doc.id,
        email: docData.email || null,
        nickname: docData.nickname,
        type: "teacher",
        description: docData.description || "",
        expertise: docData.expertise || "",
        education: docData.education || "",
        experience: docData.experience || "",
        teachingStyle: docData.teachingStyle || "",
        availability: docData.availability || [],
        pricing: docData.pricing || 0,
        photoURL: docData.photoURL || "",
        // Optional fields with default values
        ...(docData.createdAt && { createdAt: docData.createdAt }),
        ...(docData.introduction && { introduction: docData.introduction }),
      };
      teachers.push(teacher);
    }
  });

  return teachers;
}

export const fetchUserNickname = async (userId: string) => {
  if (!userId) return null;

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("User not found:", userId);
      return null;
    }

    const userData = docSnap.data();
    return userData.nickname || userId;
  } catch (error) {
    console.error("Error fetching user nickname:", error);
    return userId;
  }
};
