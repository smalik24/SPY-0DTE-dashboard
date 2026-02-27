require('dotenv').config();
const express = require('express');
const Alpaca = require('@alpacahq/alpaca-trade-api');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Database Setup
const db = new sqlite3.Database('./trading_history.db', (err) => {
    if (err) console.error('DB Error:', err.message);
    console.log('Connected to SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT,
    side TEXT,
    qty INTEGER,
    entry_price REAL,
    exit_price REAL,
    pnl REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Alpaca Setup
const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY,
  secretKey: process.env.ALPACA_SECRET_KEY,
  paper: true,
});

app.use(express.json());
app.use(express.static('public'));

app.get('/api/status', async (req, res) => {
    try {
        const account = await alpaca.getAccount();
        res.json({ status: 'online', buying_power: account.buying_power, equity: account.equity });
    } catch (error) {
        res.status(500).json({ status: 'offline', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
