"use client"
import {useState, useEffect} from 'react';
import {auth, db, doc, getDoc} from "@/app/firebase";
import {useUser} from "@/components/UserContext"
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorText, setErrorText] = useState("");
    const router = useRouter();
    const { setUser } = useUser();
    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

    async function getData(id) {

        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data()
        } else {
            console.log("No such document!");
        }
    }

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userInfo = {
                email: userCredential.user.email,
                uid: userCredential.user.uid,
                type: userCredential.user.type,
            };
            
            const curUser = await getData(userInfo.uid);
            console.log("curUser data is:", curUser);

            setUser(userInfo);

            if (curUser.type == "student") {
                router.push("/user/student");
            } else if (curUser.type == "teacher"){
                router.push("/user/teacher");
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            setErrorText("something went wrong");
        }
    };



    return (
        <div>
            <h1>Sign In</h1>
            <Link href="/">Return Home</Link>

            <form>
                <fieldset>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" onChange={handleEmailChange}/>

                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" onChange={handlePasswordChange}/>
                </fieldset>
            </form>

            <button onClick={handleSignIn}>Sign In</button>
            {errorText && <div> <p className="error-text">{errorText}</p> </div>}
        </div>
    );
}