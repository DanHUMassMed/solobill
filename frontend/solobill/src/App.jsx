import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ConsultantInfo from './pages/ConsultantInfo';
import PWABadge from './PWABadge.jsx';

import Clients from './pages/clients/Clients';
import Projects from './pages/projects/Projects';

// Admin Pages
import Admin from './pages/admin/Admin';
import TemplateManagement from './pages/admin/TemplateManagement';
import TemplateVariableGuide from './pages/admin/TemplateVariableGuide';

import { templateRepo } from './db/repositories/templateRepository';

// Simple placeholder for other pages
const Placeholder = ({ title }) => (
    <div style={{ padding: 20 }}>
        <h2>{title}</h2>
        <p>This feature is coming soon.</p>
    </div>
);

function App() {
  useEffect(() => {
    // Initialize default templates on first run
    templateRepo.initDefaultTemplates();
  }, []);

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
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/templates" element={<TemplateManagement />} />
          <Route path="/admin/templates/guide" element={<TemplateVariableGuide />} />
        </Routes>
        <PWABadge />
      </MainLayout>
    </Router>
  );
}

export default App;
