"use server";

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, runTransaction, setDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { config } from "dotenv";
import { Teacher, createNewTeacher, createTeacherFromData, TeacherDetails } from "@/types/teacher";
import { Student, createNewStudent, createStudentFromData, StudentDetails } from "@/types/student";
import { Resend } from "resend";
import { ConfirmationEmailTemplate, FeedbackEmailTemplate } from "@/lib/EmailTemplate";
import { createEvent, Event, EventStatus } from "@/types/event";
import { parseEventDateTime, parseCommaSeparatedValue, isOverlap } from "@/lib/utils";

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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export async function getUserById(userId: string) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("User document not found");
  }
  return docSnap.data();
}

// Auth Service

export type authState = {
  error: string | null;
  user: Teacher | Student | null;
};

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

  if (userData && userData.type === "teacher") {
    console.log("userData", userData);
    return {
      user: createTeacherFromData(userData as Teacher),
      error: null,
    };
  }

  if (userData && userData.type === "student") {
    console.log("userData", userData);
    return {
      user: createStudentFromData(userData),
      error: null,
    };
  }

  return { error: "Invalid user type", user: null };
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

// Feedback Service

export type FeedbackState = {
  message: string;
  error: string | null;
};

export async function addFeedback(prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
  try {
    const event: Event = JSON.parse(formData.get("event") as string);
    const rating = formData.get("rating") as string;
    const comment = formData.get("comment") as string;
    const studentId = formData.get("studentId") as string;
    const teacherId = event.bookingDetails?.teacherId;

    // Validate required fields
    if (!event || !rating || !studentId || !teacherId) {
      throw new Error("Missing required fields");
    }

    // Create new event with all required fields
    const newEvent: Event = {
      ...event,
      bookingDetails: {
        studentId: studentId,
        teacherId: teacherId,
        homework: event.bookingDetails?.homework,
        feedback: {
          rating: Number(rating),
          comment: comment || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };

    // Update both teacher and student events
    await updateTeacherEvents(teacherId, newEvent);
    await updateStudentEvents(studentId, newEvent);

    return { message: "Feedback added successfully", error: null };
  } catch (error) {
    console.error("Error adding feedback:", error);
    return { 
      message: "Error adding feedback", 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Homework Service

export async function addHomework(prevState: any, formData: FormData): Promise<any> {
  try {
    const bookingId = formData.get("bookingId") as string;
    const homeworkLink = formData.get("link") as string;

    await setDoc(
      doc(db, "bookings", bookingId),
      {
        homework: {
          link: homeworkLink,
          addedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    return { message: "Homework added successfully", error: null };
  } catch (error) {
    return { message: "Error adding homework", error: error as string };
  }
}

// Mail Service
const resend = new Resend(process.env.RESEND_API_KEY);

async function getUserEmailById(userId: string): Promise<string | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("email", userData.email);
      return userData.email;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user email:", error);
    return null;
  }
}

interface sendProps {
  to: string;
  content: string;
  type: "bookingConfirmation" | "feedbackConfirmation";
}

export async function send(props: sendProps) {
  try {
    if (props.type === "bookingConfirmation") {
      await resend.emails.send({
        from: "MeetYourTutor <onboarding@resend.dev>",
        to: [props.to],
        subject: "Booking Confirmation - MeetYourTutor",
        react: ConfirmationEmailTemplate({ content: props.content }),
      });
    }

    if (props.type === "feedbackConfirmation") {
      await resend.emails.send({
        from: "MeetYourTutor <onboarding@resend.dev>",
        to: [props.to],
        subject: "Feedback Confirmation - MeetYourTutor",
        react: FeedbackEmailTemplate({ content: props.content }),
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Storage Service

interface UploadImageResult {
  downloadUrl: string;
  path: string;
}

export async function downloadFileFromUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Error in downloadFileFromUrl:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
    throw new Error("Failed to get download URL: Unknown error occurred");
  }
}

export async function uploadImage(file: File, userId: string): Promise<UploadImageResult> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Please upload an image file.");
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_SIZE) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const path = `avatars/${fileName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { details: { photoURL: downloadUrl } }, { merge: true });

    return { downloadUrl, path };
  } catch (error) {
    console.error("Error in uploadImage:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    throw new Error("Failed to upload image: Unknown error occurred");
  }
}

// Student Service

export interface UpdateStudentProfileState {
  error: string | null;
  updatedProfile: {
    nickname: string;
    introduction?: string;
    photoURL?: string;
    details: StudentDetails;
  } | null;
}

export async function updateStudentProfile(
  prevState: UpdateStudentProfileState,
  formData: FormData
): Promise<UpdateStudentProfileState> {
  try {
    const userId = formData.get("userId") as string;
    const nickname = formData.get("nickname") as string;
    const introduction = formData.get("introduction") as string;
    const photoURL = formData.get("photoURL") as string;
    const interests = parseCommaSeparatedValue(formData.get("interests") as string);
    const goals = parseCommaSeparatedValue(formData.get("goals") as string);

    if (!nickname) {
      return {
        error: "Nickname is required",
        updatedProfile: null,
      };
    }

    const updatedProfile = {
      nickname,
      photoURL,
      details: {
        interests,
        goals,
        bookingHistory: [],
        gradeLevel: "",
        description: introduction,
      },
    };

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, updatedProfile, { merge: true });

    return {
      error: null,
      updatedProfile,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update profile",
      updatedProfile: null,
    };
  }
}

// Teacher Service

interface EventState {
  events: Event[];
  error: string | null;
}

async function fetchEvents(userId: string): Promise<Event[]> {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      console.error("User document not found");
      return [];
    }

    const userData = docSnap.data();
    return userData.events || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function addEvent(prevState: EventState, formData: FormData): Promise<EventState> {
  try {
    const userId = formData.get("userId") as string;
    const isRepeating = formData.get("isRepeating") as string;
    const date = formData.get("date") as string;
    const numberOfClasses = formData.get("numberOfClasses") as string;
    const events = await fetchEvents(userId);
    const title = formData.get("title") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const meetingLinks = formData.get("meetingLinks") as string;
    const maxStudents = formData.get("maxStudents") as string;

    const baseDate = new Date(date);
    const repeatGroupId = crypto.randomUUID();
    const generatedEvents = Array.from({ length: Number(numberOfClasses) }, (_, index) => {
      const eventDate = new Date(baseDate);
      eventDate.setDate(baseDate.getDate() + index * 7); // Add weeks

      return createEvent({
        isRecurring: isRepeating === "true",
        date: parseEventDateTime(eventDate.toISOString(), startTime, endTime),
        title: title,
        meeting_link: meetingLinks,
        maxStudents: Number(maxStudents),
        enrolledStudentIds: [],
        status: { status: "available" },
        price: 0,
        repeatInfo: {
          repeatGroupId: repeatGroupId,
          repeatIndex: index,
          totalClasses: Number(numberOfClasses),
        },
      });
    });
    const newEvents = [...events, ...generatedEvents];

    const isOverlapping = isOverlap(events, generatedEvents);
    if (isOverlapping) {
      return {
        events: prevState.events,
        error: "Event overlaps with existing events",
      };
    }

    const teacherRef = doc(db, "users", userId);
    await setDoc(teacherRef, { events: newEvents }, { merge: true });
    const docSnap = await getDoc(teacherRef);
    const userData = docSnap.data();

    if (!docSnap.exists() || !userData) {
      return { error: "Failed to update teacher data", events: [] };
    }

    return {
      events: newEvents as Event[],
      error: null,
    };
  } catch (error) {
    return {
      events: prevState.events,
      error: error instanceof Error ? error.message : "Failed to add event",
    };
  }
}

// TODO: Low Priority : Implement bulk delete event logic
export async function deleteEvent(teacherId: string, event: Event) {
  const studentId = event.bookingDetails?.studentId;

  if (teacherId) {
    const teacherRef = doc(db, "users", teacherId);
    const teacherDoc = await getDoc(teacherRef);
    const teacherData = teacherDoc.data();
    const events = teacherData?.events || [];
    await setDoc(teacherRef, { events: events.filter((e: Event) => e.id !== event.id) }, { merge: true });
  }

  if (studentId) {
    const studentRef = doc(db, "users", studentId);
    const studentDoc = await getDoc(studentRef);
    const studentData = studentDoc.data();
    const events = studentData?.events || [];
    await setDoc(studentRef, { events: events.filter((e: Event) => e.id !== event.id) }, { merge: true });
  }
}

export interface UpdateTeacherProfileState {
  error: string | null;
  updatedProfile: TeacherDetails | null;
}

export async function updateTeacherProfile(prevState: UpdateTeacherProfileState, formData: FormData) {
  const userId = formData.get("userId") as string;
  const nickname = formData.get("nickname") as string;
  const description = formData.get("description") as string;
  const expertise = formData.get("expertise") as string;
  const education = formData.get("education") as string;
  const experience = formData.get("experience") as string;
  const teachingStyle = formData.get("teachingStyle") as string;
  const pricing = Number(formData.get("pricing")) || 0;

  try {
    const updatedDetails: TeacherDetails = {
      nickname,
      description,
      expertise,
      education,
      experience,
      teachingStyle,
      pricing,
    };

    console.log("updatedProfile", updatedDetails);

    const teacherRef = doc(db, "users", userId);

    await setDoc(teacherRef, { details: updatedDetails }, { merge: true });

    return {
      error: null,
      updatedProfile: updatedDetails,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update teacher profile",
      updatedProfile: prevState.updatedProfile,
    };
  }
}

async function updateTeacherEvents(teacherId: string, newEvent: Event) {
  const teacherRef = doc(db, "users", teacherId);
  const teacherDoc = await getDoc(teacherRef);
  const teacherData = teacherDoc.data();
  const existingEvents = teacherData?.events || [];
  
  // Sanitize the event object to remove any undefined values
  const sanitizedEvent = {
    ...newEvent,
    bookingDetails: {
      studentId: newEvent.bookingDetails?.studentId,
      teacherId: newEvent.bookingDetails?.teacherId,
      homework: newEvent.bookingDetails?.homework || null,
      feedback: newEvent.bookingDetails?.feedback ? {
        rating: newEvent.bookingDetails.feedback.rating,
        comment: newEvent.bookingDetails.feedback.comment || "",
        createdAt: newEvent.bookingDetails.feedback.createdAt,
        updatedAt: newEvent.bookingDetails.feedback.updatedAt
      } : null
    }
  };

  const eventExists = existingEvents.find((e: Event) => e.id === sanitizedEvent.id);
  
  if (eventExists) {
    const updatedEvents = existingEvents.map((e: Event) => e.id === sanitizedEvent.id ? sanitizedEvent : e);
    await setDoc(teacherRef, { events: updatedEvents }, { merge: true });
  } else {
    await setDoc(teacherRef, { events: [...existingEvents, sanitizedEvent] }, { merge: true });
  }
}

async function updateStudentEvents(studentId: string, newEvent: Event) {
  const studentRef = doc(db, "users", studentId);
  const studentDoc = await getDoc(studentRef);
  const studentData = studentDoc.data();
  const existingEvents = studentData?.events || [];

  // Sanitize the event object to remove any undefined values
  const sanitizedEvent = {
    ...newEvent,
    bookingDetails: {
      studentId: newEvent.bookingDetails?.studentId,
      teacherId: newEvent.bookingDetails?.teacherId,
      homework: newEvent.bookingDetails?.homework || null,
      feedback: newEvent.bookingDetails?.feedback ? {
        rating: newEvent.bookingDetails.feedback.rating,
        comment: newEvent.bookingDetails.feedback.comment || "",
        createdAt: newEvent.bookingDetails.feedback.createdAt,
        updatedAt: newEvent.bookingDetails.feedback.updatedAt
      } : null
    }
  };

  const eventExists = existingEvents.find((e: Event) => e.id === sanitizedEvent.id);

  if (eventExists) {
    const updatedEvents = existingEvents.map((e: Event) => e.id === sanitizedEvent.id ? sanitizedEvent : e);
    await setDoc(studentRef, { events: updatedEvents }, { merge: true });
  } else {
    await setDoc(studentRef, { events: [...existingEvents, sanitizedEvent] }, { merge: true });
  }
}

export interface UpdateEventDetailsState {
  message: string;
  error: string | null;
}

export async function updateEventDetails(
  prevState: UpdateEventDetailsState,
  formData: FormData
): Promise<UpdateEventDetailsState> {
  try {
    const event = formData.get("event") as string;
    const status = formData.get("status") as string;
    const homework = formData.get("homework") as string;
    const meetingLink = formData.get("meetingLink") as string;
    const teacherId = formData.get("teacherId") as string;

    if (!event) {
      return { message: "Event not found", error: "Event not found" };
    }

    const newEvent: Event = JSON.parse(event);
    newEvent.status = status as unknown as EventStatus;
    newEvent.meeting_link = meetingLink;
    if (newEvent.bookingDetails) {
      newEvent.bookingDetails = {
        ...newEvent.bookingDetails,
        homework: homework ? { link: homework, addedAt: new Date().toISOString() } : undefined,
      };
    }

    await updateTeacherEvents(teacherId, newEvent);
    if (newEvent.bookingDetails) {
      await updateStudentEvents(newEvent.bookingDetails?.studentId, newEvent);
    }

    return {
      message: "Event details updated successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error updating event details:", error);
    return {
      message: "Failed to update event details",
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function fetchTeachers(): Promise<Teacher[]> {
  const teachers: Teacher[] = [];
  const querySnapshot = await getDocs(collection(db, "users"));

  querySnapshot.forEach((doc) => {
    const docData = doc.data();
    if (docData.type === "teacher") {
      teachers.push(createTeacherFromData({ ...docData, uid: doc.id }));
    }
  });

  return teachers;
}

// Booking Service

async function fetchGroupedEvents(repeatGroupId: string, teacherId: string): Promise<string[]> {
  const eventIds: string[] = [];

  const teacherRef = doc(db, "users", teacherId);
  const teacherDoc = await getDoc(teacherRef);

  const teacherData = teacherDoc.data();
  const events = teacherData?.events || [];

  events.forEach((event: Event) => {
    if (event.repeatInfo.repeatGroupId === repeatGroupId) {
      eventIds.push(event.id);
    }
  });

  return eventIds;
}

async function fetchEventData(eventId: string, teacherId: string): Promise<Event> {
  const teacherRef = doc(db, "users", teacherId);
  const teacherDoc = await getDoc(teacherRef);
  if (!teacherDoc.exists()) {
    throw new Error("Teacher document not found");
  }

  const teacherData = teacherDoc.data();
  const event = teacherData.events?.find((e: Event) => e.id === eventId);

  if (!event) {
    throw new Error("Event data not found");
  }
  return event as Event;
}

export async function bookEvent(event: Event, teacherId: string, studentId: string) {
  const studentEmail = await getUserEmailById(studentId);
  const teacherEmail = await getUserEmailById(teacherId);
  const eventsToUpdate: string[] = await fetchGroupedEvents(event.repeatInfo.repeatGroupId, teacherId);

  console.log("eventsToUpdate", eventsToUpdate);
  console.log("studentId", studentId);
  console.log("studentEmail", studentEmail);
  console.log("teacherEmail", teacherEmail);

  if (event.enrolledStudentIds.includes(studentId)) {
    throw new Error("You have already booked this event");
  }

  if (event.maxStudents <= event.enrolledStudentIds.length) {
    throw new Error("Event is full");
  }

  if (!studentEmail || !teacherEmail) {
    throw new Error("Student or teacher email not found");
  }

  for (const eventId of eventsToUpdate) {
    const eventData = await fetchEventData(eventId, teacherId);

    const newEvent: Event = {
      ...eventData,
      status: { status: "confirmed" },
      enrolledStudentIds: [...eventData.enrolledStudentIds, studentId],
      bookingDetails: {
        studentId,
        teacherId,
      },
    };

    await updateStudentEvents(studentId, newEvent);
    await updateTeacherEvents(teacherId, newEvent);
    await send({
      to: studentEmail,
      content: "You have a new booking",
      type: "bookingConfirmation",
    });
    await send({
      to: teacherEmail,
      content: "You have a new booking",
      type: "bookingConfirmation",
    });
  }
}
