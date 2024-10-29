import { useState } from "react";
import {auth} from "@/app/firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function TeacherSignIn() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [errorText, setErrorText] = useState("");
    const router = useRouter();

    const handleSignIn = () => {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            console.log('User signed in:', userCredential.user);

            if (token == "david2024") {
                router.push("/teacher/TeacherAccount");
            } else {
                setErrorText("token is incorrect")
            }
            
          })
          .catch((error) => {
            setErrorText("something went wrong")
          });
      };

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);
    const handleTokenChange = (event) => setToken(event.target.value);

    return (
        <div>
            <h1>Teacher SignIn</h1>
            <Link href="/">Return Home</Link>

            <form>
                <fieldset>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" onChange={handleEmailChange}/>

                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" onChange={handlePasswordChange}/>

                    <label htmlFor="token">Tokne:</label>
                    <input type="token" id="token" name="token" onChange={handleTokenChange}/>
                </fieldset>
            </form>

            <button onClick={handleSignIn}>Sign In</button>
            {errorText && <div> <p class="error-text">{errorText}</p> </div>}
        </div>
    );
}
