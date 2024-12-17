import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Alert,
  Container,
  Row,
  Col,
  Image,
  Form,
  Dropdown,
  DropdownButton,
  Button,
  InputGroup,
  Modal,
  FormControl,
} from "react-bootstrap";
import placeholderComponent from "../images/placeholder_component.png";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { useUserCon } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import Select from "react-select";
import BorrowedTo from "./BorrowedTo";

export default function ViewComponent() {
  const componentNameRef = useRef();
  const componentAmountRef = useRef();
  const componentAvailableRef = useRef();
  const componentLocationRef = useRef();
  const componentDescriptionRef = useRef();
  const addToUserAmountRef = useRef();
  const imageUploadRef = useRef();
  const [componentCategory, setComponentCategory] = useState("Choose Category");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(placeholderComponent);
  const [allowUpdate, setAllowUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [compHeaderName, setCompHeaderName] = useState("loading...");
  const [options, setOptions] = useState();
  const [selectedUser, setSelectedUser] = useState(null);
  const { isAdmin, db, storage, fullname } = useUserCon();
  const { currentUser } = useAuth();
  const history = useHistory();

  const { id } = useParams();

  useEffect(() => {
    // Set the admin flag if the user is admin.
    if (isAdmin) {
      setAllowUpdate(true);

      // Gets all user emails from the firestore DB for react-select
      getUsers();
    }

    getComponent(id);
  }, []);

  function getUsers() {
    // Stop if the user is not an admin.
    if (!isAdmin) return;

    db.collection("users")
      .get()
      .then((docs) => {
        if (!docs.empty) {
          let possibleOptions = [];

          docs.forEach((doc) => {
            const tag = {
              value: doc.id,
              label: doc.data().fullName + ' (' + doc.data().userEmail + ')',
            };

            possibleOptions.push(tag);
          });

          setOptions(possibleOptions);
        }
      });
  }

  // Callback everytime a user is selected.
  const handleSelection = (tags) => {
    setSelectedUser(tags.value);
  };

  function getComponent(docName) {
    db.collection("components")
      .doc(docName)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const compDoc = doc.data();

          // Populate the input forms with the retrieved values.
          componentNameRef.current.value = compDoc.componentName;
          componentAmountRef.current.value = compDoc.componentAmount;
          componentAvailableRef.current.value = compDoc.componentAvailable;
          componentLocationRef.current.value = compDoc.componentLocation;
          componentDescriptionRef.current.value = compDoc.componentDescription;
          setComponentCategory(compDoc.componentCategory);

          // Check if the placeholder image has been chosen, if it has then don't change the image.
          if (compDoc.image.length > 0) {
            setImagePreview(compDoc.image);
          }

          setCompHeaderName(compDoc.componentName);
        } else {
          setError("ID could not be found in the database.");
        }
      })
      .catch((error) => {
        return setError(error);
      });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Stop if the user is not an admin.
    if (!isAdmin) return;

    // Check if available amount is higher than total amount.
    if (
      componentAvailableRef.current.value * 1 >
      componentAmountRef.current.value * 1
    ) {
      return setError(
        "The total amount cannot be lower than the available amount."
      );
    }

    var docRef = db.collection("components").doc(id);

    // Update the component according to the ID submitted.
    docRef
      .update({
        componentAmount: componentAmountRef.current.value,
        componentAvailable: componentAvailableRef.current.value,
        componentCategory: componentCategory,
        componentDescription: componentDescriptionRef.current.value,
        componentLocation: componentLocationRef.current.value,
        componentName: componentNameRef.current.value,
      })
      .catch((error) => {
        setError(error);
      });

    // Set the header so it corresponds with the change, if there is any.
    setCompHeaderName(componentNameRef.current.value);

    // Check if new image has to be uploaded.
    if (uploadedFile != null) {
      const uploadTask = storage
        .ref("images/" + uploadedFile.name)
        .put(uploadedFile);

      // Callback once completed
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          return setError(error);
        },
        () => {
          storage
            .ref("images")
            .child(uploadedFile.name)
            .getDownloadURL()
            .then((url) => {
              docRef.update({ image: url });

              setLoading(false);
              setSuccess("Component succesfully updated.");
            });
        }
      );
    } else {
      setLoading(false);
      setSuccess("Component succesfully updated.");
    }
  }

  const handleChange = (e) => {
    const imageFile = e.target.files[0];

    if (!imageFile) {
      return setError("Please select an image.");
    }

    if (!imageFile.name.match(/\.(jpg|jpeg|png|gif)$/)) {
      setUploadedFile(null);
      return setError("Only jpg/jpeg/png/gif allowed.");
    }

    if (e.target.files[0]) {
      var uploadedFile = e.target.files[0];
      setUploadedFile(uploadedFile);
      setImagePreview(URL.createObjectURL(uploadedFile));
    }
  };

  function deleteComponent() {
    setError("");
    setSuccess("");

    db.collection("components")
      .doc(id)
      .delete()
      .then(() => {
        history.push("/");
      })
      .catch((error) => {
        setError(error);
      });
  }

  function addToInventoryList() {
    setSuccess("");
    setError("");

    // Stop if the user is not an admin.
    if (!isAdmin) return;

    db.collection("inventoryStatus")
      .doc(id)
      .set({
        componentName: componentNameRef.current.value,
        amountLeft: componentAvailableRef.current.value,
        componentCategory: componentCategory,
        requestedBy: fullname,
        componentID: id,
      })
      .catch((error) => {
        return setError(error);
      })
      .then(() => {
        setSuccess(
          "Component has succesfully been added to the inventory list."
        );
      });
  }

  function addToUser(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Stop if the user is not an admin.
    if (!isAdmin) return;

    // Check if a user has been selected.
    if (selectedUser === null) {
      return setError("Please select an user before adding a component to it.");
    }

    const amountToAdd = addToUserAmountRef.current.value;
    // Check that the amount is valid.
    if (!isNaN(amountToAdd) && amountToAdd < 1) {
      return setError("Please select a valid amount to add to an user.");
    }

    const compEntryRef = db
      .collection("users")
      .doc(selectedUser)
      .collection("owedComponents")
      .doc(id);

    // First check if the user already has such an entry.
    compEntryRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          // Calculate the sum of the stored and new addition.
          var totalAmount = doc.data().amountBorrowed + amountToAdd * 1;

          // Update the entry with the additional amount instead.
          compEntryRef.update({ amountBorrowed: totalAmount });
          setSuccess(
            "Existing component already borrowed: The additional request has been successfully added to the user."
          );
        } else {
          // No existing entry, add new one.
          compEntryRef.set({
            componentName: componentNameRef.current.value,
            componentID: id,
            lastUpdated: getGMTDate(),
            amountBorrowed: amountToAdd * 1,
          });
          setSuccess("Component succesfully added to the user.");
        }

        // Update the amount of total borrowed components on the selected user.
        db.collection("users")
          .doc(selectedUser)
          .get()
          .then((doc) => {
            var newAmount = doc.data().amountOfComponents + amountToAdd * 1;
            db.collection("users")
              .doc(selectedUser)
              .update({ amountOfComponents: newAmount });
          });
      })
      .catch((error) => {
        return setError(error);
      });

    // Update the total amount of the component
    db.collection("components")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          db.collection("components")
            .doc(id)
            .update({
              componentAvailable:
                doc.data().componentAvailable * 1 - amountToAdd * 1,
            });
        }
      });

    // Add the user to to the borrowedTo list under the component itself.
    db.collection("components")
      .doc(id)
      .collection("borrowedTo")
      .doc(selectedUser)
      .set({
        userEmail: selectedUser,
        lastUpdated: getGMTDate(),
      });
  }

  function requestComponent() {
    db.collection("users")
      .doc(currentUser.email)
      .collection("requestedComponents")
      .doc(id)
      .set({
        componentName: componentNameRef.current.value,
        componentID: id,
        dateRequested: getGMTDate(),
      })
      .then(() => {
        setSuccess(
          "Component has been succesfully requested, please visit Chomskylab during opening hours to recieve it."
        );
      });

      addRequestToLatestRequests();
  }
  
  // This function adds a request to the latest requests collection
  // It also enforces a limit of 10 requests in the collection
  // The limit can be changed by modifying the limit(10) parameter
  function addRequestToLatestRequests() {
    try {
      // Add a new document with an auto-generated ID to ensure uniqueness
      db.collection("latestRequests")
        .add({
          componentName: componentNameRef.current.value,
          componentID: id,
          userEmail: currentUser.email,
          dateRequested: getGMTDate(),
        })
        .then(async () => {
          console.log("Component has been successfully requested.");
  
          // Deleteing old requests to maintain the list limit
          const latestRequestsSnapshot = await db
            .collection("latestRequests")
            .orderBy("dateRequested", "desc")
            .get();
  
          // Amount of requests to keep in the collection
          const limit = 10;
  
          if (latestRequestsSnapshot.size > limit) {
            const docsToDelete = latestRequestsSnapshot.docs.slice(limit);
  
            // Delete each document that's beyond the limit
            const deletePromises = docsToDelete.map((doc) => doc.ref.delete());
            await Promise.all(deletePromises);
  
            console.log("Old requests deleted to maintain the list limit.");
          }
        });
    } catch (error) {
      console.error("Error adding request to latest requests:", error);
    }
  }
  
  

  function getGMTDate() {
    const dateString = Date().toLocaleString();
    const formatString = dateString.split("(");
    return formatString[0];
  }

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <h1
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        {compHeaderName}{" "}
        <span className="float-right">
          {allowUpdate ? (
            <Button
              variant="warning"
              className="mr-2"
              onClick={() => addToInventoryList()}
            >
              Request More
            </Button>
          ) : null}
          {allowUpdate ? (
            <Button variant="danger" onClick={() => setShow(true)}>
              Delete
            </Button>
          ) : null}
        </span>
      </h1>

      <Row>
        <Col sm={7}>
          {allowUpdate ? (
            <Select
              style={{ width: "100%" }}
              options={options}
              onChange={handleSelection}
              placeholder="Select a user..."
            />
          ) : null}
        </Col>
        <Col sm={5}>
          {allowUpdate ? (
            <Form onSubmit={addToUser}>
              <InputGroup className="mb-3">
                <FormControl
                  aria-label="Example text with button addon"
                  aria-describedby="basic-addon1"
                  required
                  type="number"
                  defaultValue="1"
                  ref={addToUserAmountRef}
                />
                <Button variant="success" type="submit">
                  Add To User
                </Button>
              </InputGroup>
            </Form>
          ) : null}
        </Col>
      </Row>

      <Card className="p-2">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col sm={4}>
              <Image
                src={imagePreview}
                style={{
                  maxWidth: "250px",
                  maxHeight: "250px",
                  marginBottom: "10px",
                }}
              ></Image>
              <Form.Group controlId="formFile">
                <Form.Control
                  type="file"
                  onChange={handleChange}
                  ref={imageUploadRef}
                  hidden={!allowUpdate}
                />
              </Form.Group>
            </Col>
            <Col sm={8}>
              <Form.Label>Component Name:</Form.Label>
              <InputGroup className="mb-3" id="componentName">
                <Form.Control
                  type="name"
                  ref={componentNameRef}
                  required
                  disabled={!allowUpdate}
                />

                <DropdownButton
                  variant="outline-secondary"
                  title={componentCategory}
                  id="input-group-dropdown-2"
                  align="end"
                  disabled={!allowUpdate}
                >
                  <Dropdown.Item onClick={() => setComponentCategory("SOUND")}>
                    SOUND
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setComponentCategory("LIGHT")}>
                    LIGHT
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setComponentCategory("CAMERAS")}
                  >
                    CAMERAS
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setComponentCategory("SENSORS")}
                  >
                    SENSORS
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setComponentCategory("ACTUATORS")}
                  >
                    ACTUATORS
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setComponentCategory("COMMUNICATION")}
                  >
                    COMMUNICATION
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setComponentCategory("MICROCONTROLLERS")}
                  >
                    MICROCONTROLLERS
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setComponentCategory("CONSUMABLES")}
                  >
                    CONSUMEABLES
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setComponentCategory("CABLES")}>
                    CABLES
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setComponentCategory("TOOLS")}>
                    TOOLS
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setComponentCategory("MACHINES")}
                  >
                    MACHINES
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setComponentCategory("MISC")}>
                    MISC
                  </Dropdown.Item>
                </DropdownButton>
              </InputGroup>
              <Row>
                <Col>
                  <Form.Group id="componentAmount">
                    <Form.Label>Total Amount:</Form.Label>
                    <Form.Control
                      type="number"
                      defaultValue="0"
                      ref={componentAmountRef}
                      required
                      disabled={!allowUpdate}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group id="componentAmount">
                    <Form.Label>Available Amount:</Form.Label>
                    <Form.Control
                      type="number"
                      defaultValue="0"
                      ref={componentAvailableRef}
                      disabled={!allowUpdate}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group id="location">
                <Form.Label>Location:</Form.Label>
                <Form.Control
                  type="text"
                  ref={componentLocationRef}
                  required
                  disabled={!allowUpdate}
                />
              </Form.Group>
              <Form.Group id="description">
                <Form.Label>Description:</Form.Label>
                <Form.Control
                  type="text"
                  as="textarea"
                  rows={3}
                  ref={componentDescriptionRef}
                  disabled={!allowUpdate}
                  required
                />
                <Form.Text
                  id="descriptionHelpBlock"
                  muted
                  hidden={!allowUpdate}
                >
                  A description which helps users read/understand the component.
                  Can be relevant information such as what it is capable of
                  doing, datasheets or what platforms it functions on e.g.
                  Arduino. This section is also search indexed!
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Container className="d-flex align-items-center justify-content-center">
            {allowUpdate ? (
              <Button
                disabled={loading}
                hidden={!allowUpdate}
                size="lg"
                className="mt-5"
                type="submit"
              >
                {" "}
                Update Component
              </Button>
            ) : (
              <Button
                size="lg"
                variant="success"
                className="mt-5"
                onClick={() => requestComponent()}
              >
                Request Component
              </Button>
            )}
          </Container>
        </Form>
      </Card>
      {isAdmin ? <BorrowedTo id={id} /> : null}

      <Modal centered show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>
            Are you sure you want to delete this component?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deleting this component will permenently delete it from the database,
          any componenets currently lended out in the system could be lost in
          the process.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Return
          </Button>
          <Button variant="danger" onClick={() => deleteComponent()}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
