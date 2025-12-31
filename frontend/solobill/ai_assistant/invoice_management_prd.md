# Product Requirements Document (PRD)

## Invoice Management

---

## Overview

The Invoice Management feature provides users with a structured interface to create, view, generate, copy, and delete invoices. Once generated, invoices become immutable records. The experience should align visually and functionally with existing management pages, particularly the Projects Management page.

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

#### Behavior

- UI should follow the provided design reference (image)
- Allows full editing of invoice details prior to generation

---

### 3. Invoice View Page

- Location URI: `/invoices/[id]`
- Purpose: View invoice details

#### Behavior

- UI should follow the provided design reference (image)
- Display invoice metadata, line items, totals, and status

---

## Invoice States & Rules

### Generated Invoice

- Once generated:
  - Invoice becomes **read-only**
  - Editing is permanently disabled
- Can be:
  - Viewed
  - Copied
  - Deleted
- Generation should be treated as a finalization step
- Generation also saves the invoice to the database
- Generation applies the active invoice template to the invoice
---

## Core Actions

| Action   | Create | Generated |
| -------- | ------ | --------- |
| View     | ✅     | ✅        |
| Edit     | ✅     | ❌        |
| Copy     | ✅     | ✅        |
| Generate | ✅     | ✅        |
| Delete   | ✅     | ✅        |

---

## Dependencies

- MUI component library
- Existing Projects Management page patterns
- Invoice template and generation pipeline (HTML → PDF)

---

## Success Criteria

- Users can clearly distinguish draft vs generated invoices
- Generated invoices cannot be edited under any circumstances
- Invoice Management page feels consistent with the rest of the application
- All core invoice actions are intuitive and discoverable
