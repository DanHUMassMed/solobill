# I Got Tired of Fighting My Invoices — So I Built SoloBill

Like many solo contractors, invoicing was never *hard* — it was just **annoying**.

For years, my setup looked like this:

* A handful of Word document invoice templates
* A directory full of PDFs named `invoice_final_v2_REALLY_FINAL.pdf`
* A manually maintained spreadsheet tracking what I sent, when I sent it, and to whom

It worked… until it didn’t.

---

## The Problem With “Good Enough” Invoicing

What I wanted seemed simple:

* **Quickly build clean, customizable invoices**
  Word doc templates were painful to maintain and even worse to reuse.

* **Predictable, reliable data extraction**
  I wanted to *trust* the data in my invoices without re-entering it elsewhere.

* **No heavyweight accounting software**
  QuickBooks and similar tools are powerful, but wildly overkill for my needs.
  I don’t run payroll. I don’t need tax forecasting.
  I just need to **print or email invoices and know what I sent**.

On top of that, some of my work involves **bioinformatics consulting billed against government grants**.

That introduces another wrinkle:

* I need to track grant IDs and billing totals internally
* But that information **should not appear on the invoice**

Clients occasionally ask:

> “How much have we billed against grant X so far?”

Answering that shouldn’t require a manual audit.

---

## Immutable Invoices Matter

Another hard requirement:

> If I regenerate an invoice a year later, it must look **exactly the same**.

Client names change.
Addresses change.
Projects evolve.

But invoices are historical records — once sent, their data should be **immutable**.

---

## So I Built SoloBill

Since I couldn’t find a tool that fit these needs, I built **SoloBill**.

SoloBill is a **lightweight, offline-first Progressive Web App** designed for solo consultants who want invoicing to be:

* Fast
* Predictable
* Flexible
* Boring (in the best possible way)

---

## What SoloBill Looks Like in Practice

### 📊 At-a-Glance Business Overview

SoloBill opens with a dashboard that shows:

* Invoices generated
* Hours worked
* Revenue billed

> **Screenshot callout:**
> *SoloBill dashboard showing invoice count, total hours, and billed revenue.*

This gives you instant visibility without exporting anything.

---

### 🗂 A Simple, Extensible Data Model

SoloBill organizes your work around:

* **Consultant**
* **Client**
* **Project**
* **Invoice**

You can also attach **Additional Information** as name/value pairs.

This is where internal-only data lives — like grant IDs or billing categories — without polluting the invoice itself.

> **Screenshot callout:**
> *Data model diagram or project view highlighting “Additional Information” fields.*

Those fields are fully extractable later for reporting.

---

### 📝 Template-Driven Invoices (No More Word Docs)

Invoices are generated from templates:

* Customize layout and branding
* Reference standard fields or custom fields
* Use the same system for invoices, emails, and exports

Most importantly:
**Invoice data is frozen at generation time.**

If client or project details change later, previously issued invoices remain accurate.

> **Screenshot callout:**
> *Generated invoice PDF showing clean layout and branding.*

---

### 💾 Offline-First, Local-Only Data

SoloBill works **100% offline after installation**.

* No cloud dependency
* No external accounts
* Your data stays on your device

You can still:

* Export CSVs
* Create full backups
* Restore data on another machine

> **Screenshot callout:**
> *Admin → Data Management screen showing backup and restore options.*

---

### 📧 Sending Invoices

Right now, SoloBill integrates with your default email client using `mailto:` links.

It’s intentionally simple — no email servers, no credentials stored.

(Direct email integration is on the roadmap.)

---

## Who SoloBill Is For

SoloBill is a good fit if you:

* Are a solo consultant or contractor
* Want control over invoice formatting
* Care about long-term data integrity
* Don’t want a full accounting suite
* Want something that just keeps working offline

If you’re heading into **2026 still fighting Word invoice templates**, this might be a better option.

👉 **Try the live beta:**
[https://solobill.higginscompany.com](https://solobill.higginscompany.com)

To explore quickly:

* Go to **Admin → Data Management**
* Click **Load Demo Data**

---

## For Developers & Contributors

SoloBill also gave me an excuse to finally build something I’d wanted to explore for a while: a **real offline-first PWA** with a clean, extensible data model.

Under the hood:

* React + MUI
* Dexie.js (IndexedDB)
* Template-driven generation
* Fully client-side and installable

This started as a personal tool, but it feels useful beyond just me.

If you’re interested in:

* Improving templates
* Adding reporting features
* Multi-device sync
* Integrated email sending
* UX polish or architectural cleanup

I’d love contributions.

👉 **Source on GitHub:**
[https://github.com/DanHUMassMed/solobill](https://github.com/DanHUMassMed/solobill)

If there’s a feature you want — add it.
If something bugs you — open an issue.
If you’re curious — clone it and poke around.

---

I hope invoicing in 2026 gets a little easier.

Thanks for reading.
