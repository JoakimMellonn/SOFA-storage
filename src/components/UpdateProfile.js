import React, { useRef, useState, useEffect } from 'react'
import { Form, Button, Card, Container, Alert } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserCon } from '../contexts/UserContext'
import logo from '../images/logoSVG.svg'

export default function UpdateProfile () {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const nameRef = useRef()
  const phoneNumberRef = useRef()
  const auidRef = useRef()
  const { currentUser, updateEmail, updatePassword, logout, signupUserInfo } = useAuth()
  const { fullname, phoneNumber, auID } = useUserCon()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  // Placeholder values for storing initial input variables from firestore.
  var originalName = ''
  var originalNumber = ''
  var originalAuID = ''

  // TODO: add updates for the rest of the fields.
  async function handleSubmit (e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match.')
    }

    // Create an empty array of promises to complete.
    const promises = []
    setLoading(true)
    setError('')

    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value))
    }

    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value))
    }

    const enteredName = nameRef.current.value
    const enteredNumber = phoneNumberRef.current.value
    const enteredID = auidRef.current.value
    if (enteredName !== originalName || enteredNumber !== originalNumber || enteredID !== originalAuID) {
      promises.push(signupUserInfo(enteredID, enteredName, enteredNumber, currentUser.email))
    }

    Promise.all(promises)
      .then(() => {
        history.push('/')
      })
      .catch(() => {
        setError('Failed to update account')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Invoke getUserDetails once page elements are loaded.
  useEffect(() => {
    // Fill document with the email from auth.
    const userEmail = currentUser.email
    emailRef.current.value = userEmail

    auidRef.current.value = auID
    nameRef.current.value = fullname
    phoneNumberRef.current.value = phoneNumber
  }, [])

  async function handleLogout () {
    setError('')

    try {
      await logout()
      history.push('/login')
    } catch (e) {
      setError('Failed to log out')
    }
  }

  return (
    <>
      <Container className='d-flex align-items-center justify-content-center mt-5'
        style={{ minHeight: '100vh' }}>
        <div className='w-100' style={{ maxWidth: '400px' }}>
          <Container className='mb-3'>
            <img src={logo} alt='Chomskylab Logo' style={{ maxWidth: '400px' }} />
          </Container>
          <Card style={{ padding: '20px' }}>
            <Card.Body>
              <h2 className='text-center mb-4'>Update Profile</h2>
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
                <Form.Control type='password' ref={passwordRef} />
              </Form.Group>
              <Form.Group id='passwordConfirm'>
                <Form.Label>Password Confirmation</Form.Label>
                <Form.Control type='password' ref={passwordConfirmRef} />
              </Form.Group>
              <Button disabled={loading} className='w-100 mt-3' type='submit'>Update Profile</Button>
              <p style={{ color: 'grey' }} className='text-center'><em>(Only changed fields will be updated)</em></p>
            </Form>
          </Card>
          <div className='w-100 text-center mt-2'>
            <Button variant='link' onClick={handleLogout}>Click here to Log Out</Button>
          </div>
        </div>
      </Container>
    </>
  )
}
