import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, Container, Navbar } from 'react-bootstrap';

const Navigation = () => (
  <Navbar bg="light" expand="lg">
    <Container>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <NavLink to="/" className="nav-link">Upload</NavLink>
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default Navigation;
