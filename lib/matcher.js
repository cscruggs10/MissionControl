const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Match a runlist vehicle against historical sales data
 * Historical sales data has truncated makes (e.g., "Chevro" for Chevrolet)
 * and short model names, while runlist has full makes in UPPERCASE
 * and full model/trim names.
 *
 * @param {Object} vehicle - Vehicle to match
 * @returns {Object} Match results
 */
async function matchVehicle(vehicle) {
  const { vin, year, make, model } = vehicle;

  if (!year || !make || !model) {
    return {
      matched: false,
      match_count: 0,
      match_strength: 'none',
      reason: 'Incomplete vehicle data'
    };
  }

  // 1. Check for exact VIN match (same vehicle sold before)
  const vinMatch = await pool.query(`
    SELECT
      COUNT(*) as count,
      MAX(date_sold) as last_sold,
      AVG(days_to_sell) as avg_days_to_sell
    FROM historical_sales
    WHERE vin = $1
  `, [vin]);

  if (vinMatch.rows[0].count > 0) {
    return {
      matched: true,
      match_count: parseInt(vinMatch.rows[0].count),
      match_strength: 'exact',
      match_type: 'VIN',
      last_sold_date: vinMatch.rows[0].last_sold,
      avg_days_to_sell: Math.round(vinMatch.rows[0].avg_days_to_sell),
      message: `This exact vehicle (VIN match) was sold ${vinMatch.rows[0].count} time(s) before`
    };
  }

  // 2. Year/Make match with fuzzy model matching
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

  // 3. Similar Year (±2 years) + Make/Model match (fuzzy)
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
  `, [make, model, year - 2, year + 2]);

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

  // 4. Make only match (any year, any model) - for makes that match
  const makeOnlyMatch = await pool.query(`
    SELECT
      COUNT(*) as count,
      MAX(date_sold) as last_sold,
      AVG(days_to_sell) as avg_days_to_sell,
      MIN(year) as min_year,
      MAX(year) as max_year
    FROM historical_sales
    WHERE UPPER($1) LIKE UPPER(make) || '%'
      AND year BETWEEN $2 AND $3
  `, [make, year - 3, year + 3]);

  if (makeOnlyMatch.rows[0].count > 0) {
    return {
      matched: true,
      match_count: parseInt(makeOnlyMatch.rows[0].count),
      match_strength: 'weak',
      match_type: 'Make Only',
      last_sold_date: makeOnlyMatch.rows[0].last_sold,
      avg_days_to_sell: Math.round(makeOnlyMatch.rows[0].avg_days_to_sell),
      message: `${makeOnlyMatch.rows[0].count} ${make} vehicles (${makeOnlyMatch.rows[0].min_year}-${makeOnlyMatch.rows[0].max_year})`
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
    SELECT id, vin, year, make, model 
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
