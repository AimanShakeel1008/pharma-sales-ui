import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import DrugTablePage from './pages/DrugTablePage';
import CompanyEstimationPage from './pages/CompanyEstimationPage';
import NotFound from './pages/NotFound';
import CountryOverviewPage from './pages/CountryOverviewPage';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <Navigation />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/drugs" element={<DrugTablePage />} />
            <Route path="/company-estimation" element={<CompanyEstimationPage />} />
            <Route path="/country-overview" element={<CountryOverviewPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
