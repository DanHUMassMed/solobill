# AI Assistant README Requirements

## Overview

The AI Assistant should generate a complete and thorough `README.md` for the application. The README should clearly describe the application's purpose, features, and usage, and include relevant images from `docs/images`.

The application is a **Progressive Web App (PWA)** with the following key characteristics:

- Can be installed as a standalone application on desktop or mobile devices.
- Runs **100% offline** once installed.
- Designed to solve an individual need, but made available for general use.

---

## Motivation

The primary motivation for this app is to provide a personalized solution for managing clients, projects, and invoices. The app is designed with flexibility in mind so it can be useful for others as well.

---

## Data Model

The application has a **simple and extensible data model**:

- **Consultant**: Represents the service provider.
- **Client**: Represents the customer.
- **Project**: Represents a specific project for a client.
- **Invoice**: Represents billing for a project.

Even though the data model is simple, the system is designed to be **extensible**, allowing additional data fields or features to be added in the future.

---

## Invoices and Templates

- **Invoices, emails, and Excel/CSV exports** are generated from **templates**.
- **Admin features** allow uploading **customized invoice templates** to match branding or format preferences.
- **Invoice data is immutable**: Once an invoice is generated, the underlying data used to create it does **not change**, even if the related client or project data is modified. This ensures **historical integrity** for invoices and their numbers.

---

## Data Export & Backup

- Full **data backups** can be created and restored on other devices.
- Data can also be **exported to CSV** for use in Excel or other downstream accounting workflows.

---

## Dashboard

The application provides a **dashboard** that gives an overview of:

- Generated invoices
- Hours worked
- Revenue billed

This enables quick insight into overall business performance.

---

## Emailing

- Currently, emails are sent through **mailto:** links.
- This allows users to generate and send invoices directly from the application.

---

## Future Development

Potential future enhancements include:

1. **Online invoice catalog**: Community-contributed sharing of invoices.
2. **Multi-device syncing**: Keep data synchronized across devices.
3. **Online backups**: Cloud-based storage for secure backups.
4. **Online email service**: Integrated email sending directly from the app.

---

## Images

- Include screenshots and other visuals from `docs/images` in the README to illustrate key features, templates, and the dashboard.

---

## Summary

The AI Assistant should generate a README that:

- Explains the app as a **PWA** with offline capabilities.
- Describes the **data model** and **invoice immutability**.
- Details **template-based exports** and **admin customization**.
- Highlights **dashboard features** and current **emailing functionality**.
- Outlines **future development goals**.
- Includes **visuals from docs/images** to enhance understanding.
