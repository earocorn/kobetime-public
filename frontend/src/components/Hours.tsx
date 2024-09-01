import { SetStateAction, useEffect, useState } from "react";
import { Employee, TimeEntry, addTimeEntry, deleteTimeEntry, fetchEmployeeFromID, fetchTimeEntries } from "../employee";
import { Timestamp } from "firebase/firestore";
import arrowIcon from "../assets/arrowRight.svg";

import Table from "react-bootstrap/esm/Table";
import Stack from "react-bootstrap/esm/Stack";
import Button from "react-bootstrap/esm/Button";
import ButtonGroup from "react-bootstrap/esm/ButtonGroup";
import Modal from "react-bootstrap/esm/Modal";
import Form from "react-bootstrap/esm/Form";
import { Alert } from "react-bootstrap";

import "../styles/Hours.css";
import "../styles/ListEmployees.css";

import EditIcon from "../assets/pencil.svg";
import DeleteIcon from "../assets/trash.svg";


interface HoursProps {
    employeeID: string;
    adminView: boolean;
}

function Hours(props: HoursProps) {

    let [employee, setEmployee] = useState<Employee | null>(null);
    let [entries, setEntries] = useState<TimeEntry[]>([]);
    let [entriesInPeriod, setEntriesInPeriod] = useState<TimeEntry[]>([]);
    let [totalHoursInPeriod, setTotalHoursInPeriod] = useState(0);

    const currentDate = new Date();
    let [startDate, setStartDate] = useState(currentDate.getDate() < 15 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) : (new Date(currentDate.getFullYear(), currentDate.getMonth(), 15)));
    let [endDate, setEndDate] = useState(currentDate.getDate() < 15 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 14)) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    let [show, setShow] = useState(false);
    let [refresh, setRefresh] = useState(false);

    let upToDate = false;

    //modals
    let [showAdd, setShowAdd] = useState(false);
    let [showEdit, setShowEdit] = useState(false);
    let [editId, setEditId] = useState("");
    let [showDelete, setShowDelete] = useState(false);
    let [deleteId, setDeleteId] = useState("");
    let [newData, setNewData] = useState<{[x: string]: any; }>({});
    let [editData, setEditData] = useState<{[x: string]: any; }>({});

    let [errorAlert, setErrorAlert] = useState("");

    const handleStartDateChange = async (date: Date) => {
        setStartDate(date);
        setEntries([]);
        await fetchData(date, endDate);
    }
    
    const handleEndDateChange = async (date: Date) => {
        setEndDate(date);
        setEntries([]);
        await fetchData(startDate, date);
    }

    function refreshTotalHoursInPeriod(entries: TimeEntry[]) {
        let durations: number[] = [];
        entries.map((entry) => {
            let duration = entry.duration;
            if(entry.duration > 15 || entry.clock_out === null) { duration = 0 }
            console.log(durations);
            durations.push(duration);
        });
        const durationSum = durations.reduce((acc, curr) => acc + curr, 0);

        setTotalHoursInPeriod(durationSum);
    }

    async function refreshTable() {
        await fetchData(startDate, endDate);
    }

    function formatTime(timestamp: Timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    async function fetchData(start: Date, end: Date) {

        console.info("fetching employee id = (" + props.employeeID + ")")
        const fetchedEmployee = await fetchEmployeeFromID(props.employeeID);
        if(fetchedEmployee) {
            console.info('fetched employee : ' + fetchedEmployee)
            setEmployee(fetchedEmployee);
        }
        //const fetchedEntries = await fetchTimeEntries(props.employeeID);
        let intervalStartDate = new Date(start);
        intervalStartDate.setDate(intervalStartDate.getDate() + 1);
        intervalStartDate.setHours(0, 0, 0, 0);
        let intervalEndDate = new Date(end);
        intervalEndDate.setDate(end.getDate() + 1);
        intervalEndDate.setHours(23, 59, 59, 999);
        console.info('Range: ', intervalStartDate, intervalEndDate);

        fetchTimeEntries(props.employeeID, intervalStartDate, intervalEndDate).then((fetchedEntries) => {
            setEntries(fetchedEntries);
            setEntriesInPeriod(fetchedEntries);
            refreshTotalHoursInPeriod(fetchedEntries);
        })
    };

    useEffect(() => {
        refreshTable();
        console.info('useEffect triggered, refreshing table.');
    }, [props.employeeID]);


    function showAddModal() {
        setShowAdd(true);
    }

    async function handleAdd() {
        if(newData.clock_in && newData.clock_out) {
            const clockInTimestamp = Timestamp.fromMillis(Date.parse(newData.clock_in));
            const clockOutTimestamp = Timestamp.fromMillis(Date.parse(newData.clock_out));
            const response = await addTimeEntry({
                clock_in: clockInTimestamp,
                clock_out: clockOutTimestamp,
                employee_id: props.employeeID,
                flag: false,
            });
            if(response === 'success') {
            setNewData({});
            setShowAdd(false);
            setErrorAlert("");
            refreshTable();
            } else {
                setErrorAlert("Please fill in all fields.");
            }
            console.error('response is : ' + response);
        } else {
            setErrorAlert("Please fill in all fields.");
        }
    }
    
    function showEditModal(id: string) {
        setShowEdit(true);
        setEditId(id);
        
    }

    function handleEdit(data: {[x: string]: any; }) {
        if(!data){
            console.error();
        }
    }

    function showDeleteModal(id: string) {
        setShowDelete(true);
        setDeleteId(id);
    }

    async function handleDelete() {
        await deleteTimeEntry(deleteId);
        setDeleteId("");
        setShowDelete(false);
        refreshTable();
    }


    return (
        <>
        {!show ? <>
        <Stack direction='vertical' style={{ alignItems:'center'}}>
        <div>
            <h1 style={{ display:'flex', justifyContent:'center', fontWeight:'lighter'}}>Hours</h1>
            <div className="container border border-gray border-2 text-center rounded-pill p-2" style={{ maxWidth:275}}>
                <div className="row" style={{ maxWidth:400, justifyContent:'left'}}>
                    <div className="col-3" style={{ }}>
                        <div>
                            <input className="startdateinput" type="date" 
                            value={startDate.toISOString().split('T')[0]} 
                            onKeyDown={(e) => e.preventDefault()}
                            onChange={(e) => {
                                if(!isNaN(Date.parse(e.target.value))) {
                                    handleStartDateChange(new Date(e.target.value));
                                }
                            }}/>
                        </div>
                    </div>
                    <div className="col-3" style={{  paddingLeft:57 }}>
                        <img src={arrowIcon} style={{ width:20, height:20}}></img>
                    </div>
                    <div className="col-3" style={{ paddingLeft:34 }}>
                        <div style={{ }}>
                        <input className="enddateinput" type="date" 
                        value={endDate.toISOString().split('T')[0]}
                        onKeyDown={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            if(!isNaN(Date.parse(e.target.value))) {
                                handleEndDateChange(new Date(e.target.value));
                            }
                        }}
                        required
                        />
                        </div>
                    </div>
                </div>
            </div>
            
            <h5 style={{ display:'flex', justifyContent:'center', fontWeight:'light', padding:8}}>{
            props.adminView === false ? "Your" : employee?.name + "'s" 
            } total hours from this period are {totalHoursInPeriod > 0 ? totalHoursInPeriod.toFixed(2) : "not available"}.</h5>
        </div>
        <div className="container border border-gray border-3 rounded" style={{ maxWidth:850, padding:10 }}>
            <Table striped bordered hover>
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Date</th>
                    <th scope="col">Start</th>
                    <th scope="col">End</th>
                    <th scope="col">Total</th>
                    {props.adminView && (
                        <th scope="col"><button className="btn btn-success" style={{ fontWeight:'bold' }} onClick={showAddModal}>Add</button></th>
                    )}
                    </tr>
                </thead>
                <tbody>
                    { entriesInPeriod ? entriesInPeriod.map((entry) => {
                        return (
                            <tr key={entry.id}>
                                <th scope="row">{entriesInPeriod.indexOf(entry)}</th>
                                <td>{entry.clock_in.toDate().toLocaleDateString()}</td>
                                <td>{formatTime(entry.clock_in)}</td>
                                <td style={entry.flag ? { backgroundColor:'red' } : {}}>{entry.clock_out !== null ? formatTime(entry.clock_out) : 'N/A'}</td>
                                <td>{entry.duration.toString()}</td>
                                {props.adminView && (<td>
                                    <ButtonGroup>
                                        <Button className="editbutton" variant="outline-light" onClick={() => showEditModal(entry.id)}><img style={{width:20, height:20}} src={EditIcon}/></Button>
                                        <Button className="deletebutton" variant="outline-danger" onClick={() => {
                                            showDeleteModal(entry.id);
                                            setEditData({
                                                clock_in: entry.clock_in,
                                                clock_out: entry.clock_out,
                                                employee_id: employee?.id,
                                                flag: entry.flag,
                                            });
                                            }}><img style={{width:20, height:20}} src={DeleteIcon}/></Button>
                                    </ButtonGroup>
                                    </td>)}
                            </tr>
                        );
                    }) : (<>No Entries in period</>)}
                </tbody>
            </Table>
        </div>
        </Stack>

        <Modal
        show={showAdd}
        onHide={() => {
            setShowAdd(false);
            setNewData({});
            setErrorAlert("");
        }}
        >
            <Modal.Header
            closeButton
            >
                <Modal.Title>
                    New Entry for {employee?.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form>
                {errorAlert.length > 0 && (<Alert variant="danger">{errorAlert}</Alert>)}
                <Form.Label>Clock-IN Date and Time</Form.Label>
                <Form.Control
                className="clockininput"
                type="datetime-local"
                onChange={(e) => {
                    newData.clock_in = e.target.value;
                    setErrorAlert("");
                }}
                required
                />
            <br />
            <Form.Group>
                <Form.Label>Clock-OUT Date and Time</Form.Label>
                <Form.Control
                className="clockoutinput"
                type="datetime-local"
                onChange={(e) => {
                    newData.clock_out = e.target.value;
                    setErrorAlert("");
                }}
                required
                />
            </Form.Group>
                
            </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleAdd}>
                    Submit
                </Button>
                <Button variant="danger"
                onClick={() => {
                    setShowAdd(false);
                    setNewData({});
                    setErrorAlert("");
                }}
                >
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal
        show={showEdit}
        onHide={() => {
            setShowEdit(false);
        }}
        >
            <Modal.Header
            closeButton
            >
                <Modal.Title>
                    Edit
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <Form>
                    <Form.Group>
                        <Form.Label>
                            Clock-IN Date and Time
                        </Form.Label>
                        <Form.Control
                        type="datetime-local"
                        value={editData.clock_in}
                        ></Form.Control>

                    </Form.Group>
                    <Form.Group>
                        <Form.Label>
                            Clock-OUT Date and Time
                        </Form.Label>
                        <Form.Control
                        type="datetime-local"
                        value={editData.clock_out}
                        ></Form.Control>

                    </Form.Group>
                </Form>

            </Modal.Body>
            <Modal.Footer>
                <Button>

                </Button>
                <Button>
                    
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal
        show={showDelete}
        onHide={() => {
            setDeleteId("");
            setShowDelete(false);
        }}
        >
            <Modal.Header
            closeButton
            >
                <Modal.Title style={{ color:'red', fontWeight:'bold' }}>
                    !WARNING!
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to permanently delete this time entry?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleDelete}>
                    Yes
                </Button>
                <Button variant="danger" onClick={() => {
                    setDeleteId("");
                    setShowDelete(false);
                }}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>

        </> : <></>}
        
        </>
    )
}

export default Hours;