import { 
  signInWithEmailAndPassword, 
  isSignInWithEmailLink,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const isVerificationLink = () => {
  return isSignInWithEmailLink(auth, window.location.href);
};

export const checkEmailExists = async (email) => {
  try {
    await signInWithEmailAndPassword(auth, email, "dummy-password");
    return true;
  } catch (error) {
    if (error.code !== "auth/invalid-credential") {
      throw error;
    }
    return false;
  }
};

export const createNewUser = async (email, password, nickname) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    createdAt: new Date().toISOString(),
    email: user.email,
    uid: user.uid,
    type: "student",
    nickname: nickname,
    balance: 0,
    bookingHistory: [],
  });

  return user;
};

export const sendVerificationEmail = async (email) => {
  const actionCodeSettings = {
    url: window.location.origin + "/auth/signup",
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
}; 