'use strict';

module.exports = {
  generateErrorReport(results) {
    // Handle undefined or null results
    if (!results) {
      return {
        summary: {
          total_records: 0,
          successful: 0,
          failed: 0,
          invalid: 0,
          skipped: 0
        },
        validation_errors: [],
        processing_errors: [{
          error: 'Failed to process data',
          severity: 'ERROR',
          recommendation: 'Please check the file format and try again'
        }],
        duplicate_records: [],
        data_quality_issues: []
      };
    }

    // Initialize arrays if they don't exist
    results.success = results.success || [];
    results.failed = results.failed || [];
    results.invalid = results.invalid || [];
    results.skipped = results.skipped || [];

    const report = {
      summary: {
        total_records: results.processed || 0,
        successful: results.success.length,
        failed: results.failed.length,
        invalid: results.invalid.length,
        skipped: results.skipped.length
      },
      validation_errors: [],
      processing_errors: [],
      duplicate_records: [],
      data_quality_issues: []
    };

    // Process invalid records (validation errors)
    if (Array.isArray(results.invalid)) {
      results.invalid.forEach(record => {
        // Extract field values from the errors if available
        const errorDetails = Array.isArray(record.errors) 
          ? record.errors.map(error => {
              // Try to extract field and value if it's in the format "field: message (got: value)"
              const match = typeof error === 'string' && error.match(/^([^:]+): ([^(]+) \(got: (.+)\)$/);
              if (match) {
                return {
                  field: match[1].trim(),
                  message: match[2].trim(),
                  value: match[3].trim()
                };
              }
              return { message: error };
            })
          : [{ message: 'Unknown validation error' }];
            
        console.log(`Adding validation error for ${record.name_code || record.add_id}:`, JSON.stringify(errorDetails, null, 2));
        
        report.validation_errors.push({
          name_code: record.name_code,
          add_id: record.add_id,
          errors: record.errors || ['Unknown validation error'],
          error_details: errorDetails,
          severity: 'ERROR',
          recommendation: this.getRecommendation(record.errors || [])
        });
      });
    }

    // Process failed records (processing errors)
    if (Array.isArray(results.failed)) {
      results.failed.forEach(record => {
        console.log(`Adding processing error for ${record.name_code || record.add_id}:`, record.error);
        
        report.processing_errors.push({
          name_code: record.name_code,
          add_id: record.add_id,
          error: record.error || 'Unknown error',
          severity: 'ERROR',
          recommendation: 'Check data format and try again'
        });
      });
    }

    // Process skipped records (duplicates)
    if (Array.isArray(results.skipped)) {
      results.skipped.forEach(record => {
        console.log(`Adding duplicate record for ${record.name_code || record.add_id}:`, record.reason);
        
        report.duplicate_records.push({
          name_code: record.name_code,
          add_id: record.add_id,
          reason: record.reason || 'Record already exists',
          severity: 'WARNING',
          recommendation: 'Record already exists in system'
        });
      });
    }

    // Add data quality warnings
    if (Array.isArray(results.success)) {
      results.success.forEach(record => {
        const qualityIssues = this.checkDataQuality(record);
        if (qualityIssues.length > 0) {
          report.data_quality_issues.push({
            name_code: record.name_code,
            issues: qualityIssues,
            severity: 'WARNING',
            recommendation: 'Consider updating these fields for better data quality'
          });
        }
      });
    }

    return report;
  },

  getRecommendation(errors) {
    const recommendations = {
      'Invalid phone number': 'Provide a valid 10-digit Indian phone number',
      'Invalid PAN number': 'PAN should be in format ABCDE1234F',
      'Invalid Aadhaar number': 'Aadhaar should be 12 digits',
      'Duplicate Name_Code': 'Use a unique identifier for each record',
      'Record already exists': 'Update existing record if needed'
    };

    return errors.map(error => {
      for (const [key, value] of Object.entries(recommendations)) {
        if (error.includes(key)) return value;
      }
      return 'Check and correct the data';
    });
  },

  checkDataQuality(record) {
    const issues = [];

    // Check for missing or incomplete data
    if (!record.phone_number) issues.push('Missing phone number');
    if (!record.email) issues.push('Missing email');
    if (!record.address || record.address.length < 10) issues.push('Incomplete address');
    if (!record.pan_number) issues.push('Missing PAN number');

    return issues;
  }
}; 