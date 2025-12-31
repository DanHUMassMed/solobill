# Review all of the code before starting any new coding activity

## Admin Pages & Template Management – Implementation Instructions

### Admin Page Structure

- Under the `pages/` directory, create a new `admin/` directory.
- The Admin area will contain multiple pages as additional admin features are added.
- Create a **Main Admin page** that serves as the entry point and provides navigation to all admin functions.

---

### Admin Function #1: Template Management

#### Purpose

Provide a UI for managing HTML templates used for:

- Invoice creation
- Email generation

---

### Default Templates

- Default templates are stored at:
  - `/public/templates/invoice_template.html`
  - `/public/templates/email_template.html`
- On first use, these default templates should be **copied into IndexedDB**.
- Once copied, all editing and rendering operations use the IndexedDB versions (not the files in `public/`).

---

### Template Engine & Rendering

- Templates are processed using **Nunjucks**.
- Invoice templates are rendered to PDF using **html2pdf**.
- Email templates are rendered as HTML previews only.

---

### Template Management Features

#### Active Template Selection

- Allow the user to select:
  - One **active Invoice template**
  - One **active Email template**
- Only one active template per type at a time.

---

#### View Templates

- Users can preview any template using **mock data**.
- Mock data should cover:
  - `consultant`
  - `client`
  - `project`
  - `invoice`

---

#### Edit Templates

- Any template stored in IndexedDB can be edited.
- Editing UI:
  - Simple multiline text editor (textarea or code editor)
  - Save updates back to IndexedDB
- Changes should be immediately reflected in previews.

---

#### Reset & Delete Rules

- **Default templates**:
  - Can be reset to their original versions from `/public/templates/`
  - Cannot be permanently deleted
- **Uploaded templates**:
  - Can be edited
  - Can be deleted permanently from IndexedDB

---

### Upload Custom Templates

- Provide an upload capability to select an `.html` file from the filesystem.
- When uploading:
  - Prompt for a **template name**
  - Require the user to specify the template type:
    - Email
    - Invoice
- Uploaded templates are stored in IndexedDB and treated the same as editable templates.

---

### Template Variable Guide

- Provide a help page or modal titled **“Template Variable Guide”**
- This guide lists all variables available to the template engine, including:
  - `consultant`
  - `client`
  - `project`
  - `invoice`
- For each variable, include:
  - Variable name
  - Short description of its contents and purpose

---

### UX Notes

- Template Management should feel safe and reversible:
  - Clear distinction between default and uploaded templates
  - Explicit reset and delete actions
- Emphasize preview-before-use to reduce template errors

### Implementation Notes
Use the provided images as a guide not as strict implementation rule
for example on the default templates the greyed delete trashcan icon can be replaced with the reset
capability
