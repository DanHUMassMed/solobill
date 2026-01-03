
// Estimates the size of a Dexie table by iterating through records
export const estimateTableSize = async (table) => {
  let bytes = 0;

  await table.each((record) => {
    // Basic estimation: JSON string length. 
    // This is an approximation of the serialized size in IndexedDB.
    bytes += new Blob([JSON.stringify(record)]).size;
  });

  return bytes;
};

// Formats bytes into a human readable string with commas and smart unit selection
export const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: dm })} ${sizes[i]}`;
};

// Gets the total authoritative storage usage from the Storage Manager API
export const getTotalStorageUsage = async () => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    const { usage, quota } = await navigator.storage.estimate();
    return {
      usageBytes: usage,
      quotaBytes: quota,
      usageFormatted: formatBytes(usage),
      quotaFormatted: formatBytes(quota),
      percentUsed: quota ? +((usage / quota) * 100).toFixed(1) : 0,
    };
  } catch (error) {
    console.error('Error getting storage estimate:', error);
    return null;
  }
};

// Gets per-entity storage breakdown
export const getEntityStorageUsage = async (db) => {
  const result = {};

  if (!db || !db.tables) return result;

  for (const table of db.tables) {
    try {
        const bytes = await estimateTableSize(table);
        result[table.name] = {
          bytes,
          formatted: formatBytes(bytes)
        };
    } catch (error) {
        console.error(`Error estimating size for table ${table.name}:`, error);
        result[table.name] = { bytes: 0, formatted: 'Error', error: true };
    }
  }

  return result;
};

// Main function to be called from UI
export const calculateStorageUsage = async (db) => {
  const [total, entities] = await Promise.all([
    getTotalStorageUsage(),
    getEntityStorageUsage(db),
  ]);

  return { total, entities };
};
