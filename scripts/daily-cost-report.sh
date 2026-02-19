#!/bin/bash

# Daily cost report - runs at noon UTC
# Reports previous 24 hours of compute spend

cd /root/clawd/mission-control || exit 1

# Generate cost report for last 24 hours
node scripts/report-costs.js report --hours=24 2>/dev/null || echo "Cost report generation failed"
