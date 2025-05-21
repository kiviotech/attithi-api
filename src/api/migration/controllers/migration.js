'use strict';

/**
 * Migration controller
 */

const { factories } = require('@strapi/strapi');
const xlsx = require('xlsx');

module.exports = factories.createCoreController('api::migration.migration', ({ strapi }) => ({
  async uploadFile(ctx) {
    try {
      // Check for files existence - using Koa's files property from the multipart middleware
      const files = ctx.request.files ? ctx.request.files : {};
      if (!files || !files.file) {
        return ctx.badRequest('No file with name "file" uploaded');
      }
      
      const uploadedFile = files.file;
      const filePath = typeof uploadedFile.path === 'string' ? uploadedFile.path : uploadedFile.path[0];
      
      // Process the upload asynchronously without awaiting
      const jobIdPromise = strapi.service('api::migration.migration').processUpload(filePath);
      
      // Start a timer to ensure we respond to the client quickly
      const timeoutPromise = new Promise(resolve => {
        // We'll wait at most 2 seconds before responding to ensure the client gets a quick response
        setTimeout(() => resolve('timeout'), 2000);
      });
      
      // Race between quick job creation and timeout
      const result = await Promise.race([jobIdPromise, timeoutPromise]);
      
      // If we timed out, we'll respond with a pending job status
      // The actual job will continue processing in the background
      if (result === 'timeout') {
        return ctx.send({
          status: 'pending',
          message: 'File upload received, processing has started'
        });
      }
      
      // If we got the job ID before timeout, return it
      return ctx.send({ jobId: result });
      
    } catch (error) {
      // Check if it's a known error type, otherwise send a generic message
      if (error.name === 'ValidationError' || error.name === 'ApplicationError') {
        return ctx.badRequest(error.message);
      } else {
        return ctx.internalServerError(`Import failed: ${error.message}`);
      }
    }
  },
  
  async checkProgress(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        return ctx.badRequest('Missing job ID');
      }
      
      const progress = await strapi.service('api::migration.migration').checkJobProgress(id);
      return ctx.send(progress);
    } catch (error) {
      return ctx.badRequest(`Failed to check progress: ${error.message}`);
    }
  },
  
  async getResults(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        return ctx.badRequest('Missing job ID');
      }
      
      const results = await strapi.service('api::migration.migration').getJobResults(id);
      return ctx.send(results);
    } catch (error) {
      return ctx.badRequest(`Failed to get results: ${error.message}`);
    }
  },
  
  async cancelJob(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        return ctx.badRequest('Missing job ID');
      }
      
      const result = await strapi.service('api::migration.migration').cancelJob(id);
      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(`Failed to cancel job: ${error.message}`);
    }
  },
  
  async getLogs(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        return ctx.badRequest('Missing job ID');
      }
      
      const logs = await strapi.service('api::migration.migration').getJobLogs(id);
      return ctx.send(logs);
    } catch (error) {
      return ctx.badRequest(`Failed to get logs: ${error.message}`);
    }
  },
  
  async downloadTemplate(ctx) {
    try {
      // Create sample data
      const sampleData = [
        {
          Name_Code: "TEST001",
          Add_Id: "ADD001",
          "Booking Details_Booking_Id": "BOOK20220315-0001",
          Receipt_Booking_Id: "REC001",
          "Receipt No": "R12345",
          MathOrMission: "Math",
          Actual_Name: "John Doe",
          Address1: "123 Main St",
          Address2: "Apt 4B",
          PO: "PO Box 123",
          Dist: "Kolkata",
          State: "West Bengal",
          Pin: "700001",
          Amount: "1000",
          Mode: "Cash",
          "Receipt Date": "03/15/2022",
          "DD/CH No": "",
          "DD/CH Date": "",
          Purpose: "General Donation",
          "PAN NO": "ABCDE1234F",
          "Bank Name": "",
          Name_Prefix: "Mr.",
          "Mobile No": "9876543210",
          "Landline No": "03322221111",
          "C/O": "",
          Country: "India"
        }
      ];

      // Create workbook
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(sampleData);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Legacy Data");
      
      // Generate buffer
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Set response headers
      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('Content-Disposition', 'attachment; filename="legacy_data_template.xlsx"');
      ctx.set('Content-Length', buffer.length);
      
      // Send file
      return ctx.body = buffer;
    } catch (error) {
      return ctx.badRequest(`Failed to generate template: ${error.message}`);
    }
  },
  
  async cleanupJobs(ctx) {
    try {
      // Only allow admin users to cleanup jobs
      if (!ctx.state.user || !ctx.state.user.roles.some(r => r.name === 'Admin')) {
        return ctx.unauthorized('Only administrators can clean up jobs');
      }
      
      const { hours } = ctx.request.query;
      const maxAgeHours = hours ? parseInt(hours, 10) : 24;
      
      const result = await strapi.service('api::migration.migration').cleanupOldJobs(maxAgeHours);
      return ctx.send(result);
    } catch (error) {
      return ctx.badRequest(`Failed to cleanup jobs: ${error.message}`);
    }
  }
})); 