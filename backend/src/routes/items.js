const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (async, non-blocking)
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');


    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to read data: ${err.message}`);
  }
}

// Utility to write data (async, non-blocking)
async function writeData(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    throw new Error(`Failed to write data: ${err.message}`);
  }
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, offset, q } = req.query;
    let results = data;

    // Apply search filter
    if (q) {
      const queryLower = q.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(queryLower) ||
        (item.category && item.category.toLowerCase().includes(queryLower))
      );
    }

    const total = results.length;

    // Apply pagination
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : results.length;
    
    results = results.slice(offsetNum, offsetNum + limitNum);

    res.json({
      items: results,
      total,
      offset: offsetNum,
      limit: limitNum
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id, 10));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;