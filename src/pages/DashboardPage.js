import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Button,
  Alert
} from 'react-bootstrap';
import { BsGraphUp, BsGlobe, BsCapsulePill, BsBuilding, BsPersonBadge } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'; // ⬅️ Added charts
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [quarter, setQuarter] = useState('');
  const [quarters, setQuarters] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topDrugs, setTopDrugs] = useState([]);
  const [companySales, setCompanySales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const API_BASE = 'http://13.201.34.246:8080/api/results';

  // Load quarters on mount
  useEffect(() => {
    axios.get(`${API_BASE}/quarters`)
      .then((res) => {
        setQuarters(res.data);
        if (res.data.length > 0) {
          setQuarter(res.data[0]); // default to first quarter
        }
      })
      .catch(() => setErrorMsg('❌ Failed to fetch quarters.'));
  }, []);

  // Fetch data when quarter changes
  useEffect(() => {
    if (!quarter) return;

    setLoading(true);

    const fetchSummary = axios.get(`${API_BASE}/summary?quarter=${quarter}`);
    const fetchTopDrugs = axios.get(`${API_BASE}/top-drugs?quarter=${quarter}`);
    const fetchCompanySales = axios.get(`${API_BASE}/company-sales?quarter=${quarter}`);

    Promise.all([fetchSummary, fetchTopDrugs, fetchCompanySales])
      .then(([summaryRes, topDrugsRes, companySalesRes]) => {
        setSummary(summaryRes.data);
        setTopDrugs(topDrugsRes.data);
        setCompanySales(companySalesRes.data);
        setErrorMsg('');
      })
      .catch(() => {
        setErrorMsg('❌ Failed to fetch dashboard data.');
      })
      .finally(() => setLoading(false));
  }, [quarter]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#00E396', '#775DD0', '#FEB019', '#FF66C3'];

  return (
    <Container className="mt-5">
      <h3 className="text-center text-primary mb-4">📊 Sales Estimation Dashboard</h3>

      {errorMsg && <Alert variant="danger" className="text-center">{errorMsg}</Alert>}

      <Form.Group className="mb-4 text-center">
        <Form.Label><strong>Select Quarter:</strong></Form.Label>
        <Form.Select
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          style={{ maxWidth: '300px', margin: '0 auto' }}
        >
          {quarters.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </Form.Select>
      </Form.Group>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <div className="text-muted mt-2">Loading dashboard...</div>
        </div>
      ) : summary && (
        <>
          <Row className="g-4 text-center">
            <Col md={6} lg={3}>
              <Card border="primary" bg="light" className="shadow-sm">
                <Card.Body>
                  <BsGraphUp size={30} className="mb-2 text-primary" />
                  <Card.Title>Total Sales</Card.Title>
                  <Card.Text><strong>${summary.totalSales.toLocaleString()}</strong></Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card border="success" bg="light" className="shadow-sm">
                <Card.Body>
                  <BsGlobe size={30} className="mb-2 text-success" />
                  <Card.Title>Countries</Card.Title>
                  <Card.Text><strong>{summary.totalCountries}</strong></Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card border="info" bg="light" className="shadow-sm">
                <Card.Body>
                  <BsCapsulePill size={30} className="mb-2 text-info" />
                  <Card.Title>Drugs Estimated</Card.Title>
                  <Card.Text><strong>{summary.totalDrugs}</strong></Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card border="warning" bg="light" className="shadow-sm">
                <Card.Body>
                  <BsBuilding size={30} className="mb-2 text-warning" />
                  <Card.Title>Companies</Card.Title>
                  <Card.Text><strong>{summary.totalCompanies}</strong></Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4 justify-content-center">
            <Col md={6}>
              <Card border="dark" bg="light" className="shadow-sm">
                <Card.Body className="text-center">
                  <BsPersonBadge size={30} className="mb-2 text-dark" />
                  <Card.Title>Our Company Sales</Card.Title>
                  <Card.Text>
                    <strong>${summary.ourCompanySales.toLocaleString()}</strong>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="text-center mt-4">
          <Button variant="outline-success" className="me-3" onClick={() => navigate('/drugs')}>
            📋 View Drug-wise Estimation
            </Button>
          <Button variant="outline-warning" className="me-3" onClick={() => navigate('/company-estimation')}>
            🏢 View Company Estimation
          </Button>
          <Button variant="outline-success" className="me-3" onClick={() => navigate('/country-overview')}>
            🌍 View Country Overview
          </Button>
          </div>

          {/* Graphs Section */}
          <h4 className="mt-5 text-primary text-center">📈 Top 10 Drugs by Estimated Sales</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDrugs} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
              <XAxis type="number" />
              <YAxis dataKey="drugName" type="category" />
              <Tooltip />
              <Bar dataKey="estimatedSales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>

          <h4 className="mt-5 text-primary text-center">🥧 Company-wise Sales Distribution</h4>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={companySales}
                dataKey="totalSales"
                nameKey="companyName"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label
              >
                {companySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </Container>
  );
};

export default DashboardPage;
