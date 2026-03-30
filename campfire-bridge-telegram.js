#!/usr/bin/env node
/**
 * Campfire → Telegram Bridge (Temporary)
 * Routes Campfire messages to Corey's Telegram until proper channel plugin is built
 */

const http = require('http');

const CAMPFIRE_WEBHOOK = 'http://167.99.125.7/rooms/1/2-2zU2n8pAaWVl/messages';
const TELEGRAM_BOT_TOKEN = '8729675819:AAExw4HeQcVHWuW_g33eYUbNTjh1kbzJR10';
const COREY_TELEGRAM_ID = '6910769194';

let lastMessageId = 0;

function postToCampfire(message) {
  return new Promise((resolve, reject) => {
    const req = http.request(CAMPFIRE_WEBHOOK, { 
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }
    }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', reject);
    req.write(message);
    req.end();
  });
}

function sendToTelegram(message) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: COREY_TELEGRAM_ID,
      text: `💬 **Campfire Message:**\n\n${message}\n\n_Reply here and I'll send it to Campfire_`,
      parse_mode: 'Markdown'
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Create local webhook receiver for VPS to call
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/campfire/incoming') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const username = data.user?.name || 'Unknown';
        const message = data.message?.body?.plain || data.message?.body;
        const messageId = data.message?.id;
        
        // Skip if: no message, already seen, or is our own message
        if (!message || messageId <= lastMessageId || message.includes('🌸')) {
          res.writeHead(200);
          res.end('OK');
          return;
        }
        
        lastMessageId = messageId;
        console.log(`[${username}]: ${message}`);
        
        // Route to Corey's Telegram
        await sendToTelegram(`**${username}:** ${message}`);
        console.log('Forwarded to Telegram');
        
        res.writeHead(200);
        res.end('OK');
      } catch (error) {
        console.error('Error:', error.message);
        res.writeHead(500);
        res.end();
      }
    });
  } else {
    res.writeHead(200);
    res.end('Campfire → Telegram Bridge Running ✅\n');
  }
});

const PORT = 18790;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌸 Campfire → Telegram bridge listening on port ${PORT}`);
  console.log(`💬 Routing Campfire messages to Telegram ID: ${COREY_TELEGRAM_ID}`);
});
