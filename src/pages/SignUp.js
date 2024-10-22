import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword} from "firebase/auth";
import { db, auth, doc, setDoc } from "@/app/firebase";

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
            <a href="/TeacherSignIn">Teacher Sign In</a>
            <a href="/">Return Home</a>

            <form>
                <fieldset>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" onChange={handleEmailChange}/>

                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" onChange={handlePasswordChange}/>
                </fieldset>
            </form>

            <button onClick={handleSignup}>Sign Up</button>
            {text && <div> <p className="error-text">{text}</p> <a href="/SignIn"> Sign In </a> </div>}
        </div>
    );
}
