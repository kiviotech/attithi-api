# Frontend Integration Plan for Data Migration

## Overview

This document outlines the plan for integrating the Excel data migration functionality with the frontend user interface. The goal is to provide administrators with an intuitive, user-friendly interface to upload legacy data, monitor import progress, view results, and handle any errors that might occur during the import process.

## Architecture

The integration will follow a client-server architecture:

- **Backend**: Strapi API endpoints for file upload, data processing, and status reporting
- **Frontend**: React-based UI components for user interaction and data visualization
- **Communication**: RESTful API calls with proper authentication and error handling

## User Interface Components

### 1. Migration Dashboard

**Purpose**: Central hub for migration operations and monitoring
**Location**: Add to Admin Menu under "Data Management" or similar section

**Features**:

- Summary statistics of previous imports
- Quick access to recent import jobs
- Status indicators for ongoing imports
- Actions to initiate new imports

### 2. Upload Component

**Purpose**: Allow users to select and upload Excel files
**Design**:

- Drag-and-drop area for file selection
- File type validation (only .xlsx, .xls)
- File size indicator and limits
- Upload button with loading state
- Cancel button for aborting upload

**Implementation**:

```jsx
import { useState } from 'react';
import { Box, Button, Typography, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadComponent = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                         selectedFile.type === 'application/vnd.ms-excel')) {
      setFile(selectedFile);
    } else {
      // Show error - invalid file type
    }
  };

  const handleUpload = async () => {
    if (!file) return;
  
    setUploading(true);
    setProgress(0);
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      // Upload with progress tracking
      const response = await uploadFileWithProgress(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
    
      // Handle successful upload - redirect to monitoring page
      if (response.data && response.data.jobId) {
        navigateToProgressPage(response.data.jobId);
      }
    } catch (error) {
      // Handle error
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center' }}>
      <input
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        id="file-upload"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button 
          variant="contained" 
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
        >
          Select Excel File
        </Button>
      </label>
    
      {file && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpload}
            disabled={uploading}
            sx={{ mt: 1 }}
          >
            Upload & Start Import
          </Button>
        </Box>
      )}
    
      {uploading && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" sx={{ mt: 1 }}>{progress}% Uploaded</Typography>
        </Box>
      )}
    </Box>
  );
};

export default UploadComponent;
```

### 3. Progress Monitoring

**Purpose**: Track and display the status of ongoing import jobs
**Design**:

- Real-time progress bar
- Current stage indicator
- Processed/total records counter
- Estimated time remaining
- Cancel option for long-running imports
- Auto-refresh every 5 seconds

**Implementation**:

```jsx
import { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Paper, Grid, Button } from '@mui/material';

const ProgressMonitor = ({ jobId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/migration/progress/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });
      
        if (!response.ok) throw new Error('Failed to fetch progress');
      
        const data = await response.json();
        setProgress(data);
        setLoading(false);
      
        // If not complete, schedule next update
        if (data.status === 'processing') {
          return true; // continue polling
        }
      
        return false; // stop polling if complete
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return false; // stop polling on error
      }
    };
  
    // Initial fetch
    fetchProgress();
  
    // Set up polling
    const intervalId = setInterval(() => {
      fetchProgress().then(shouldContinue => {
        if (!shouldContinue) clearInterval(intervalId);
      });
    }, 5000);
  
    return () => clearInterval(intervalId);
  }, [jobId]);
  
  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!progress) return <Typography>No data available</Typography>;
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Import Progress</Typography>
      <Typography variant="body2" color="textSecondary">Job ID: {jobId}</Typography>
    
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>Status: {progress.status}</Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress.percentComplete || 0} 
              sx={{ mt: 1, mb: 1 }}
            />
            <Typography variant="body2">
              {progress.processed} / {progress.total} records processed ({progress.percentComplete}%)
            </Typography>
          </Grid>
        
          <Grid item xs={6}>
            <Typography variant="body2">Success: {progress.success}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Failed: {progress.failed}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Invalid: {progress.invalid}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Skipped: {progress.skipped}</Typography>
          </Grid>
        
          {progress.estimatedTimeRemaining && (
            <Grid item xs={12}>
              <Typography variant="body2">
                Estimated time remaining: {progress.estimatedTimeRemaining}
              </Typography>
            </Grid>
          )}
        
          {progress.status === 'processing' && (
            <Grid item xs={12}>
              <Button variant="outlined" color="secondary">
                Cancel Import
              </Button>
            </Grid>
          )}
        
          {progress.status === 'completed' && (
            <Grid item xs={12}>
              <Button variant="contained" color="primary" href={`/admin/migration/results/${jobId}`}>
                View Results
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProgressMonitor;
```

### 4. Results View

**Purpose**: Display detailed results after import completion
**Design**:

- Summary statistics panel
- Tabbed interface for different result categories:
  - Successful imports
  - Failed records
  - Invalid records
  - Skipped records
- Searchable and sortable data tables
- Export options (CSV, Excel)
- Detailed error messages and suggestions

**Implementation**:

```jsx
import { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Tabs, Tab, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const ResultsView = ({ jobId }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/migration/results/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });
      
        if (!response.ok) throw new Error('Failed to fetch results');
      
        const data = await response.json();
        setResults(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchResults();
  }, [jobId]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset pagination when changing tabs
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const exportToCsv = (data, filename) => {
    // Implementation for CSV export
    // ...
  };
  
  if (loading) return <Typography>Loading results...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!results) return <Typography>No results available</Typography>;
  
  // Determine which data to show based on active tab
  let currentData = [];
  let columns = [];
  
  switch (activeTab) {
    case 0: // Success
      currentData = results.details?.success || [];
      columns = [
        { id: 'name_code', label: 'Name Code' },
        { id: 'guestId', label: 'Guest ID' },
        { id: 'bookingId', label: 'Booking ID' }
      ];
      break;
    case 1: // Failed
      currentData = results.details?.failed || [];
      columns = [
        { id: 'name_code', label: 'Name Code' },
        { id: 'error', label: 'Error Message' }
      ];
      break;
    case 2: // Invalid
      currentData = results.details?.invalid || [];
      columns = [
        { id: 'name_code', label: 'Name Code' },
        { id: 'errors', label: 'Validation Errors' }
      ];
      break;
    case 3: // Skipped
      currentData = results.details?.skipped || [];
      columns = [
        { id: 'name_code', label: 'Name Code' },
        { id: 'reason', label: 'Reason' }
      ];
      break;
    default:
      break;
  }
  
  // Paginate the data
  const paginatedData = currentData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">Import Results</Typography>
        <Typography variant="body2" color="textSecondary">Job ID: {jobId}</Typography>
      
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Typography>
            Total records: {results.total} • Processing time: {results.processingTime}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => exportToCsv(results.details, `import-results-${jobId}.csv`)}
          >
            Export Results
          </Button>
        </Box>
      
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Paper sx={{ p: 2, flex: 1, bgcolor: 'success.light' }}>
            <Typography variant="h6">Success</Typography>
            <Typography variant="h4">{results.success}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, bgcolor: 'error.light' }}>
            <Typography variant="h6">Failed</Typography>
            <Typography variant="h4">{results.failed}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, bgcolor: 'warning.light' }}>
            <Typography variant="h6">Invalid</Typography>
            <Typography variant="h4">{results.invalid}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, bgcolor: 'info.light' }}>
            <Typography variant="h6">Skipped</Typography>
            <Typography variant="h4">{results.skipped}</Typography>
          </Paper>
        </Box>
      </Paper>
    
      <Paper>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Success (${results.success})`} />
          <Tab label={`Failed (${results.failed})`} />
          <Tab label={`Invalid (${results.invalid})`} />
          <Tab label={`Skipped (${results.skipped})`} />
        </Tabs>
      
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map(column => (
                    <TableCell key={column.id}>
                      {column.id === 'errors' ? 
                        (Array.isArray(row[column.id]) ? row[column.id].join(', ') : row[column.id]) : 
                        String(row[column.id] || '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={currentData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ResultsView;
```

### 5. Error Handling Modal

**Purpose**: Display detailed errors and provide resolution options
**Design**:

- Modal dialog with error details
- Suggested resolutions
- Options to retry, skip, or abort
- Links to relevant documentation

## API Integration

### 1. Upload API

**Endpoint**: `POST /api/migration/upload`
**Request**:

- Content-Type: multipart/form-data
- Body: File attachment

**Response**:

```json
{
  "jobId": "1649234567890",
  "totalRecords": 500,
  "estimatedBatches": 5,
  "message": "Import process started. Use the /migration/progress/:jobId endpoint to check progress."
}
```

**Implementation**:

```javascript
// Service for API calls
export const uploadExcelFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('jwt');
  
  return axios.post('/api/migration/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    },
    onUploadProgress: progressEvent => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });
};
```

### 2. Progress API

**Endpoint**: `GET /api/migration/progress/:jobId`
**Response**:

```json
{
  "jobId": "1649234567890",
  "status": "processing",
  "total": 500,
  "processed": 250,
  "percentComplete": 50,
  "success": 220,
  "failed": 20,
  "invalid": 10,
  "skipped": 0,
  "startTime": "2023-04-06T10:30:15.000Z",
  "lastProcessed": "2023-04-06T10:31:45.000Z",
  "estimatedTimeRemaining": "120 seconds"
}
```

**Implementation**:

```javascript
export const checkImportProgress = async (jobId) => {
  const token = localStorage.getItem('jwt');
  
  return axios.get(`/api/migration/progress/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

### 3. Results API

**Endpoint**: `GET /api/migration/results/:jobId`
**Response**:

```json
{
  "jobId": "1649234567890",
  "status": "completed",
  "total": 500,
  "processed": 500,
  "success": 450,
  "failed": 30,
  "invalid": 20,
  "skipped": 0,
  "processingTime": "180 seconds",
  "details": {
    "success": [
      { "name_code": "TEST001", "guestId": "1", "bookingId": "101" },
      // ...more records
    ],
    "failed": [
      { "name_code": "TEST089", "error": "Failed to create guest record" },
      // ...more records
    ],
    "invalid": [
      { "name_code": "TEST123", "errors": ["Invalid phone number", "Invalid PAN number"] },
      // ...more records
    ],
    "skipped": [
      { "name_code": "TEST456", "reason": "Record already exists" },
      // ...more records
    ]
  },
  "errorReport": "..."
}
```

**Implementation**:

```javascript
export const getImportResults = async (jobId) => {
  const token = localStorage.getItem('jwt');
  
  return axios.get(`/api/migration/results/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

## Routing and Navigation

### 1. Route Structure

```
/admin/migration               # Migration dashboard
/admin/migration/upload        # Upload page
/admin/migration/progress/:id  # Progress monitoring page
/admin/migration/results/:id   # Results page
/admin/migration/history       # Import history
```

### 2. Navigation Implementation

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import MigrationDashboard from './components/MigrationDashboard';
import UploadPage from './components/UploadPage';
import ProgressPage from './components/ProgressPage';
import ResultsPage from './components/ResultsPage';
import HistoryPage from './components/HistoryPage';

const MigrationRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MigrationDashboard />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/progress/:jobId" element={<ProgressPage />} />
      <Route path="/results/:jobId" element={<ResultsPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MigrationRoutes;
```

## State Management

Use React Context API to manage global state for migration processes:

```jsx
import { createContext, useContext, useState } from 'react';

const MigrationContext = createContext();

export const MigrationProvider = ({ children }) => {
  const [currentJob, setCurrentJob] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [error, setError] = useState(null);
  
  const startNewJob = (jobData) => {
    setCurrentJob(jobData);
    setRecentJobs(prev => [jobData, ...prev].slice(0, 10)); // Keep last 10 jobs
  };
  
  const updateJobProgress = (jobId, progressData) => {
    if (currentJob?.jobId === jobId) {
      setCurrentJob(prev => ({ ...prev, ...progressData }));
    }
  
    setRecentJobs(prev => 
      prev.map(job => job.jobId === jobId ? { ...job, ...progressData } : job)
    );
  };
  
  return (
    <MigrationContext.Provider 
      value={{ 
        currentJob, 
        recentJobs, 
        error, 
        startNewJob, 
        updateJobProgress, 
        setError 
      }}
    >
      {children}
    </MigrationContext.Provider>
  );
};

export const useMigration = () => useContext(MigrationContext);
```

## Error Handling Strategy

1. **Input Validation**:

   - Client-side validation of file format and size
   - Prevent submission of invalid files
2. **API Errors**:

   - Capture and display HTTP errors
   - Provide retry mechanisms for network issues
3. **Import Errors**:

   - Display record-specific errors in the results view
   - Offer guidance on how to correct data issues
4. **Error Recovery**:

   - Allow for partial imports
   - Provide option to skip failed records and retry

## User Experience Considerations

1. **First-Time User Experience**:

   - Provide a guided tour for first-time users
   - Include tooltips explaining each step
   - Link to documentation and sample files
2. **Feedback Mechanisms**:

   - Clear loading indicators for all async operations
   - Toast notifications for important events
   - Confirmation dialogs for destructive actions
3. **Accessibility**:

   - Ensure all components meet WCAG standards
   - Provide keyboard navigation
   - Support screen readers
4. **Mobile Responsiveness**:

   - Adapt UI for different screen sizes
   - Simplify views on smaller screens

## Integration Timeline

| Phase         | Task                     | Estimated Duration |
| ------------- | ------------------------ | ------------------ |
| Planning      | UI/UX Design Mockups     | 2 days             |
| Planning      | Component Structure      | 1 day              |
| Development   | API Integration Services | 1 day              |
| Development   | Upload Component         | 2 days             |
| Development   | Progress Monitoring      | 2 days             |
| Development   | Results View             | 3 days             |
| Development   | Error Handling           | 2 days             |
| Development   | State Management         | 1 day              |
| Testing       | Unit Tests               | 2 days             |
| Testing       | Integration Tests        | 2 days             |
| Testing       | User Acceptance Testing  | 3 days             |
| Deployment    | Production Deployment    | 1 day              |
| Documentation | User Guide               | 2 days             |

## Future Enhancements

1. **Scheduled Imports**:

   - Allow scheduling imports for off-peak hours
2. **Import Templates**:

   - Save and reuse import configurations
3. **Data Preview**:

   - Show preview of data before full import
4. **Advanced Validation**:

   - Create custom validation rules
   - Save validation profiles
5. **Import History Analytics**:

   - Dashboard with import statistics
   - Trend analysis of data quality

## Conclusion

This integration plan provides a comprehensive approach to incorporating the Excel migration functionality into the frontend interface. By following this plan, the development team will create a user-friendly experience that makes data migration intuitive and efficient for administrators.
