import React from 'react'
import { Route, Redirect } from 'react-router'
import { useUserCon } from '../contexts/UserContext'

// Protects components from being loaded when the user is not an admin.
export default function AdminRoute ({ component: Component, ...rest }) {
  const { isAdmin } = useUserCon()

  return (
    <Route
      {...rest}
      render={props => {
        return isAdmin ? <Component {...props} /> : <Redirect to='/' />
      }}
    />
  )
}
