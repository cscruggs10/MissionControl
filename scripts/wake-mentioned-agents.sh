#!/usr/bin/env bash
# Check for @mentions and wake agents via system events
# Runs every minute via cron

cd /root/clawd/mission-control

# Get undelivered notifications from Convex
node -e "
require('dotenv').config({ path: '.env.local' });
const { ConvexHttpClient } = require('convex/browser');
const client = new ConvexHttpClient(process.env.CONVEX_URL);

(async () => {
  const notifs = await client.query('notifications:getUndelivered');
  notifs.forEach(n => {
    if (n.sessionKey) {
      console.log(n.sessionKey);
    }
  });
})();
" | while read -r sessionKey; do
  if [ -n "$sessionKey" ]; then
    echo "🔔 Waking $sessionKey for @mention..."
    # Trigger wake event via cron wake action  
    echo "{\"text\": \"Check Mission Control for new @mentions\", \"sessionKey\": \"$sessionKey\"}" | \
      curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer d20dc84d1e244037bed4ab5c0f086cc0e25978249b9b8b43" \
        --data @- \
        http://localhost:18789/internal/wake || echo "Wake failed for $sessionKey"
  fi
done
