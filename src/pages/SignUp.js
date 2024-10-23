import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword} from "firebase/auth";
import { db, auth, doc, setDoc } from "@/app/firebase";
import Link from 'next/link';

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [text, setText] = useState("");

    const handleSignup = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                uid: user.uid,
                createdAt: new Date().toISOString(),
            });
            setText("Sign Up Successful, Sign in here");

        } catch (signUpError) {
            if (signUpError.code === "auth/email-already-in-use") {
                setText("You already have an Account, Sign in here");
            } else {
                setText(signUpError.message);
            }
            console.error("Error during sign-up:", signUpError.message);
        }
    };

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

    return (
        <div>
            <h1>Sign Up</h1>
            <form>
                <fieldset>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" onChange={handleEmailChange}/>

                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" onChange={handlePasswordChange}/>
                </fieldset>
            </form>

            <div class="flex justify-start pt-10 space-x-10">
                <button class="inline-block" onClick={handleSignup}>Sign Up</button>
                <Link class="inline-block" href="/TeacherSignIn">Teacher Sign In</Link>
                <Link class="inline-block" href="/">Return Home</Link>
            </div>



            {text && <div> <p class="error-text">{text}</p> <Link href="/SignIn"> Sign In </Link> </div>}
        </div>
    );
}
