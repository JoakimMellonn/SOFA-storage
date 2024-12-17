import React, { useRef, useState } from 'react'
import { Form, Button, Card, Container, Alert } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../images/logoSVG.svg'

export default function ForgotPassword () {
  const emailRef = useRef()
  const { resetPassword, currentUser } = useAuth()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  // If user is already logged in, redirect to the main page.
  if (currentUser !== null) {
    history.push('/')
  }

  async function handleSubmit (e) {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      await resetPassword(emailRef.current.value)
      setMessage('Success: Check your Email Inbox for further instructions.')
    } catch (e) {
      setError(e.message)
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
              <h2 className='text-center mb-4'>Password Reset</h2>
              {error && <Alert variant='danger'>{error}</Alert>}
              {message && <Alert variant='success'>{message}</Alert>}
            </Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group id='email'>
                <Form.Label>Email</Form.Label>
                <Form.Control type='email' ref={emailRef} required />
              </Form.Group>
              <Button disabled={loading} className='w-100 mt-3' type='submit'>Reset Password</Button>
            </Form>
            <div className='w-100 text-center mt-3'>
              <Link to='/login'>Return to Login</Link>
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
