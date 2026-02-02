const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Mileage filter range
const MIN_MILEAGE = 40000;
const MAX_MILEAGE = 150000;

/**
 * Match a runlist vehicle against historical sales data
 * Historical sales data has truncated makes (e.g., "Chevro" for Chevrolet)
 * and short model names, while runlist has full makes in UPPERCASE
 * and full model/trim names.
 *
 * Matching tiers:
 * 1. Exact Year/Make/Model (strong match)
 * 2. Similar Year (±1) + Make/Model (moderate match)
 *
 * Filters:
 * - Mileage must be between 40,000 and 150,000
 *
 * @param {Object} vehicle - Vehicle to match
 * @returns {Object} Match results
 */
async function matchVehicle(vehicle) {
  const { year, make, model, mileage } = vehicle;

  if (!year || !make || !model) {
    return {
      matched: false,
      match_count: 0,
      match_strength: 'none',
      reason: 'Incomplete vehicle data'
    };
  }

  // Filter by mileage range (40k - 150k)
  if (!mileage || mileage < MIN_MILEAGE || mileage > MAX_MILEAGE) {
    return {
      matched: false,
      match_count: 0,
      match_strength: 'none',
      reason: mileage ? `Mileage ${mileage.toLocaleString()} outside range (${MIN_MILEAGE.toLocaleString()}-${MAX_MILEAGE.toLocaleString()})` : 'No mileage data'
    };
  }

  // 1. Exact Year/Make/Model match (fuzzy for truncated makes/models)
  // Historical data has truncated makes (e.g., "Chevro") and may have different model formats
  // Use case-insensitive prefix matching for make, and check if model contains or starts with historical model
  const ymmMatch = await pool.query(`
    SELECT
      COUNT(*) as count,
      MAX(date_sold) as last_sold,
      AVG(days_to_sell) as avg_days_to_sell
    FROM historical_sales
    WHERE year = $1
      AND UPPER($2) LIKE UPPER(make) || '%'
      AND (UPPER(model) = UPPER($3) OR UPPER($3) LIKE UPPER(model) || '%')
  `, [year, make, model]);

  if (ymmMatch.rows[0].count > 0) {
    return {
      matched: true,
      match_count: parseInt(ymmMatch.rows[0].count),
      match_strength: 'strong',
      match_type: 'YMM',
      last_sold_date: ymmMatch.rows[0].last_sold,
      avg_days_to_sell: Math.round(ymmMatch.rows[0].avg_days_to_sell),
      message: `${ymmMatch.rows[0].count} similar vehicle(s): ${year} ${make} ${model}`
    };
  }

  // 2. Similar Year (±1 year) + Make/Model match (fuzzy)
  const similarMatch = await pool.query(`
    SELECT
      COUNT(*) as count,
      MAX(date_sold) as last_sold,
      AVG(days_to_sell) as avg_days_to_sell,
      MIN(year) as min_year,
      MAX(year) as max_year
    FROM historical_sales
    WHERE UPPER($1) LIKE UPPER(make) || '%'
      AND (UPPER(model) = UPPER($2) OR UPPER($2) LIKE UPPER(model) || '%')
      AND year BETWEEN $3 AND $4
  `, [make, model, year - 1, year + 1]);

  if (similarMatch.rows[0].count > 0) {
    return {
      matched: true,
      match_count: parseInt(similarMatch.rows[0].count),
      match_strength: 'moderate',
      match_type: 'Similar YMM',
      last_sold_date: similarMatch.rows[0].last_sold,
      avg_days_to_sell: Math.round(similarMatch.rows[0].avg_days_to_sell),
      message: `${similarMatch.rows[0].count} similar vehicle(s): ${similarMatch.rows[0].min_year}-${similarMatch.rows[0].max_year} ${make} ${model}`
    };
  }

  // No match found
  return {
    matched: false,
    match_count: 0,
    match_strength: 'none',
    match_type: null,
    message: 'No similar vehicles found in history'
  };
}

/**
 * Match all vehicles in a runlist
 * @param {number} runlistId - Runlist ID
 */
async function matchRunlist(runlistId) {
  // Get all vehicles for this runlist
  const vehicles = await pool.query(`
    SELECT id, vin, year, make, model, mileage
    FROM runlist_vehicles
    WHERE runlist_id = $1
  `, [runlistId]);
  
  let matchedCount = 0;
  
  for (const vehicle of vehicles.rows) {
    const matchResult = await matchVehicle(vehicle);
    
    // Update vehicle with match results
    await pool.query(`
      UPDATE runlist_vehicles
      SET
        matched = $1,
        match_count = $2
      WHERE id = $3
    `, [
      matchResult.matched,
      matchResult.match_count,
      vehicle.id
    ]);
    
    if (matchResult.matched) {
      matchedCount++;
    }
  }
  
  // Update runlist stats
  await pool.query(`
    UPDATE runlists
    SET 
      matched_vehicles = $1,
      status = 'matched'
    WHERE id = $2
  `, [matchedCount, runlistId]);
  
  return {
    total: vehicles.rows.length,
    matched: matchedCount,
    unmatched: vehicles.rows.length - matchedCount
  };
}

module.exports = {
  matchVehicle,
  matchRunlist
};
