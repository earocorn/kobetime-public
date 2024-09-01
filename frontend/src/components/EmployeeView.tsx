import { getFirestore } from "firebase/firestore";
import app, { auth } from "../private/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchCurrentEmployee, validateAccessClock } from "../employee";
import logoutIcon from '../assets/logout.svg';
import clockIcon from '../assets/clock.svg';
import wrenchIcon from '../assets/settings.svg';
import flowerIcon from '../assets/flower.svg';
import calendarIcon from '../assets/calendar.svg';
import hourglassIcon from '../assets/hourglass.svg';
import Hours from "./Hours";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Button from "react-bootstrap/esm/Button";
import Stack from "react-bootstrap/esm/Stack";
import { isMobile } from "react-device-detect";

const firestore = getFirestore(app)


interface RenderProps {
    view: string;
    employeeID: string;
    errormsg: string;
}

function RenderView(props: RenderProps) {

    switch (props.view) {
        case "hours":
            return (
                <Hours employeeID={props.employeeID} adminView={false}/>
            )
            break;
        case "schedule":
            return (
                <>
                <h1>schedule goes here</h1>
                </>
            )
            break;
        case "settings":
            return (
                <>
                <h1>Settings go here</h1>
                </>
            )
        case "clock":
            return (
                <>
                <h1>{props.errormsg}</h1>
                </>
            )
        default:
            break;
    }

    return (
        <>
        <h1>Nothin to see here folks. ༼ つ ◕_◕ ༽つ</h1>
        </>
    )
}

function EmployeeView() {
    const navigate = useNavigate();

    let [employeeID, setEmployeeID] = useState("");
    let [employeeName, setEmployeeName] = useState("");
    let [employeePasscode, setEmployeePasscode] = useState("");
    let [employeeEmail, setEmployeeEmail] = useState("");
    let [employeeAdmin, setEmployeeAdmin] = useState(false);

    let [selectedButton, setSelectedButton] = useState("");

    let [testMessage, setTestMessage] = useState("");

    const buttonMenu = [
        { name: 'Sign Out', icon:logoutIcon, clickHandler:handleSignOut, disability:false },
        { name: 'Settings', icon:flowerIcon, clickHandler:() => handleViewClick('settings'), disability:selectedButton===('settings') },
        { name: 'Hours', icon:clockIcon, clickHandler:() => handleViewClick('hours'), disability:selectedButton===('hours')},
        { name: 'Schedule', icon:calendarIcon, clickHandler:() => handleViewClick('schedule'), disability:selectedButton===('schedule') },
        { name: 'Clock', icon:hourglassIcon, clickHandler:() => clockButtonClick(), disability:selectedButton===('clock') },
    ]

    const buttonWidth = isMobile ? 100 : 250
    const buttonRowWidth = isMobile ? 400 : 900

    async function handleSignOut() {
        const confirmation = window.confirm("Are you sure you want to sign out?")

        if(confirmation) {
            getAuth().signOut().then(() => {
                navigate('/');
            }, () => {
                console.error("Could not sign out!");
            });
        }
    }

    function handleViewClick(view: string) {
        setSelectedButton(view);
    }

    async function manageButtonClick() {
        if(employeeAdmin) {
        navigate('/employees');
        }
    }

    async function clockButtonClick() {
        validateAccessClock().then((distance) => {
            if(distance >= 0.5) {
                setTestMessage('Access denied. distance from work: ' + distance)
            } else {
                setTestMessage('Loading... from ' + distance);
                navigate('/clock');
            }
            handleViewClick('clock')
        });
        
    }

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (curUser) => {
            if(curUser) {
                if(!employeeID) {
                    fetchCurrentEmployee().then((employee) => {
                    if(employee) {
                        setEmployeeID(employee.id);
                        setEmployeeName(employee.name);
                        setEmployeePasscode(employee.passcode);
                        setEmployeeEmail(employee.email);
                        setEmployeeAdmin(employee.admin);
                    }
                })
                }
            }
                
        })

        return () => listen();
      }, []);

    return (
        <>
        { getAuth().currentUser && (
            <>
            <style>{`
            .btn {
                border-color: lightgray;
                border-width: 2px;
                background-color: #e7e7e7;
                color: black;
                transition-duration: 0.3s;
            }
            .btn:disabled {
                border-color: lightgray;
            }
            .btn:hover {
                box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
            }
            `}
            </style>
            <h1 style={{ fontStyle:'italic', textAlign:'center'}}>Welcome, {employeeName ? employeeName : 'User'}!</h1>
            <hr/>
        <Stack direction="vertical" style={{ display:'flex', alignItems:'center', textAlign:'center'}}>
            <div style={{ }}>
            <h3>My Dashboard</h3>
            <Row className='row g-2' style={{ maxWidth:buttonRowWidth }}>
                { buttonMenu.map((buttonData) => {
                return (
                    <Col key={buttonMenu.indexOf(buttonData)} className='col' style={{ display:'flex', justifyContent:'center'}}>
                        <Button variant="flat" className='rounded-3' style={{ width:buttonWidth, height:75}} onClick={buttonData.clickHandler} disabled={buttonData.disability}>
                            <img src={buttonData.icon} style={{ width:20, height:20 }}/>
                            <span>{buttonData.name}</span>
                        </Button>
                    </Col>
                )
                })}
                {employeeAdmin && (
                <Col className='col' style={{  display:'flex' ,justifyContent:'center' }}>
                    <Button variant='flat' className='rounded-3' style={{ width: buttonWidth, height: 75 }} onClick={manageButtonClick} value={""}>
                        <img src={ wrenchIcon } style={{ width:20, height:20 }}/>
                        <span> Manage</span>
                    </Button>
                </Col>
                )}
            </Row>
        </div>
        </Stack>
        <hr/>
        <div className="container" style={{ display:'flex', justifyContent:'center'}}>
            <RenderView view={selectedButton} employeeID={employeeID} errormsg={testMessage}/>
        </div>
         </>)}
        </>
    )
}

export default EmployeeView;