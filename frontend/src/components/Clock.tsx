import { ButtonGroup, Button, Col, Container, Row } from "react-bootstrap";
import Pinpad from "./Pinpad";
import { useState } from "react";
import '../styles/Clock.css';

function Clock() {

    let [showPinPad, setShowPinPad] = useState({showing:false, inOut:''});

    return (
        <>
        { showPinPad.showing && showPinPad.inOut.length !== 0 ? (
            <>
            <Pinpad inOut={showPinPad.inOut} backButton={
            <Button variant="secondary" onClick={() => setShowPinPad({showing:false, inOut:''})} style={{ fontWeight:'bold' }}>{'BACK'}</Button>
            }/>
            </>
        ) : (
            <Container fluid className="d-flex align-items-center justify-content-center">
            <ButtonGroup className="text-center d-flex">
                <Button variant="success" size="lg" onClick={() => setShowPinPad({showing:true, inOut:'in'})} style={{ display:'flex', justifyContent:'center' }}>
                    Clock In
                </Button>
                <Button variant="danger" size="lg" onClick={() => setShowPinPad({showing:true, inOut:'out'})} style={{ display:'flex', justifyContent:'center' }}>
                    Clock Out
                </Button>
            </ButtonGroup>
        </Container>
        ) }
        
        </>
    )
}

export default Clock;