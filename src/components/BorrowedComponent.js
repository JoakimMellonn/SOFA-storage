import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserCon } from "../contexts/UserContext";

export default function BorrowedComponent({ document, user, compInfo }) {
  const { db } = useUserCon();
  const [amount, setAmount] = useState(document.amountBorrowed);
  const [componentLocation, setCompLocation] = useState("")


  function updateComponent() {
    // Check if the value is negative.
    if (amount < 0) {
      return;
    }

    // First update the component in question with the new amount.
    db.collection("users")
      .doc(user)
      .collection("owedComponents")
      .doc(document.componentID)
      .update({ amountBorrowed: amount })
      .then(() => {
        // Get the current amount of borrowed items.
        db.collection("users")
          .doc(user)
          .get()
          .then((doc) => {
            if (doc.exists) {
              let removeInitialAmount =
                doc.data().amountOfComponents * 1 - document.amountBorrowed * 1;
              let newAmount = removeInitialAmount + amount * 1;
              db.collection("users")
                .doc(user)
                .update({ amountOfComponents: newAmount });

              // Subtract the amount added to the user from the database entry
              let amountToRemove = amount * 1 - document.amountBorrowed * 1;

              // Update the total amount on the component
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
                          doc.data().componentAvailable * 1 - amountToRemove,
                      });
                  }
                });
            }
          });
      });
  }

  function deleteComponent() {
    // First delete the component in question from the user.
    db.collection("users")
      .doc(user)
      .collection("owedComponents")
      .doc(document.componentID)
      .delete()
      .then(() => {
        // Then remove the amount from the total borrowed variable from the user.
        db.collection("users")
          .doc(user)
          .get()
          .then((doc) => {
            if (doc.exists) {
              let newAmount =
                doc.data().amountOfComponents * 1 - document.amountBorrowed * 1;
              db.collection("users")
                .doc(user)
                .update({ amountOfComponents: newAmount });
            }
          });
      });

    // Then update the available amount on the component itself.
    db.collection("components")
      .doc(document.componentID)
      .get()
      .then((doc) => {
        if (doc.exists) {
          db.collection("components")
            .doc(document.componentID)
            .update({
              componentAvailable:
                doc.data().componentAvailable * 1 + amount * 1,
            });
        }
      });

    // Delete the entry from the borrowedTo list under the component itself.
    db.collection("components")
      .doc(document.componentID)
      .collection("borrowedTo")
      .doc(user)
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
      <td>{document.lastUpdated}</td>
      <td>
        <input
          style={{ width: "160px" }}
          onKeyUp={(event) => setAmount(event.target.value)}
          defaultValue={document.amountBorrowed}
        />
      </td>
      <td>
        <Button variant="success" onClick={() => updateComponent()}>
          Update
        </Button>{" "}
        <Button onClick={() => deleteComponent()} variant="danger">
          Delete{" "}
        </Button>
      </td>
    </tr>
  );
}
