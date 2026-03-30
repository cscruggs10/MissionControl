#!/usr/bin/env node
/**
 * Campfire Webhook Receiver
 * Receives messages from Campfire and routes them to Clawdbot
 */

const http = require('http');

const PORT = 3456;
const WEBHOOK_PATH = '/campfire/webhook';

// Campfire outgoing webhook URL to send messages back
const CAMPFIRE_WEBHOOK = 'http://167.99.125.7/rooms/1/2-2zU2n8pAaWVl/messages';

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === WEBHOOK_PATH) {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        
        console.log('Received from Campfire:', payload);
        
        // Extract message content
        const message = payload.content || payload.message || payload.text;
        const user = payload.user || payload.username || 'Unknown';
        
        if (message) {
          console.log(`[${user}]: ${message}`);
          
          // TODO: Route to Clawdbot main session
          // For now, just echo back
          const response = `🌸 Iris: I heard you say "${message}"`;
          
          // Post response back to Campfire
          const https = require('http');
          const campfireReq = https.request(CAMPFIRE_WEBHOOK, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
            }
          });
          
          campfireReq.write(response);
          campfireReq.end();
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.writeHead(500);
        res.end();
      }
    });
  } else if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Campfire Webhook Receiver Running\n');
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Campfire webhook receiver listening on port ${PORT}`);
  console.log(`Webhook URL: http://YOUR_PUBLIC_IP:${PORT}${WEBHOOK_PATH}`);
  console.log('Configure this URL in Campfire chatbot settings');
});
