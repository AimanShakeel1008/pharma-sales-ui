import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"; // <-- Add this
import { useTable, usePagination } from "react-table";
import axios from "axios";
import Papa from "papaparse";

// Register components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE = "http://localhost:8080/api/results";

const CompanyEstimationPage = () => {
  const [quarter, setQuarter] = useState("");
  const [quarters, setQuarters] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [summary, setSummary] = useState(null);
  const [drugDetails, setDrugDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [quartersRes, companiesRes] = await Promise.all([
          axios.get(`${API_BASE}/quarters`),
          axios.get(`${API_BASE}/companies`),
        ]);

        setQuarters(quartersRes.data);
        setCompanies(companiesRes.data);
        setQuarter((prev) => prev || quartersRes.data[0] || "");
        setCompanyName((prev) => prev || companiesRes.data[0] || "");
      } catch (err) {
        setErrorMsg("❌ Failed to fetch dropdown data.");
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!quarter || !companyName) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const summaryRes = await axios.get(
          `${API_BASE}/company-summary?companyName=${encodeURIComponent(
            companyName
          )}&quarter=${quarter}`
        );
        const drugsRes = await axios.get(
          `${API_BASE}/company-details?companyName=${encodeURIComponent(
            companyName
          )}&quarter=${quarter}`
        );

        setSummary(summaryRes.data);
        setDrugDetails(drugsRes.data);
        setErrorMsg("");
      } catch (err) {
        setErrorMsg("❌ Failed to fetch company estimation.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quarter, companyName]);

  const exportCSV = () => {
    const csv = Papa.unparse(drugDetails);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${companyName}_${quarter}_drug_sales.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo(
    () => [
      { Header: "Drug Name", accessor: "drugName" },
      { Header: "Country", accessor: "countryName" },
      { Header: "Category", accessor: "categoryName" },
      { Header: "Rank", accessor: "rank" },
      { Header: "Mean Sales ($)", accessor: "estimatedSales" },
      { Header: "Min Sales ($)", accessor: "minSales" },
      { Header: "Max Sales ($)", accessor: "maxSales" },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    pageCount,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: drugDetails,
      initialState: { pageSize: 10 },
    },
    usePagination
  );

  return (
    <Container className="mt-5">
      <h3 className="text-center text-primary mb-4">
        🏢 Company Sales Estimation
      </h3>

      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              <strong>Select Quarter:</strong>
            </Form.Label>
            <Form.Select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
            >
              {quarters.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              <strong>Select Company:</strong>
            </Form.Label>
            <Form.Select
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <div className="text-muted mt-2">Loading data...</div>
        </div>
      ) : (
        <>
          {summary && (
            <Card className="text-center shadow-sm mb-4">
              <Card.Body>
                <h4>
                  Total Sales:{" "}
                  <span className="text-success">
                    ${summary.totalSales.toLocaleString()}
                  </span>
                </h4>
              </Card.Body>
            </Card>
          )}

          <Row className="mb-5">
            <Col md={6}>
              {summary && (
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="text-center">Top Countries</h5>
                    <Bar
                      data={{
                        labels: summary.topCountries.map((c) => c.name),
                        datasets: [
                          {
                            label: "Sales ($)",
                            data: summary.topCountries.map((c) => c.sales),
                            backgroundColor: "rgba(54, 162, 235, 0.6)",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        animation: {
                          duration: 1500, // Animation duration in ms
                          easing: "easeOutBounce", // Type of animation
                        },
                        plugins: {
                          legend: {
                            display: true,
                            position: "top",
                          },
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                          },
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </Card.Body>
                </Card>
              )}
            </Col>
            <Col md={6}>
              {summary && (
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="text-center">Top Categories</h5>
                    <Pie
                      data={{
                        labels: summary.topCategories.map((c) => c.name),
                        datasets: [
                          {
                            data: summary.topCategories.map((c) => c.sales),
                            backgroundColor: [
                              "rgba(255,99,132,0.6)",
                              "rgba(54,162,235,0.6)",
                              "rgba(255,206,86,0.6)",
                              "rgba(75,192,192,0.6)",
                              "rgba(153,102,255,0.6)",
                            ],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        animation: {
                          animateScale: true,
                          animateRotate: true,
                          duration: 1500,
                          easing: "easeInOutQuad",
                        },
                        plugins: {
                          legend: {
                            display: true,
                            position: "bottom",
                          },
                        },
                      }}
                    />
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col className="text-end">
              <Button variant="success" size="sm" onClick={exportCSV}>
                📥 Export CSV
              </Button>
            </Col>
          </Row>

          <div style={{ overflowX: "auto" }}>
            <table
              {...getTableProps()}
              className="table table-bordered table-hover"
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              size="sm"
              variant="secondary"
            >
              ⏮️ First
            </Button>
            <Button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              size="sm"
              variant="secondary"
            >
              ◀️ Previous
            </Button>
            <span>
              Page {pageIndex + 1} of {pageOptions.length}
            </span>
            <Button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              size="sm"
              variant="secondary"
            >
              Next ▶️
            </Button>
            <Button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              size="sm"
              variant="secondary"
            >
              Last ⏭️
            </Button>

            <Form.Select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ width: "100px", marginLeft: "10px" }}
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </Form.Select>
          </div>
        </>
      )}
    </Container>
  );
};

export default CompanyEstimationPage;
