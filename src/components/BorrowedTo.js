import React, { useState } from "react";
import { Button, Card, Container, Table } from "react-bootstrap";
import { Link, useHistory } from 'react-router-dom'
import { db } from "../firebase";

export default function BorrowedTo({ id }) {
  const [isEnabled, setEnabled] = useState(false);
  const [borrowedList, setBorrowedList] = useState([]);

  const history = useHistory()

  function enableLookupView() {
    // First enable the table vieww.
    setEnabled(true);

    findUsers();
  }

  // Look up the users who have borrowed this component.
  function findUsers() {
    db.collection("components")
      .doc(id)
      .collection("borrowedTo")
      .get()
      .then((docs) => {
        if (!docs.empty) {
          let foundUsers = [];
          let userNames = [];

          docs.forEach((doc) => {
            foundUsers.push(doc.data());
          });

          setBorrowedList(foundUsers);
        }
      });
  }



  // The param link here should have used the proper way through React Router, but I deemed it was too much effort. (https://reacttraining.com/blog/react-router-v5-1)
  // Could be changed in the future, especially if more redirects to user lookups needs to be made!

  return (
    <>
      {isEnabled ? (
        <Card className="mt-3 p-2">
          <h2>Currently borrowed to:</h2>
          <Table responsive>
            <thead>
              <tr>
                <th>Email:</th>
                <th>Date Added To User:</th>
              </tr>
            </thead>
            <tbody>
              {borrowedList.map((doc, i) => (
                <tr key={i}>
                  <td><button onClick={() => history.push('/users/?uEmail='+ doc.userEmail)} type="button" className="btn btn-link">{doc.userEmail}</button></td>
                  <td>{doc.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Container className="mt-1 d-flex align-items-center justify-content-center">
          <Button variant="link" onClick={() => enableLookupView()}>
            Check who borrowed this component
          </Button>
        </Container>
      )}
    </>
  );
}
