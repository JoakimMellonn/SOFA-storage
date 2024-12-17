import React, { useRef, useState } from 'react'
import { Form, Button, Card, Container, Alert } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserCon } from '../contexts/UserContext'
import logo from '../images/logoSVG.svg'

export default function Login () {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login, currentUser } = useAuth()
  const { getUserInformation } = useUserCon()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  // If user is already logged in, redirect to the main page.
  if (currentUser !== null) {
    history.push('/')
  }

  async function handleSubmit (e) {
    e.preventDefault()

    // Make sure both fields are not empty.
    if (emailRef.current.value === '' || passwordRef.current.value === '') {
      setError('Please fillout the fields before logging in.')
      return setLoading(false)
    }
    
    try {
      setError('')
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      await getUserInformation(currentUser.email)
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
              <h2 className='text-center mb-4'>Login</h2>
              {error && <Alert variant='danger'>{error}</Alert>}
            </Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group id='email'>
                <Form.Label>Email</Form.Label>
                <Form.Control type='email' ref={emailRef} required />
              </Form.Group>
              <Form.Group id='password'>
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' ref={passwordRef} required />
              </Form.Group>
              <Button disabled={loading} className='w-100 mt-3' type='submit'>Login</Button>
            </Form>
            <div className='w-100 text-center mt-3'>
              <Link to='/forgot-password'>Forgot Password?</Link>
            </div>
          </Card>
          <div className='w-100 text-center mt-2'>
            Need an account? <Link to='/signup'>Sign Up</Link>
          </div>
        </div>
      </Container>
    </>
  )
}
