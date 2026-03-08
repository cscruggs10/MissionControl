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
    console.error('❌ Not authenticated.');
    process.exit(1);
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function getLatestVideoEmail(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    // Get the latest email
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
    });

    if (!res.data.messages || res.data.messages.length === 0) {
      console.log('📭 No emails found');
      return;
    }

    const messageId = res.data.messages[0].id;
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const headers = msg.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
    const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
    
    console.log(`\n📧 Latest Email:`);
    console.log(`   From: ${from}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message ID: ${messageId}\n`);

    // Function to recursively find attachments
    function findAttachments(parts, attachments = []) {
      if (!parts) return attachments;
      
      for (const part of parts) {
        if (part.filename && part.body && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId,
            messageId: messageId
          });
        }
        
        // Recursively check nested parts
        if (part.parts) {
          findAttachments(part.parts, attachments);
        }
      }
      
      return attachments;
    }

    const attachments = findAttachments([msg.data.payload]);

    if (attachments.length === 0) {
      console.log('📎 No attachments found');
      console.log('\nDebugging info:');
      console.log('Payload structure:', JSON.stringify(msg.data.payload, null, 2).substring(0, 500));
      return;
    }

    console.log(`📎 Found ${attachments.length} attachment(s):\n`);
    
    for (const att of attachments) {
      const sizeMB = (att.size / 1024 / 1024).toFixed(2);
      console.log(`   ${att.filename}`);
      console.log(`   Size: ${sizeMB} MB`);
      console.log(`   Type: ${att.mimeType}`);
      console.log(`   Attachment ID: ${att.attachmentId}\n`);
      
      // Download it
      console.log(`⬇️  Downloading...`);
      const outputDir = path.join(__dirname, '..', 'uploads');
      const filepath = await downloadAttachment(gmail, att.messageId, att.attachmentId, att.filename, outputDir);
      console.log(`✅ Saved to: ${filepath}\n`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.stack) console.error(err.stack);
  }
}

async function downloadAttachment(gmail, messageId, attachmentId, filename, outputDir) {
  try {
    const attachment = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId,
    });

    const data = Buffer.from(attachment.data.data, 'base64');
    
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

authorize()
  .then(auth => getLatestVideoEmail(auth))
  .catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });
