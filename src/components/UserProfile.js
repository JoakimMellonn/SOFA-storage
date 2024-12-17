import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useUserCon } from "../contexts/UserContext";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

export default function UserProfile() {
  const { logout, currentUser } = useAuth();
  const { fullname, db } = useUserCon();
  const [error, setError] = useState("");
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [requestedItems, setRequestedItems] = useState([]);
  const history = useHistory();

  useEffect(() => {
    getBorrowedComponents();
    getRequestedComponents();
  }, []);
  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/login");
    } catch (e) {
      setError("Failed to log out");
    }
  }

  function getBorrowedComponents() {
    db.collection("users")
      .doc(currentUser.email)
      .collection("owedComponents")
      .get()
      .then((docs) => {
        if (!docs.empty) {
          var componentList = [];

          docs.forEach((doc) => {
            componentList.push(doc.data());
          });

          setBorrowedItems(componentList);
        }
      })
      .catch((error) => {
        setError(error);
      });
  }

  function getRequestedComponents() {
    db.collection("users")
      .doc(currentUser.email)
      .collection("requestedComponents")
      .get()
      .then((docs) => {
        if (!docs.empty) {
          var requestList = [];

          docs.forEach((doc) => {
            requestList.push(doc.data());
          });

          setRequestedItems(requestList);
        }
      })
      .catch((error) => {
        setError(error);
      });
  }

  return (
    <Container>
      {error && <Alert variant="danger">{error}</Alert>}
      <h1 className="mt-5 mb-3">{fullname}</h1>
      <h2>Requested Components:</h2>
      <Table responsive hover>
        <thead>
          <tr>
            <th>Component Name</th>
            <th>Date Requested</th>
          </tr>
        </thead>
        <tbody>
          {requestedItems.map((doc, i) => (
            <tr key={i}>
              <td>
                <Link to={"/component/" + doc.componentID}>
                  {doc.componentName}
                </Link>
              </td>
              <td>{doc.dateRequested}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2 className="mt-5">Borrowed Components:</h2>
      <Table responsive hover>
        <thead>
          <tr>
            <th>Component Name</th>
            <th>Date Updated</th>
            <th>Outstanding Amount</th>
          </tr>
        </thead>
        <tbody>
          {borrowedItems.map((doc, i) => (
            <tr key={i}>
              <td>
                <Link to={"/component/" + doc.componentID}>
                  {doc.componentName}
                </Link>
              </td>
              <td>{doc.lastUpdated}</td>
              <td>{doc.amountBorrowed}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Container className="d-flex align-items-center justify-content-center">
        <Button
          className="mt-3"
          onClick={() => history.push("/update-profile")}
        >
          Edit Profile
        </Button>
      </Container>
      <div className="w-100 text-center">
        <Button variant="link" onClick={handleLogout}>
          Click here to Log Out
        </Button>
      </div>
    </Container>
  );
}
