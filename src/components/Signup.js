import React, { useRef, useState } from 'react'
import { Form, Button, Card, Container, Alert } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserCon } from '../contexts/UserContext'
import logo from '../images/logoSVG.svg'

export default function Signup () {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const nameRef = useRef()
  const phoneNumberRef = useRef()
  const auidRef = useRef()
  const { signup, currentUser } = useAuth()
  const { updateUserInfo } = useUserCon()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  // If user is already logged in, redirect to the main page.
  if (currentUser !== null) {
    history.push('/')
  }

  async function handleSubmit (e) {
    e.preventDefault()

    // Snapshot of variables before processing:
    const fullName = nameRef.current.value
    const phoneNumber = phoneNumberRef.current.value
    const auID = auidRef.current.value
    const email = emailRef.current.value.toLowerCase()
    const password = passwordRef.current.value
    const passwordConf = passwordConfirmRef.current.value

    if (password !== passwordConf) {
      setLoading(false)
      return setError('Passwords do not match.')
    }

    // Validate input fields
    if ( fullName === '' || phoneNumber === '' || phoneNumber === '' || auID === '' || email === '' || password === '' || passwordConf === '') {
      setLoading(false)
      return setError('Please fill out all neccesary fields.')
    }

    // First setup authentication account with firebase.
    // Update firestore with the rest of the user details if user has been authenticated.
    try {
      setError('')
      setLoading(true)

      await signup(email, password)
      
      
      await updateUserInfo(auID, fullName, phoneNumber, email)

      history.push('/')
    } catch (errorMessage) {
      setError(errorMessage.message)
    }

    setLoading(false)
  }

  return (
    <>
      <Container className='d-flex align-items-center justify-content-center'
        style={{ minHeight: '100vh' }}>
        <div className='w-100' style={{ maxWidth: '400px' }}>
          <Container className='mb-3'>
            <img src={logo} alt='Chomskylab Logo' style={{ maxWidth: '400px' }} />
          </Container>
          <Card style={{ padding: '20px' }}>
            <Card.Body>
              <h2 className='text-center mb-4'>Sign Up</h2>
              {error && <Alert variant='danger'>{error}</Alert>}
            </Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group id='name'>
                <Form.Label>Full name</Form.Label>
                <Form.Control type='name' ref={nameRef} required />
              </Form.Group>
              <Form.Group id='phoneNumber'>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control type='phoneNumber' ref={phoneNumberRef} required />
              </Form.Group>
              <Form.Group id='auID'>
                <Form.Label>AU ID</Form.Label>
                <Form.Control type='auID' ref={auidRef} required />
              </Form.Group>
              <Form.Group id='email'>
                <Form.Label>Email</Form.Label>
                <Form.Control type='email' ref={emailRef} required />
              </Form.Group>
              <Form.Group id='password'>
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' ref={passwordRef} required />
              </Form.Group>
              <Form.Group id='passwordConfirm'>
                <Form.Label>Password Confirmation</Form.Label>
                <Form.Control type='password' ref={passwordConfirmRef} required />
              </Form.Group>
              <Button disabled={loading} className='w-100 mt-3' type='submit'>Sign Up</Button>
            </Form>
          </Card>
          <div className='w-100 text-center mt-2'>
        Already have an account? <Link to='/login'>Log In</Link>
          </div>
        </div>
      </Container>
    </>
  )
}
