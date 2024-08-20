import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa, { ParseResult } from 'papaparse';

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

  const handleColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const column = event.target.value;
    setSelectedColumn(column);
    if (column) {
      determineColumnType(column);
    }
  };

  const determineColumnType = (column: string) => {
    const columnData = csvData.map(row => row[column]).filter(value => value !== undefined);
    
    if (columnData.length === 0) {
      setColumnType('Unknown');
      return;
    }

    const isNumeric = columnData.every(value => !isNaN(Number(value)) && value.trim() !== '');
    setColumnType(isNumeric ? 'Numeric' : 'Text');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    }
  });

  const columnOptions = csvData.length > 0 ? Object.keys(csvData[0]).map((col, index) => (
    <option key={index} value={col}>{col}</option>
  )) : [];

  return (
    <div>
      {csvData.length > 0 ? (
        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>CSV Data</h3>
            <button onClick={handleReset} style={{ padding: '10px 20px' }}>
              Upload Another CSV File
            </button>
          </div>
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <label htmlFor="column-select" style={{ marginRight: '10px' }}>Select Column:</label>
            <select id="column-select" value={selectedColumn || ''} onChange={handleColumnChange} style={{ padding: '10px' }}>
              <option value="">-- Select a column --</option>
              {columnOptions}
            </select>
            {selectedColumn && columnType && (
              <p>Data Type of Column "{selectedColumn}": {columnType}</p>
            )}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {Object.keys(csvData[0]).map((header, index) => (
                  <th key={index} style={{ border: '1px solid #ccc', padding: '8px' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex} style={{ border: '1px solid #ccc', padding: '8px' }}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : loading ? (
        <p>Loading CSV data...</p>
      ) : (
        <div
          {...getRootProps()}
          style={{
            border: '2px dashed #cccccc',
            padding: '20px',
            textAlign: 'center',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the CSV file here ...</p>
          ) : (
            <p>Drag 'n' drop a CSV file here, or click to select a file</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropzone;


// import React, { useCallback, useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import Papa, { ParseResult } from 'papaparse';

// interface CsvRow {
//   [key: string]: string;
// }

// const Dropzone: React.FC = () => {
//   const [csvData, setCsvData] = useState<CsvRow[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const file = acceptedFiles[0]; // Assuming a single file is uploaded

//     if (file) {
//       setLoading(true);
//       const parsedData: CsvRow[] = [];

//       Papa.parse<CsvRow>(file, {
//         header: true,
//         skipEmptyLines: true,
//         chunk: (results: ParseResult<CsvRow>) => {
//           parsedData.push(...results.data);
//           setCsvData((prevData) => [...prevData, ...results.data]);
//         },
//         complete: () => {
//           setLoading(false);
//           console.log('CSV file fully parsed:', parsedData);
//         },
//         error: (error) => {
//           setLoading(false);
//           console.error('Error parsing CSV:', error);
//         },
//       });
//     }
//   }, []);

//   const handleReset = () => {
//     setCsvData([]);
//     setLoading(false);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       'text/csv': ['.csv']
//     }
//   });

//   return (
//     <div>
//       {csvData.length > 0 ? (
//         <div style={{ padding: '20px', overflowX: 'auto' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'left', margin: '0 0 10px 0' }}>
//             <h3 style={{ margin: 0 }}>CSV Data</h3>
//             <button onClick={handleReset} style={{ padding: '10px 20px' }}>
//               Upload Another CSV File
//             </button>
//           </div>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead>
//               <tr>
//                 {Object.keys(csvData[0]).map((header, index) => (
//                   <th key={index} style={{ border: '1px solid #ccc', padding: '8px' }}>{header}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {csvData.map((row, rowIndex) => (
//                 <tr key={rowIndex}>
//                   {Object.values(row).map((value, colIndex) => (
//                     <td key={colIndex} style={{ border: '1px solid #ccc', padding: '8px' }}>{value}</td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : loading ? (
//         <p>Loading CSV data...</p>
//       ) : (
//         <div
//           {...getRootProps()}
//           style={{
//             border: '2px dashed #cccccc',
//             padding: '20px',
//             textAlign: 'center',
//             borderRadius: '4px',
//             cursor: 'pointer',
//           }}
//         >
//           <input {...getInputProps()} />
//           {isDragActive ? (
//             <p>Drop the CSV file here ...</p>
//           ) : (
//             <p>Drag 'n' drop a CSV file here, or click to select a file</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dropzone;
