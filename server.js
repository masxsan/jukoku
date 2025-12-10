const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Database initialization
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Create data table
    db.run(`CREATE TABLE IF NOT EXISTS jurnal_data (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Database tables initialized');
      }
    });
  });
}

// API Routes

// Get all data
app.get('/api/data', (req, res) => {
  db.all('SELECT id, type, timestamp, data FROM jurnal_data ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ isOk: false, error: err.message });
    }
    
    try {
      const data = rows.map(row => ({
        ...JSON.parse(row.data),
        id: row.id,
        type: row.type,
        timestamp: row.timestamp
      }));
      res.json(data);
    } catch (parseError) {
      console.error('Error parsing data:', parseError);
      res.status(500).json({ isOk: false, error: 'Error parsing data' });
    }
  });
});

// Create new data
app.post('/api/data', (req, res) => {
  const record = req.body;
  
  if (!record.id || !record.type) {
    return res.status(400).json({ isOk: false, error: 'Missing required fields: id and type' });
  }
  
  const dataJson = JSON.stringify(record);
  
  db.run(
    'INSERT INTO jurnal_data (id, type, timestamp, data) VALUES (?, ?, ?, ?)',
    [record.id, record.type, record.timestamp || new Date().toISOString(), dataJson],
    function(err) {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ isOk: false, error: err.message });
      }
      res.json({ isOk: true, id: record.id });
    }
  );
});

// Update data
app.put('/api/data/:id', (req, res) => {
  const { id } = req.params;
  const record = req.body;
  
  if (!record.type) {
    return res.status(400).json({ isOk: false, error: 'Missing required field: type' });
  }
  
  const dataJson = JSON.stringify(record);
  
  db.run(
    'UPDATE jurnal_data SET type = ?, timestamp = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [record.type, record.timestamp || new Date().toISOString(), dataJson, id],
    function(err) {
      if (err) {
        console.error('Error updating data:', err);
        return res.status(500).json({ isOk: false, error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ isOk: false, error: 'Record not found' });
      }
      res.json({ isOk: true, id: id });
    }
  );
});

// Delete data
app.delete('/api/data/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM jurnal_data WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).json({ isOk: false, error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ isOk: false, error: 'Record not found' });
    }
    res.json({ isOk: true, id: id });
  });
});

// Bulk operations for backup/restore
app.post('/api/data/bulk', (req, res) => {
  const { data } = req.body;
  
  if (!Array.isArray(data)) {
    return res.status(400).json({ isOk: false, error: 'Data must be an array' });
  }
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    let successCount = 0;
    let errorCount = 0;
    
    data.forEach((record, index) => {
      if (!record.id || !record.type) {
        errorCount++;
        return;
      }
      
      const dataJson = JSON.stringify(record);
      
      db.run(
        'INSERT OR REPLACE INTO jurnal_data (id, type, timestamp, data) VALUES (?, ?, ?, ?)',
        [record.id, record.type, record.timestamp || new Date().toISOString(), dataJson],
        function(err) {
          if (err) {
            errorCount++;
            console.error(`Error inserting record ${record.id}:`, err);
          } else {
            successCount++;
          }
          
          // Last item
          if (index === data.length - 1) {
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                return res.status(500).json({ isOk: false, error: err.message });
              }
              res.json({ 
                isOk: true, 
                successCount, 
                errorCount,
                total: data.length 
              });
            });
          }
        }
      );
    });
  });
});

// Clear all data
app.delete('/api/data', (req, res) => {
  db.run('DELETE FROM jurnal_data', function(err) {
    if (err) {
      console.error('Error clearing data:', err);
      return res.status(500).json({ isOk: false, error: err.message });
    }
    res.json({ isOk: true, deletedCount: this.changes });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Jurnal kokur.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database file: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});


