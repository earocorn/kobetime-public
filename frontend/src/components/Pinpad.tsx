import { Component, ReactElement, useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Col, Container, Modal, Row, Stack } from "react-bootstrap";
import '../styles/pinpad.css';
import { Employee, clockEmployee, fetchEmployeeFromPasscode } from "../employee";
import { useNavigate } from "react-router-dom";

interface PinpadProps {
    inOut: string;
    backButton: ReactElement;
}


function Pinpad(props: PinpadProps) {
    const navigate = useNavigate();

    const [pwdText, setPwdText] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const buttons = [1,2,3,4,5,6,7,8,9, -1, 0, -2];
    const [error, setError] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [clockedEmployee, setClockedEmployee] = useState<Employee | null>(null);
    const [clockedTime, setClockedTime] = useState<Date | null>(null);
    const [result, setResult] = useState(["", ""]);

    function updateText(num: string) {
        setError(false);
        if (pwdText.length < 5) {
            setPwdText((prev) => prev + num);
        }
        if (num === '-1') {
            setPwdText('');
        }
        if (num === '-2') {
            const currentPwd = pwdText;
            setPwdText('');
            console.log('Currentpwd = ' + currentPwd);
            fetchEmployeeFromPasscode(currentPwd).then(async (employee) => {
                //accepted
                if(employee) {
                    //navigate('/account');
                    console.log('Employee found: ' + employee.name);
                    setClockedEmployee(employee);
                    const clocked = new Date();
                    setClockedTime(clocked);
                    setShowResult(true);
                    const response = await clockEmployee(employee, props.inOut, clocked);
                    if(response === 'success') {
                        setResult(['You have been successfully clocked ' + props.inOut + ' at ' + clocked?.toLocaleTimeString() + '!', 'success']);
                    } else {
                        setResult([response, 'danger'])
                    }
                } else {
                    setError(true);
                }
            }, () => {
                console.error('No employee found.')
                setError(true);
            })
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return(
        <>
        { props.inOut.length === 0 ? (
            <>
            Henlo empty props :(
            </>
        ) : (
            <>
                <>
            <Container className="border border-4 border-primary rounded-3 p-2 d-flex" style={{ justifyContent:'center', justifyItems:'center', maxWidth:400 }}>
                <Stack direction="vertical" className="" style={{ maxWidth:350 }}>
                    <Alert className="text-center" style={{ fontWeight:'bold' }} variant={props.inOut === 'in' ? 'success' : 'danger'}>You are clocking {props.inOut}.</Alert>
                    <Stack direction="horizontal" className="d-flex" style={{ justifyItems:'center' }}>
                        {props.backButton}
                        <label style={{ }}>{currentTime.toDateString()} at {currentTime.toLocaleTimeString()}</label>
                    </Stack>
                    <input type={error ? 'text' : 'password'} className="text-center border border-3 border-primary" style={{ fontSize:50, color:(error ? 'red' : 'blue') }} disabled value={error ? 'Invalid PIN' : pwdText}/>
                    <Container className="d-flex" style={{ maxHeight:400 }}>
                    <Row style={{ justifyContent:'center' }}>
                        {buttons.map((butNum) => {
                            return(
                                <Col xs={4} key={buttons.indexOf(butNum).toString()}>
                                    <div className="rounded-circle border border-5"
                                    key={(buttons.indexOf(butNum) + 30).toString()} 
                                    style={{ 
                                        display:'flex', 
                                        justifyContent:'center', 
                                        width:100, height:100, 
                                        backgroundColor:(butNum >= 0 ? 'blue' : (butNum === -1 ? 'red' : 'green')),
                                        borderColor:'white'
                                    }}
                                    onClick={() => updateText(butNum.toString())}>

                                    <label className='rounded-3' 
                                        key={(buttons.indexOf(butNum) + 100).toString()} 
                                        style={{ fontSize:40 }} >
                                        {butNum >= 0 ? butNum : (butNum === -1 ? 'X' : '>')}
                                    </label>    
                                    </div>
                                    
                                </Col>
                            )
                        })}
                    </Row>    
                    </Container>
                </Stack>
            </Container>        
                </>
            

                <Modal
                show={showResult}

                >
                    <Modal.Header>
                        <Modal.Title>
                            {result[0].length === 0 ? (<h1>Loading...</h1>) : (<h1 className='text-center' style={{ fontStyle:'italic', display:'flex', justifyContent:'center', fontSize:50 }}>Hello, {clockedEmployee?.name}!</h1>)}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Stack direction='vertical'>
                        
                            {result[0].length != 0 && (<Alert variant={result[1] === 'success' ? 'success' : 'danger'} style={{ justifyContent:'center', display:'flex', fontWeight:'bold', fontSize:30 }}>
                                {result[0]}
                            </Alert>)}
                        </Stack>
                    </Modal.Body>
                    <Modal.Footer>
                        <Container style={{ display:'flex', justifyContent:'center' }}>
                            {props.backButton}
                        </Container>
                    </Modal.Footer>
                </Modal>
            
            </>
        ) }
        
        </>
    )
}

export default Pinpad;