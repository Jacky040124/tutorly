import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Logger } from "@/utils/logger";

export async function updateStudentAcademicDetails(userId, academicDetails) {
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
  } catch (error) {
    Logger.logError(error, {
      context: 'updateStudentAcademicDetails',
      userId,
      academicDetails
    });
    throw new Error(`Failed to update academic details: ${error.message}`);
  }
}
