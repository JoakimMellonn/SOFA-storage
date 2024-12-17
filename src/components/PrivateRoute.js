import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Responsible for making sure users are signed in before navigating outside of signup/login
export default function PrivateRoute ({ component: Component, ...rest }) {
  const { currentUser } = useAuth()

  return (
    <Route
      {...rest}
      render={props => {
        return currentUser ? <Component {...props} /> : <Redirect to='/login' />
      }}
    />
  )
}
