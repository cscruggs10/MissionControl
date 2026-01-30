#!/usr/bin/env node
/**
 * AutoIntel Web Server
 * Handles CSV uploads and triggers auction scraping
 */

import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure file upload
const upload = multer({
  dest: join(__dirname, 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.csv')) {
      return cb(new Error('Only CSV files allowed'));
    }
    cb(null, true);
  }
});

// Ensure uploads directory exists
const uploadsDir = join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir);
}

// Serve static files
app.use(express.static(join(__dirname, '../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AutoIntel' });
});

// Scrape endpoint with streaming progress
app.post('/api/scrape', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { auctionName, auctionDate } = req.body;
  
  if (!auctionName || !auctionDate) {
    return res.status(400).json({ error: 'Missing auction name or date' });
  }

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const csvPath = req.file.path;
  const fullAuctionName = `${auctionName} (${auctionDate})`;

  // Spawn scraper process
  const scraper = spawn('node', [
    join(__dirname, 'autoniq-scraper.js'),
    csvPath,
    fullAuctionName
  ]);

  let output = '';
  let processed = 0;
  let errors = 0;
  let total = 0;
  const startTime = Date.now();

  // Send initial progress
  res.write(`data: ${JSON.stringify({ progress: 0, message: 'Starting scraper...' })}\n\n`);

  // Parse stdout
  scraper.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    console.log(text);

    // Parse progress from scraper output
    const loadedMatch = text.match(/Loaded (\d+) vehicles/);
    if (loadedMatch) {
      total = parseInt(loadedMatch[1]);
      res.write(`data: ${JSON.stringify({ 
        progress: 5, 
        message: `Loaded ${total} vehicles from runlist` 
      })}\n\n`);
    }

    // Count processed vehicles
    if (text.includes('✓') && text.includes('announcements found')) {
      processed++;
      const progress = total > 0 ? Math.min(95, Math.floor((processed / total) * 100)) : 50;
      res.write(`data: ${JSON.stringify({ 
        progress, 
        message: `Processing: ${processed}/${total} vehicles` 
      })}\n\n`);
    }

    // Count errors
    if (text.includes('✗') && text.includes('Error:')) {
      errors++;
    }

    // Completion
    if (text.includes('=== Scraping Complete ===')) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      res.write(`data: ${JSON.stringify({ 
        progress: 100,
        complete: true,
        processed,
        errors,
        total,
        duration,
        message: 'Complete!' 
      })}\n\n`);
    }
  });

  scraper.stderr.on('data', (data) => {
    console.error('Scraper error:', data.toString());
  });

  scraper.on('close', (code) => {
    if (code !== 0 && !output.includes('=== Scraping Complete ===')) {
      res.write(`data: ${JSON.stringify({ 
        error: 'Scraper process failed',
        code 
      })}\n\n`);
    }
    res.end();
  });

  scraper.on('error', (err) => {
    console.error('Failed to start scraper:', err);
    res.write(`data: ${JSON.stringify({ 
      error: 'Failed to start scraper: ' + err.message 
    })}\n\n`);
    res.end();
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚗 AutoIntel server running on http://localhost:${PORT}`);
  console.log(`Upload runlists at: http://localhost:${PORT}\n`);
});
