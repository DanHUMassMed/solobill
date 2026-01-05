import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

/* -----------------------------
   Types
--------------------------------*/

export type AdditionalFieldValue =
  | string
  | number
  | boolean
  | null;

export type AdditionalFieldsDB =
  | Record<string, AdditionalFieldValue>
  | undefined;

type AdditionalFieldRow = {
  name: string;
  value: string;
};

export type AdditionalFieldsHandle = {
  /**
   * Call ONLY on save.
   * Validates + returns DB-safe JSON.
   * Throws on error.
   */
  getValueForSave: () => Record<string, AdditionalFieldValue>;
};

interface AdditionalFieldsProps {
  /**
   * Pass exactly what is stored in the DB
   */
  value?: AdditionalFieldsDB;
}

/* -----------------------------
   Component
--------------------------------*/

export const AdditionalFields = forwardRef<
  AdditionalFieldsHandle,
  AdditionalFieldsProps
>(function AdditionalFields({ value }, ref) {
  /* ---- Internal UI state (array form) ---- */
  const [rows, setRows] = useState<AdditionalFieldRow[]>([]);

  /* ---- Normalize DB → UI (single place) ---- */
  useEffect(() => {
    if (!value) {
      setRows([]);
      return;
    }

    setRows(
      Object.entries(value).map(([name, val]) => ({
        name,
        value: val == null ? '' : String(val)
      }))
    );
  }, [value]);

  /* ---- Expose save-time API ---- */
  useImperativeHandle(ref, () => ({
    getValueForSave() {
      const result: Record<string, AdditionalFieldValue> = {};
      const seen = new Set<string>();

      for (const { name, value } of rows) {
        const trimmed = name.trim();

        if (!trimmed) {
          throw new Error('Additional field names cannot be blank');
        }

        if (seen.has(trimmed)) {
          throw new Error(`Duplicate additional field name: "${trimmed}"`);
        }

        seen.add(trimmed);
        result[trimmed] = value;
      }

      return result;
    }
  }));

  /* ---- UI handlers ---- */
  const updateRow = (
    index: number,
    key: 'name' | 'value',
    newValue: string
  ) => {
    const next = [...rows];
    next[index] = { ...next[index], [key]: newValue };
    setRows(next);
  };

  const addRow = () => {
    setRows([...rows, { name: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  /* ---- Render ---- */
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Additional Information
      </Typography>

      {rows.map((row, index) => (
        <Box
          key={index}
          sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}
        >
          <TextField
            label="Field Name"
            value={row.name}
            onChange={(e) =>
              updateRow(index, 'name', e.target.value)
            }
            fullWidth
            size="small"
          />

          <TextField
            label="Value"
            value={row.value}
            onChange={(e) =>
              updateRow(index, 'value', e.target.value)
            }
            fullWidth
            size="small"
          />

          <IconButton
            onClick={() => removeRow(index)}
            color="error"
            aria-label="delete field"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addRow}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Field
      </Button>
    </Box>
  );
});
