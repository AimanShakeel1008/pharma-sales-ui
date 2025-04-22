import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const API_BASE = 'http://localhost:8080/api/results';

const CountryOverviewPage = () => {
  const [quarter, setQuarter] = useState('');
  const [quarters, setQuarters] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryName, setCountryName] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Quarters and Countries
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [quartersRes, countriesRes] = await Promise.all([
          axios.get(`${API_BASE}/quarters`),
          axios.get(`${API_BASE}/countries`)
        ]);

        setQuarters(quartersRes.data);
        setCountries(countriesRes.data);

        setQuarter(quartersRes.data[0] || '');
        setCountryName(countriesRes.data[0] || '');
      } catch (error) {
        setErrorMsg('❌ Failed to fetch metadata.');
      }
    };

    fetchMetaData();
  }, []);

  // Fetch Country Sales Summary
  useEffect(() => {
    if (!quarter || !countryName) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/country-summary?countryName=${encodeURIComponent(countryName)}&quarter=${quarter}`);
        setSummary(res.data);
        setErrorMsg('');
      } catch (error) {
        setErrorMsg('❌ Failed to fetch country overview.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [quarter, countryName]);

  return (
    <Container className="mt-5">
      <h3 className="text-center text-primary mb-4">🌍 Country Sales Overview</h3>

      {errorMsg && <Alert variant="danger" className="text-center">{errorMsg}</Alert>}

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label><strong>Select Quarter:</strong></Form.Label>
            <Form.Select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
            >
              {quarters.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label><strong>Select Country:</strong></Form.Label>
            <Form.Select
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
            >
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <div className="text-muted mt-2">Loading country data...</div>
        </div>
      ) : (
        <>
          {/* Total Sales Summary */}
          {summary && (
            <Card className="text-center shadow-sm mb-4">
              <Card.Body>
                <h4>Total Country Sales: <span className="text-success">
                  {summary?.totalSales ? `$${summary.totalSales.toLocaleString()}` : 'No data'}
                </span></h4>
              </Card.Body>
            </Card>
          )}

          {/* Charts */}
          <Row className="mb-5">
            <Col md={6}>
              {summary?.topCategories?.length > 0 && (
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="text-center">Top Categories</h5>
                    <Pie
                      data={{
                        labels: summary.topCategories.map(cat => cat.name),
                        datasets: [{
                          data: summary.topCategories.map(cat => cat.sales),
                          backgroundColor: [
                            'rgba(255,99,132,0.6)',
                            'rgba(54,162,235,0.6)',
                            'rgba(255,206,86,0.6)',
                            'rgba(75,192,192,0.6)',
                            'rgba(153,102,255,0.6)'
                          ]
                        }]
                      }}
                    />
                  </Card.Body>
                </Card>
              )}
            </Col>

            <Col md={6}>
              {summary?.topCompanies?.length > 0 && (
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="text-center">Top Companies</h5>
                    <Bar
                      data={{
                        labels: summary.topCompanies.map(comp => comp.name),
                        datasets: [{
                          label: 'Sales ($)',
                          data: summary.topCompanies.map(comp => comp.sales),
                          backgroundColor: 'rgba(75,192,192,0.6)'
                        }]
                      }}
                    />
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default CountryOverviewPage;
