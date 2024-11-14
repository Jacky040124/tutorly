import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// = Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDdKApKZNEERKmPLfB8SxlGsJRTZV5ALvc",
    authDomain: "tutor-website-5528f.firebaseapp.com",
    projectId: "tutor-website-5528f",
    storageBucket: "tutor-website-5528f.appspot.com",
    messagingSenderId: "320690040214",
    appId: "1:320690040214:web:fde29b5326692c27e981b7",
    measurementId: "G-J0MZ8W9SSG"
};
// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { app, db, auth, doc, setDoc, getDoc, collection, getDocs };

