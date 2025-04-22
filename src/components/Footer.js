import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => (
  <footer className="bg-dark text-white text-center py-3 mt-auto">
    <Container>
      <small>&copy; {new Date().getFullYear()} Pharma Estimation Tool. All rights reserved.</small>
    </Container>
  </footer>
);

export default Footer;
