import React, { Component } from "react";
import { connectInfiniteHits } from "react-instantsearch-dom";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Row, Col, Container, Image, Badge } from "react-bootstrap";
import placeholderComponent from "../images/placeholder_component.png";
import "../css/search.css";
import "instantsearch.css/themes/satellite.css";

class InfiniteHits extends Component {
  static propTypes = {
    hits: PropTypes.arrayOf(PropTypes.object).isRequired,
    hasMore: PropTypes.bool.isRequired,
    refineNext: PropTypes.func.isRequired,
  };

  sentinel = null;

  onSentinelIntersection = (entries) => {
    const { hasMore, refineNext } = this.props;

    entries.forEach((entry) => {
      if (entry.isIntersecting && hasMore) {
        refineNext();
      }
    });
  };

  componentDidMount() {
    this.observer = new IntersectionObserver(this.onSentinelIntersection);

    this.observer.observe(this.sentinel);
  }

  componentWillUnmount() {
    this.observer.disconnect();
  }

  render() {
    const { hits } = this.props;

    return (
      <div className="ais-InfiniteHits">
        <ul className="ais-InfiniteHits-list">
          {hits.map((hit) => (
            <Link
              className="ais-InfiniteHits-item"
              style={{ width: "100%" }}
              to={"/component/" + hit.objectID}
            >
              <Container className="p-3" style={{ width: "100%" }}>
                <Row>
                  <Col sm={4}>
                    <Image
                      style={{
                        height: "200px",
                        width: "200px",
                        objectFit: "cover",
                      }}
                      src={
                        hit.image.length > 0 ? hit.image : placeholderComponent
                      }
                      fluid
                      rounded
                    />
                  </Col>
                  <Col sm={8}>
                    <h2
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      {hit.componentName}{" "}
                      <span
                        className="float-right"
                        style={{ fontSize: "25px", paddingLeft: "10px" }}
                      >
                        <Badge variant="info">{hit.componentCategory}</Badge>
                      </span>{" "}
                    </h2>
                    <p style={{ height: "100px", overflow: "hidden" }}>
                      {hit.componentDescription}
                    </p>
                  </Col>
                </Row>
                <Container className="d-flex align-items-center justify-content-center mt-2">
                  <h5>
                    <Badge pill variant="light">
                      Available: {hit.componentAvailable} |{" "}
                      {hit.componentLocation}
                    </Badge>
                  </h5>
                </Container>
              </Container>
            </Link>
          ))}
          <li
            className="ais-InfiniteHits-sentinel"
            ref={(c) => (this.sentinel = c)}
          />
        </ul>
      </div>
    );
  }
}

export default connectInfiniteHits(InfiniteHits);
