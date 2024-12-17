import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { useUserCon } from '../contexts/UserContext'
import logo from '../images/logoSVG.svg'

export default function Navigationbar () {
  const { currentUser } = useAuth()
  const { isAdmin } = useUserCon()
  const history = useHistory()
  const [expanded, setExpanded] = useState(false)

  // Check if a user is logged into the page. If not, do not render the navbar.
  if (currentUser == null) {
    return (
      <>
      </>
    )
  }

  // Ensure that the navbar is closed, when a link in the navbar is clicked.
  const handleNavClick = (path) => {
    history.push(path)
    setExpanded(false)
  }

  return (
    <Navbar bg='light' expand='lg' style={{position: 'sticky', top: '0', zIndex: '9001'}} expanded={expanded}>
      <Container style={{ minWidth: '100%' }}>
        <Navbar.Brand onClick={() => handleNavClick('/')}>
          <img
            src={logo}
            height='30'
            className='d-inline-block align-top'
            alt='Chomskylab logo' />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' onClick={() => setExpanded(expanded ? false : 'expanded')} />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='me-auto'>
            <Nav.Link onClick={() => handleNavClick('/')}>Home</Nav.Link>
            {isAdmin ? <Nav.Link onClick={() => handleNavClick('/users')}>Users</Nav.Link> : null}
            {isAdmin ? <Nav.Link onClick={() => handleNavClick('/add-component')}>Add Component</Nav.Link> : null}
            {isAdmin ? <Nav.Link onClick={() => handleNavClick('/inventory')}>Inventory Status</Nav.Link> : null}
            {isAdmin ? <Nav.Link onClick={() => handleNavClick('/latest-requests')}>Latest requests</Nav.Link> : null}
          </Nav>
          <Navbar.Text className='justify-content-end'>
            Signed in as: <Link to='/user-profile'>{currentUser.email}</Link>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
