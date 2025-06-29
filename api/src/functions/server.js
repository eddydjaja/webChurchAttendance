require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: true
  }
});

// Test DB connection on startup
console.log('Testing database connection...');
db.connect((err) => {
  if (err) {
    console.error('Failed to connect to MySQL database:', err.message);
    process.exit(1); // Stop the server if DB connection fails
  } else {
    console.log('Successfully connected to MySQL database!');
  }
});

app.get('/api/data/:primaryKey', (req, res) => {
  console.log('Received request for primary key:', req.params.primaryKey);
  const primaryKey = req.params.primaryKey;
  const query = 'SELECT * FROM Attendance WHERE service_date = ?';

  db.query(query, [primaryKey], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }
    res.json(results[0] || {}); // Return empty object if not found
  });
});

app.listen(4280, () => {
  console.log('Backend listening on port 3001');
});