'use strict';

const xlsx = require('xlsx');
const fs = require('fs');

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

      // Check file size (5MB limit)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        return ctx.badRequest('File size exceeds 5MB limit');
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
      
      // Convert to JSON (limit to 100 records)
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

      if (data.length > 100) {
        data = data.slice(0, 100);
      }

      // Create a unique job ID
      const jobId = Date.now().toString();
      global.migrationProgress = global.migrationProgress || {};
      global.migrationProgress[jobId] = 0;

      let results;
      try {
        // Start the import process
        results = await strapi.service('api::migration.migration').importDonorData(
          data,
          (progress) => {
            global.migrationProgress[jobId] = progress;
          }
        );
      } catch (error) {
        console.error('Data import error:', error);
        results = {
          success: [],
          failed: [{ error: error.message }],
          invalid: [],
          skipped: [],
          processed: data.length
        };
      }

      // Generate error report
      const errorReport = await strapi.service('api::migration.error-report').generateErrorReport(results);

      return {
        success: true,
        jobId,
        processed: data.length,
        successful: results?.success?.length || 0,
        failed: results?.failed?.length || 0,
        invalid: results?.invalid?.length || 0,
        skipped: results?.skipped?.length || 0,
        error_report: errorReport,
        details: {
          success: results?.success || [],
          failed: results?.failed || [],
          invalid: results?.invalid || [],
          skipped: results?.skipped || []
        }
      };

    } catch (error) {
      console.error('Excel upload failed:', error);
      return ctx.badRequest(`Excel upload failed: ${error.message}`);
    }
  },

  async importData(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!Array.isArray(data)) {
        return ctx.badRequest('Data must be an array');
      }

      // Create a unique job ID for this import
      const jobId = Date.now().toString();

      // Store progress in memory (in production, use Redis or similar)
      global.migrationProgress = global.migrationProgress || {};
      global.migrationProgress[jobId] = 0;

      // Start the import process
      const results = await strapi.service('api::migration.migration').importDonorData(
        data,
        (progress) => {
          global.migrationProgress[jobId] = progress;
        }
      );

      return {
        success: true,
        jobId,
        processed: data.length,
        successful: results.success.length,
        failed: results.failed.length,
        invalid: results.invalid.length,
        skipped: results.skipped.length,
        details: {
          success: results.success,
          failed: results.failed,
          invalid: results.invalid,
          skipped: results.skipped
        }
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  // Add endpoint to check progress
  async checkProgress(ctx) {
    try {
      const { jobId } = ctx.params;
      
      if (!global.migrationProgress || !global.migrationProgress[jobId]) {
        return ctx.notFound('Job not found');
      }

      return {
        jobId,
        progress: global.migrationProgress[jobId]
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}; 