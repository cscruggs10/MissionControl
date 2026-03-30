#!/usr/bin/env node
/**
 * Campfire ↔ Clawdbot Bridge
 * Routes Campfire messages to Iris session and sends responses back
 */

const http = require('http');

const CAMPFIRE_WEBHOOK = 'http://167.99.125.7/rooms/1/2-2zU2n8pAaWVl/messages';
const CLAWDBOT_GATEWAY = 'http://localhost:18789';
const GATEWAY_TOKEN = '6b2f2b03868ea6ff5f1af2b62279767099537159a2cbd725';
const IRIS_SESSION_KEY = 'main'; // Iris runs in main session

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

async function sendToClawdbot(message, username) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sessionKey: IRIS_SESSION_KEY,
      message: message,
      timeoutSeconds: 120
    });

    const options = {
      hostname: 'localhost',
      port: 18789,
      path: '/api/v1/sessions/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${GATEWAY_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok && result.result?.reply) {
            resolve(result.result.reply);
          } else {
            reject(new Error(result.error || 'No response from Clawdbot'));
          }
        } catch (error) {
          reject(error);
        }
      });
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
        
        // Send to Clawdbot (Iris session) and get response
        const response = await sendToClawdbot(message, username);
        
        // Post response back to Campfire
        const campfireMsg = `🌸 Iris: ${response}`;
        await postToCampfire(campfireMsg);
        console.log('Sent:', campfireMsg);
        
        res.writeHead(200);
        res.end('OK');
      } catch (error) {
        console.error('Error:', error.message);
        
        // Post error notification to Campfire
        try {
          await postToCampfire(`🌸 Iris: Sorry, I encountered an error: ${error.message}`);
        } catch (e) {
          console.error('Failed to post error to Campfire:', e.message);
        }
        
        res.writeHead(500);
        res.end();
      }
    });
  } else {
    res.writeHead(200);
    res.end('Campfire Bridge Running ✅\n');
  }
});

const PORT = 18790; // Different from gateway port
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌸 Campfire bridge listening on port ${PORT}`);
  console.log(`📡 VPS webhook should POST to: http://[MAC_IP]:${PORT}/campfire/incoming`);
  console.log(`🔗 Connected to Clawdbot gateway on port 18789`);
  console.log(`💬 Routing messages to Iris (session: ${IRIS_SESSION_KEY})`);
});
