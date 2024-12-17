import React, { useContext, useState, useEffect } from 'react'
import { db, storage } from '../firebase'
import { useAuth } from './AuthContext'

// Deals with anything connected to firestore userinformation.

const UserContext = React.createContext()
export function useUserCon () {
  return useContext(UserContext)
}

export function UserProvider ({ children }) {
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  // User variables.
  const [isAdmin, setAdmin] = useState(false)
  const [fullname, setFullname] = useState()
  const [phoneNumber, setPhoneNumber] = useState()
  const [auID, setAuID] = useState()
  const [amountOfComponents, setAmountOfComponents] = useState()

  // Retrieve userinformation from firestore database.
  async function getUserInformation (userEmail) {
    setLoading(true)
    await db.collection('users').doc(userEmail).get().then((doc) => {
      if (doc.exists) {
        const userDocument = doc.data()

        // Update state variables with userinformation.
        setAdmin(userDocument.adminStatus)
        setFullname(userDocument.fullName)
        setPhoneNumber(userDocument.phoneNumber)
        setAuID(userDocument.auID)
        setAmountOfComponents(userDocument.amountOfComponents)
        setLoading(false)
      }
    }).catch((error) => {
      return error
    })

    return 'success'
  }

  useEffect(() => {
    // Update user information upon loading the page.
    async function checkCurrentUser () {
      if (currentUser !== null && fullname === undefined) {
        await getUserInformation(currentUser.email)
      } else {
        // No user is currently logged in, remove the loading requirement.
        setLoading(false)
      }
    }
    checkCurrentUser()
  })

  // Sign up a user with the provided information into the firestore database.
  async function updateUserInfo (ID, name, number, givenEmail) {
    await db.collection('users').doc(givenEmail).set({
      auID: ID,
      fullName: name,
      phoneNumber: number,
      adminStatus: false,
      amountOfComponents: 0,
      userEmail: givenEmail
    }).catch((error) => {
      return error
    })

    // Update current user information
    setAdmin(false)
    setFullname(name)
    setPhoneNumber(number)
    setAuID(ID)
    setAmountOfComponents(0)

    return 'success'
  }

  const value = {
    isAdmin,
    fullname,
    phoneNumber,
    auID,
    amountOfComponents,
    getUserInformation,
    updateUserInfo,
    db,
    storage
  }

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  )
}
