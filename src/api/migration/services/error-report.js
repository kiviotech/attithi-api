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
        report.validation_errors.push({
          name_code: record.name_code,
          errors: record.errors || ['Unknown validation error'],
          severity: 'ERROR',
          recommendation: this.getRecommendation(record.errors || [])
        });
      });
    }

    // Process failed records (processing errors)
    if (Array.isArray(results.failed)) {
      results.failed.forEach(record => {
        report.processing_errors.push({
          name_code: record.name_code,
          error: record.error || 'Unknown error',
          severity: 'ERROR',
          recommendation: 'Check data format and try again'
        });
      });
    }

    // Process skipped records (duplicates)
    if (Array.isArray(results.skipped)) {
      results.skipped.forEach(record => {
        report.duplicate_records.push({
          name_code: record.name_code,
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