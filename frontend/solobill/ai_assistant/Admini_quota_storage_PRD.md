# Product Requirements Document (PRD)
## SoloBill – Storage Size & Quota Status (Admin -> Data Management -> Storage Usage)

---

## 1. Overview

SoloBill is an offline-first PWA that stores business-critical data (consultants, clients, projects, invoices) in IndexedDB.  As data grows, users need visibility into **how much local storage is being used**, **how much remains**, and **which entities consume the most space**.

This feature adds a **manual storage usage check** to the **Admin → Data Management** section.

---

## 2. Goals

- Give users clear insight into local storage usage
- Prevent unexpected storage exhaustion
- Support informed decisions (cleanup, export, cloud sync)
- Avoid unnecessary background computation

---

## 3. Non-Goals

- Enforcing storage limits
- Automatic background polling
- Per-object-store quota enforcement
- Cloud storage management (future feature)

---

## 4. User Stories

### Primary
- **As a SoloBill admin**, I want to manually check how much local storage my data uses so I can manage offline storage responsibly.

### Secondary
- As a user, I want to see which data types (Invoices, Clients, etc.) use the most space.
- As a user, I want to be warned when storage usage is approaching the browser quota.

---

## 5. UX / UI Requirements

### Location
**Admin → Data Management → Storage Usage**

### UI Components
- **“Calculate Storage Usage” button** (manual trigger)
- **Summary section**
  - Total storage used
  - Total quota available
  - Percentage used
- **Breakdown table**
  - Consultants
  - Clients
  - Projects
  - Invoices
- **Warning banner** if usage ≥ 70%
- “Storage is persistent” indicator

### UX Notes
- No automatic calculation on page load
- Calculation runs only when the button is pressed
- Results remain visible until refreshed or recalculated

---

## 6. Functional Requirements

### Storage Summary
- Use the **Storage Manager API** to retrieve:
  - Total usage (bytes)
  - Total quota (bytes)

### Entity Breakdown
- Estimate per-entity storage by iterating IndexedDB tables:
  - consultants
  - clients
  - projects
  - invoices

### Warning Threshold
- Display a warning when:
usage / quota >= 0.70


---

## 7. Technical Design

### 7.1 Total Storage Usage (Authoritative)

```js
export const getTotalStorageUsage = async () => {
if (!navigator.storage?.estimate) return null;

const { usage, quota } = await navigator.storage.estimate();

return {
  usageBytes: usage,
  quotaBytes: quota,
  usageMB: +(usage / 1024 / 1024).toFixed(2),
  quotaMB: +(quota / 1024 / 1024).toFixed(2),
  percentUsed: +(usage / quota * 100).toFixed(1),
};
};
```

### 7.2 Entity-Level Size Estimation (Dexie)

```js
const estimateTableSize = async (table) => {
  let bytes = 0;

  await table.each((record) => {
    bytes += new Blob([JSON.stringify(record)]).size;
  });

  return bytes;
};
```

### 7.3 Per-Entity Breakdown

```js
export const getEntityStorageUsage = async (db) => {
  const result = {};

  for (const table of db.tables) {
    const bytes = await estimateTableSize(table);
    result[table.name] = {
      bytes,
      kb: +(bytes / 1024).toFixed(2),
      mb: +(bytes / 1024 / 1024).toFixed(2),
    };
  }

  return result;
};
```

### 7.4 Combined Calculation (Triggered by Button)

```js
export const calculateStorageUsage = async (db) => {
  const [total, entities] = await Promise.all([
    getTotalStorageUsage(),
    getEntityStorageUsage(db),
  ]);

  return { total, entities };
};
```

#### Summary

This feature provides transparent, user-controlled insight into SoloBill’s offline storage usage, aligning with the app’s offline-first philosophy while preventing unexpected data loss due to browser storage limits.