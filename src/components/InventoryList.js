import React, { useEffect, useState } from "react";
import { Card, Container, Table, Button, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserCon } from "../contexts/UserContext";

export default function InventoryList() {
  const { db } = useUserCon();
  const [inventoryRequests, setInventoryRequests] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInventoryStatus();
  }, []);

  function getInventoryStatus() {
    db.collection("inventoryStatus").onSnapshot((querySnapshot) => {
      const items = [];

      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });

      setInventoryRequests(items);
      setLoading(false)
    });
  }

  function deleteEntry(entryID) {
    setError("");
    setSuccess("");

    db.collection("inventoryStatus")
      .doc(entryID)
      .delete()
      .then(() => {
        setSuccess("The entry has successfully been removed from the list.");
      })
      .catch((error) => {
        setError(error);
      });
  }

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <h1>Inventory Status</h1>
      <Container className="d-flex align-items-center justify-content-center"><Spinner hidden={!loading} animation="border" variant="primary" /></Container>
      <Card className="p-2" hidden={loading}>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Component Category</th>
              <th>Requested By</th>
              <th>Amount Left</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {inventoryRequests.map((req, i) => (
              <tr key={i}>
                <td>
                  <Link to={"/component/" + req.componentID}>
                    {req.componentName}
                  </Link>
                </td>
                <td>{req.componentCategory}</td>
                <td>{req.requestedBy}</td>
                <td>{req.amountLeft}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => deleteEntry(req.componentID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}
