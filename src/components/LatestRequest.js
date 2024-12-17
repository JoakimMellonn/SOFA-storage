import React, { useState, useEffect } from "react";
import { Container, Table, Alert, Image } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { db } from "../firebase"; // Ensure this points to your Firebase config

export default function LatestRequests() {
  const [latestRequests, setLatestRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLatestRequests();
  }, []);

  // Fetch the latest 10 requests from the database
  function fetchLatestRequests() {
    db.collection("latestRequests")
      .orderBy("dateRequested", "desc")
      .limit(10)
      .get()
      .then(async (snapshot) => {
        let requests = await Promise.all(
          snapshot.docs.map(async (doc) => {
            let requestData = {
              componentID: doc.data().componentID,
              dateRequested: doc.data().dateRequested,
              userEmail: doc.data().userEmail,
            };
            
            // Use the retrieved component ID to fetch the component data i.e name, location, image
            const componentDoc = await db.collection("components").doc(requestData.componentID).get();
            if (componentDoc.exists) {
              const componentData = componentDoc.data();
              requestData = {
                ...requestData,
                componentLocation: componentData.componentLocation,
                componentImage: componentData.image,
                componentName: componentData.componentName,                
              };
            }
            return requestData;
          })
        );
        
        setLatestRequests(requests);
      })
      .catch((error) => {
        setError("Failed to fetch latest component requests");
        console.error("Error fetching latest requested components:", error);
      });
  }

  return (
    <Container>
      {error && <Alert variant="danger">{error}</Alert>}
      <h1 className="mt-5 mb-3">Latest Requested Components</h1>
      
      <Table responsive hover>
        <thead>
          <tr>
            <th>Image</th>
            <th>Component Name</th>
            <th>Location</th>
            <th>User Email</th>
            <th>Date Requested</th>
          </tr>
        </thead>
        <tbody>
          {latestRequests.map((doc, i) => (
            <tr key={i}>
              <td>
                {doc.componentImage ? (
                  <Image
                    src={doc.componentImage}
                    fluid
                    className="img-responsive"
                    style={{
                      maxWidth: "100%", // Fill available space
                      height: "auto", // Maintain aspect ratio
                      minHeight: "100px", // Limit minimum height
                      minWidth: "100px", // Limit minimum width
                      maxHeight: "300px", // Limit maximum height
                      objectFit: "cover", // Crop if necessary
                      borderRadius: "5px",
                    }}
                  />
                ) : (
                  "No image available"
                )}
              </td>
              <td>
                <Link to={"/component/" + doc.componentID}>
                  {doc.componentName}
                </Link>
              </td>
              <td>{doc.componentLocation || "N/A"}</td>
              <td>
                <Link to={"/user-profile/" + doc.userEmail}>
                  {doc.userEmail}
                </Link>
              </td>
              <td>{doc.dateRequested}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
