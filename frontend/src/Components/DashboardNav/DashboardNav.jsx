import React from 'react'
import { Link } from 'react-router-dom'
import './DashboardNav.css'

function DashboardNav() {
  return (
    <div>
      <DashboardNav className="navbar">
        <Link to="/mainHome" className="nav-link">Home</Link>
        <Link to="/AddUser" className="nav-link">Add User</Link>
        <Link to="/UserDetails" className="nav-link">User Details</Link>
        <Link to="/ContactUs" className="nav-link">Contact Us</Link>
        <Link to="/Register" className="nav-link"><button>Register</button></Link>
        <Link to="/login" className="nav-link"><button>Loginn</button></Link>
        
      </DashboardNav>
    </div>
  )
}
export default DashboardNav
