import { useEffect, useState } from "react"
import { addDoc, collection, deleteDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import app, { auth } from "../private/firebase";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import NotifMessage from "./NotifMessage";
import { fetchEmployees } from "../employee";
import Table from "react-bootstrap/esm/Table";
import ButtonGroup from "react-bootstrap/esm/ButtonGroup";
import Button from "react-bootstrap/esm/Button";
import Stack from "react-bootstrap/esm/Stack";
import Hours from "./Hours";
import Container from "react-bootstrap/esm/Container";

import '../styles/ListEmployees.css';
import Modal from "react-bootstrap/esm/Modal";
import Form from "react-bootstrap/esm/Form";

import EditIcon from "../assets/pencil.svg";
import ViewIcon from "../assets/eye.svg";
import ViewOffIcon from "../assets/eye-off.svg";
import DeleteIcon from "../assets/trash.svg";
import Navbar from "react-bootstrap/esm/Navbar";
import { Nav, NavDropdown, NavItem, NavbarBrand } from "react-bootstrap";
import NavbarToggle from "react-bootstrap/esm/NavbarToggle";
import NavbarCollapse from "react-bootstrap/esm/NavbarCollapse";

const firestore = getFirestore(app);

function ListEmployees() {
    const navigate = useNavigate();

    let [employees, setEmployees] = useState<{ id: string; name: string; passcode: string; admin: boolean; email: string; }[]>([]);
    let [showAddForm, setShowAddForm] = useState(false);
    let [showEditFormId, setShowEditFormId] = useState("");
    let [newEmployeeName, setNewEmployeeName] = useState("");
    let [newEmployeePasscode, setNewEmployeePasscode] = useState("");
    let [newEmployeeEmail, setNewEmployeeEmail] = useState("");
    let [newEmployeeAdmin, setNewEmployeeAdmin] = useState(false);

    let [formSubmissionError, setFormSubmissionError] = useState("");
    let [notification, setNotification] = useState("");


    let [employeeState, setEmployeeState] = useState(0);
    let [editEmployeeName, setEditEmployeeName] = useState(["", ""]);
    let [editEmployeePasscode, setEditEmployeePasscode] = useState(["", ""]);
    let [editEmployeeEmail, setEditEmployeeEmail] = useState(["", ""]);
    let [editEmployeeAdmin, setEditEmployeeAdmin] = useState([false, false]);
    let [signedInUser, setSignedInUser] = useState<{
                                                      id: string;
                                                      name: any;
                                                      passcode: any;
                                                      admin: any;
                                                      email: any;
                                                    } | undefined>();


    let [showDelete, setShowDelete] = useState(false);
    let [deleteId, setDeleteId] = useState("");

    let viewHoursId = "";
    let [showHours, setShowHours] = useState([false, ""]);

    function handleSignOut() {
      auth.signOut().then(function() {
        console.log('Signed out user: ' + ((auth.currentUser?.email == undefined) ? "No user signed in." : auth.currentUser?.email));
        navigate('/')
      }, function(error) {
        console.error('Error signing out: ', error);
      })
    }

    useEffect(() => {
      const fetch = async () => {
        const updatedEmployees = await fetchEmployees();
        setEmployees(updatedEmployees);
      }
      fetch();
      console.info('useEffect triggered, employees fetched');
      }, [employeeState]);

    onAuthStateChanged(auth, async (user) => {
      if(!user) {
        navigate('/')
      }
      fetchEmployees().then((curEmployees) => {
        const curEmployee = curEmployees.find((employee) => employee.email === getAuth().currentUser?.email);
        if(!curEmployee) {
          console.error('No employee logged in.');
        } else
        if(curEmployee?.admin === false) {
          navigate('/')
        }
        setSignedInUser(curEmployee);
      })
    })

    async function deleteEmployee(employeeId: string) {
        setDeleteId(employeeId);
        setShowDelete(true);
    }

    async function handleDelete() {
      try{
        await deleteDoc(doc(firestore, 'employees', deleteId))
        setEmployees((prevEmployees) => prevEmployees.filter((employee) => employee.id !== deleteId));
        setEmployeeState((curState) => curState+1);
      } catch (error) {
        console.error('ERROR:', error);
      }
      setDeleteId("");
      setShowDelete(false);
    }

    function validateEmail(email: string) {
      const atIndex = email.indexOf('@');
      const dotIndex = email.indexOf('.');

      if(atIndex !== -1 && dotIndex !== -1) {
        if(atIndex < dotIndex) {
          if(atIndex !== 0 && dotIndex !== email.length - 1) {
            setFormSubmissionError("");
            return true;
          }
        }
      }
      setFormSubmissionError("Invalid email!");
      console.error("Something is wrong with email validation.")
      return false;
    }

    function getEmployee(employeeId: string) {
      let editEmployee = employees.find((employee) => employee.id === employeeId) as { id: string; name: string; passcode: string; admin: boolean, email: string };
      setEditEmployeeName([editEmployee.name, editEmployee.name]);
      setEditEmployeePasscode([editEmployee.passcode, editEmployee.passcode]);
      setEditEmployeeAdmin([editEmployee.admin, editEmployee.admin]);
      setEditEmployeeEmail([editEmployee.email, editEmployee.email]);
      return editEmployee;
    }

    async function updateEmployee() {
      let currentEmployees: string[] = [];
      let currentPasscodes: string[] = [];
      let currentEmails: string[] = [];
      employees.map(employee => {
        currentEmployees.push(employee.name);
        currentPasscodes.push(employee.passcode);
        currentEmails.push(employee.email);
      });

      currentEmployees = currentEmployees.filter((employee) => employee !== editEmployeeName[0]);
      currentPasscodes = currentPasscodes.filter((passcode) => passcode !== editEmployeePasscode[0]);
      currentEmails = currentEmails.filter((email) => email !== editEmployeeEmail[0]);

      let editEmployee = employees.find((employee) => employee.id === showEditFormId) as { id: string; name: string; passcode: string; admin: boolean; email: string };

      if(currentEmployees.includes(editEmployeeName[1]) || currentPasscodes.includes(editEmployeePasscode[1]) || currentEmails.includes(editEmployeeEmail[1])) {
        setFormSubmissionError("Employee already exists or passcode has been taken!");
        return;
      }
      if(editEmployeeName[1].length === 0) {
        setFormSubmissionError("Please enter an employee name!");
        return;
      }
      if(!/^\d{1,5}$/.test(editEmployeePasscode[1])) {
        setFormSubmissionError("Passcode must be a number 5 digits or less!");
        return;
      }
      if(!validateEmail(editEmployeeEmail[1])) {
        return;
      }

      let confirmationTextArr = [""];
      let confirmationText = "";
      if(!(editEmployee.name === editEmployeeName[1])) { confirmationTextArr.push("\nChange: " + editEmployeeName[0] + " -> " + editEmployeeName[1]) };
      if(!(editEmployee.passcode === editEmployeePasscode[1])) { confirmationTextArr.push("\nChange: " + editEmployeePasscode[0] + " -> " + editEmployeePasscode[1]) };
      if(!(editEmployee.email === editEmployeeEmail[1])) { confirmationTextArr.push("\nEmail: " + editEmployeeEmail[0] + " -> " + editEmployeeEmail[1])};
      if(!(editEmployee.admin === editEmployeeAdmin[1])) { confirmationTextArr.push("\nAdmin: " + editEmployeeAdmin[0] + " -> " + editEmployeeAdmin[1])};
      confirmationTextArr.map((change) => confirmationText += change)
      const confirmation = window.confirm(confirmationTextArr.length < 2 ? "No edits." : "Making the following changes: " + confirmationText);

      if(confirmation) {
        try{
          await updateDoc(doc(firestore, 'employees', showEditFormId), { name: editEmployeeName[1], passcode: editEmployeePasscode[1], admin: editEmployeeAdmin[1], email: editEmployeeEmail[1]});
          const updatedEmployees = await fetchEmployees();
          setEmployeeState((curState) => curState+1);
          //needs backend code to delete old emails
          await addDefaultUser(editEmployeeEmail[1], updatedEmployees);
        } catch (error) {
          console.error(error);
        }
      }

      fetchEmployees();
      
      setShowEditFormId("");
      setShowAddForm(false);
      setEditEmployeeAdmin([false, false]);
      setEditEmployeeName(["", ""]);
      setEditEmployeePasscode(["", ""]);
      setEditEmployeeEmail(["", ""])
      setFormSubmissionError("");

    }

    async function addDefaultUser(email: string, employees: { id: string; name: string; passcode: string; admin: boolean; email: string; }[] ) {
      fetchEmployees();
      console.log(employees);
      let employeeFromEmail = employees.find((employee) => employee.email === email) as { id: string; name: string; passcode: string; admin: boolean, email: string };
      if(employeeFromEmail) {
      let idViaEmail: string = employeeFromEmail.id;
      console.log("addDefaultUser() called with " + email + " and " + idViaEmail)
        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, idViaEmail);
            const curUser = userCredential.user;
            
            console.log("Created employee " + curUser.email + " with default password.");
            if(curUser.email) {
              sendPasswordResetEmail(getAuth(), curUser.email).then(() => {

              })
            }
            getAuth().signOut();
        } catch (error) {
          setFormSubmissionError("OOPS")
        }
      } else {
        console.error("Employee not found!");
      }
    }

    async function employeeSubmission() {
      let currentEmployees: string[] = [];
      let currentPasscodes: string[] = [];
      let currentEmails: string[] = [];
      employees.map(employee => {
        currentEmployees.push(employee.name);
        currentPasscodes.push(employee.passcode);
        currentEmails.push(employee.email);
      });
      //allows us to check if new employee name/code is in the current employee list
      //input checking
      if(currentEmployees.includes(newEmployeeName) || currentPasscodes.includes(newEmployeePasscode) || currentEmails.includes(newEmployeeEmail)) {
        setFormSubmissionError("Employee already exists or passcode has been taken!");
        return;
      }
      if(newEmployeeName.length === 0) {
        setFormSubmissionError("Please enter an employee name!");
        return;
      }
      if(!/^\d{1,5}$/.test(newEmployeePasscode)) {
        setFormSubmissionError("Passcode must be a number 5 digits or less!");
        return;
      }
      if(!validateEmail(newEmployeeEmail)) {
        return;
      }

      const newEmployee ={
        name: newEmployeeName,
        passcode: newEmployeePasscode,
        admin: newEmployeeAdmin,
        email: newEmployeeEmail,
      };
      //add employee
      try{
      await addDoc(collection(firestore, 'employees'), newEmployee);
      const updatedEmployees = await fetchEmployees();
      await addDefaultUser(newEmployee.email, updatedEmployees);
      setEmployeeState((curState) => curState+1);
      } catch (error) {
        console.error(error)
        const employeeToDelete: string | undefined = (await fetchEmployees()).find((employee) => employee.email  === newEmployee.email)?.id
        if(employeeToDelete) {
          await deleteDoc(doc(firestore, 'employees', employeeToDelete));
          console.log("Deleted employee " + newEmployee.name);
        }
        else {
          console.error("No employee to delete.");
        }
      } finally {
        console.log("WE DID IT O_O")
      }
        //update employees list
      fetchEmployees();

      //take us back to employees list
      setNewEmployeeAdmin(false);
      setNewEmployeeName("");
      setNewEmployeePasscode("");
      setNewEmployeeEmail("");
      setFormSubmissionError("");
      setShowAddForm(false);

    }

    function handleGoToClock() {
      navigate('/clock')
    }
    
    function handleGoToProfile() {
      navigate('/account')
    }

    function refreshHours(id: string) {
      setShowHours([true, id]);
    }

    function summarize() {
      setShowHours([false, ""]);
    }

    return (
        <>
        {getAuth().currentUser && signedInUser &&
        (<>
        <>
        <Navbar bg="dark" variant="dark">
          <Container 
          style={{
            display:'flex'
          }}>
            <Navbar.Brand>KobeTime</Navbar.Brand>
            <Navbar.Toggle aria-controls="nav"/>
            <Navbar.Collapse id="nav" className="justify-content-end">
              <Nav className="mr-auto">
                <NavDropdown 
                title={`Signed in as ${signedInUser.name}`} 
                style={{ }}
                >
                  <NavDropdown.Item 
                  onClick={handleGoToProfile}>
                    My Account
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={handleGoToClock}>
                    Time Clock
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <Button style={{ display:'flex' }} variant='outline-danger' onClick={() => handleSignOut()}>Sign Out</Button>
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
              
          </Container>
        </Navbar>
        
        
        <Container className="border border-3 rounded" style={{ maxWidth:800, padding:10}}>
          <Stack direction='vertical'>
            <Stack direction='horizontal' gap={3}>
            <h2>Employees</h2>
            <Button variant="secondary" className="ms-auto" style={{ maxHeight:40 }} onClick={() => summarize()}>Summary</Button>
            <div className="vr"></div>
            <Button variant="success" onClick={() => setShowAddForm(true)} style={{ maxHeight:40 }}>New Employee</Button>
          </Stack>
          <Container style={{ overflowX:'auto', display:'flex', justifyItems:'center', justifyContent:'center' }}>
            <Table striped bordered hover style={{ maxWidth:750, justifyContent:'center', justifyItems:'center'}}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Code</th>
                <th scope="col">Admin</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              { employees && employees.map((employee) => { 
                return(
                  <tr key={employee.id}>
                    <th scope="row">{employees.indexOf(employee)}</th>
                    <td><strong>{employee.name}</strong>
            <p style={{ fontStyle:'italic'}}>{employee.email}</p></td>
                    <td>{employee.passcode}</td>
                    <td>{employee.admin ? 'Yes' : 'No'}</td>
                    <td>
                      <ButtonGroup>
                        <Button className="viewbutton" variant="outline-light" onClick={() => {
                          refreshHours(employee.id);
                          console.info('viewHoursID : ' + employee.id);
                        }}
                        disabled={showHours[0] === true && showHours[1] === employee.id}><img style={{ width:20, height:20 }} src={(showHours[0] === true && showHours[1] === employee.id) ? ViewOffIcon : ViewIcon}></img></Button>
                        <Button variant="outline-light" className="editbutton" onClick={() => 
                      {
                      setShowEditFormId(employee.id);
                      getEmployee(employee.id);
                      }}><img src={EditIcon} style={{ width:20, height:20 }}></img></Button>
                      <Button variant="outline-danger" className="deletebutton" onClick={() => deleteEmployee(employee.id)}><img style={{width:20, height:20}} src={DeleteIcon}></img></Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>  
          </Container>
          
          </Stack>
        
        </Container>
        {(showHours[0] === true) ? (<Hours adminView={true} employeeID={showHours[1].toString()}/>) : (<></>) }
        </>

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
                Are you sure you want to permanently delete this employee?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleDelete}>
                    Yes
                </Button>
                <Button variant="danger" onClick={() => {
                    setShowDelete(false);
                    setDeleteId("");
                }}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>

          <Modal
          centered
          show={showAddForm} 
          onHide={() => {
            setShowAddForm(false);
            setNewEmployeeAdmin(false);
            setNewEmployeeName("");
            setNewEmployeePasscode("");
            setNewEmployeeEmail("");
            setFormSubmissionError("");
          }}>
            <Modal.Header closeButton>
              <Modal.Title>
                New Employee
              </Modal.Title>
            </Modal.Header>
          <Modal.Body>
            <Form className="form-floating">
        <div className="container-sm border border-warning" style={{ justifyContent:'center', padding:20, backgroundColor:'blanchedalmond'}}>
        <div className="col mb-3">
        <NotifMessage notifmsg="Please inform new employees to check their email to set a password."/>
        <div className="row mb-3">
         <label htmlFor="employeeName" className="form-label">
           Employee Name
         </label>
         <input
           type="text"
           className="form-control"
           id="employeeName"
           value={newEmployeeName}
           onChange={(e) => {
            setNewEmployeeName(e.target.value);
            setFormSubmissionError("");
          }}
         />
       </div>
       <div className="row mb-3">
         <label htmlFor="employeePasscode" className="form-label">
           Passcode
         </label>
         <input
           type="text"
           className="form-control"
           id="employeePasscode"
           value={newEmployeePasscode}
           onChange={(e) => {
            setNewEmployeePasscode(e.target.value);
            setFormSubmissionError("");
          }}
          aria-describedby="inputGroupPrepend" 
          required
         />
       </div>
       <div className="row mb-3">
         <label htmlFor="employeeEmail" className="form-label">
           Email
         </label>
         <input
           type="text"
           className="form-control"
           id="employeeEmail"
           value={newEmployeeEmail}
           onChange={(e) => {
            setNewEmployeeEmail(e.target.value);
            setFormSubmissionError("");
          }}
          placeholder="name@example.com"
          aria-describedby="inputGroupPrepend" 
          required
         />
       </div>
       <div className="row mb-3">
       <div className="form-check">
         <input
           type="checkbox"
           className="form-check-input"
           id="isAdmin"
           checked={newEmployeeAdmin}
           onChange={(e) => setNewEmployeeAdmin(e.target.checked)}
         />
         <label className="form-check-label" htmlFor="isAdmin">
           Admin
         </label>
        </div>
       </div>
       <ErrorMessage errormsg={formSubmissionError}/>
       
       </div>
       </div>
     </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" style={{fontWeight:"bold"}} onClick={employeeSubmission}>
            Submit
          </Button>
          <Button variant="danger" style={{fontWeight:"bold"}} onClick={() => {
          setShowAddForm(false);
          setNewEmployeeAdmin(false);
          setNewEmployeeName("");
          setNewEmployeePasscode("");
          setNewEmployeeEmail("");
          setFormSubmissionError("");
          }}>
          Cancel
            </Button>
          </Modal.Footer>
          </Modal>
        <Modal
        centered
        show={showEditFormId.length > 0}
        backdrop="static"
        keyboard={false}
        onHide={() => {
          setShowEditFormId("");
          setShowAddForm(false);
          setEditEmployeeAdmin([false, false]);
          setEditEmployeeName(["", ""]);
          setEditEmployeePasscode(["", ""]);
          setEditEmployeeEmail(["", ""]);
          setFormSubmissionError("");
        }}
        >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Employee {editEmployeeName[0]}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
        <Form>
          <Container className="border border-warning" style={{ justifyContent:'center', padding:20, backgroundColor:'blanchedalmond'}}>
          <div className="col mb-3">
          <div className="row mb-3">
            <label htmlFor="employeeName" className="form-label">
              Employee Name <small className="text-body-secondary">(Previously: {editEmployeeName[0]})</small>
            </label>
            <input
              type="text"
              className="form-control"
              id="employeeName"
              value={editEmployeeName[1]}
              onChange={(e) => {
                setEditEmployeeName([editEmployeeName[0], e.target.value]);
                setFormSubmissionError("");
              }}
            />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="employeePasscode" className="form-label">
              Passcode <small className="text-body-secondary">(Previously: {editEmployeePasscode[0]})</small>
            </label>
            <input
              type="text"
              className="form-control"
              id="employeePasscode"
              value={editEmployeePasscode[1]}
              onChange={(e) => {
                setEditEmployeePasscode([editEmployeePasscode[0], e.target.value]);
                setFormSubmissionError("");
              }}
            />
          </div>
          <div className="row mb-3">
            <label htmlFor="editEmail" className="form-label">
              Email <small className="text-body-secondary">(Previously: {editEmployeeEmail[0]})</small>
            </label>
            <input
              type="text"
              className="form-control"
              id="editEmail"
              value={editEmployeeEmail[1]}
              onChange={(e) => {
                setEditEmployeeEmail([editEmployeeEmail[0], e.target.value]);
                setFormSubmissionError("");
              }}
              aria-describedby="inputGroupPrepend" 
              required
            />
          </div>
          <div className="row mb-3">
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isAdmin"
              checked={editEmployeeAdmin[1]}
              onChange={(e) => setEditEmployeeAdmin([editEmployeeAdmin[0], e.target.checked])}
            />
            <label className="form-check-label" htmlFor="isAdmin">
              Admin
            </label>
            </div>
          </div>
          <ErrorMessage errormsg={formSubmissionError}/>
          
          </Container>
        </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" style={{fontWeight:"bold"}} onClick={updateEmployee}>
            Submit
          </Button>
          <Button variant="danger" style={{fontWeight:"bold"}} onClick={() => {
          setShowEditFormId("");
          setShowAddForm(false);
          setEditEmployeeAdmin([false, false]);
          setEditEmployeeName(["", ""]);
          setEditEmployeePasscode(["", ""]);
          setEditEmployeeEmail(["", ""]);
          setFormSubmissionError("");
          }}>
          Cancel
          </Button>
        </Modal.Footer>
        </Modal>
     <div style={{ display:'flex', justifyContent:'center'}}>
     
   </div>
        </>
        )}
        </>
    )
}

export default ListEmployees