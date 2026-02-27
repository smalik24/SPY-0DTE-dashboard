#!/usr/bin/env node
/**
 * SPY 0DTE Scalping Bot - Paper Trading Only
 * Strategy: Mean Reversion with VWAP + RSI + MACD
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

// Load environment variables
const ENV = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      ENV[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Configuration
const CONFIG = {
  alpaca: {
    keyId: ENV.ALPACA_API_KEY,
    secretKey: ENV.ALPACA_SECRET_KEY,
    baseUrl: ENV.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets',
    dataUrl: 'https://data.alpaca.markets'
  },
  alphaVantage: {
    apiKey: ENV.ALPHA_VANTAGE_API_KEY
  },
  symbol: 'SPY',
  checkInterval: 60000, // 1 minute
  strategy: {
    rsiPeriod: 14,
    rsiOversold: 35,
    rsiOverbought: 65,
    takeProfitPercent: 0.20, // 20%
    stopLossPercent: 0.15    // 15%
  }
};

// In-memory state
const STATE = {
  lastPrice: 0,
  rsi: 50,
  macd: 0,
  vwap: 0,
  signal: null,
  positions: [],
  trades: []
};

// Helper: Make HTTPS request
function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'http:' ? http : https;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Get current SPY price from Alpha Vantage
async function getCurrentPrice() {
  try {
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'GLOBAL_QUOTE');
    url.searchParams.set('symbol', CONFIG.symbol);
    url.searchParams.set('apikey', CONFIG.alphaVantage.apiKey);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET'
    };
    
    const result = await httpsRequest(options);
    
    if (result.data['Global Quote'] && result.data['Global Quote']['05. price']) {
      const price = parseFloat(result.data['Global Quote']['05. price']);
      STATE.lastPrice = price;
      return price;
    }
    
    return STATE.lastPrice || 0;
  } catch (error) {
    console.error('Error fetching price:', error.message);
    return STATE.lastPrice || 0;
  }
}

// Calculate RSI (simplified)
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Generate trading signal
function generateSignal(price, rsi) {
  // Mean reversion logic
  // CALL: RSI oversold (< 35)
  // PUT: RSI overbought (> 65)
  
  if (rsi < CONFIG.strategy.rsiOversold) {
    return { type: 'CALL', price, reason: `RSI oversold (${rsi.toFixed(1)})` };
  } else if (rsi > CONFIG.strategy.rsiOverbought) {
    return { type: 'PUT', price, reason: `RSI overbought (${rsi.toFixed(1)})` };
  }
  
  return null;
}

// Execute paper trade (simulated)
async function executeTrade(signal) {
  const trade = {
    id: Date.now(),
    type: signal.type,
    entryPrice: signal.price,
    entryTime: new Date().toISOString(),
    reason: signal.reason,
    stopLoss: signal.type === 'CALL' 
      ? signal.price * (1 - CONFIG.strategy.stopLossPercent)
      : signal.price * (1 + CONFIG.strategy.stopLossPercent),
    takeProfit: signal.type === 'CALL'
      ? signal.price * (1 + CONFIG.strategy.takeProfitPercent)
      : signal.price * (1 - CONFIG.strategy.takeProfitPercent),
    status: 'OPEN'
  };
  
  STATE.positions.push(trade);
  STATE.trades.push(trade);
  
  console.log(`\n🤖 PAPER TRADE EXECUTED:`);
  console.log(`   Type: ${trade.type}`);
  console.log(`   Entry: $${trade.entryPrice.toFixed(2)}`);
  console.log(`   Stop: $${trade.stopLoss.toFixed(2)}`);
  console.log(`   Target: $${trade.takeProfit.toFixed(2)}`);
  console.log(`   Reason: ${trade.reason}\n`);
  
  return trade;
}

// Check open positions for exit
function checkPositions(currentPrice) {
  STATE.positions.forEach((position, index) => {
    if (position.status !== 'OPEN') return;
    
    let shouldClose = false;
    let exitReason = '';
    
    if (position.type === 'CALL') {
      if (currentPrice >= position.takeProfit) {
        shouldClose = true;
        exitReason = 'Take profit hit';
      } else if (currentPrice <= position.stopLoss) {
        shouldClose = true;
        exitReason = 'Stop loss hit';
      }
    } else { // PUT
      if (currentPrice <= position.takeProfit) {
        shouldClose = true;
        exitReason = 'Take profit hit';
      } else if (currentPrice >= position.stopLoss) {
        shouldClose = true;
        exitReason = 'Stop loss hit';
      }
    }
    
    if (shouldClose) {
      position.status = 'CLOSED';
      position.exitPrice = currentPrice;
      position.exitTime = new Date().toISOString();
      position.exitReason = exitReason;
      
      const pnl = position.type === 'CALL'
        ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100
        : ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
      
      position.pnl = pnl;
      
      console.log(`\n✅ POSITION CLOSED:`);
      console.log(`   Type: ${position.type}`);
      console.log(`   Entry: $${position.entryPrice.toFixed(2)}`);
      console.log(`   Exit: $${currentPrice.toFixed(2)}`);
      console.log(`   P&L: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%`);
      console.log(`   Reason: ${exitReason}\n`);
      
      STATE.positions.splice(index, 1);
    }
  });
}

// Main bot loop
async function runBot() {
  console.log('📊 SPY 0DTE Bot Starting...');
  console.log(`   Symbol: ${CONFIG.symbol}`);
  console.log(`   Mode: PAPER TRADING ONLY`);
  console.log(`   Strategy: Mean Reversion (RSI ${CONFIG.strategy.rsiOversold}/${CONFIG.strategy.rsiOverbought})`);
  console.log(`   Check Interval: ${CONFIG.checkInterval / 1000}s\n`);
  
  const priceHistory = [];
  
  setInterval(async () => {
    try {
      const price = await getCurrentPrice();
      if (!price) return;
      
      priceHistory.push(price);
      if (priceHistory.length > 50) priceHistory.shift();
      
      const rsi = calculateRSI(priceHistory, CONFIG.strategy.rsiPeriod);
      STATE.rsi = rsi;
      
      console.log(`[${new Date().toLocaleTimeString()}] SPY: $${price.toFixed(2)} | RSI: ${rsi.toFixed(1)} | Open Positions: ${STATE.positions.length}`);
      
      // Check existing positions
      checkPositions(price);
      
      // Generate new signal if no open positions
      if (STATE.positions.length === 0) {
        const signal = generateSignal(price, rsi);
        if (signal) {
          STATE.signal = signal;
          await executeTrade(signal);
        }
      }
    } catch (error) {
      console.error('Bot error:', error.message);
    }
  }, CONFIG.checkInterval);
}

// Simple HTTP server for frontend
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/status') {
    res.writeHead(200);
    res.end(JSON.stringify({
      price: STATE.lastPrice,
      rsi: STATE.rsi,
      signal: STATE.signal,
      openPositions: STATE.positions.length,
      totalTrades: STATE.trades.length,
      trades: STATE.trades.slice(-10).reverse()
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(3000, () => {
  console.log('🌐 API server running on http://localhost:3000\n');
  runBot();
});
