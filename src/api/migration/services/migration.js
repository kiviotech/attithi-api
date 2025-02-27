'use strict';

const BATCH_SIZE = 100; // Process 100 records at a time

module.exports = {
  // Data validation rules
  validationRules: {
    isValidAadhaar: (number) => {
      if (!number) return false;
      const aadhaarPattern = /^\d{12}$/;
      return aadhaarPattern.test(number.replace(/\s/g, ''));
    },

    isValidPAN: (number) => {
      if (!number) return false;
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      return panPattern.test(number.replace(/\s/g, ''));
    },

    isValidPhone: (number) => {
      if (!number) return false;
      const phonePattern = /^(\+91)?[6-9]\d{9}$/;
      return phonePattern.test(number.replace(/\s/g, ''));
    },

    cleanString: (str) => {
      if (!str) return '';
      return str.trim().replace(/\s+/g, ' ');
    }
  },

  async importDonorData(data, progressCallback) {
    try {
      // Clean and validate data
      const cleanedData = await this.cleanAndValidateData(data);
      
      // Process in batches
      const batches = this.createBatches(cleanedData, BATCH_SIZE);
      
      const results = {
        success: [],
        failed: [],
        invalid: [],
        progress: 0
      };

      for (let i = 0; i < batches.length; i++) {
        const batchResults = await this.processBatch(batches[i]);
        
        results.success.push(...batchResults.success);
        results.failed.push(...batchResults.failed);
        results.invalid.push(...batchResults.invalid);
        
        // Update progress
        results.progress = ((i + 1) / batches.length) * 100;
        if (progressCallback) {
          progressCallback(results.progress);
        }
      }

      return results;
    } catch (error) {
      console.error('Data import failed:', error);
      throw error;
    }
  },

  async cleanAndValidateData(data) {
    // First, check for duplicates within the import data
    const duplicateNameCodes = this.findDuplicateNameCodes(data);

    // Get existing name codes from the database
    const existingNameCodes = await this.getExistingNameCodes();

    return Promise.all(data.map(async record => {
      const validationErrors = [];
      
      // Check for duplicates within import data
      if (duplicateNameCodes.has(record.Name_Code)) {
        validationErrors.push(`Duplicate Name_Code ${record.Name_Code} found in import data`);
      }

      // Check if record already exists in database
      if (existingNameCodes.has(record.Name_Code)) {
        validationErrors.push(`Name_Code ${record.Name_Code} already exists in the system`);
      }

      // Clean basic fields
      const cleanedRecord = {
        ...record,
        Actual_Name: this.validationRules.cleanString(record.Actual_Name),
        Address1: this.validationRules.cleanString(record.Address1),
        Address2: this.validationRules.cleanString(record.Address2),
        Mobile_No: record.Mobile_No?.replace(/\s/g, ''),
        PAN_NO: record.PAN_NO?.replace(/\s/g, '')
      };

      // Validate ID proofs
      if (record.identity_proof === 'aadhar' && !this.validationRules.isValidAadhaar(record.identity_number)) {
        validationErrors.push('Invalid Aadhaar number');
      }
      if (record.PAN_NO && !this.validationRules.isValidPAN(record.PAN_NO)) {
        validationErrors.push('Invalid PAN number');
      }

      // Handle phone number validation
      if (record.Mobile_No) {
        if (!this.validationRules.isValidPhone(record.Mobile_No)) {
          validationErrors.push('Invalid phone number');
          // If phone is invalid, try to extract from Name_Code if it looks like a phone number
          if (this.validationRules.isValidPhone(record.Name_Code)) {
            cleanedRecord.Mobile_No = record.Name_Code;
            validationErrors.pop(); // Remove the invalid phone error
          }
        }
      } else if (this.validationRules.isValidPhone(record.Name_Code)) {
        cleanedRecord.Mobile_No = record.Name_Code;
      }

      return {
        ...cleanedRecord,
        validationErrors,
        isValid: validationErrors.length === 0,
        existsInSystem: existingNameCodes.has(record.Name_Code)
      };
    }));
  },

  // Helper to find duplicate Name_Codes within import data
  findDuplicateNameCodes(data) {
    const nameCodes = new Set();
    const duplicates = new Set();
    
    data.forEach(record => {
      if (nameCodes.has(record.Name_Code)) {
        duplicates.add(record.Name_Code);
      }
      nameCodes.add(record.Name_Code);
    });
    
    return duplicates;
  },

  // Helper to get existing Name_Codes from database
  async getExistingNameCodes() {
    const existingGuests = await strapi.db.query('api::guest-detail.guest-detail').findMany({
      select: ['unique_no']
    });
    
    return new Set(existingGuests.map(guest => guest.unique_no));
  },

  createBatches(data, batchSize) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    return batches;
  },

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

        // Create guest
        const guest = await this.createOrUpdateGuest({
          name: record.Actual_Name,
          phone_number: record.Mobile_No || record.Name_Code,
          address: this.formatAddress(record),
          email: '',
          pan_number: record.PAN_NO || '',
          unique_no: record.Name_Code,
          status: 'approved',
          identity_proof: record.identity_proof || '',
          identity_number: record.identity_number || ''
        });

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
            amount: parseFloat(record.Amount) || 0,
            payment_mode: record.Mode || 'Cash',
            payment_date: this.parseDate(record.Receipt_Date),
            cheque_no: record.DD_CH_No || '',
            cheque_date: this.parseDate(record.DD_CH_Date),
            bank_name: record.Bank_Name || '',
            purpose: record.Purpose || ''
          });
        }

        results.success.push({
          name_code: record.Name_Code,
          guestId: guest.id
        });
      } catch (error) {
        results.failed.push({
          name_code: record.Name_Code,
          error: error.message
        });
      }
    }

    return results;
  },

  async createOrUpdateGuest(guestData) {
    try {
      // Check if guest exists by unique_no or phone_number
      let guest = await strapi.db.query('api::guest-detail.guest-detail').findOne({
        where: {
          $or: [
            { unique_no: guestData.unique_no },
            { phone_number: guestData.phone_number }
          ]
        }
      });

      if (guest) {
        // Update existing guest
        guest = await strapi.db.query('api::guest-detail.guest-detail').update({
          where: { id: guest.id },
          data: guestData
        });
      } else {
        // Create new guest
        guest = await strapi.db.query('api::guest-detail.guest-detail').create({
          data: {
            ...guestData,
            publishedAt: new Date()
          }
        });
      }

      return guest;
    } catch (error) {
      console.error('Guest creation failed:', error);
      throw error;
    }
  },

  async createReceiptDetail(receiptData) {
    try {
      const receipt = await strapi.db.query('api::receipt-detail.receipt-detail').create({
        data: {
          ...receiptData,
          publishedAt: new Date()
        }
      });
      return receipt;
    } catch (error) {
      console.error('Receipt creation failed:', error);
      throw error;
    }
  },

  async createDonation(donationData) {
    try {
      const donation = await strapi.db.query('api::donation.donation').create({
        data: {
          ...donationData,
          publishedAt: new Date()
        }
      });
      return donation;
    } catch (error) {
      console.error('Donation creation failed:', error);
      throw error;
    }
  },

  formatAddress(data) {
    const parts = [
      data.Address1,
      data.Address2,
      data.PO,
      data.Dist,
      data.State,
      data.Pin
    ].filter(Boolean);
    return parts.join(', ');
  },

  parseDate(dateString) {
    if (!dateString) return null;
    try {
      // Assuming date format is MM/DD/YY
      const [month, day, year] = dateString.split('/');
      return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (error) {
      console.error('Date parsing failed:', dateString);
      return null;
    }
  }
}; 