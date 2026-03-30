const http = require('http');

const PORT = 3456;
const CAMPFIRE_WEBHOOK = 'http://167.99.125.7/rooms/1/2-2zU2n8pAaWVl/messages';

// Store last message timestamp to avoid duplicates
let lastMessageTime = 0;

function postToCampfire(message) {
  const req = http.request(CAMPFIRE_WEBHOOK, { method: 'POST' });
  req.write(message);
  req.end();
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Received from Campfire:', JSON.stringify(data, null, 2));
        
        // Extract message details
        const message = data.content || data.message || data.text || data.body;
        const username = data.user || data.username || data.creator || 'Unknown';
        const timestamp = data.created_at || Date.now();
        
        // Avoid duplicate/echo messages
        if (timestamp <= lastMessageTime) {
          console.log('Skipping duplicate/old message');
          res.writeHead(200);
          res.end('OK');
          return;
        }
        
        lastMessageTime = timestamp;
        
        // Skip messages from bots (avoid loops)
        if (username.toLowerCase().includes('bot') || 
            username.toLowerCase().includes('iris') ||
            message.includes('🌸')) {
          console.log('Skipping bot message');
          res.writeHead(200);
          res.end('OK');
          return;
        }
        
        if (message) {
          console.log(`[${username}]: ${message}`);
          
          // For now, respond with a smart reply
          // TODO: Forward to Clawdbot gateway and get real response
          const response = `🌸 Iris: Hey ${username}! I received your message. Full Clawdbot integration coming next!`;
          
          postToCampfire(response);
        }
        
        res.writeHead(200);
        res.end('OK');
      } catch(e) {
        console.error('Error:', e);
        res.writeHead(500);
        res.end();
      }
    });
  } else {
    res.writeHead(200);
    res.end('Campfire Webhook Receiver v2 - Running\n');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Campfire webhook receiver v2 listening on port ${PORT}`);
  console.log(`Will forward messages to Clawdbot and post responses back to Campfire`);
});
