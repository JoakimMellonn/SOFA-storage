import React, { useEffect, useState } from "react";
import {
  Card,
  Container,
  Table,
  Alert,
  Badge,
  Button,
  Spinner,
} from "react-bootstrap";
import { useUserCon } from "../contexts/UserContext";
import Select from "react-select";
import BorrowedComponent from "./BorrowedComponent";
import RequestedComponent from "./RequestedComponent";

export default function UserOverview() {
  const { db } = useUserCon();
  const [options, setOptions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [displayName, setDisplayName] = useState("Choose an user...");
  const [contactInfo, setContactInfo] = useState("");
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [componentsBorrowed, setComponentsBorrowed] = useState("");
  const [firstUserIsSelected, setFirstUserIsSelected] = useState(false);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [requestedItems, setRequestedItems] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [requestSnapshot, setRequestSnapshot] = useState(null);
  const [componentSnapshot, setComponentSnapshot] = useState(null);
  const [userSnapshot, setUserSnapshot] = useState(null);
  const [loading, setLoading] = useState(true)

  const [userData, setUserData] = useState([])

  useEffect(() => {
    // Get users for react-select
    getUsers();
  }, []);

  // Helper function to sort amount of components (because of json object)
  function myComparator(a,b){
    return  parseInt(b.amountOfComponents, 10) - parseInt(a.amountOfComponents, 10);
  }

  // Resets states between new selections.
  function resetSelection() {
    setDisplayName("");
    setContactInfo("");
    setUserIsAdmin(false);
    setComponentsBorrowed("");
    setBorrowedItems([]);
    setRequestedItems([]);
    setSelectedEmail("");
  }

  function getUsers() {
    db.collection("users")
      .get()
      .then((docs) => {
        if (!docs.empty) {
          let possibleOptions = [];
          let collectedUserData = [];

          docs.forEach((doc) => {
            const tag = {
              value: doc.id,
              label:  doc.data().fullName + ' (' + doc.data().userEmail + ')',
            };

            possibleOptions.push(tag);
            
            // Push the entire doc to the list, in order to create the sorted user list.
            collectedUserData.push(doc.data());
          });

          setOptions(possibleOptions);

          // Sort the list before setting it to the state
          collectedUserData.sort(myComparator)
        
          setUserData(collectedUserData);
          setLoading(false)

          checkForUserRedirect()

        }
      });
  }

  // Check if a user was passed through in the url and select the user if so.
  function checkForUserRedirect() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString)
    if (urlParams.has("uEmail")) {
      const passedEmail = urlParams.get('uEmail')
      selectUser(passedEmail)
    }
  }

  function lookupUser(email) {
    setUserSnapshot(() =>
      db
        .collection("users")
        .doc(email)
        .onSnapshot(
          (querySnapshot) => {
            const data = querySnapshot.data();
            setDisplayName(data.fullName);

            // Set the contact info header.
            setContactInfo(
              data.userEmail +
                " | AU-ID: " +
                data.auID +
                " | Phone Number : " +
                data.phoneNumber
            );

            // Set admin information
            setUserIsAdmin(data.adminStatus);

            setComponentsBorrowed(data.amountOfComponents);
          },
          (error) => {
            setError(error);
          }
        )
    );
  }

  function lookupRequests(email) {
    setRequestSnapshot(() =>
      db
        .collection("users")
        .doc(email)
        .collection("requestedComponents")
        .onSnapshot(
          (querySnapshot) => {
            var requestList = [];

            // Refresh map to avoid an error when getting a new query.
            setRequestedItems([]);

            querySnapshot.forEach((doc) => {
              requestList.push(doc.data());
            });

            setRequestedItems(requestList);
          },
          (error) => {
            setError(error);
          }
        )
    );
  }

  function lookupComponents(email) {
    setComponentSnapshot(() =>
      db
        .collection("users")
        .doc(email)
        .collection("owedComponents")
        .onSnapshot(
          (querySnapshot) => {
            var componentList = [];

            // Refresh map to avoid an error when getting a new query.
            setBorrowedItems([]);

            querySnapshot.forEach((doc) => {
              componentList.push(doc.data());
            });

            setBorrowedItems(componentList);
          },
          (error) => {
            setError(error);
          }
        )
    );
  }

  // Callback everytime a user is selected.
  const handleSelection = (tags) => {
    const userEmail = tags.value;
    selectUser(userEmail)
  };

  function selectUser(userEmail) {
    setError("");
    setSuccess("");
    resetSelection();

    // Unsubscribe from snapshot listeners when a new user is selected. (not sure this actually works...)
    if (requestSnapshot != null) {
      requestSnapshot();
    }
    if (componentSnapshot != null) {
      componentSnapshot();
    }
    if (userSnapshot != null) {
      userSnapshot();
    }

    setSelectedEmail(userEmail);

    setSelectedUser(userEmail);
    lookupUser(userEmail);
    lookupComponents(userEmail);
    lookupRequests(userEmail);

    if (firstUserIsSelected === false) {
      setFirstUserIsSelected(true);
    }
  }

  function makeUserAdmin() {
    setError("");
    setSuccess("");

    db.collection("users")
      .doc(selectedEmail)
      .update({ adminStatus: true })
      .then(() => {
        setSuccess(
          "User has succesfully been made admin, refresh to see changes."
        );
      })
      .catch((error) => {
        setError(error);
      });
  }

  function returnToListView() {
    setError("");
    setSuccess("");
    resetSelection();

    // Unsubscribe from snapshot listeners when a new user is selected. (not sure this actually works...)
    if (requestSnapshot != null) {
      requestSnapshot();
    }
    if (componentSnapshot != null) {
      componentSnapshot();
    }
    if (userSnapshot != null) {
      userSnapshot();
    }

    setFirstUserIsSelected(false);
  }

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {loading ? 
      <Container className="d-flex align-items-center justify-content-center"><Spinner animation="border" variant="primary" /></Container>
       : 
       <Select
        style={{ width: "100%" }}
        options={options}
        onChange={handleSelection}
        placeholder="Search for a user"
      />}
      <Card className="mt-2 p-2" hidden={firstUserIsSelected}>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total Components</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((doc, i) => (
          <tr>
            <td><button onClick={() => selectUser(doc.userEmail)} type="button" class="btn btn-link">{doc.fullName}</button></td>
            <td>{doc.userEmail}</td>
            <td>{doc.amountOfComponents}</td>
          </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Card className="mt-2 p-2" hidden={!firstUserIsSelected}>
        <h1>
          {displayName}{" "}
          {userIsAdmin ? (
            <Badge variant="danger">Admin</Badge>
          ) : (
            <Badge variant="info">User</Badge>
          )}
        </h1>
        <h6>{contactInfo}</h6>
        <h2 className="mt-5">Requested Components: </h2>
        <Table>
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Date Requested</th>
              <th>Amount To Add</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requestedItems.map((doc, i) => (
              <RequestedComponent document={doc} user={selectedEmail} key={i} />
            ))}
          </tbody>
        </Table>

        <h2 className="mt-5">
          Borrowed Components:{" "}
          <Badge variant="secondary">{componentsBorrowed}</Badge>
        </h2>
        <Table>
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Date Updated</th>
              <th>Outstanding Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {borrowedItems.map((doc, i) => (
              <BorrowedComponent document={doc} user={selectedEmail} key={i} />
            ))}
          </tbody>
        </Table>
        <Container className="d-flex align-items-center justify-content-center">
          {userIsAdmin ? null : (
            <Button
              variant="danger"
              hidden={selectedUser === null}
              className="w-50 mt-5"
              onClick={() => makeUserAdmin()}
            >
              Make Admin
            </Button>
          )}
        </Container>
      </Card>
      <Container className="d-flex align-items-center pt-4 justify-content-center">
       <Button onClick={() => returnToListView()} variant="outline-secondary" className="w-40">Return To List</Button>
      </Container>
    </Container>
  );
}
