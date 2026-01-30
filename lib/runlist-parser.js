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
    const vehicle = {
      vin: record[columnMappings.vin]?.trim(),
      year: parseInt(record[columnMappings.year]) || null,
      make: record[columnMappings.make]?.trim(),
      model: record[columnMappings.model]?.trim(),
      lane: columnMappings.lane ? record[columnMappings.lane]?.trim() : null,
      lot: columnMappings.lot ? record[columnMappings.lot]?.trim() : null
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
const OPTIONAL_FIELDS = ['lane', 'lot'];

module.exports = {
  parseRunlistWithMappings,
  getCSVHeaders,
  REQUIRED_FIELDS,
  OPTIONAL_FIELDS
};
