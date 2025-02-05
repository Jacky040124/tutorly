import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { config } from "dotenv";
import { createUserFromData, createNewStudent, createNewTeacher } from "@/types/user";
import { User } from "@/types/user";
import { Feedback } from "@/types/booking";
// Firebase Service

config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

// Auth Service

export interface authState {
  error: string | null;
  user: User | null;
}

export const signIn = async (prevState: authState, formData: FormData): Promise<authState> => {
  const email = formData.get("email");
  const password = formData.get("password");

  const userCredential = await signInWithEmailAndPassword(auth, email as string, password as string);
  const docRef = doc(db, "users", userCredential.user.uid);
  const docSnap = await getDoc(docRef);
  const userData = docSnap.data();

  if (!docSnap.exists() || !userData) {
    return { error: "User data not found", user: null };
  }

  return {
    user: createUserFromData(userData),
    error: null,
  };
};

export const signUpStudent = async (prevState: authState, formData: FormData): Promise<authState> => {
  const email = formData.get("email");
  const password = formData.get("password");
  const nickname = formData.get("nickname") as string;
  const signupCode = formData.get("signupCode") as string;

  if (signupCode !== process.env.NEXT_PUBLIC_STUDENT_SIGNUP_CODE) {
    return { error: "Invalid signup code", user: null };
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email as string, password as string);

  if (!userCredential.user.email || !userCredential.user.uid) {
    return { error: "User credential is not valid", user: null };
  }

  const userData = createNewStudent(userCredential.user.email, userCredential.user.uid, nickname);

  await setDoc(doc(db, "users", userCredential.user.uid), userData);

  return {
    user: userData,
    error: null,
  };
};

export const signUpTeacher = async (prevState: authState, formData: FormData): Promise<authState> => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  if (!userCredential.user.email || !userCredential.user.uid) {
    return { error: "User credential is not valid", user: null };
  }

  const userData = createNewTeacher(userCredential.user.email, userCredential.user.uid);

  await setDoc(doc(db, "users", userCredential.user.uid), userData);

  return { error: null, user: userData };
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

// Booking Service

export async function updateFeedback(bookingId: string, feedback: Feedback) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(
      bookingRef,
      {
        feedback: {
          rating: feedback.rating,
          comment: feedback.comment,
          studentId: feedback.studentId,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    console.log("Successfully updated feedback");
    return true;
  } catch (error) {
    console.error("Error updating feedback:", error);
    throw error;
  }
}

export interface FeedbackState {
  message: string;
  error: string | null;
}

export async function addFeedback(prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
  try {
    const bookingId = formData.get("bookingId") as string;
    const studentId = formData.get("studentId") as string;
    const rating = formData.get("rating") as string;
    const comment = formData.get("comment") as string;

    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(
      bookingRef,
      {
        feedback: {
          rating: rating,
          comment: comment,
          studentId: studentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          meetingId: bookingId,
        },
      },
      { merge: true }
    );

    return { message: "Feedback added successfully", error: null };
  } catch (error) {
    return { message: "Error adding feedback", error: error as string };
  }
}
