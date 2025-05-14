'use strict';

const fs = require('fs');
const path = require('path');
const Excel = require('exceljs');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');

/**
 * migration service
 */

const BATCH_SIZE = 100; // Process 100 records at a time
const JOBS = {}; // In-memory job storage

// Add expected headers for validation - we'll make this more flexible
const REQUIRED_HEADERS = ['Name_Code', 'Amount']; // Only these are absolutely required
const EXPECTED_HEADERS = [
  'Name_Code', 'Actual_Name', 'Mobile No', 'Email', 'PAN NO', 'Add_Id',
  'Amount', 'Receipt Date', 'Receipt No', 'Transaction Type'
];

// Helper functions for validation
const helpers = {
  // Trim whitespace from string fields
  trimField: (value) => {
    return typeof value === 'string' ? value.trim() : value;
  },
  
  // Validate mobile number with more lenient rules
  isValidMobile: (mobile) => {
    if (!mobile) return true; // Allow empty
    const cleaned = String(mobile).replace(/[^0-9]/g, '');
    return cleaned.length >= 8 && cleaned.length <= 15; // More lenient rule
  },
  
  // Validate PAN with more lenient rules
  isValidPAN: (pan) => {
    if (!pan) return true; // Allow empty
    const trimmed = String(pan).trim();
    return /^[A-Za-z0-9]{5,15}$/.test(trimmed); // More lenient rule
  },
  
  // Validate email
  isValidEmail: (email) => {
    if (!email) return true; // Allow empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).trim());
  },
  
  // Format date from Excel to ISO
  formatDate: (excelDate) => {
    if (!excelDate) return null;
    
    try {
      // Handle Excel numeric dates
      if (typeof excelDate === 'number') {
        const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
      }
      
      // Handle string dates
      if (typeof excelDate === 'string') {
        const date = new Date(excelDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },
  
  // Clean name by removing numbers and extra spaces
  cleanName: (name) => {
    if (!name) return '';
    return String(name)
      .trim() // Remove leading/trailing spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[0-9]/g, '') // Remove all numbers
      .replace(/\s+/g, ' ') // Clean up any double spaces created after removing numbers
      .trim(); // Final trim in case removing numbers left spaces at ends
  },
  
  // Enhanced trim field with extra cleaning
  cleanField: (value, type = 'text') => {
    if (!value) return value;
    
    const stringValue = String(value).trim();
    
    switch(type) {
      case 'name':
        return helpers.cleanName(stringValue);
      case 'mobile':
        return stringValue.replace(/[^0-9+]/g, ''); // Keep only numbers and + sign
      case 'email':
        return stringValue.toLowerCase();
      case 'pan':
        return stringValue.toUpperCase(); // PAN should be uppercase
      default:
        return stringValue;
    }
  }
};

// Field mappings with their types - expanded to handle more variations
const fieldMappings = {
  // Guest information - handle different naming conventions
  'Name_Code': { key: 'name_code', type: 'name' },
  'Name Code': { key: 'name_code', type: 'name' },
  'NameCode': { key: 'name_code', type: 'name' },
  'Actual_Name': { key: 'name', type: 'name' },
  'Actual Name': { key: 'name', type: 'name' },
  'ActualName': { key: 'name', type: 'name' },
  'Name': { key: 'name', type: 'name' },
  'Mobile No': { key: 'mobile', type: 'mobile' },
  'Mobile': { key: 'mobile', type: 'mobile' },
  'Mobile Number': { key: 'mobile', type: 'mobile' },
  'Phone': { key: 'mobile', type: 'mobile' },
  'Phone Number': { key: 'mobile', type: 'mobile' },
  'Email': { key: 'email', type: 'email' },
  'Email ID': { key: 'email', type: 'email' },
  'EmailID': { key: 'email', type: 'email' },
  'PAN NO': { key: 'pan', type: 'pan' },
  'PAN': { key: 'pan', type: 'pan' },
  'Pan Number': { key: 'pan', type: 'pan' },
  'Pan No': { key: 'pan', type: 'pan' },
  'Add_Id': { key: 'add_id', type: 'text' },
  'AddId': { key: 'add_id', type: 'text' },
  'ID': { key: 'add_id', type: 'text' },
  
  // Donation information
  'Amount': { key: 'amount', type: 'number' },
  'Donation Amount': { key: 'amount', type: 'number' },
  'Receipt Date': { key: 'date', type: 'date' },
  'Date': { key: 'date', type: 'date' },
  'Donation Date': { key: 'date', type: 'date' },
  'Receipt No': { key: 'receipt_number', type: 'text' },
  'Receipt Number': { key: 'receipt_number', type: 'text' },
  'ReceiptNo': { key: 'receipt_number', type: 'text' },
  'Transaction Type': { key: 'transaction_type', type: 'text' },
  'Mode': { key: 'transaction_type', type: 'text' },
  'Payment Mode': { key: 'transaction_type', type: 'text' },
  'Payment Type': { key: 'transaction_type', type: 'text' },
  'Bank Name': { key: 'bank_name', type: 'text' },
  'Bank': { key: 'bank_name', type: 'text' },
  'Branch Name': { key: 'branch_name', type: 'text' },
  'Branch': { key: 'branch_name', type: 'text' },
  'Cheque/DD Number': { key: 'ddch_number', type: 'text' },
  'Cheque Number': { key: 'ddch_number', type: 'text' },
  'DD Number': { key: 'ddch_number', type: 'text' },
  'Cheque/DD Date': { key: 'ddch_date', type: 'date' },
  'Cheque Date': { key: 'ddch_date', type: 'date' },
  'DD Date': { key: 'ddch_date', type: 'date' },
  'Purpose': { key: 'purpose', type: 'text' },
  'Donation Purpose': { key: 'purpose', type: 'text' },
  'Donation For': { key: 'donation_for', type: 'text' },
  'DonationFor': { key: 'donation_for', type: 'text' },
  'MathOrMission': { key: 'donation_for', type: 'text' },
  'In Memory Of': { key: 'in_memory_of', type: 'text' },
  'InMemoryOf': { key: 'in_memory_of', type: 'text' }
};

module.exports = ({ strapi }) => ({
  // Add the missing importDonorData method
  async importDonorData(data, progressCallback = null) {
    // Create a unique job ID
    const jobId = uuidv4();
    console.log(`Starting import job ${jobId} with ${data.length} records`);
    
    // Initialize results
    const results = {
      jobId,
      success: [],
      failed: [],
      invalid: [],
      skipped: [],
      updated: [],
      processed: 0,
      total: data.length
    };
    
    // Process each record
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const recordId = record.Add_Id || record.name_code || `record-${i+1}`;
      
     // console.log(`Processing record ${i+1}/${data.length} (${recordId})`);
      
      try {
        // Transform and validate data
        const processedData = this.transformData(record);
        const validationResult = this.validateData(processedData);
        
        // Update progress if callback provided
        if (progressCallback) {
          progressCallback(Math.floor((i + 1) / data.length * 100));
        }
        
        // Handle validation failures
        if (!validationResult.isValid) {
          // console.log(`Record ${recordId} validation failed:`, JSON.stringify({
          //   errors: validationResult.errors,
          //   record: {
          //     name_code: record.Name_Code,
          //     add_id: record.Add_Id
          //   }
          // }, null, 2));
          
          results.invalid.push({
            add_id: record.Add_Id || 'unknown',
            name_code: record.Name_Code || 'unknown',
            errors: validationResult.errors.map(e => `${e.field}: ${e.message} (got: ${JSON.stringify(e.value)})`)
          });
          continue;
        }

        // Log warnings if any
        if (validationResult.warnings.length > 0) {
          console.log(`Record ${recordId} has warnings:`, JSON.stringify({
            warnings: validationResult.warnings,
            record: {
            name_code: record.Name_Code,
              add_id: record.Add_Id
            }
          }, null, 2));
        }
        
        // Here you would implement the actual data insertion logic
        // For now, we'll simulate a success
        console.log(`Record ${recordId} processed successfully`);

        results.success.push({
          name_code: record.Name_Code || 'unknown',
          add_id: record.Add_Id || 'unknown',
          guestId: `G-${Date.now()}`, // Simulate a generated ID
          bookingId: record['Booking Details_Booking_Id'] || null
        });
      } 
      catch (error) {
        // Handle processing errors
        console.error(`Record ${recordId} processing failed:`, error.message);
        
        results.failed.push({
          add_id: record.Add_Id || 'unknown',
          name_code: record.Name_Code || 'unknown',
          error: error.message
        });
      }
      
      // Update processed count
      results.processed++;
      
      // Log progress every 10 records
      if (i % 10 === 0 || i === data.length - 1) {
        console.log(`Progress: ${i+1}/${data.length} (${Math.floor((i+1)/data.length*100)}%)`);
        console.log(`Status: ${results.success.length} successful, ${results.invalid.length} invalid, ${results.failed.length} failed`);
      }
    }
    
    console.log(`Import job ${jobId} completed:`, JSON.stringify({
      total: data.length,
      success: results.success.length,
      invalid: results.invalid.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
      updated: results.updated.length
    }, null, 2));

    return results;
  },

  // Add the checkJobProgress method
  async checkJobProgress(jobId) {
    // If using the in-memory JOBS object
    if (JOBS[jobId]) {
      return {
        jobId,
        status: JOBS[jobId].status,
        progress: JOBS[jobId].progress,
        processed: JOBS[jobId].processed,
        total: JOBS[jobId].total
      };
    }
    
    // Return default progress for jobs not found
    return {
      jobId,
      status: 'not_found',
      progress: 0,
      processed: 0,
      total: 0
    };
  },
  
  // Process the uploaded file and start a background job
  async processUpload(filePath, options = {}) {
    console.log('Starting file processing:', filePath);
    const jobId = uuidv4();
    
    // Initialize job status
    JOBS[jobId] = {
      id: jobId,
      status: 'processing',
      progress: 0,
      total: 0,
      processed: 0,
      results: {
        success: 0,
        error: 0,
        warning: 0,
        info: 0
      },
      logs: [],
      errors: [],
      warnings: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Log initial job status
    console.log(`Created job ${jobId}, starting background processing`);
    
    // Start background processing - use Promise to ensure it runs
    this.processFileInBackground(jobId, filePath, options)
      .then(() => {
        console.log(`Job ${jobId} background processing completed`);
      })
      .catch(err => {
        console.error(`Job ${jobId} failed with error:`, err.message, err.stack);
        // Update job status
        if (JOBS[jobId]) {
          JOBS[jobId].status = 'failed';
          JOBS[jobId].updatedAt = new Date();
          this.logError(jobId, `Job failed: ${err.message}`);
        }
      });
    
    return jobId;
  },
  
  // Background processing function
  async processFileInBackground(jobId, filePath, options) {
    try {
      const job = JOBS[jobId];
      if (!job) return;
      
      // Log job starting
      this.logInfo(jobId, 'Starting migration job');
      
      // Read the Excel file
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];
      
      if (!worksheet) {
        this.logError(jobId, 'No worksheet found in Excel file');
        JOBS[jobId].status = 'failed';
        return;
      }
      
      // Get headers from first row and convert to array of strings
      const headerRow = worksheet.getRow(1);
      const headerValues = Array.isArray(headerRow.values) ? headerRow.values : [];
      const headers = headerValues.slice(1).map(cell => String(cell || '')); // Convert to string and handle empty cells
      
      // Check for required headers (more flexible validation)
      const missingRequiredHeaders = REQUIRED_HEADERS.filter(
        required => !headers.some(header => header.toLowerCase() === required.toLowerCase())
      );
      
      if (missingRequiredHeaders.length > 0) {
        this.logInfo(jobId, 'Headers found in file:', headers);
        this.logError(jobId, 'Required headers missing', { 
          missingHeaders: missingRequiredHeaders,
          message: 'The Excel file is missing required headers'
        });
        JOBS[jobId].status = 'failed';
        return;
      }
      
      // Log which additional expected headers were found
      const foundExpectedHeaders = EXPECTED_HEADERS.filter(
        expected => headers.some(header => header.toLowerCase() === expected.toLowerCase())
      );
      
      this.logInfo(jobId, 'Found these expected headers:', foundExpectedHeaders);
      
      // Count rows for progress tracking
      const rowCount = worksheet.rowCount - 1; // Minus header row
      JOBS[jobId].total = rowCount;
      
      this.logInfo(jobId, `Found ${rowCount} records to process`);
      
      // Process data in batches
      for (let startRow = 2; startRow <= worksheet.rowCount; startRow += BATCH_SIZE) {
        const endRow = Math.min(startRow + BATCH_SIZE - 1, worksheet.rowCount);
        
        // Process this batch
        await this.processBatch(jobId, worksheet, headers, startRow, endRow);
        
        // Update job status
        JOBS[jobId].updatedAt = new Date();
        
        // Check if job was cancelled
        if (JOBS[jobId].status === 'cancelled') {
          this.logInfo(jobId, 'Job was cancelled by user');
          break;
        }
      }
      
      // Finalize job
      if (JOBS[jobId].status !== 'cancelled') {
        JOBS[jobId].status = 'completed';
        this.logInfo(jobId, 'Migration job completed');
      }
      
      // Clean up the temporary file
      fs.unlinkSync(filePath);
      
    } catch (error) {
      // Log the error
      this.logError(jobId, `Job failed: ${error.message}`);
      
      // Update job status
      if (JOBS[jobId]) {
        JOBS[jobId].status = 'failed';
        JOBS[jobId].updatedAt = new Date();
      }
      
      // Try to clean up the file
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (unlinkError) {
        // Ignore unlink errors
      }
    }
  },
  
  // Process a batch of rows
  async processBatch(jobId, worksheet, headers, startRow, endRow) {
    const job = JOBS[jobId];
    if (!job) return;
    
    this.logInfo(jobId, `Processing batch from row ${startRow} to ${endRow}`);
    
    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
      // Skip processing if job was cancelled
      if (job.status === 'cancelled') break;
      
      const row = worksheet.getRow(rowNumber);
      const rawData = {};
      
      // Extract data from the row - ensure we handle empty cells properly
      headers.forEach((header, index) => {
        if (!header || header.trim() === '') return; // Skip empty headers
        
        // Excel headers are 1-based, and we shifted earlier
        const cell = row.getCell(index + 1);
        let cellValue = cell.value;
        
        // Handle different cell types
        if (cell.type === Excel.ValueType.Hyperlink && cellValue && cellValue.text) {
          cellValue = cellValue.text;
        } else if (cell.type === Excel.ValueType.RichText && cellValue && cellValue.richText) {
          cellValue = cellValue.richText.map(rt => rt.text).join('');
        } else if (cell.type === Excel.ValueType.Formula) {
          cellValue = cell.result; // Use formula result
        }
        
        // Assign value to rawData if it's not null/undefined
        if (cellValue !== null && cellValue !== undefined) {
          rawData[header] = cellValue;
        }
      });
      
      // Skip empty rows
      if (Object.keys(rawData).length === 0) {
        this.logInfo(jobId, `Skipping empty row ${rowNumber}`);
        job.processed++;
        continue;
      }
      
      console.log(`Raw data row ${rowNumber}:`, JSON.stringify(rawData));
      
      // Process this record
      try {
        await this.processRecord(jobId, rawData, rowNumber);
      } catch (error) {
        this.logError(jobId, `Error processing row ${rowNumber}: ${error.message}`, { 
          row: rowNumber, 
          error: error.message,
          stack: error.stack
        });
        
        // Continue with next record despite errors
        job.results.error++;
      }
      
      // Update progress
      job.processed++;
      job.progress = Math.floor((job.processed / job.total) * 100);
      job.updatedAt = new Date();
    }
  },
  
  // Process a single record
  async processRecord(jobId, rawData, rowNumber) {
    try {
      const job = JOBS[jobId];
      
      console.log(`Processing record from row ${rowNumber}:`, JSON.stringify({
        name_code: rawData.Name_Code,
        add_id: rawData.Add_Id,
        row: rowNumber
      }));
      
      // Apply transformations to data (trimming, etc.)
      const processedData = this.transformData(rawData);
      
      // Validate the data
      const validationResult = this.validateData(processedData);
      
      if (!validationResult.isValid) {
        // Log the validation errors with more details
        const errorDetails = validationResult.errors.map(err => {
          return `${err.field}: ${err.message} (Value: ${JSON.stringify(err.value)})`;
        }).join(', ');
        
        console.log(`Row ${rowNumber} validation failed:`, JSON.stringify({
          name_code: rawData.Name_Code || 'unknown',
          add_id: rawData.Add_Id || 'unknown',
          errors: validationResult.errors
        }, null, 2));
        
        this.logError(jobId, `Row ${rowNumber}: Validation failed - ${errorDetails}`, {
          row: rowNumber,
          rawData,
          errors: validationResult.errors
        });
        
        // Store the failed record with more information for reporting
        if (!job.invalid) job.invalid = [];
        job.invalid.push({
          row: rowNumber,
          name_code: rawData.Name_Code || 'unknown',
          add_id: rawData.Add_Id || 'unknown',
          errors: validationResult.errors.map(err => `${err.field}: ${err.message}`)
        });
        
        job.results.error++;
        return;
      }
      
      // Check for warnings
      if (validationResult.warnings.length > 0) {
        const warningDetails = validationResult.warnings.map(w => {
          return `${w.field}: ${w.message} (Value: ${JSON.stringify(w.value)})`;
        }).join(', ');
        
        console.log(`Row ${rowNumber} has warnings:`, JSON.stringify({
          name_code: rawData.Name_Code || 'unknown',
          add_id: rawData.Add_Id || 'unknown',
          warnings: validationResult.warnings
        }, null, 2));
        
        this.logWarning(jobId, `Row ${rowNumber}: Has warnings - ${warningDetails}`, {
          row: rowNumber,
          warnings: validationResult.warnings
        });
        
        job.results.warning++;
      }
      
      // Insert the data with proper error handling
      console.log(`Inserting data for row ${rowNumber}`);
      const insertResult = await this.insertMigrationData(processedData);
      
      if (!insertResult.success) {
        this.logError(jobId, `Row ${rowNumber}: Failed to insert - ${insertResult.message}`, {
          row: rowNumber,
          error: insertResult.message
        });
        job.results.error++;
        return;
      }
      
      // Log success
      console.log(`Row ${rowNumber} processed successfully:`, JSON.stringify({
        name_code: rawData.Name_Code || 'unknown',
        add_id: rawData.Add_Id || 'unknown',
        guestId: insertResult.guestId,
        receiptId: insertResult.receiptId,
        donationId: insertResult.donationId
      }));
      
      this.logInfo(jobId, `Row ${rowNumber}: Successfully processed and inserted into database`);
      job.results.success++;
      
    } catch (error) {
      // Log processing error
      console.error(`Row ${rowNumber} processing failed:`, error.message, error.stack);
      
      this.logError(jobId, `Row ${rowNumber}: Processing failed - ${error.message}`, {
        row: rowNumber,
        error: error.message,
        stack: error.stack
      });
      
      JOBS[jobId].results.error++;
    }
  },
  
  // Transform the data (apply trimming, date conversions, etc.)
  transformData(rawData) {
    const result = {};
    
    // Process each field - case-insensitive matching
    Object.keys(rawData).forEach(key => {
      const value = rawData[key];
      
      // Skip null or undefined values
      if (value === null || value === undefined) {
        return;
      }
      
      // Try to find a match in fieldMappings (case-insensitive)
      let fieldConfig = null;
      
      // First try exact match
      if (fieldMappings[key]) {
        fieldConfig = fieldMappings[key];
      } else {
        // Try case-insensitive match
        const lowerKey = key.toLowerCase();
        const mappingKey = Object.keys(fieldMappings).find(k => 
          k.toLowerCase() === lowerKey
        );
        
        if (mappingKey) {
          fieldConfig = fieldMappings[mappingKey];
        } else {
          // Default mapping based on common patterns
          if (lowerKey.includes('name') && !lowerKey.includes('bank')) {
            fieldConfig = { key: 'name', type: 'name' };
          } else if (lowerKey.includes('mobile') || lowerKey.includes('phone')) {
            fieldConfig = { key: 'mobile', type: 'mobile' };
          } else if (lowerKey.includes('email')) {
            fieldConfig = { key: 'email', type: 'email' };
          } else if (lowerKey.includes('pan')) {
            fieldConfig = { key: 'pan', type: 'pan' };
          } else if (lowerKey.includes('amount')) {
            fieldConfig = { key: 'amount', type: 'number' };
          } else if (lowerKey.includes('date')) {
            fieldConfig = { key: 'date', type: 'date' };
          } else if (lowerKey.includes('receipt') && (lowerKey.includes('no') || lowerKey.includes('number'))) {
            fieldConfig = { key: 'receipt_number', type: 'text' };
          } else if (lowerKey.includes('id') && !lowerKey.includes('receipt')) {
            fieldConfig = { key: 'add_id', type: 'text' };
          } else if (lowerKey.includes('mode') || lowerKey.includes('transaction')) {
            fieldConfig = { key: 'transaction_type', type: 'text' };
          } else if (lowerKey.includes('purpose')) {
            fieldConfig = { key: 'purpose', type: 'text' };
          } else {
            // Default fallback
            fieldConfig = { key: key.toLowerCase(), type: 'text' };
          }
        }
      }
      
      const mappedKey = fieldConfig.key;
      
      // Apply transformations based on field type
      if (fieldConfig.type === 'date') {
        result[mappedKey] = helpers.formatDate(value);
      } else if (fieldConfig.type === 'number') {
        const numValue = parseFloat(value);
        result[mappedKey] = isNaN(numValue) ? value : numValue;
      } else {
        result[mappedKey] = helpers.cleanField(value, fieldConfig.type);
      }
    });
    
    // Special handling for name field
    if (!result.name) {
      // Try Actual_Name first
      if (rawData['Actual_Name'] || rawData['Actual Name']) {
        result.name = helpers.cleanField(rawData['Actual_Name'] || rawData['Actual Name'], 'name');
      }
      // If still no name, try Name_Code
      if (!result.name && (rawData['Name_Code'] || rawData['Name Code'])) {
        result.name = helpers.cleanField(rawData['Name_Code'] || rawData['Name Code'], 'name');
      }
    }
    
    // Special handling for add_id
    if (!result.add_id && rawData['Add_Id']) {
      result.add_id = rawData['Add_Id'];
    }
    if (!result.add_id && rawData['booking details_booking_id']) {
      result.add_id = rawData['booking details_booking_id'];
    }
    
    // Log the cleaned data
    console.log('Cleaned data:', {
      original: {
        name_code: rawData['Name_Code'] || rawData['Name Code'],
        actual_name: rawData['Actual_Name'] || rawData['Actual Name']
      },
      cleaned: {
        name: result.name,
        name_code: result.name_code,
        add_id: result.add_id
      }
    });
    
    return result;
  },
  
  // Validate the data
  validateData(data) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    console.log("Validating data:", JSON.stringify(data, null, 2));
    
    // Only require name field if it's not from a numeric-only name_code
    // (numeric-only name_codes are often just mobile numbers)
    const isNumericNameCode = data.name_code && /^\d+$/.test(data.name_code);
    
    // Check required fields with more flexibility
    const requiredFields = [];
    
    // Name is required if it's not a numeric-only name_code
    if (!isNumericNameCode) {
      requiredFields.push('name');
    }
    
    // Amount is required for donations
    requiredFields.push('amount');
    
    // Validate required fields
    requiredFields.forEach(field => {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        result.isValid = false;
        const error = {
          field,
          message: 'Field is required',
          value: data[field]
        };
        console.log(`Validation error: ${field} is required, got ${JSON.stringify(data[field])}`);
        result.errors.push(error);
      }
    });
    
    // Validate amount if present - be more flexible with parsing
    if (data.amount !== undefined && data.amount !== null) {
      let isValidAmount = false;
      let amount;
      
      // Try different parsing approaches
      if (typeof data.amount === 'number') {
        isValidAmount = true;
        amount = data.amount;
      } else if (typeof data.amount === 'string') {
        // Remove commas, currency symbols, etc.
        const cleanAmount = data.amount.replace(/[^\d.-]/g, '');
        amount = parseFloat(cleanAmount);
        isValidAmount = !isNaN(amount);
      }
      
      if (!isValidAmount) {
        result.isValid = false;
        result.errors.push({
          field: 'amount',
          message: 'Amount must be a valid number',
          value: data.amount
        });
      } else if (amount <= 0) {
        // Warning for zero or negative amounts
        result.warnings.push({
          field: 'amount',
          message: 'Amount should be greater than zero',
          value: amount
        });
      }
    }
    
    // Validate mobile number if present
    if (data.mobile && !helpers.isValidMobile(data.mobile)) {
      const warning = {
        field: 'mobile',
        message: 'Mobile number format may be invalid',
        value: data.mobile
      };
      console.log(`Validation warning: mobile - ${data.mobile} has invalid format`);
      result.warnings.push(warning);
    }
    
    // Validate PAN if present
    if (data.pan && !helpers.isValidPAN(data.pan)) {
      const warning = {
        field: 'pan',
        message: 'PAN format may be invalid',
        value: data.pan
      };
      console.log(`Validation warning: PAN - ${data.pan} has invalid format`);
      result.warnings.push(warning);
    }
    
    // Validate email if present
    if (data.email && !helpers.isValidEmail(data.email)) {
      const warning = {
        field: 'email',
        message: 'Email format is invalid',
        value: data.email
      };
      console.log(`Validation warning: email - ${data.email} has invalid format`);
      result.warnings.push(warning);
    }
    
    // Check for date validations
    Object.entries(data).forEach(([field, value]) => {
      if (field.toLowerCase().includes('date') && value) {
        const formattedDate = helpers.formatDate(value);
        if (!formattedDate) {
          const warning = {
            field,
            message: 'Date format is invalid',
            value
          };
          console.log(`Validation warning: ${field} - ${value} has invalid date format`);
          result.warnings.push(warning);
        }
      }
    });
    
    // Log validation result
    if (!result.isValid) {
      console.log(`Validation failed with ${result.errors.length} errors and ${result.warnings.length} warnings`);
    } else if (result.warnings.length > 0) {
      console.log(`Validation passed with ${result.warnings.length} warnings`);
    } else {
      console.log("Validation passed with no issues");
    }
    
    return result;
  },
  
  // Insert data into the database
  async insertMigrationData(data) {
    try {
      console.log('Inserting migration data:', JSON.stringify(data, null, 2));
      
      // Check if this is a valid data object
      if (!data || !data.name) {
        console.log('Invalid data object, skipping insert');
        return { success: false, message: 'Invalid data object' };
      }
      
      // Extract the add_id as unique identifier
      const addId = data.add_id || data.name_code;
      if (!addId) {
        console.log('No add_id or name_code available, cannot identify user uniquely');
        return { success: false, message: 'Missing unique identifier' };
      }
      
      console.log(`Looking for existing guest with unique_no: ${addId}`);
      
      // First, check if guest already exists with this add_id
      const existingGuests = await strapi.entityService.findMany('api::guest-detail.guest-detail', {
        filters: {
          unique_no: addId,
        },
      });
      
      console.log(`Found ${existingGuests ? existingGuests.length : 0} existing guests with unique_no: ${addId}`);
      
      let guestId;
      
      // If guest doesn't exist, create a new one
      if (!existingGuests || existingGuests.length === 0) {
        console.log(`Creating new guest with add_id: ${addId}`);
        
        // Prepare guest data
        const guestData = {
          name: data.name,
          phone_number: data.mobile || '',
          email: data.email || '',
          pan_number: data.pan || '',
          unique_no: addId, // Use add_id as the unique identifier
          publishedAt: new Date(),
        };
        
        console.log(`Guest creation data:`, JSON.stringify(guestData, null, 2));
        
        try {
          // Create the guest
          const newGuest = await strapi.entityService.create('api::guest-detail.guest-detail', {
            data: guestData,
          });
          
          guestId = newGuest.id;
          console.log(`Created new guest with ID: ${guestId}`);
        } catch (guestError) {
          console.error(`Failed to create guest:`, guestError.message, guestError.stack);
          return { success: false, message: `Failed to create guest: ${guestError.message}` };
        }
      } else {
        // Use existing guest
        guestId = existingGuests[0].id;
        console.log(`Using existing guest with ID: ${guestId}`);
      }
      
      // Now create the receipt
      const receiptDate = data.date 
        ? new Date(data.date).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];
      
      const receiptData = {
        donation_date: receiptDate,
        Receipt_number: data.receipt_number || `REC-${Date.now()}`,
        publishedAt: new Date(),
      };
      
      console.log(`Receipt creation data:`, JSON.stringify(receiptData, null, 2));
      
      let newReceipt;
      try {
        newReceipt = await strapi.entityService.create('api::receipt-detail.receipt-detail', {
          data: receiptData,
        });
        
        console.log(`Created new receipt with ID: ${newReceipt.id}`);
      } catch (receiptError) {
        console.error(`Failed to create receipt:`, receiptError.message, receiptError.stack);
        return { success: false, message: `Failed to create receipt: ${receiptError.message}` };
      }
      
      // Finally create the donation - ensure amount is properly formatted
      const amount = typeof data.amount === 'number' ? data.amount : 
                    (typeof data.amount === 'string' ? parseFloat(data.amount.replace(/[^\d.-]/g, '')) : 0);
      
      // Make sure to use proper enums based on the schema
      let transactionType = 'Cash'; // Default
      if (data.transaction_type) {
        // Map to allowed enum values
        const typeMap = {
          'cash': 'Cash',
          'cheque': 'Cheque',
          'bank transfer': 'Bank Transfer',
          'bank': 'Bank Transfer',
          'transfer': 'Bank Transfer',
          'dd': 'DD',
          'm.o': 'M.O'
        };
        transactionType = typeMap[data.transaction_type.toLowerCase()] || 'Cash';
      }
      
      let donationFor = 'Math'; // Default
      if (data.donation_for) {
        // Map to allowed enum values
        donationFor = data.donation_for.toLowerCase().includes('mission') ? 'Mission' : 'Math';
      }
      
      // Create donation data with proper field names matching schema
      const donationData = {
        donationAmount: amount,
        transactionType: transactionType,
        donationFor: donationFor,
        purpose: data.purpose || 'General',
        guest: guestId,
        receipt_detail: newReceipt.id,
        status: 'completed',
      };
      
      // Add optional fields if they exist
      if (data.bank_name) donationData.bankName = data.bank_name;
      if (data.branch_name) donationData.branchName = data.branch_name;
      if (data.in_memory_of) donationData.InMemoryOf = data.in_memory_of;
      if (data.ddch_number) donationData.ddch_number = data.ddch_number;
      if (data.ddch_date) {
        try {
          const parsedDate = new Date(data.ddch_date);
          if (!isNaN(parsedDate.getTime())) {
            donationData.ddch_date = parsedDate.toISOString().split('T')[0];
          }
        } catch (dateError) {
          console.warn(`Could not parse ddch_date: ${data.ddch_date}`);
        }
      }
      
      console.log('Creating donation with data:', JSON.stringify(donationData, null, 2));
      
      let newDonation;
      try {
        // Create the donation
        newDonation = await strapi.entityService.create('api::donation.donation', {
          data: donationData,
        });
        
        console.log(`Created new donation with ID: ${newDonation.id}`);
      } catch (donationError) {
        console.error(`Failed to create donation:`, donationError.message, donationError.stack);
        return { success: false, message: `Failed to create donation: ${donationError.message}` };
      }
      
      console.log(`Successfully created all records: guest=${guestId}, receipt=${newReceipt.id}, donation=${newDonation.id}`);
      
      return {
        success: true,
        guestId,
        receiptId: newReceipt.id,
        donationId: newDonation.id,
      };
    } catch (error) {
      console.error('Error inserting migration data:', error.message, error.stack);
      return { success: false, message: error.message };
    }
  },
  
  // Log an informational message
  logInfo(jobId, message, data = {}) {
    if (!JOBS[jobId]) return;
    
    JOBS[jobId].logs.push({
      level: 'info',
      message,
      data,
      timestamp: new Date()
    });
  },
  
  // Log a warning message
  logWarning(jobId, message, data = {}) {
    if (!JOBS[jobId]) return;
    
    JOBS[jobId].logs.push({
      level: 'warning',
      message,
      data,
      timestamp: new Date()
    });
    
    JOBS[jobId].warnings.push({
      message,
      data,
      timestamp: new Date()
    });
  },
  
  // Log an error message
  logError(jobId, message, data = {}) {
    if (!JOBS[jobId]) return;
    
    JOBS[jobId].logs.push({
      level: 'error',
      message,
      data,
      timestamp: new Date()
    });
    
    JOBS[jobId].errors.push({
      message,
      data,
      timestamp: new Date()
    });
  },
  
  // Get job status
  getJobStatus(jobId) {
    return JOBS[jobId] || null;
  },
  
  // Get job logs
  getJobLogs(jobId) {
    if (!JOBS[jobId]) return [];
    return JOBS[jobId].logs;
  },
  
  // Get job results
  getJobResults(jobId) {
    if (!JOBS[jobId]) return null;
    
    return {
      status: JOBS[jobId].status,
      results: JOBS[jobId].results,
      errors: JOBS[jobId].errors,
      warnings: JOBS[jobId].warnings,
      processed: JOBS[jobId].processed,
      total: JOBS[jobId].total
    };
  },
  
  // Cancel a job
  cancelJob(jobId) {
    if (!JOBS[jobId]) return false;
    
    JOBS[jobId].status = 'cancelled';
    JOBS[jobId].updatedAt = new Date();
    this.logInfo(jobId, 'Job cancellation requested by user');
    
    return true;
  },
  
  // Generate a sample template
  generateTemplate() {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('MigrationTemplate');
    
    // Define columns
    worksheet.columns = [
      { header: 'name', key: 'name', width: 20 },
      { header: 'mobile', key: 'mobile', width: 15 },
      { header: 'email', key: 'email', width: 25 },
      { header: 'pan', key: 'pan', width: 15 },
      { header: 'amount', key: 'amount', width: 15 },
      { header: 'date', key: 'date', width: 15 }
      // Add all required columns
    ];
    
    // Add a sample row
    worksheet.addRow({
      name: 'John Doe',
      mobile: '9876543210',
      email: 'john@example.com',
      pan: 'ABCDE1234F',
      amount: 1000,
      date: new Date()
    });
    
    return workbook;
  },
  
  // Clean up old jobs
  cleanupOldJobs(maxAgeInHours = 24) {
    const maxAgeMs = maxAgeInHours * 60 * 60 * 1000;
    const now = Date.now(); // Use timestamp instead of Date object
    
    Object.keys(JOBS).forEach(jobId => {
      const job = JOBS[jobId];
      const jobCreatedAt = new Date(job.createdAt).getTime(); // Convert to timestamp
      const jobAge = now - jobCreatedAt;
      
      if (jobAge > maxAgeMs) {
        delete JOBS[jobId];
      }
    });
    
    return {
      remainingJobs: Object.keys(JOBS).length
    };
  }
}); 