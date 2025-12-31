import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ConsultantInfo from './pages/ConsultantInfo';
import PWABadge from './PWABadge.jsx';

import Clients from './pages/clients/Clients';

import Projects from './pages/projects/Projects';

// Simple placeholder for other pages
const Placeholder = ({ title }) => (
    <div style={{ padding: 20 }}>
        <h2>{title}</h2>
        <p>This feature is coming soon.</p>
    </div>
);

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/consultant" element={<ConsultantInfo />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/invoices" element={<Placeholder title="Invoices" />} />
          <Route path="/email" element={<Placeholder title="Email" />} />
          <Route path="/admin" element={<Placeholder title="Admin" />} />
        </Routes>
        <PWABadge />
      </MainLayout>
    </Router>
  );
}

export default App;