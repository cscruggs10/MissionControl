const { parse } = require('csv-parse/sync');
const fs = require('fs');

/**
 * Parse a runlist CSV file using provided column mappings
 * @param {string} filePath - Path to CSV file
 * @param {Object} columnMappings - Column name mappings (e.g., { vin: 'VIN', year: 'Year', ... })
 * @returns {Array} Parsed vehicle records
 */
function parseRunlistWithMappings(filePath, columnMappings) {
  const csvContent = fs.readFileSync(filePath, 'utf-8');

  // Parse CSV with headers
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true
  });

  if (records.length === 0) {
    return [];
  }

  // Transform records using column mapping
  // Only extract fields that exist in the database
  const vehicles = records.map(record => {
    let lane = columnMappings.lane ? record[columnMappings.lane]?.trim() : null;
    let lot = columnMappings.lot ? record[columnMappings.lot]?.trim() : null;

    // Handle combined lane_run field (e.g., "1-41" -> lane: 1, lot: 41)
    if (columnMappings.lane_run) {
      const combined = record[columnMappings.lane_run]?.trim();
      if (combined && combined.includes('-')) {
        const parts = combined.split('-');
        lane = parts[0]?.trim();
        lot = parts[1]?.trim();
      } else if (combined) {
        // If no dash, treat as lot/run number
        lot = combined;
      }
    }

    // Parse mileage - handle commas and various formats
    let mileage = null;
    if (columnMappings.mileage) {
      const mileageStr = record[columnMappings.mileage]?.trim();
      if (mileageStr) {
        // Remove commas, dollar signs, and non-numeric chars except decimals
        const cleaned = mileageStr.replace(/[,$]/g, '').replace(/[^\d.]/g, '');
        mileage = parseInt(cleaned) || null;
      }
    }

    const vehicle = {
      vin: record[columnMappings.vin]?.trim(),
      year: parseInt(record[columnMappings.year]) || null,
      make: record[columnMappings.make]?.trim(),
      model: record[columnMappings.model]?.trim(),
      mileage,
      lane,
      lot
    };

    return vehicle;
  }).filter(v => v.vin && v.vin.length >= 10); // Must have valid VIN

  return vehicles;
}

/**
 * Get CSV headers from a file
 */
function getCSVHeaders(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true,
    to: 1
  });

  if (records.length === 0) {
    return [];
  }

  return Object.keys(records[0]);
}

// Required fields for mapping
const REQUIRED_FIELDS = ['vin', 'year', 'make', 'model'];

// Optional fields for mapping (only ones that exist in database)
// lane_run is for combined columns like "1-41" that split into lane and lot
const OPTIONAL_FIELDS = ['lane', 'lot', 'lane_run', 'mileage'];

module.exports = {
  parseRunlistWithMappings,
  getCSVHeaders,
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS
};
