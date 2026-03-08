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

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function readEmailBody(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 1,
  });

  const messageId = res.data.messages[0].id;
  const msg = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  });

  const headers = msg.data.payload.headers;
  const subject = headers.find(h => h.name === 'Subject')?.value;
  console.log(`\n📧 Subject: ${subject}\n`);

  function getBody(payload) {
    let body = '';
    
    if (payload.body && payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString();
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          body += Buffer.from(part.body.data, 'base64').toString();
        }
        if (part.parts) {
          body += getBody(part);
        }
      }
    }
    
    return body;
  }

  const body = getBody(msg.data.payload);
  console.log('📄 Email body:\n');
  console.log(body);
  
  // Look for Google Drive links
  const driveLinks = body.match(/https:\/\/drive\.google\.com\/[^\s<>]*/g);
  if (driveLinks) {
    console.log('\n🔗 Found Google Drive links:');
    driveLinks.forEach(link => console.log(`   ${link}`));
  }
}

authorize()
  .then(auth => readEmailBody(auth))
  .catch(err => console.error('❌', err));
