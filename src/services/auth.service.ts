import { auth, db } from '../lib/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const docRef = doc(db, "users", userCredential.user.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        throw new Error("User data not found");
    }
    
    const userData = docSnap.data();
    let formattedUser;

    if (userData.type === "teacher") {
        formattedUser = {
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            type: userData.type,
            nickname: userData.nickname,
            description: userData.description,
            availability: userData.availability,
            pricing: userData.pricing
        };
    } else if (userData.type === "student") {
        formattedUser = {
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            type: userData.type,
            nickname: userData.nickname,
            balance: userData.balance,
        };
    }

    return {
        user: formattedUser,
        redirectTo: `/dashboard/${userData.type}/${userCredential.user.uid}`
    };
};

export const signUpStudent = async (email: string, password: string, nickname: string) => {
    if (!email || !password || !nickname) {
        throw new Error("All fields are required");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const userData = {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString(),
        type: "student",
        nickname,
        balance: 0
        };

    await setDoc(doc(db, "users", userCredential.user.uid), userData);
    
    return userData;
};

export const signUpTeacher = async (email: string, password: string, nickname: string, description: string) => {
    if (!email || !password || !nickname || !description) {
        throw new Error("All fields are required");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const userData = {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString(),
        type: "teacher",
        nickname,
        description,
        availability: [],
        pricing: 0,
    };

    await setDoc(doc(db, "users", userCredential.user.uid), userData);
    
    return {
        message: "Sign Up Successful, Sign in here",
        userData
    };
};

export const signOut = async () => {
    await firebaseSignOut(auth);
}; 