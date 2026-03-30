#!/usr/bin/env node

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002';

const vehicleData = {
  vin: '1N4BL4DV4RN370015',
  mileage: 59938,
  price: '17200',
  condition: 'Deal Machine Certified',
  videos: ['https://res.cloudinary.com/dcpy2x17s/video/upload/v1773177425/deal-machine-uploads/hlc8gj4yox9sxah3pums.mp4'],
  description: '2024 Nissan Altima 2.5 - 59,938 miles, White exterior, Black interior. Clean condition, no visible damage.',
  reconExterior: 'None Found',
  reconMechanical: 'None Found',
  reconInterior: 'None Found'
};

async function createAndUpdateListing() {
  console.log('Creating Deal Machine listing for 2024 Nissan Altima...');

  try {
    // Step 1: Create vehicle with VIN
    const createResponse = await fetch(`${API_URL}/api/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData)
    });

    const vehicle = await createResponse.json();

    if (!createResponse.ok) {
      console.error('Error creating listing:', vehicle);
      return;
    }

    console.log(`✅ Vehicle created with ID: ${vehicle.id}`);

    // Step 2: Update with full details
    const updateData = {
      mileage: vehicleData.mileage,
      price: vehicleData.price,
      condition: vehicleData.condition,
      description: vehicleData.description,
      status: 'active',
      inQueue: true
    };

    const updateResponse = await fetch(`${API_URL}/api/vehicles/${vehicle.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const updated = await updateResponse.json();

    if (!updateResponse.ok) {
      console.error('Error updating vehicle:', updated);
      return;
    }

    console.log('\n✅ Successfully listed on Deal Machine!');
    console.log('Vehicle ID:', updated.id);
    console.log('VIN:', updated.vin);
    console.log('Year/Make/Model:', `${updated.year} ${updated.make} ${updated.model}`);
    console.log('Mileage:', updated.mileage);
    console.log('Price: $' + updated.price);
    console.log('Status:', updated.status);

  } catch (error) {
    console.error('Failed to create listing:', error.message);
  }
}

createAndUpdateListing();
