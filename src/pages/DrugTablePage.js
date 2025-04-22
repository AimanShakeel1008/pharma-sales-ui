import React, { useEffect, useMemo, useState } from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';
import { Container, Spinner, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DrugTablePage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [quarters, setQuarters] = useState([]);
  const [quarter, setQuarter] = useState('');
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  const API_BASE = 'http://localhost:8080/api/results';

  useEffect(() => {
    axios.get(`${API_BASE}/quarters`)
      .then((res) => {
        setQuarters(res.data);
        if (res.data.length > 0) {
          setQuarter(res.data[0]);
        }
      });
  }, []);

  useEffect(() => {
    if (!quarter) return;

    setLoading(true);
    axios.get(`${API_BASE}/drugs?quarter=${quarter}`)
      .then((res) => {
        setData(res.data);
        setFilteredData(res.data);

        const uniqueCountries = [...new Set(res.data.map(d => d.countryName))];
        const uniqueCategories = [...new Set(res.data.map(d => d.categoryName))];
        const uniqueCompanies = [...new Set(res.data.map(d => d.companyName))];

        setCountries(uniqueCountries);
        setCategories(uniqueCategories);
        setCompanies(uniqueCompanies);
      })
      .catch((err) => {
        console.error('Failed to fetch', err);
      })
      .finally(() => setLoading(false));
  }, [quarter]);

  // Handle Filtering
  useEffect(() => {
    let temp = data;

    if (selectedCountry !== '') {
      temp = temp.filter(drug => drug.countryName === selectedCountry);
    }
    if (selectedCategory !== '') {
      temp = temp.filter(drug => drug.categoryName === selectedCategory);
    }
    if (selectedCompany !== '') {
      temp = temp.filter(drug => drug.companyName === selectedCompany);
    }
    if (searchText.trim() !== '') {
      temp = temp.filter(drug =>
        drug.drugName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(temp);
  }, [selectedCountry, selectedCategory, selectedCompany, searchText, data]);

  const handleRowClick = (row) => {
    setSelectedDrug(row.original);
    setShowModal(true);
  };

  const columns = useMemo(() => [
    { Header: 'Drug Name', accessor: 'drugName' },
    { Header: 'Company', accessor: 'companyName' },
    { Header: 'Category', accessor: 'categoryName' },
    { Header: 'Country', accessor: 'countryName' },
    { Header: 'Rank', accessor: 'rank' },
    { Header: 'Mean Sales ($)', accessor: 'estimatedSales' },
    { Header: 'Min Sales ($)', accessor: 'minSales' },
    { Header: 'Max Sales ($)', accessor: 'maxSales' }
  ], []);

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
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageSize: 10 }
    },
    useSortBy,
    usePagination
  );

  return (
    <Container className="mt-5">
      <h3 className="text-center text-primary mb-4">📋 Drug Estimation Table</h3>

      {/* Quarter selection */}
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

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label><strong>Filter by Country:</strong></Form.Label>
            <Form.Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label><strong>Filter by Category:</strong></Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label><strong>Filter by Company:</strong></Form.Label>
            <Form.Select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map((comp, idx) => (
                <option key={idx} value={comp}>{comp}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label><strong>Search by Drug Name:</strong></Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter drug name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
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
          <div style={{ overflowX: 'auto' }}>
            <table {...getTableProps()} className="table table-bordered table-hover">
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()}>
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button variant="secondary" size="sm" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              ⏮️ First
            </Button>
            <Button variant="secondary" size="sm" onClick={() => previousPage()} disabled={!canPreviousPage}>
              ◀️ Previous
            </Button>
            <span>
              Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
            </span>
            <Button variant="secondary" size="sm" onClick={() => nextPage()} disabled={!canNextPage}>
              Next ▶️
            </Button>
            <Button variant="secondary" size="sm" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
              Last ⏭️
            </Button>

            <Form.Select style={{ width: "100px" }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 25, 50].map(size => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </Form.Select>
          </div>
        </>
      )}

      {/* Modal for Selected Drug */}
      {selectedDrug && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedDrug.drugName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Company:</strong> {selectedDrug.companyName}</p>
            <p><strong>Country:</strong> {selectedDrug.countryName}</p>
            <p><strong>Category:</strong> {selectedDrug.categoryName}</p>
            <p><strong>Rank:</strong> {selectedDrug.rank}</p>

            <h5 className="mt-4 text-primary">📈 Sales Trend</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" data={[{label:"Mean",sales:selectedDrug.estimatedSales},{label:"Min",sales:selectedDrug.minSales},{label:"Max",sales:selectedDrug.maxSales}]} stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default DrugTablePage;
