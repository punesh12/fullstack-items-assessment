const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { mean } = require('../utils/stats');
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Cache for stats
let statsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5000; // 5 seconds cache TTL

// File watcher to invalidate cache on changes
let watcher = null;

function setupFileWatcher() {
  if (watcher) {
    watcher.close();
  }
  
  watcher = fs.watch(DATA_PATH, (eventType) => {
    if (eventType === 'change') {
      // Invalidate cache when file changes
      statsCache = null;
      cacheTimestamp = null;
    }
  });
}

// Initialize watcher
try {
  setupFileWatcher();
} catch (err) {
  console.warn('Could not setup file watcher:', err.message);
}

// Calculate stats
function calculateStats(items) {
  if (items.length === 0) {
    return {
      total: 0,
      averagePrice: 0
    };
  }

  const prices = items.map(item => item.price || 0);
  return {
    total: items.length,
    averagePrice: mean(prices)
  };
}

// GET /api/stats
router.get('/', (req, res, next) => {
  const now = Date.now();
  
  // Return cached stats if still valid
  if (statsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    return res.json(statsCache);
  }

  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) return next(err);

    try {
      const items = JSON.parse(raw);
      const stats = calculateStats(items);
      
      // Update cache
      statsCache = stats;
      cacheTimestamp = now;
      
      res.json(stats);
    } catch (parseErr) {
      next(parseErr);
    }
  });
});

// Cleanup watcher on shutdown
process.on('SIGTERM', () => {
  if (watcher) {
    watcher.close();
  }
});

process.on('SIGINT', () => {
  if (watcher) {
    watcher.close();
  }
});

module.exports = router;