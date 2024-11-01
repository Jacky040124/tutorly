"use client"
import {useState, useEffect} from 'react';
import {auth} from "@/app/firebase";
import {useUser} from "@/components/UserContext"
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorText, setErrorText] = useState("");
    const router = useRouter();
    // const {user, setUser} = useUser();
    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

    const test = useUser();

    useEffect(() => {
        // console.log(useUser);
        // console.log(test);
    })

    const handleSignIn = () => {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {

            const userInfo = {
                email: userCredential.user.email,
                uid: userCredential.user.uid,
                type: userCredential.user.type,
            };

            console.log('Setting user:', userInfo);
            setUser(userInfo);
            router.push("/user/StudentAccount");
          })
          .catch((error) => {
            console.error('Sign-in error:', error);
            setErrorText("something went wrong");
          });
      };



    return (
        <div>
            <h1>Sign In</h1>
            <Link href="/SignInTeacher">Teacher Sign In</Link>
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