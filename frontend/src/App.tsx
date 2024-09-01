import './styles/App.css'
import ListEmployees from './components/ListEmployees'
import {  BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import EmployeeView from './components/EmployeeView'
import LoginEmail from './components/LoginEmail'
import ForgotPassword from './components/ForgotPassword'
import ClockPage from './components/ClockPage'

function App() {

  return (
    <Router>
        <Routes>
          <Route path='/' Component={Login}/>
          <Route path='/clock' Component={ClockPage}/>
          <Route path='/employees' Component={ListEmployees}/>
          <Route path='/account' Component={EmployeeView}/>
          <Route path='/loginemail' Component={LoginEmail}/>
          <Route path='/forgotpassword' Component={ForgotPassword}/>
        </Routes>
    </Router>
  )
}

export default App
