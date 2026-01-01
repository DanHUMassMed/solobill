# Product Requirements Document (PRD)

## Invoice Management

---

## Overview

The Invoice Management feature provides users with a structured interface to create, view, generate, copy, and delete invoices. Once generated, invoices become immutable records. The experience should align visually and functionally with existing management pages, particularly the Projects Management page.
Client Accordion contains Projects Accordion
Projects Accordion contains Invoices Cards

---

## Goals

- Enable users to manage invoices efficiently
- Ensure consistency with existing UI/UX patterns
- Prevent post-generation edits to finalized invoices

---

## Page Structure

### 1. Invoice Management Page

- Location: `/pages/invoices`
- Purpose: Central hub for managing all invoices

#### UI & Layout

- Follow layout and interaction patterns established on the **Projects Management** page
- Use **MUI Accordion components** to partition invoices logically
- Display invoices within each accordion section as **equally sized MUI Cards**
- Ensure responsive behavior across screen sizes

#### Primary Actions

- **Add Invoice** button prominently displayed
  - Navigates to the Create Invoice page

---

### 2. Create Invoice Page

- Location: `/pages/invoices`
- Invoice Number should be auto generated
    export const generateInvoiceNumber = () => {
      const date = new Date()
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "");

      const suffix = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

      return `INV-${date}-${suffix}`;
    };


#### Behavior

- UI should follow the provided design reference (image)
- Allows full editing of invoice details prior to save or generation
- Validate invoice details before save or generation
- Error messages should be displayed in a consistent manner (red border, red text)
- The Save button saves and returns to the Invoice Management page
- The Generate button generates the invoice and opens the Invoice View page
---

### 3. Invoice View Page

- Is a read-only view of of the Generated Invoice with the print/save as pdf button
- Location URI: `/invoices/[id]`
- Purpose: View invoice details allow reprinting and saving as pdf

#### Behavior

- UI should follow the provided design reference (image)
- Display invoice metadata, line items, totals, and status

---
- Once an invoice is saved it can only be copied, viewed or deleted
- This will ensure each invoice is immutable and invoices numbers are unique
---

---

## Dependencies

- MUI component library
- Existing Projects Management page patterns
- Invoice template and generation pipeline (HTML → PDF)

---

## Success Criteria

- Once an invoice is saved it can only be copied, viewed or deleted
- Invoice Management page feels consistent with the rest of the application
- All core invoice actions are intuitive and discoverable
