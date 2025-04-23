import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Row,
  Col,
  ProgressBar,
  Spinner
} from 'react-bootstrap';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [quarter, setQuarter] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);

  const BACKEND_URL = 'http://13.201.34.246:8080/api';

  // Poll for estimation status
  useEffect(() => {
    let interval;
    if (isEstimating) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/estimation/status?quarter=${quarter}`);
          const status = res.data.status.toLowerCase();

          if (status === 'success') {
            setIsEstimating(false);
            setUploadStatus({ type: 'success', message: '✅ Estimation completed successfully!' });
            clearInterval(interval);
          } else if (status === 'failed') {
            setIsEstimating(false);
            setUploadStatus({ type: 'danger', message: '❌ Estimation failed. Please try again or check logs.' });
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Failed to poll estimation status:', err);
        }
      }, 5000); // every 5 seconds
    }

    return () => clearInterval(interval);
  }, [isEstimating, quarter]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !quarter) {
      setUploadStatus({ type: 'danger', message: '📌 Please select a file and enter the quarter (e.g., 2024Q1).' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('quarter', quarter);

    try {
      setIsUploading(true);
      setUploadStatus({ type: 'info', message: '📤 Uploading file...' });

      await axios.post(`${BACKEND_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadStatus({ type: 'info', message: '⏳ Estimation in progress...' });
      setIsEstimating(true);
    } catch (err) {
      console.error(err);
      setUploadStatus({ type: 'danger', message: '❌ Upload failed. Please check the file or try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled = isUploading || isEstimating;

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <h4 className="text-center mb-4 text-primary">📁 Upload Master Data (ZIP)</h4>
              <Form onSubmit={handleUpload}>
                <Form.Group controlId="quarter" className="mb-3">
                  <Form.Label><strong>Quarter (e.g., 2024Q1)</strong></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Quarter"
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    disabled={isDisabled}
                  />
                </Form.Group>

                <Form.Group controlId="file" className="mb-4">
                  <Form.Label><strong>Select Master ZIP File</strong></Form.Label>
                  <Form.Control
                    type="file"
                    accept=".zip"
                    onChange={(e) => setFile(e.target.files[0])}
                    disabled={isDisabled}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isDisabled}
                  >
                    {(isUploading || isEstimating) ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : 'Upload File'}
                  </Button>
                </div>
              </Form>

              {isEstimating && (
                <div className="mt-4">
                  <ProgressBar animated now={100} variant="info" />
                  <p className="text-center text-muted mt-2">Estimation is running...</p>
                </div>
              )}

              {uploadStatus && (
                <Alert variant={uploadStatus.type} className="mt-4 text-center">
                  {uploadStatus.message}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FileUpload;
