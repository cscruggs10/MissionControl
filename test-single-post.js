#!/usr/bin/env node

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002';

// Test with all fields in one POST
const vehicleData = {
  vin: '1N4BL4DV4RN370015',
  videos: ['https://res.cloudinary.com/dcpy2x17s/video/upload/v1773177425/deal-machine-uploads/hlc8gj4yox9sxah3pums.mp4'],
  mileage: 59938,
  price: '15500',
  condition: 'Deal Machine Certified',
  description: '2024 Nissan Altima 2.5 - Clean, white exterior, black interior',
  reconExterior: 'None Found',
  reconMechanical: 'None Found',
  reconInterior: 'None Found'
};

async function testSinglePost() {
  console.log('Testing single POST with complete data...');
  console.log('Data:', JSON.stringify(vehicleData, null, 2));

  try {
    const response = await fetch(`${API_URL}/api/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', result);
      return;
    }

    console.log('\n✅ SUCCESS - Created in ONE step!');
    console.log('Vehicle ID:', result.id);
    console.log('VIN:', result.vin);
    console.log('Year/Make/Model:', `${result.year} ${result.make} ${result.model}`);
    console.log('Mileage:', result.mileage);
    console.log('Price:', result.price);
    console.log('Condition:', result.condition);
    console.log('Status:', result.status);
    console.log('In Queue:', result.inQueue);

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testSinglePost();
