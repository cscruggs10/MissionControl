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

async function listRecentEmails(auth, maxResults = 10) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    // Search for recent emails with attachments
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'has:attachment',
      maxResults: maxResults,
    });

    const messages = res.data.messages || [];
    
    if (messages.length === 0) {
      console.log('📭 No emails with attachments found');
      return [];
    }

    console.log(`\n📬 Found ${messages.length} email(s) with attachments:\n`);

    const emailDetails = [];
    
    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      const headers = msg.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';
      
      // Get attachments
      const attachments = [];
      if (msg.data.payload.parts) {
        for (const part of msg.data.payload.parts) {
          if (part.filename && part.body.attachmentId) {
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body.size,
              attachmentId: part.body.attachmentId
            });
          }
        }
      }

      const details = {
        id: message.id,
        subject,
        from,
        date,
        attachments
      };

      emailDetails.push(details);

      console.log(`📧 Message ID: ${message.id}`);
      console.log(`   From: ${from}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Date: ${date}`);
      console.log(`   Attachments:`);
      attachments.forEach(att => {
        const sizeMB = (att.size / 1024 / 1024).toFixed(2);
        console.log(`     - ${att.filename} (${sizeMB} MB) [${att.mimeType}]`);
      });
      console.log('');
    }

    return emailDetails;
  } catch (err) {
    console.error('❌ Error fetching emails:', err.message);
    process.exit(1);
  }
}

async function downloadAttachment(auth, messageId, attachmentId, filename, outputDir) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    const attachment = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId,
    });

    const data = Buffer.from(attachment.data.data, 'base64');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, data);
    
    return filepath;
  } catch (err) {
    console.error('❌ Error downloading attachment:', err.message);
    throw err;
  }
}

// Run
authorize()
  .then(auth => listRecentEmails(auth, 20))
  .catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });
