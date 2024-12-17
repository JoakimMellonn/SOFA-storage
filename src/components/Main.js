import React, { useState } from "react";
import {
  InstantSearch,
  SearchBox,
  RefinementList,
} from "react-instantsearch-dom";
import { Container, Row, Col, Alert } from "react-bootstrap";
import algoliaSearch from "algoliasearch/lite";
import "../css/search.css";
import "instantsearch.css/themes/satellite.css";
import InfiniteHits from "./InfiniteHits";

// https://codesandbox.io/s/github/algolia/create-instantsearch-app/tree/templates/react-instantsearch?file=/src/App.js

export default function Main() {
  const searchClient = algoliaSearch(
    "QTEVXHL3O4",
    "e7b7f3cb983836187b5eacb1ff7dc19b"
  );
  const [succesMessage, setSuccesMessage] = useState("");

  return (
    <Container className="mt-5 mb-3">
      {succesMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccesMessage("")}
          dismissible
        >
          <Alert.Heading>{succesMessage}</Alert.Heading>
          <p>
            Please visit the office during opening hours, where you will be able
            to recieve your component. You can view and edit your current
            requests by clicking on your email adress in the top right.
          </p>
        </Alert>
      )}
      <InstantSearch searchClient={searchClient} indexName="components">
        <Row>
          <Col sm={2} md={3}>
            <RefinementList attribute="componentCategory" />
          </Col>
          <Col sm={10} md={9}>
            <SearchBox
              className="searchbox mb-3"
              translations={{
                placeholder: "",
              }}
            />
            <InfiniteHits />
          </Col>
        </Row>
      </InstantSearch>
    </Container>
  );
}
