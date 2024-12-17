import React, { useRef, useState } from "react";
import { useUserCon } from "../contexts/UserContext";
import {
  Card,
  Container,
  Form,
  Row,
  Col,
  InputGroup,
  Dropdown,
  DropdownButton,
  Button,
  Alert,
  Image,
} from "react-bootstrap";
import placeholderComponent from "../images/placeholder_component.png";

// https://github.com/bradtraversy/react_file_uploader/blob/master/client/src/components/FileUpload.js
export default function AddComponent() {
  const componentNameRef = useRef();
  const componentAmountRef = useRef();
  const componentAvailableRef = useRef();
  const componentLocationRef = useRef();
  const componentDescriptionRef = useRef();
  const imageUploadRef = useRef();
  const [componentCategory, setComponentCategory] = useState("Choose Category");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(placeholderComponent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { db, storage } = useUserCon();

  // Callback everytime a file is selected, to properly insert it.
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

  function createUniqueID() {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    return dateString + randomness;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate input of the form.
    if (componentCategory === "Choose Category") {
      return setError("Please select a category before uploading a component");
    }

    if (componentNameRef.current.value.length <= 0) {
      return setError("Please enter a component name.");
    }

    if (componentLocationRef.current.value.length <= 0) {
      return setError("Please enter a location.");
    }

    if (componentDescriptionRef.current.value.length <= 0) {
      return setError("Please enter a description.");
    }

    // Check if there is an uploaded image file.
    if (uploadedFile !== null) {
      // Attempt to upload the given image to firebase storage.
      const generatedID = createUniqueID();
      const uploadTask = storage
        .ref("images/" + generatedID + uploadedFile.name)
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
            .child(generatedID + uploadedFile.name)
            .getDownloadURL()
            .then((url) => {
              uploadComponent(url);
              setLoading(false);
            });
        }
      );
    } else {
      // Else upload an empty image string, so we can show the placeholder.
      uploadComponent("");
      setLoading(false);
    }
  }

  async function uploadComponent(url) {
    // Get variables from the form.
    const componentName = componentNameRef.current.value;
    const componentAmount = componentAmountRef.current.value * 1;
    const componentAvailable = componentAvailableRef.current.value * 1;
    const componentLocation = componentLocationRef.current.value;
    const componentDescription = componentDescriptionRef.current.value;

    // Add the component to firestore.
    await db
      .collection("components")
      .doc()
      .set({
        componentName: componentName,
        componentAmount: componentAmount,
        componentAvailable: componentAvailable,
        componentCategory: componentCategory,
        componentLocation: componentLocation,
        componentDescription: componentDescription,
        image: url,
      })
      .catch((error) => {
        return setError(error);
      })
      .then(() => {
        // Reset the variables and alert success
        resetForm();
        setSuccess("Component succesfully uploaded!");
      });
  }

  function resetForm() {
    componentNameRef.current.value = "";
    componentAmountRef.current.value = "";
    componentAvailableRef.current.value = "";
    componentLocationRef.current.value = "";
    componentDescriptionRef.current.value = "";
    imageUploadRef.current.value = "";
    setComponentCategory("Choose Category");
    setImagePreview(placeholderComponent);
    setUploadedFile(null);
  }

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <h1>Add Component</h1>
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
                />
              </Form.Group>
            </Col>
            <Col sm={8}>
              <Form.Label>Component Name:</Form.Label>
              <InputGroup className="mb-3" id="componentName">
                <Form.Control type="name" ref={componentNameRef} required />

                <DropdownButton
                  variant="outline-secondary"
                  title={componentCategory}
                  id="input-group-dropdown-2"
                  align="end"
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
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group id="location">
                <Form.Label>Location:</Form.Label>
                <Form.Control type="text" ref={componentLocationRef} required />
              </Form.Group>
              <Form.Group id="description">
                <Form.Label>Description:</Form.Label>
                <Form.Control
                  type="text"
                  as="textarea"
                  rows={3}
                  ref={componentDescriptionRef}
                  required
                />
                <Form.Text id="descriptionHelpBlock" muted>
                  A description which helps users read/understand the component.
                  Can be relevant information such as what it is capable of
                  doing, datasheets or what platforms it functions on e.g.
                  Arduino. This section is also search indexed!
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Container className="d-flex align-items-center justify-content-center">
            <Button disabled={loading} size="lg" className="mt-5" type="submit">
              Upload Component
            </Button>
          </Container>
        </Form>
      </Card>
    </Container>
  );
}
