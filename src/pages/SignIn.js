import { useState } from "react";
import {auth} from "@/app/firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function SignIn() {
    const [isSignIn, setIsSignedIn] = useState(false); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorText, setErrorText] = useState("");
    const router = useRouter();

    const handleSignIn = () => {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            setIsSignedIn(true)
            console.log('User signed in:', userCredential.user);
            router.push("/user/StudentAccount");
          })
          .catch((error) => {
            setErrorText("something went wrong")
          });
      };

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);
    const handleLogout = () => setIsSignedIn(false);

    return (
        <div>
            {!isSignIn ? (
                <>
                    <h1>Sign In</h1>
                    <Link href="/TeacherSignIn">Teacher Sign In</Link>
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
                    {errorText && <div> <p class="error-text">{errorText}</p> </div>}
                </>
            ) : (
                <>
                    <h1>Sign In Successful</h1>
                    <button onClick={handleLogout}> Sign Out </button>
                </>
            )}
        </div>
    );
}
