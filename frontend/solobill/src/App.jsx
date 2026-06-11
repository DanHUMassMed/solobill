import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import MobileLayout from './components/layout/MobileLayout';
import { useDeviceProfile } from './hooks/useDeviceProfile';
import Dashboard from './pages/Dashboard';
import ConsultantInfo from './pages/ConsultantInfo';
import PWABadge from './PWABadge.jsx';
import { NotificationProvider } from './context/NotificationContext';
import { LocalServiceProvider } from "./context/LocalServiceContext"


import Clients from './pages/clients/Clients';
import Projects from './pages/projects/Projects';

import Invoices from './pages/invoices/Invoices';
import InvoiceCreate from './pages/invoices/InvoiceCreate';
import InvoiceView from './pages/invoices/InvoiceView';
import Email from './pages/email/Email';

// Admin Pages
import Admin from './pages/admin/Admin';
import TemplateManagement from './pages/admin/TemplateManagement';
import TemplateVariableGuide from './pages/admin/TemplateVariableGuide';
import DataManagement from './pages/admin/DataManagement';
import About from './pages/admin/About';

import { templateRepo } from './db/repositories/templateRepository';


function App() {
  const { isTouch, isSmallScreen } = useDeviceProfile();

  const Layout =
    isTouch && isSmallScreen ? MobileLayout : MainLayout;

  useEffect(() => {
    // Initialize default templates on first run
    templateRepo.initDefaultTemplates();
  }, []);

  return (
    <NotificationProvider>
      <LocalServiceProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/consultant" element={<ConsultantInfo />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/projects" element={<Projects />} />
            
            {/* Invoice Routes */}
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/create" element={<InvoiceCreate />} />
            <Route path="/invoices/:id" element={<InvoiceView />} />
            
            <Route path="/email" element={<Email />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/templates" element={<TemplateManagement />} />
            <Route path="/admin/templates/guide" element={<TemplateVariableGuide />} />
            <Route path="/admin/data" element={<DataManagement />} />
            <Route path="/admin/about" element={<About />} />
          </Routes>
          <PWABadge />
        </Layout>
      </Router>
      </LocalServiceProvider>
    </NotificationProvider>
  );
}

export default App;
