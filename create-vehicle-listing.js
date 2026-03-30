#!/usr/bin/env node

// Script to create a Deal Machine vehicle listing
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'https://newdealmachine.up.railway.app';

const vehicleData = {
  vin: '3N1CP5BV3RL594830',
  mileage: 50689,
  price: '13500',
  condition: 'Deal Machine Certified',
  videos: ['https://res.cloudinary.com/dcpy2x17s/video/upload/v1773159818/deal-machine-uploads/qjfr9ctqqq0bfkaasuld.mp4'],
  description: '2024 Nissan Kicks S - 50,689 miles, Gun Metallic exterior, Black interior. Clean condition, no visible damage. 1.6L 4-cylinder, CVT transmission.',
  // Optional recon fields
  reconExterior: 'None Found',
  reconMechanical: 'None Found',
  reconInterior: 'None Found'
};

async function createListing() {
  console.log('Creating Deal Machine listing...');
  console.log('API URL:', API_URL);
  console.log('Vehicle Data:', JSON.stringify(vehicleData, null, 2));

  try {
    const response = await fetch(`${API_URL}/api/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error creating listing:');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(result, null, 2));
      return;
    }

    console.log('\n✅ Successfully created listing!');
    console.log('Vehicle ID:', result.id);
    console.log('VIN:', result.vin);
    console.log('Year:', result.year);
    console.log('Make:', result.make);
    console.log('Model:', result.model);
    console.log('Trim:', result.trim);
    console.log('Price:', result.price);
    console.log('Status:', result.status);
    console.log('\nFull response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Failed to create listing:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

createListing();
