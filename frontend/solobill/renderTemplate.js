// To run this file, use the following command:
// node renderTemplate.js >test.html

import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';
import { mockInvoice, mockInvoices } from './src/utils/mockData.js';

// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tell Nunjucks EXACTLY where templates live
const templatesDir = path.join(__dirname, 'public/templates');

const env = nunjucks.configure(templatesDir, {
  autoescape: true,
});

env.addFilter('formatDate', (str) => {
  if (!str) return '';
  return new Date(str).toLocaleDateString();
});
env.addFilter('fixed', (num) => {
  if (num === undefined || num === null) return '0.00';
  return parseFloat(num).toFixed(2);
});
env.addFilter('currency', (value) => {
  if (value == null || isNaN(value)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
});

// const output = env.render('invoice_template.html', {invoice: mockInvoice});
//console.log(output);

const mailtoLink = env.render('email_template.html', {invoices: mockInvoices});

// Wrap the mailtoLink in a minimal HTML page
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Preview</title>
</head>
<body>
  <a href="${mailtoLink}">Send Email</a>
</body>
</html>`;

console.log(html);