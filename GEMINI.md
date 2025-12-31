# Product Requirements Document (PRD) – Invoice PWA

## Overview

The Invoice PWA is a lightweight Progressive Web App designed to streamline invoicing for consultants. The app will allow users to manage clients, projects, and consultant information, and generate invoices using pre-defined templates. Future iterations may include custom template uploads, recurring invoices, and advanced reporting.

The app is **offline-first** and uses **Dexie.js** (IndexedDB wrapper) for local storage, with a repository layer abstracting database access.

---

## Features & Requirements

### 1. Dashboard / Business Overview

The dashboard provides a high-level view of business metrics, trends, and recent activity. This gives the consultant quick insights into financial performance and workload.

**Dashboard Components:**

- **Key Metrics Cards:**

  - Monthly Revenue
  - Monthly Hours Worked
  - Active Projects
  - Total Clients
- **Charts:**

  - Revenue & Hours Trends (Last 6 months)
  - Revenue by Client (donut or pie chart)
- **Recent Activity:**

  - Recent invoices with client, invoice number, date, and amount
    Quick links to view invoice details

**UI Considerations:**
    - Cards for key metrics with summary numbers and year-to-date values
    - Bar/line chart for trends combining revenue and hours
    - Donut/pie chart to show revenue contribution per client
    - Table/list view for recent invoices with quick access
    - Buttons for "New Invoice" and "Add Client" prominently available

**Repository / Data Integration:**
    - Metrics and charts are computed from Dexie.js database using repository queries
    - Recent invoices fetched via invoiceRepository with sorting by date
    - Computed totals for revenue and hours
    - Data updates in real-time as invoices are added or updated

### 1. Consultant Management

The user of the app can manage their own consultant profile. This information will be used as a snapshot in invoice generation.

**Consultant Fields:**

* `name`: string — e.g., "Daniel Higgins"
* `addressL1`: string — e.g., "18 Winifred's Way"
* `addressL2`?: string — optional
* `addressL3`?: string — optional
* `email`: string — e.g., "[dan@gmail.com](mailto:dan@gmail.com)"
* `additionalFields`?: string — optional custom info

**Actions:**

* Add or edit consultant info
* Automatically populate invoice fields with consultant info

**UI Considerations:**

* Simple profile form
* Save button with validation (email format, required fields)

---

### 2. Client Management

The app must allow the user to **add, view, edit, and delete clients**.

**Client Fields:**

* `id`: string — unique identifier
* `name`: string — e.g., "UMass Chan Medical School"
* `addressL1`: string
* `addressL2`?: string — optional
* `addressL3`?: string — optional
* `contactNm`?: string — optional
* `billingRepName`?: string — optional
* `billingRepEmail`?: string — optional
* `additionalFields`?: string — optional

**Actions:**

* Add new client
* Edit existing client
* Delete client
* List all clients

**UI Considerations:**

* Simple form with validation for required fields
* Table or list view to display all clients with edit/delete actions

---

### 3. Project Management

The app must allow the user to **associate projects with clients** and manage them.

**Project Fields:**

* `id`: string — unique identifier
* `clientId`: string — links project to client
* `name`: string — project name
* `poNumber`: string — e.g., "PO-12345"
* `contractingTitle`: string — e.g., "Bioinformatics Support"
* `contractingRate`: string | number — e.g., 80
* `contractingDesc`: string — detailed description
* `additionalFields`?: string — optional

**Actions:**

* Add project to a client
* Edit project details
* Delete project
* View projects under a specific client

**UI Considerations:**

* Form for project entry
* Drop-down to select associated client
* Table/list view to show projects per client

---

### 4. Invoice Generation

The app will allow the user to **generate invoices based on project data and consultant input**.

**Invoice Fields (Snapshots + Line Items):**

```ts
export interface InvoiceLineItem {
  id: string | number;
  dateDesc: string;
  workDesc: string;
  hours: string | number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // ISO string
  consultant: Consultant; // snapshot
  client: Client;         // snapshot
  project: Project;       // snapshot
  invoiceLineItems: InvoiceLineItem[];
}
```

**User Inputs:**

* Date range or specific dates
* Hours worked for each project

**Actions:**

* Select client and project
* Enter work dates and hours
* Generate invoice using the selected template
* Generate pre-filled email using email template
* View and Print past invoices

**UI Considerations:**

* Form for date and hours input
* Button to generate invoice and email
* Preview of invoice before sending
* Download option for PDF invoice
* Read-only view page for invoices with print option

---

### 5. Templates

The app will include built-in templates for email and invoice generation. Future updates will allow uploading custom templates.

**Default Templates:**

* `invoice_email_template`
* `invoice_template`

**Requirements:**

* Store templates within the app
* Allow selection of template for invoice generation
* Support variable placeholders (e.g., client name, project details, dates, hours, totals)

---

### 6. Technical Stack & Tools

* **Platform:** Progressive Web App (PWA) for desktop and mobile browsers
* **Frontend:** React.js (TSX components) using MUI
* **Backend:** Optional Node.js / serverless for persistence
* **Storage:** Dexie.js (IndexedDB wrapper) with repository layer
* **Repositories:** Abstract database operations for invoices, clients, projects, consultants
* **PDF Generation:** Library to generate PDF invoices from templates
* **Email Integration:** Open mail client via `mailto:` link with pre-filled fields
* **Offline-first:** Dexie.js ensures offline CRUD for all entities
* **File Naming:** `.ts` → camelCase, `.tsx` → PascalCase

---

### 7. Repository Layer (Data Access Pattern)

**Purpose:**

* Encapsulates Dexie.js operations
* Provides typed, consistent API
* Enforces business rules (e.g., invoice immutability)
* Supports future sync/export

**Example Repositories:**

```ts
clientRepository.getById(clientId)
invoiceRepository.create(invoice)
projectRepository.getByClient(clientId)
```

**Notes:**

* All queries and mutations go through repositories
* Transactions can be used for multi-entity updates

---

### 8. User Flow Example

1. Add consultant information
2. Add client information
3. Add project(s) under client
4. Enter hours worked for a project
5. Select invoice template
6. Generate invoice and preview
7. Generate email with invoice attached
8. Open mail app to send invoice

---

### 9. Non-functional Requirements

* Responsive design
* Offline-first behavior
* Secure storage of sensitive data (emails, client info)
* Fast load times and minimal dependencies
* Consistent file naming convention

---

### 10. Success Metrics

* Users can generate invoices in under 2 minutes
* Accurate population of invoice fields from client, project, and consultant snapshots
* Zero errors in PDF generation and mailto integration
* All offline operations complete without data loss

---

### 11. Example Data

**Client Example:**

```json
{
  "id": "client_001",
  "name": "UMass Chan Medical School",
  "addressL1": "373 Plantation Street",
  "addressL2": "Worcester, MA 01605"
}
```

**Project Example:**

```json
{
  "id": "project_001",
  "clientId": "client_001",
  "name": "R01 Dual (speed type: 131753)",
  "poNumber": "PO-12345",
  "contractingTitle": "Bioinformatics Support for Amy Walker Lab",
  "contractingRate": 80,
  "contractingDesc": "Microscopy image analysis and development of ImageJ Puncta Process Plug-in."
}
```

---
