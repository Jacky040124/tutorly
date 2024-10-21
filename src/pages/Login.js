import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Login() {
    const [isSignUpActive, setIsSignUpActive] = useState(false);

    const handleMethodChange = () => {
        setIsSignUpActive(!isSignUpActive);
    }

    const handleSignup = () => {
        createUserWithEmailAndPassword(auth,email,password)
            .then((userCredential) => { // firebase resolve the promise and provide userCredential
                const user = userCredential.userCredential.user;
                console.log(user)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode,errorMessage);
            })
    }
    

    return(
        <div>
            <h1> Sign In </h1>
            <a className="standard-btn bg-green" href="/TeacherSignIn">TeacherSignIn</a>
            <a className="standard-btn bg-green" href="/">Return Home</a>

            <form>
                <fieldset>
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" name="name" />

                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" />
                </fieldset>
            </form>

            <button onClick={handleMethodChange}> Login </button>

        </div>
    )
}