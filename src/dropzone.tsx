import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa, { ParseResult } from 'papaparse';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';

interface CsvRow {
  [key: string]: string;
}

const Dropzone: React.FC = () => {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [columnType, setColumnType] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      setLoading(true);
      const parsedData: CsvRow[] = [];

      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        chunk: (results: ParseResult<CsvRow>) => {
          parsedData.push(...results.data);
          setCsvData((prevData) => [...prevData, ...results.data]);
        },
        complete: () => {
          setLoading(false);
          console.log('CSV file fully parsed:', parsedData);
        },
        error: (error) => {
          setLoading(false);
          console.error('Error parsing CSV:', error);
        },
      });
    }
  }, []);

  const handleReset = () => {
    setCsvData([]);
    setLoading(false);
    setSelectedColumn(null);
    setColumnType(null);
  };

  const handleColumnChange = (event: SelectChangeEvent<string>) => {
    const column = event.target.value as string;
    setSelectedColumn(column);
    if (column) {
      determineColumnType(column);
    }
  };

  const determineColumnType = (column: string) => {
    const columnData = csvData
      .map((row) => row[column])
      .filter((value) => value !== undefined);

    if (columnData.length === 0) {
      setColumnType('Unknown');
      return;
    }

    const isNumeric = columnData.every(
      (value) => !isNaN(Number(value)) && value.trim() !== '',
    );
    setColumnType(isNumeric ? 'Numeric' : 'Text');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const columnOptions =
    csvData.length > 0
      ? Object.keys(csvData[0]).map((col, index) => (
          <MenuItem key={index} value={col}>
            {col}
          </MenuItem>
        ))
      : [];

  return (
    <Box sx={{ padding: '20px' }}>
      {csvData.length > 0 ? (
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <Typography variant="h5">CSV Data</Typography>
            <Button variant="contained" color="primary" onClick={handleReset}>
              Upload Another CSV File
            </Button>
          </Box>
          <Box sx={{ marginBottom: '20px' }}>
            <Typography>Select Column:</Typography>
            <Select
              value={selectedColumn || ''}
              onChange={handleColumnChange}
              aria-label="Select Column"
              sx={{ marginLeft: '10px', minWidth: '200px' }}
            >
              <MenuItem value="">
                <em>-- Select a column --</em>
              </MenuItem>
              {columnOptions}
            </Select>
            {selectedColumn && columnType && (
              <Typography>Data Type of Column: {columnType}</Typography>
            )}
          </Box>
          <TableContainer>
            <Table sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow>
                  {Object.keys(csvData[0]).map((header, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        backgroundColor: '#c8e6c9',
                        fontWeight: 'bold',
                        borderLeft: '1px solid #ccc',
                        padding: '8px',
                        textAlign: 'center',
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {csvData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      backgroundColor:
                        rowIndex % 2 === 0 ? '#f1f8e9' : '#ffffff',
                      '&:hover': {
                        backgroundColor: '#e0f7fa', // Light cyan color on hover
                      },
                    }}
                  >
                    {Object.values(row).map((value, colIndex) => (
                      <TableCell
                        key={colIndex}
                        sx={{ border: '1px solid #ccc', padding: '8px' }}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : loading ? (
        <CircularProgress />
      ) : (
        <Box
          {...getRootProps()}
          aria-label="drop a CSV file here"
          sx={{
            border: '2px dashed #cccccc',
            padding: '20px',
            textAlign: 'center',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#f9fbe7',
          }}
        >
          <input
            {...getInputProps()}
            style={{ display: 'none' }}
            data-testid="file-input"
          />
          {isDragActive ? (
            <Typography>Drop the CSV file here ...</Typography>
          ) : (
            <Typography>
              Drag 'n' drop a CSV file here, or click to select a file
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Dropzone;
