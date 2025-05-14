# Migration Plan: Old User Data Import

## Executive Summary

This document outlines a comprehensive plan to enhance the existing Excel import functionality to handle the new excel format with additional fields including historic booking data, donations, and deeksha status. The migration will focus on creating new entries in existing collections rather than modifying the schema, preserving the current data model while importing historical data.

## Implementation Status Tracking

| Phase                          | Task                              | Status      | Notes                                           |
| ------------------------------ | --------------------------------- | ----------- | ----------------------------------------------- |
| Phase 1: Data Analysis         | Map Excel Fields to Collections   | Completed   | Created comprehensive field mapping table       |
| Phase 1: Data Analysis         | Identify Required Transformations | Completed   | Documented transformation requirements          |
| Phase 2: Data Processing Logic | Enhance Processing Logic          | Completed   | Implemented updated processBatch function       |
| Phase 2: Data Processing Logic | Create Booking Records            | Completed   | Added createBookingRecord function              |
| Phase 2: Data Processing Logic | Data Format Conversions           | Completed   | Added helper functions for data transformation  |
| Phase 3: Error Handling        | Enhanced Validation               | Completed   | Added additional validation functions           |
| Phase 3: Error Handling        | Detailed Error Reporting          | Completed   | Added field-specific error tracking             |
| Phase 4: Implementation        | Update Migration Controller       | Completed   | Enhanced controller with better error handling  |
| Phase 4: Implementation        | Data Transformation               | Completed   | Implemented mapping functions for legacy data   |
| Phase 4: Implementation        | Update Testing                    | In Progress | Creating test cases for validation              |
| Execution                      | Backup                            | Pending     |                                                 |
| Execution                      | Code Implementation               | In Progress | Implementing changes in development environment |
| Execution                      | Testing                           | Pending     |                                                 |
| Execution                      | Full Import                       | Pending     |                                                 |
| Execution                      | Verification                      | Pending     |                                                 |

## Data Analysis

### Excel Format Headers

- Name_Code (primary identifier)
- Add_Id (address identifier)
- Booking Details_Booking_Id (booking reference)
- Receipt_Booking_Id (receipt reference)
- Receipt No (donation receipt number)
- MathOrMission (donation category)
- Actual_Name (guest name)
- Address1, Address2, PO, Dist, State, Pin (address components)
- Amount (donation amount)
- Mode (payment method)
- Receipt Date (donation date)
- DD/CH No (demand draft/check number)
- DD/CH Date (payment instrument date)
- Purpose (donation purpose)
- PAN NO (tax identification)
- Bank Name (financial institution)
- Name_Prefix (title)
- Mobile No (contact number)
- Landline No (alternate contact)
- C/O (care of)
- Country (location)

### Strapi Content Types

1. **Guest Detail**: Core user information

   - Basic info: name, phone, email, address
   - Identity info: PAN, unique_no, identity_proof
   - Status and relationship details
   - Historical stay: arrival_date, departure_date
   - Deeksha information
2. **Donation**: Financial contributions

   - Amount, purpose, payment method
   - Connected to guest and receipt
   - Status tracking
3. **Receipt Detail**: Payment documentation

   - Receipt number, date
   - Counter information (Math/Mission)
4. **Booking Request**: Stay information

   - Status, dates, guest information
   - Relation to room allocations
5. **Room Allocation**: Room assignments

   - Connects guests to rooms
   - Manages room status

## Implementation Plan

### Phase 1: Data Analysis

1. **Map Excel Fields to Collections**

   - Identify which Excel fields map to which Strapi collections
   - Create a comprehensive mapping document
   - Identify any potential data conversion requirements
2. **Identify Required Transformations**

   - Address formatting from multiple fields
   - Date format conversions
   - Payment method standardization
   - Field value normalization

### Phase 2: Data Processing Logic

1. **Enhance Processing Logic**

   - Update `processBatch()` function to handle:
     - Historic booking information
     - Multiple address components
     - Legacy identifiers
2. **Create Booking Records**

   - Create regular booking request entries for historical bookings

   ```javascript
   async createBookingRecord(record, guestId) {
     // Extract booking information
     if (!record.Booking_Details_Booking_Id) {
       return null; // Skip if no booking ID
     }

     const bookingData = {
       name: record.Actual_Name,
       phone_number: record.Mobile_No || '',
       status: 'confirmed', // Historical records are confirmed
       admin_comment: `Historical booking imported from legacy data. Reference: ${record.Booking_Details_Booking_Id}`,
       // Extract any dates if available or use reasonable defaults
       arrival_date: this.extractDateFromBookingId(record.Booking_Details_Booking_Id) || null,
       departure_date: null,
       // Add other required fields with defaults
       publishedAt: new Date()
     };

     // Create the booking record
     const booking = await strapi.db.query('api::booking-request.booking-request').create({
       data: bookingData
     });

     // Link the guest to this booking
     await strapi.db.query('api::guest-detail.guest-detail').update({
       where: { id: guestId },
       data: {
         booking_request: booking.id
       }
     });

     return booking;
   }
   ```
3. **Data Format Conversions**

   - Add helper functions for data format handling

   ```javascript
   extractDateFromBookingId(bookingId) {
     // Logic to extract date components from booking ID
     // Assuming format contains date information
     if (!bookingId) return null;

     // Implement extraction based on booking ID format
     // For example, if format is YYYYMMDD-XXXX
     try {
       const datePart = bookingId.split('-')[0];
       if (datePart && datePart.length === 8) {
         const year = datePart.substring(0, 4);
         const month = datePart.substring(4, 6);
         const day = datePart.substring(6, 8);
         return new Date(`${year}-${month}-${day}`);
       }
     } catch (error) {
       console.error('Failed to extract date from booking ID:', error);
     }
     return null;
   }

   formatCompleteAddress(record) {
     const addressParts = [
       record.Address1,
       record.Address2,
       record.PO,
       record.Dist,
       record.State,
       record.Pin,
       record.Country || 'India'
     ].filter(Boolean);

     return addressParts.join(', ');
   }
   ```

### Phase 3: Error Handling and Validation

1. **Enhanced Validation**

   - Add validation rules for new fields

   ```javascript
   isValidBookingId: (id) => {
     if (!id) return true; // Optional field
     // Validation logic specific to your booking ID format
     return true;
   }
   ```
2. **Detailed Error Reporting**

   - Expand error reporting to include issues with new fields
   - Track field-specific error counts

### Phase 4: Implementation

1. **Update Migration Controller**

   - Enhance the upload and import endpoints
   - Ensure proper handling of new fields
2. **Data Transformation**

   - Create mapping functions between legacy and new data structures

   ```javascript
   mapLegacyToGuest(record) {
     return {
       name: record.Actual_Name,
       phone_number: record.Mobile_No || '',
       address: this.formatCompleteAddress(record),
       unique_no: record.Name_Code,
       pan_number: record.PAN_NO || '',
       status: 'approved' // Assuming historical guests are approved
     };
   }

   mapLegacyToDonation(record, guestId, receiptId) {
     return {
       guest: guestId,
       receipt_detail: receiptId,
       donationAmount: parseFloat(record.Amount) || 0,
       transactionType: this.mapPaymentMode(record.Mode) || 'Cash',
       donationFor: record.MathOrMission || 'Math',
       ddch_number: record.DD_CH_No || '',
       ddch_date: this.parseDate(record.DD_CH_Date),
       bankName: record.Bank_Name || '',
       purpose: record.Purpose || '',
       status: 'completed'
     };
   }

   mapPaymentMode(mode) {
     // Map legacy payment modes to system values
     const modeMap = {
       'CASH': 'Cash',
       'CHEQUE': 'Cheque',
       'CH': 'Cheque',
       'CHQ': 'Cheque',
       'DD': 'DD',
       'BANK TRANSFER': 'Bank Transfer',
       'TRANSFER': 'Bank Transfer',
       'M.O': 'M.O'
     };

     return modeMap[mode?.toUpperCase()] || 'Cash';
   }
   ```
3. **Update Testing**

   - Create test cases to verify legacy data import
   - Add validation to check data integrity

## Excel to Strapi Field Mapping

The following table shows how each field from the Excel spreadsheet maps to Strapi collection fields:

| Excel Field                | Strapi Collection        | Strapi Field    | Notes                                  |
| -------------------------- | ------------------------ | --------------- | -------------------------------------- |
| Name_Code                  | guest-detail             | unique_no       | Primary identifier for guest           |
| Add_Id                     | N/A                      | N/A             | Reference only, not stored directly    |
| Booking Details_Booking_Id | booking-request          | admin_comment   | Stored as reference in comment         |
| Receipt_Booking_Id         | receipt-detail           | N/A             | Reference only, not stored directly    |
| Receipt No                 | receipt-detail           | Receipt_number  | Receipt identifier                     |
| MathOrMission              | donation                 | donationFor     | Math or Mission donation category      |
| Actual_Name                | guest-detail             | name            | Guest name                             |
| Address1                   | guest-detail             | address         | Combined with other address fields     |
| Address2                   | guest-detail             | address         | Combined with other address fields     |
| PO                         | guest-detail             | address         | Combined with other address fields     |
| Dist                       | guest-detail             | address         | Combined with other address fields     |
| State                      | guest-detail             | address         | Combined with other address fields     |
| Pin                        | guest-detail             | address         | Combined with other address fields     |
| Amount                     | donation                 | donationAmount  | Donation amount                        |
| Mode                       | donation                 | transactionType | Payment method                         |
| Receipt Date               | receipt-detail, donation | donation_date   | Date of receipt/donation               |
| DD/CH No                   | donation                 | ddch_number     | Cheque/DD number                       |
| DD/CH Date                 | donation                 | ddch_date       | Cheque/DD date                         |
| Purpose                    | donation                 | purpose         | Purpose of donation                    |
| PAN NO                     | guest-detail             | pan_number      | PAN card number                        |
| Bank Name                  | donation                 | bankName        | Bank name for transactions             |
| Name_Prefix                | N/A                      | N/A             | Could be merged with name if needed    |
| Mobile No                  | guest-detail             | phone_number    | Contact number                         |
| Landline No                | N/A                      | N/A             | Could be stored in guest notes         |
| C/O                        | guest-detail             | address         | Combined with address if present       |
| Country                    | guest-detail             | address         | Combined with address, default "India" |

## Implementation Code

### Enhanced Data Format Conversions

```javascript
// Add these helper functions to the migration service

// Format complete address from all address components
formatCompleteAddress(record) {
  const addressParts = [
    record.Address1,
    record.Address2,
    record.PO,
    record.Dist,
    record.State,
    record.Pin,
    record.Country || 'India'
  ].filter(Boolean);
  
  return addressParts.join(', ');
},

// Map payment modes to standard values
mapPaymentMode(mode) {
  // Map legacy payment modes to system values
  const modeMap = {
    'CASH': 'Cash',
    'CHEQUE': 'Cheque',
    'CH': 'Cheque', 
    'CHQ': 'Cheque',
    'DD': 'DD',
    'BANK TRANSFER': 'Bank Transfer',
    'TRANSFER': 'Bank Transfer',
    'M.O': 'M.O'
  };
  
  return modeMap[mode?.toUpperCase()] || 'Cash';
},

// Extract date from booking ID if possible
extractDateFromBookingId(bookingId) {
  if (!bookingId) return null;
  
  // Implement extraction based on booking ID format
  // For example, if format is YYYYMMDD-XXXX
  try {
    const datePart = bookingId.split('-')[0];
    if (datePart && datePart.length === 8) {
      const year = datePart.substring(0, 4);
      const month = datePart.substring(4, 6);
      const day = datePart.substring(6, 8);
      return new Date(`${year}-${month}-${day}`);
    }
    // Additional formats can be handled here
  } catch (error) {
    console.error('Failed to extract date from booking ID:', error);
  }
  return null;
}
```

### Updated Process Batch Function

```javascript
async processBatch(batch) {
  const results = {
    success: [],
    failed: [],
    invalid: [],
    skipped: [] // For existing records
  };

  for (const record of batch) {
    try {
      if (!record.isValid) {
        results.invalid.push({
          name_code: record.Name_Code,
          errors: record.validationErrors
        });
        continue;
      }

      // Skip if record exists (or handle update if needed)
      if (record.existsInSystem) {
        results.skipped.push({
          name_code: record.Name_Code,
          reason: 'Record already exists'
        });
        continue;
      }

      // Create guest with enhanced address handling
      const guest = await this.createOrUpdateGuest({
        name: record.Actual_Name,
        phone_number: record.Mobile_No || record.Name_Code,
        address: this.formatCompleteAddress(record), // Using enhanced address function
        email: '',
        pan_number: record.PAN_NO || '',
        unique_no: record.Name_Code,
        status: 'approved',
        identity_proof: record.identity_proof || '',
        identity_number: record.identity_number || ''
      });

      // Create booking record if booking ID exists
      let booking = null;
      if (record.Booking_Details_Booking_Id) {
        booking = await this.createBookingRecord(record, guest.id);
      }

      // Handle receipt and donation if present
      if (record.Receipt_No) {
        const receipt = await this.createReceiptDetail({
          Receipt_number: record.Receipt_No,
          donation_date: this.parseDate(record.Receipt_Date),
          counter: record.MathOrMission || 'Math'
        });

        await this.createDonation({
          guest: guest.id,
          receipt_detail: receipt.id,
          donationAmount: parseFloat(record.Amount) || 0,
          transactionType: this.mapPaymentMode(record.Mode) || 'Cash',
          donationFor: record.MathOrMission || 'Math',
          ddch_number: record.DD_CH_No || '',
          ddch_date: this.parseDate(record.DD_CH_Date),
          bankName: record.Bank_Name || '',
          purpose: record.Purpose || '',
          status: 'completed'
        });
      }

      results.success.push({
        name_code: record.Name_Code,
        guestId: guest.id,
        bookingId: booking?.id || null
      });
    } catch (error) {
      results.failed.push({
        name_code: record.Name_Code,
        error: error.message
      });
    }
  }

  return results;
}
```

### Booking Record Creation Function

```javascript
async createBookingRecord(record, guestId) {
  try {
    // Extract arrival date from booking ID if possible
    const arrivalDate = this.extractDateFromBookingId(record.Booking_Details_Booking_Id);
  
    // Create a simple booking record with the available information
    const booking = await strapi.db.query('api::booking-request.booking-request').create({
      data: {
        name: record.Actual_Name,
        phone_number: record.Mobile_No || '',
        status: 'confirmed', // Historical records are confirmed
        admin_comment: `Historical booking imported from legacy data. Reference: ${record.Booking_Details_Booking_Id}`,
        arrival_date: arrivalDate, 
        departure_date: null, // No departure date info in the import data
        guests: [guestId], // Link to the guest
        publishedAt: new Date()
      }
    });
  
    return booking;
  } catch (error) {
    console.error('Failed to create booking record:', error);
    return null;
  }
}
```

### Enhanced Validation Functions

```javascript
// Add these to validationRules in the migration service
isValidBookingId: (id) => {
  if (!id) return true; // Optional field
  // Add specific booking ID validation if needed
  return true;
},

isValidAmount: (amount) => {
  if (!amount) return true;
  return !isNaN(parseFloat(amount));
},

isValidReceiptNo: (receiptNo) => {
  if (!receiptNo) return true;
  // Basic validation that receipt number is not empty
  return receiptNo.trim().length > 0;
}
```

### Updated Migration Controller

```javascript
// Enhanced migration controller with improved error handling and reporting

module.exports = {
  async uploadExcel(ctx) {
    try {
      const { files } = ctx.request;
    
      if (!files || !files.file) {
        return ctx.badRequest('No file uploaded');
      }

      const file = files.file;

      // Log file details for debugging
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Check file size (increased to 20MB for larger datasets)
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
      if (file.size > MAX_FILE_SIZE) {
        return ctx.badRequest('File size exceeds 20MB limit');
      }

      // Check if file is empty
      if (!file.size) {
        return ctx.badRequest('File is empty');
      }

      let workbook;
      try {
        // Read as buffer if file.buffer exists, otherwise use path
        if (file.buffer) {
          workbook = xlsx.read(file.buffer, { type: 'buffer' });
        } else {
          workbook = xlsx.readFile(file.path);
        }
      } catch (error) {
        console.error('Excel reading error:', error);
        return ctx.badRequest('Invalid Excel file format');
      }

      if (!workbook.SheetNames.length) {
        return ctx.badRequest('Excel file has no sheets');
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
    
      // Convert to JSON (increased limit to 500 records per batch)
      let data;
      try {
        data = xlsx.utils.sheet_to_json(worksheet);
      } catch (error) {
        console.error('JSON conversion error:', error);
        return ctx.badRequest('Failed to parse Excel data');
      }
    
      // Validate data
      if (!Array.isArray(data) || data.length === 0) {
        return ctx.badRequest('No valid data found in Excel file');
      }

      // Create a unique job ID for tracking
      const jobId = Date.now().toString();
      global.migrationProgress = global.migrationProgress || {};
      global.migrationProgress[jobId] = {
        total: data.length,
        processed: 0,
        success: 0,
        failed: 0,
        invalid: 0,
        skipped: 0,
        lastProcessed: null,
        startTime: new Date(),
        status: 'processing'
      };

      // Process in batches to prevent memory issues
      const BATCH_SIZE = 100;
      const batches = [];
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        batches.push(data.slice(i, i + BATCH_SIZE));
      }

      // Start the import process asynchronously
      this.processImportBatches(batches, jobId);

      return {
        jobId,
        totalRecords: data.length,
        estimatedBatches: batches.length,
        message: 'Import process started. Use the /migration/progress/:jobId endpoint to check progress.'
      };
    } catch (error) {
      console.error('Excel upload failed:', error);
      return ctx.badRequest(`Excel upload failed: ${error.message}`);
    }
  },

  // Process batches asynchronously to prevent timeout
  async processImportBatches(batches, jobId) {
    try {
      let processed = 0;
      const progress = global.migrationProgress[jobId];
      const results = {
        success: [],
        failed: [],
        invalid: [],
        skipped: []
      };

      for (let i = 0; i < batches.length; i++) {
        const batchData = batches[i];
      
        // Process the batch
        const batchResults = await strapi.service('api::migration.migration').importDonorData(
          batchData,
          (batchProgress) => {
            // Update global progress
            progress.processed = processed + Math.floor(batchData.length * (batchProgress / 100));
            progress.percentComplete = Math.floor((progress.processed / progress.total) * 100);
          }
        );
      
        // Update results
        results.success.push(...batchResults.success);
        results.failed.push(...batchResults.failed);
        results.invalid.push(...batchResults.invalid);
        results.skipped.push(...batchResults.skipped || []);
      
        // Update batch progress
        processed += batchData.length;
        progress.processed = processed;
        progress.success = results.success.length;
        progress.failed = results.failed.length;
        progress.invalid = results.invalid.length;
        progress.skipped = results.skipped.length;
        progress.lastProcessed = new Date();
        progress.percentComplete = Math.floor((progress.processed / progress.total) * 100);
      
        // Save last batch results if this is the last batch
        if (i === batches.length - 1) {
          progress.status = 'completed';
          progress.endTime = new Date();
          progress.processingTime = (progress.endTime - progress.startTime) / 1000; // in seconds
        
          // Generate error report
          const errorReport = await strapi.service('api::migration.error-report').generateErrorReport(results);
          progress.errorReport = errorReport;
          progress.details = {
            success: results.success.map(item => ({
              name_code: item.name_code,
              guestId: item.guestId,
              bookingId: item.bookingId
            })),
            failed: results.failed,
            invalid: results.invalid,
            skipped: results.skipped
          };
        }
      }
    } catch (error) {
      console.error('Batch processing failed:', error);
      const progress = global.migrationProgress[jobId];
      progress.status = 'failed';
      progress.error = error.message;
      progress.endTime = new Date();
    }
  },

  // Add enhanced progress checking endpoint
  async checkProgress(ctx) {
    try {
      const { jobId } = ctx.params;
    
      if (!global.migrationProgress || !global.migrationProgress[jobId]) {
        return ctx.notFound('Job not found');
      }

      const progress = global.migrationProgress[jobId];
    
      // Calculate estimated time remaining if still processing
      let estimatedTimeRemaining = null;
      if (progress.status === 'processing' && progress.processed > 0) {
        const elapsedTime = (new Date() - progress.startTime) / 1000; // in seconds
        const recordsPerSecond = progress.processed / elapsedTime;
        const remainingRecords = progress.total - progress.processed;
        estimatedTimeRemaining = remainingRecords / recordsPerSecond;
      }

      return {
        jobId,
        status: progress.status,
        total: progress.total,
        processed: progress.processed,
        percentComplete: progress.percentComplete,
        success: progress.success,
        failed: progress.failed,
        invalid: progress.invalid,
        skipped: progress.skipped,
        startTime: progress.startTime,
        lastProcessed: progress.lastProcessed,
        estimatedTimeRemaining: estimatedTimeRemaining ? `${Math.ceil(estimatedTimeRemaining)} seconds` : null,
        ...(progress.status === 'completed' || progress.status === 'failed' ? {
          endTime: progress.endTime,
          processingTime: `${progress.processingTime} seconds`,
          errorReport: progress.errorReport
        } : {})
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // Add endpoint to retrieve results for a completed job
  async getResults(ctx) {
    try {
      const { jobId } = ctx.params;
    
      if (!global.migrationProgress || !global.migrationProgress[jobId]) {
        return ctx.notFound('Job not found');
      }

      const progress = global.migrationProgress[jobId];
    
      if (progress.status !== 'completed') {
        return ctx.badRequest('Job is not complete');
      }

      return {
        jobId,
        status: progress.status,
        total: progress.total,
        processed: progress.processed,
        success: progress.success,
        failed: progress.failed,
        invalid: progress.invalid,
        skipped: progress.skipped,
        processingTime: `${progress.processingTime} seconds`,
        details: progress.details,
        errorReport: progress.errorReport
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
};
```

### Updated Routes Configuration

```javascript
// Add this to src/api/migration/routes/migration.js

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/migration/upload',
      handler: 'migration.uploadExcel',
      config: {
        policies: [],
        description: 'Upload Excel file for data migration',
        tags: ['Migration']
      }
    },
    {
      method: 'POST',
      path: '/migration/import',
      handler: 'migration.importData',
      config: {
        policies: [],
        description: 'Import donor data from Excel',
        tags: ['Migration']
      }
    },
    {
      method: 'GET',
      path: '/migration/progress/:jobId',
      handler: 'migration.checkProgress',
      config: {
        policies: [],
        description: 'Check import progress',
        tags: ['Migration']
      }
    },
    {
      method: 'GET',
      path: '/migration/results/:jobId',
      handler: 'migration.getResults',
      config: {
        policies: [],
        description: 'Get detailed results of a completed import job',
        tags: ['Migration']
      }
    }
  ]
};
```

## Integration Testing Approach

To ensure the migration implementation works correctly, we'll set up a comprehensive testing approach:

### 1. Test Data Preparation

1. Create a small subset of test data (10-20 records) with various scenarios:

   - Records with only guest information
   - Records with guest and donation information
   - Records with guest, donation, and booking information
   - Records with various edge cases (missing fields, special characters, etc.)
2. Prepare expected results for each test record to validate against

### 2. Unit Tests

1. Test individual helper functions:

   - `formatCompleteAddress` - Verify address formatting with different combinations of fields
   - `mapPaymentMode` - Test mapping of various payment method notations
   - `extractDateFromBookingId` - Test date extraction from different booking ID formats
   - Validation functions - Test with valid and invalid inputs
2. Mock database interactions for isolated testing

### 3. Integration Tests

1. Set up a test environment with a clean database
2. Run the import process with test data
3. Verify relationships are correctly created:
   - Guest records are created with correct data
   - Donation records link to the right guests
   - Receipt records contain correct information
   - Booking records are properly linked to guests

### 4. Validation Tests

1. Test duplicate handling:
   - Import same record twice, ensure second attempt is properly handled
2. Test error handling:
   - Intentionally inject invalid data, verify proper error reporting
3. Test transaction integrity:
   - Simulate failure midway through import, verify no partial records remain

### 5. Performance Testing

1. Test with progressively larger datasets:
   - 100 records
   - 500 records
   - 1000 records
2. Monitor memory usage and execution time
3. Verify progress tracking works correctly

### Test Implementation Plan

```javascript
// Example test case for address formatting
describe('Address Formatting', () => {
  test('formats complete address with all fields', () => {
    const record = {
      Address1: '123 Main St',
      Address2: 'Apt 4B',
      PO: 'PO Box 123',
      Dist: 'Sample District',
      State: 'West Bengal',
      Pin: '700001',
      Country: 'India'
    };
  
    const result = migrationService.formatCompleteAddress(record);
    expect(result).toBe('123 Main St, Apt 4B, PO Box 123, Sample District, West Bengal, 700001, India');
  });
  
  test('formats address with missing fields', () => {
    const record = {
      Address1: '123 Main St',
      State: 'West Bengal',
      Pin: '700001'
    };
  
    const result = migrationService.formatCompleteAddress(record);
    expect(result).toBe('123 Main St, West Bengal, 700001, India');
  });
});

// Example test for date extraction
describe('Booking ID Date Extraction', () => {
  test('extracts date from YYYYMMDD format', () => {
    const date = migrationService.extractDateFromBookingId('20220315-1234');
    expect(date).toEqual(new Date('2022-03-15'));
  });
  
  test('returns null for invalid format', () => {
    const date = migrationService.extractDateFromBookingId('ABC1234');
    expect(date).toBeNull();
  });
});
```

## Execution Steps

1. **Backup**

   - Backup current database
   - Export any existing production data
2. **Code Implementation**

   - Update migration services with new logic
   - Implement data transformation functions
   - Add error handling for new field types
3. **Testing**

   - Test with sample data subset
   - Verify relational integrity
   - Test error handling
4. **Full Import**

   - Process full dataset in batches
   - Monitor progress and handle errors
   - Verify imported data
5. **Verification**

   - Check random samples for data quality
   - Verify historical records are accessible
   - Test querying capabilities

## Considerations

1. **Performance**

   - Process in batches of 100 records
   - Implement progress tracking
   - Add resume capabilities for large imports
2. **Data Quality**

   - Implement robust validation
   - Handle missing or inconsistent data
   - Preserve original values where possible
3. **Compatibility**

   - Ensure new data works with existing APIs
   - Test front-end compatibility
   - Maintain backward compatibility

## Technical Details

1. **Database Impact**

   - Increase in record count
   - No schema changes required
   - Consider adding indices for performance
2. **API Changes**

   - No changes to existing endpoints
   - New utility endpoints for data verification
3. **Deployment Strategy**

   - Implement in development first
   - Test with subset of production data
   - Schedule maintenance window for production update
