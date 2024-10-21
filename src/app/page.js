import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

import NavBar from "../../components/NavBar";
import Home from "../../components/Home";
import Tutorial from "../../components/Tutorial";
import Teachers from "../../components/Teachers";
import Disclaimer from "../../components/Disclaimer";


export default function App() {
    
    const firebaseConfig = {
        apiKey: "AIzaSyDdKApKZNEERKmPLfB8SxlGsJRTZV5ALvc",
        authDomain: "tutor-website-5528f.firebaseapp.com",
        projectId: "tutor-website-5528f",
        storageBucket: "tutor-website-5528f.appspot.com",
        messagingSenderId: "320690040214",
        appId: "1:320690040214:web:fde29b5326692c27e981b7",
        measurementId: "G-J0MZ8W9SSG"
    };
    initializeApp(firebaseConfig)
    const db = getFirestore()


  return (
    <div>
        <NavBar />
        <Home />
        <Tutorial />
        <Teachers />
        <Disclaimer />
    </div>
  );
}
