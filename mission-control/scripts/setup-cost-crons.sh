#!/bin/bash

# Setup cron jobs for 3x daily cost reporting
# Runs at 9 AM, 3 PM, and 9 PM UTC

CRON_SCRIPT_DIR="/root/clawd/mission-control/scripts"

# Create a wrapper script that agents can call
cat > "$CRON_SCRIPT_DIR/cost-report-cron.sh" << 'EOF'
#!/bin/bash

# This script runs the cost report and posts it to Corey via Mission Control
# It's designed to be called by an agent (like Prowl) during their heartbeat

SCRIPT_DIR="/root/clawd/mission-control/scripts"
REPORT_FILE="/tmp/cost-report-$$.txt"

# Generate the report
cd "$SCRIPT_DIR/.."
node "$SCRIPT_DIR/report-costs.js" report > "$REPORT_FILE" 2>&1

# Extract just the report text (skip the log messages)
REPORT=$(cat "$REPORT_FILE" | sed -n '/Generated report:/,/💾 Saved report/p' | sed '1d;$d')

# Clean up
rm -f "$REPORT_FILE"

# Output the report (agent will capture this and post to Telegram)
echo "$REPORT"
EOF

chmod +x "$CRON_SCRIPT_DIR/cost-report-cron.sh"

echo "✅ Created cost report cron wrapper script"
echo ""
echo "To enable 3x daily cost reports, add this to an agent's HEARTBEAT.md:"
echo ""
echo "## Cost Reporting (3x daily)"
echo "- [ ] At 09:00, 15:00, 21:00 UTC - Run cost report"
echo "  - Check current hour: \$(date +%H)"
echo "  - If hour matches (09, 15, or 21), run: bash /root/clawd/mission-control/scripts/cost-report-cron.sh"
echo "  - Post output to Corey via Telegram"
echo ""
echo "Alternatively, set up a system cron job:"
echo ""
echo "# Add to crontab (crontab -e)"
echo "0 9,15,21 * * * /root/clawd/mission-control/scripts/cost-report-cron.sh | /usr/bin/clawdbot message send --target=corey"
echo ""
