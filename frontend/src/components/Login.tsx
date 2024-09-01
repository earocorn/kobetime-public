import { createUserWithEmailAndPassword, getAuth, isSignInWithEmailLink, onAuthStateChanged, sendPasswordResetEmail, sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithEmailLink, signOut } from "firebase/auth";
import app, { auth, firestore } from "../private/firebase";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import { collection, getDocs } from "firebase/firestore";
import Stack from "react-bootstrap/esm/Stack";
import Container from "react-bootstrap/esm/Container";

import '../styles/Login.css';
import { Button, FloatingLabel, Form, FormGroup } from "react-bootstrap";

function Login() {

    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [signedIn, setSignedIn] = useState(false);
    let [errorText, setErrorText] = useState("");

    let [employeeName, setEmployeeName] = useState("");
    let [employeePasscode, setEmployeePasscode] = useState("");
    let [employeeEmail, setEmployeeEmail] = useState("");
    let employeeAdmin: boolean = false;

    async function fetchCurrentEmployee() {
        if(getAuth().currentUser) {
            const employeesRef = collection(firestore, 'employees');
            const querySnapshot = await getDocs(employeesRef);
            const employee = querySnapshot.docs.find((user) => user.get('email') === getAuth().currentUser?.email)
            if(employee) {
                const employeeData = employee.data();
                setEmployeeName(employeeData.name);
                setEmployeePasscode(employeeData.passcode);
                setEmployeeEmail(employeeData.email);
                employeeAdmin = employeeData.admin;
            }
        } else {
            setEmployeeName("NO CURRENT USER")
        }
    }

    const navigate = useNavigate();

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSignIn();
    }

    async function handleSignIn() {
        try{
            if(!signedIn) {
                    console.log(getAuth().currentUser)
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    console.log("Signed in user " + user.email);
                    setSignedIn(true)
                    if(employeeAdmin) {
                        navigate('/employees')
                    } else {
                    console.log("err")
                    navigate('/account')
                    }
            }
            } catch(error) {
            setSignedIn(false)
            console.error("Could not sign in user!")
            setErrorText("Invalid email and/or password.")
            }
        }
    
    async function handleSignOut() {
        getAuth().signOut();
        setSignedIn(false);
    }
    
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');

        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        } else {
            signInWithEmailLink(auth, email, window.location.href)
            .then(() => {
              window.localStorage.removeItem('emailForSignIn');
            })
            .catch((error) => {
              console.error(error);
            });
        }

      }
    

    useEffect(() => {
        const listen = onAuthStateChanged(auth, async (curUser) => {
            if (curUser) {
              await fetchCurrentEmployee()
                setSignedIn(true)
                const uid = curUser.uid;
                console.log("user is signed in : " + curUser.email)
                console.log(signedIn)
                //signOut(auth)
                if(employeeAdmin) {
                      navigate('/employees')
                  } else {
                      console.log('test')
                      navigate('/account')
                  }
            } else {
                console.error("No one signed in. " + auth.currentUser?.email);
            }
          });

          return () => listen();
    }, []);
    
    return (
        <>
        { !signedIn && (<>
        <Container className="loginbox" style={{ maxWidth:350, justifyContent:'center', borderRadius:4, padding:20 }}>
            <Stack direction="vertical">
                <h1 style={{ display:'flex', justifyContent:'center' }}>Login</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <FloatingLabel
                            label="Email"
                            className="mb-3"
                        >
                        <Form.Control 
                        type="email" 
                        placeholder="name@example.com"
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setErrorText("");
                        }}
                        />
                        </FloatingLabel>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <FloatingLabel
                            label="Password"
                        >
                        <Form.Control
                        type="password"
                        placeholder="Password"
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setErrorText("")
                        }}
                        />
                        </FloatingLabel>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <a className="link" href="/loginemail" style={{ display:'flex', justifyContent:'center' }}>Sign in via email</a>
                        <a className="link" href="/forgotpassword" style={{ display:'flex', justifyContent:'center' }}>Forgot Password?</a>
                    </Form.Group>
                    <Container>
                        <ErrorMessage errormsg={errorText}/>
                    </Container>
                    <div style={{ display:'flex', justifyContent:'center' }}>
                        <Button type="submit" style={{ width:'100%', borderRadius:4 }}>Sign In</Button>
                    </div>
                    
                </Form>
            </Stack>
        </Container>
        </>)}
        {signedIn && (
        <>
        <h1>Signed in as {auth.currentUser?.email}</h1>
        <button className="btn btn-danger" onClick={handleSignOut}>sign out</button>
        </>
        )}
        </>
    );
};

export default Login;