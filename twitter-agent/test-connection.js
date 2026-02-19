#!/usr/bin/env node
/**
 * Test Twitter API Connection
 * Verifies credentials and displays account info
 */

const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config({ path: '/root/clawd/.twitter-credentials' });

async function testConnection() {
  try {
    console.log('Testing Twitter API connection...\n');

    // Initialize client with OAuth 1.0a user context
    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY,
      appSecret: process.env.TWITTER_CONSUMER_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Get authenticated user's info
    const me = await client.v2.me();
    
    console.log('✅ Connection successful!\n');
    console.log('Account Details:');
    console.log(`  Username: @${me.data.username}`);
    console.log(`  Name: ${me.data.name}`);
    console.log(`  ID: ${me.data.id}`);
    console.log('\nReady to post! 🚀');

    return true;
  } catch (error) {
    console.error('❌ Connection failed:\n');
    console.error(error.message);
    if (error.data) {
      console.error('\nError details:', JSON.stringify(error.data, null, 2));
    }
    return false;
  }
}

testConnection();
