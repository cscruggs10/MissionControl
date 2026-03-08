#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '..', '.credentials', 'gmail-oauth.json');
const TOKEN_PATH = path.join(__dirname, '..', '.credentials', 'gmail-token.json');

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (!fs.existsSync(TOKEN_PATH)) {
    console.error('❌ Not authenticated. Run: node scripts/gmail-auth.js');
    process.exit(1);
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function listAllRecentEmails(auth, maxResults = 20) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
    });

    const messages = res.data.messages || [];
    
    if (messages.length === 0) {
      console.log('📭 No emails found');
      return [];
    }

    console.log(`\n📬 Found ${messages.length} recent email(s):\n`);

    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      const headers = msg.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';
      
      console.log(`📧 From: ${from}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Date: ${date}`);
      console.log('');
    }

    return messages;
  } catch (err) {
    console.error('❌ Error fetching emails:', err.message);
    process.exit(1);
  }
}

// Run
authorize()
  .then(auth => listAllRecentEmails(auth))
  .catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });
