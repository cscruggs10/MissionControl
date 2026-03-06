#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Path to credentials
const CREDENTIALS_PATH = path.join(__dirname, '..', '.credentials', 'gmail-oauth.json');
const TOKEN_PATH = path.join(__dirname, '..', '.credentials', 'gmail-token.json');

// Gmail API scopes
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify'
];

async function authorize() {
  // Load credentials
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we already have a token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    console.log('✅ Already authenticated!');
    return oAuth2Client;
  }

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 Gmail Authentication Required\n');
  console.log('1. Open this URL in your browser:');
  console.log('\n' + authUrl + '\n');
  console.log('2. Sign in as: iris@ifinancememphis.com');
  console.log('3. Grant access to the requested permissions');
  console.log('4. Copy the authorization code from the browser');
  console.log('\nPaste the authorization code here: ');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('❌ Error retrieving access token:', err);
          reject(err);
          return;
        }
        oAuth2Client.setCredentials(token);
        
        // Save token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        fs.chmodSync(TOKEN_PATH, 0o600);
        
        console.log('\n✅ Token saved successfully!');
        console.log('📧 Iris now has access to iris@ifinancememphis.com\n');
        resolve(oAuth2Client);
      });
    });
  });
}

// Test the connection
async function testConnection(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    const res = await gmail.users.getProfile({ userId: 'me' });
    console.log('📬 Connected to:', res.data.emailAddress);
    console.log('📊 Total messages:', res.data.messagesTotal);
    console.log('📥 Threads total:', res.data.threadsTotal);
  } catch (err) {
    console.error('❌ Error testing connection:', err);
  }
}

// Run
authorize()
  .then(auth => testConnection(auth))
  .catch(err => {
    console.error('❌ Authentication failed:', err);
    process.exit(1);
  });
