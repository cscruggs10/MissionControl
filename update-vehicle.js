#!/usr/bin/env node

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002';
const vehicleId = 93;

const updateData = {
  mileage: 50689,
  price: '13500',
  condition: 'Deal Machine Certified',
  description: '2024 Nissan Kicks S - 50,689 miles, Gun Metallic exterior, Black interior. Clean condition, no visible damage. 1.6L 4-cylinder, CVT transmission.',
  status: 'active',
  inQueue: true
};

async function updateVehicle() {
  console.log('Updating vehicle', vehicleId);
  console.log('Update data:', JSON.stringify(updateData, null, 2));

  try {
    const response = await fetch(`${API_URL}/api/vehicles/${vehicleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error updating vehicle:');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(result, null, 2));
      return;
    }

    console.log('\n✅ Successfully updated vehicle!');
    console.log('Full response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Failed to update vehicle:', error.message);
  }
}

updateVehicle();
