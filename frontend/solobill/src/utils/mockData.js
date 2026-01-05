

export const mockConsultant = {
  name: 'Daniel Smith',
  email: 'dan.smith@example.com',
  addressL1: '18 Forest St',
  addressL2: 'Worcester, MA 01605',
  addressL3: '',
  additionalFields: {
    termDays: 40,
    phone: '555-555-5555',
  }
}

export const mockClient = {
  name: 'University Medical School',
  addressL1: '123 Main Street',
  addressL2: 'Boston, MA 02101',
  addressL3: '',
  contactNm: 'Jane Smith',
  billingRepName: 'Accounts Payable',
  billingRepEmail: 'ap@umed.edu',
}

export const mockProject = {
  name: 'R01 Dual (speed type: 123456)',
  poNumber: 'PO-12345',
  contractingTitle: 'Bioinformatics Support',
  contractingRate: 80,
  contractingDesc: 'Microscopy image analysis and development.',
}

export const mockInvoice = {
    id: 'inv_mock_001',
    invoiceNumber: '20250001',
    invoiceDate: new Date().toISOString(),
    totalHours: 40,
    totalAmount: 3200,
    client: mockClient,
    consultant: mockConsultant,
    project: mockProject,
    lineItems: [
      { id: 1, dateDesc: '2025-12-01', workDesc: 'Data analysis and visualization', hours: 20 },
      { id: 2, dateDesc: '2025-12-02', workDesc: 'Plugin development for ImageJ', hours: 20 },
    ]
}

export const mockInvoice2 = {
    id: 'inv_mock_002',
    invoiceNumber: '20250002',
    invoiceDate: new Date().toISOString(),
    totalHours: 40,
    totalAmount: 3200,
    client: mockClient,
    consultant: mockConsultant,
    project: mockProject,
    lineItems: [
      { id: 1, dateDesc: '2025-11-01', workDesc: 'Data analysis and visualization', hours: 20 },
      { id: 2, dateDesc: '2025-11-02', workDesc: 'Plugin development for ImageJ', hours: 20 },
    ]
}

export const mockInvoices = [mockInvoice, mockInvoice2];
    