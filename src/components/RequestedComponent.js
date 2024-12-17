import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserCon } from "../contexts/UserContext";

export default function RequestedComponent({ document, user }) {
  const { db } = useUserCon();
  const [amount, setAmount] = useState(1);
  const [componentLocation, setCompLocation] = useState("")

  function addComponentToUser() {
    // Check if the value is negative.
    if (amount < 0) {
      return;
    }

    // First check if the user already has borrowed a similiar component.
    db.collection("users")
      .doc(user)
      .collection("owedComponents")
      .doc(document.componentID)
      .get()
      .then((doc) => {
        if (doc.exists) {
          db.collection("users")
            .doc(user)
            .collection("owedComponents")
            .doc(document.componentID)
            .update({
              amountBorrowed: doc.data().amountBorrowed * 1 + amount * 1,
            });
        } else {
          db.collection("users")
            .doc(user)
            .collection("owedComponents")
            .doc(document.componentID)
            .set({
              componentName: document.componentName,
              componentID: document.componentID,
              lastUpdated: document.dateRequested,
              amountBorrowed: amount,
            });
        }

        // Now remove the request from the list.
        db.collection("users")
          .doc(user)
          .collection("requestedComponents")
          .doc(document.componentID)
          .delete();

        // And update the total amount of borrowed items for the user.
        db.collection("users")
          .doc(user)
          .get()
          .then((doc) => {
            if (doc.exists) {
              let newAmount = doc.data().amountOfComponents * 1 + amount * 1;
              db.collection("users")
                .doc(user)
                .update({ amountOfComponents: newAmount });
            }
          });

        // Subtract the amount added to the user from the database entry
        db.collection("components")
          .doc(document.componentID)
          .get()
          .then((doc) => {
            if (doc.exists) {
              // Update the new total
              db.collection("components")
                .doc(document.componentID)
                .update({
                  componentAvailable:
                    doc.data().componentAvailable * 1 - amount * 1,
                });
            }
          });
      });

    // Add the user to to the borrowedTo list under the component itself.
    db.collection("components")
      .doc(document.componentID)
      .collection("borrowedTo")
      .doc(user)
      .set({
        userEmail: user,
        lastUpdated: getGMTDate(),
      });
  }

  function getGMTDate() {
    const dateString = Date().toLocaleString();
    const formatString = dateString.split("(");
    return formatString[0];
  }

  function deleteRequest() {
    // Remove the component in requestion from requests.
    db.collection("users")
      .doc(user)
      .collection("requestedComponents")
      .doc(document.componentID)
      .delete();
  }

    // Find the component and get information on where it is and how many there are left.
    function getComponentInformation() {
      db.collection("components")
      .doc(document.componentID)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setCompLocation(" (" + doc.data().componentLocation + ")")
        }
      });
    }
  
    getComponentInformation()

  return (
    <tr>
      <td>
        <Link to={"/component/" + document.componentID}>
          {document.componentName}
        </Link>{componentLocation}
      </td>
      <td>{document.dateRequested}</td>
      <td>
        <input
          style={{ width: "160px" }}
          onKeyUp={(event) => setAmount(event.target.value)}
          defaultValue={1}
        />
      </td>
      <td>
        <Button
          className="mr-1"
          variant="success"
          onClick={() => addComponentToUser()}
        >
          Approve
        </Button>
        <Button variant="danger" onClick={() => deleteRequest()}>
          Delete
        </Button>
      </td>
    </tr>
  );
}
