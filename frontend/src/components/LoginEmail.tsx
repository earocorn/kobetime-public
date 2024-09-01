import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";


function LoginEmail() {
    let navigate = useNavigate()

    let [email, setEmail] = useState("");
    let [errorText, setErrorText] = useState("");
    let [messageSent, setMessageSent] = useState(false);
    let [tries, setTries] = useState(0);

    const actionCodeSettings = {
        url:'https://kobetime.web.app/',
        handleCodeInApp: true
    }

    async function handleGoBack() {
        navigate('/')
    }

    async function handleSendEmail() {
        if(email.length === 0) {
            setErrorText("Please enter an email.");
            return;
        }
        sendSignInLinkToEmail(getAuth(), email, actionCodeSettings).then(() => {
            window.localStorage.setItem('emailForSignIn', email);
            setErrorText("");
            setMessageSent(true);
        }, () => {
            if(tries > 3) {
                setErrorText("If your email is correct it is possible that the email sign-in link limit has been reached.");
            } else {
                setErrorText("Invalid email! Please try again.");
            }
            tries++;
        }).catch((error) => {
            console.error(error)
        })
    }

    return(
        <>
        <button className="btn btn-danger" onClick={handleGoBack}>Back</button>
        <h1 style={{ display:'flex', justifyContent:'center' }}>Sign In Via Email</h1>
        <div>
            <div className="container-sm border border-5 border-danger rounded-5" style={{ maxWidth:350, justifyContent:'center', padding:20}}>
                {!messageSent && (
                <div className="col mb-3">
                    <div className="row mb-3">
                        <p>Please enter your email below. Contact an administrator if you are experiencing difficulties.</p>
                    </div>
                    <div className="row mb-3">
                        <label htmlFor="emailForgotPassword" className="form-label" style={{ fontWeight:'bold'}}>Email</label>
                        <input type="email" className="form-control" id="emailForgotPassword" placeholder="name@example.com" onChange={(e) => {
                            setEmail(e.target.value);
                            setErrorText("");
                        }}/>
                    </div> 
                    <ErrorMessage errormsg={errorText}/>
                    <div className="row mb-3">
                        <button className="btn btn-primary" onClick={handleSendEmail}>Send Email</button>
                    </div>
                </div>    
                )}
                {messageSent && (
                    <div className="col mb-3">
                        <div className="row mb-3">
                            <h4>Email successfully sent!</h4>
                        </div>
                        <div className="row mb-3">
                            <button className="btn btn-success" onClick={handleGoBack}>OK</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    )
}

export default LoginEmail;