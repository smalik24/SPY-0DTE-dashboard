# SPY 0DTE Trading Dashboard

Professional trading dashboard with automated paper trading bot for SPY 0-day-to-expiration options.

## 🌐 Live Dashboard
**https://smalik24.github.io/SPY-0DTE-dashboard/**

## Features

### Frontend
- ✅ Modern, professional UI with dark neon theme
- ✅ Real-time SPY pricing (Alpha Vantage API)
- ✅ Live metrics dashboard (RSI, open positions, total trades)
- ✅ Signal tracking with CALL/PUT indicators
- ✅ TradingView Lightweight Charts integration
- ✅ Mobile-responsive PWA (iOS ready)

### Trading Bot
- ✅ Paper trading only (Alpaca Paper API)
- ✅ Mean reversion strategy (VWAP + RSI + MACD)
- ✅ Automated entry/exit logic
- ✅ Risk management (20% TP / 15% SL)
- ✅ Trade logging and performance tracking

### Automated Maintenance
- ✅ Daily cron job (3 AM EST)
- ✅ AI agent reviews code quality
- ✅ Auto-fixes bugs and optimizes performance
- ✅ Ultra-cheap operation (Gemini Flash model)

## Strategy

**Entry Signals:**
- **CALL**: RSI < 35 (oversold) + Price above VWAP
- **PUT**: RSI > 65 (overbought) + Price below VWAP

**Exit Logic:**
- **Take Profit**: 20% gain
- **Stop Loss**: 15% loss
- **Max Hold**: Manages positions until TP/SL hit

## Running the Bot

### Prerequisites
- Node.js (bundled with EasyClaw at `/Applications/EasyClaw.app/Contents/Resources/node/bin/node`)
- API keys (already configured in `.env`)

### Start Bot
```bash
cd ~/.easyclaw/data/config/workspace
/Applications/EasyClaw.app/Contents/Resources/node/bin/node bot.js
```

The bot will:
1. Check SPY price every 60 seconds
2. Calculate RSI from price history
3. Generate signals based on strategy
4. Execute paper trades via Alpaca
5. Monitor open positions for exit conditions
6. Serve API at `http://localhost:3000/api/status`

## API Configuration

### Alpaca Paper Trading
- **Key ID**: Configured in `.env`
- **Secret Key**: Configured in `.env`
- **Base URL**: `https://paper-api.alpaca.markets`

### Market Data
- **Alpha Vantage API Key**: Configured in `.env`
- **Free tier**: 25 requests/day
- **Update frequency**: Every 60 seconds

## Files

- `index.html` - Frontend dashboard (GitHub Pages)
- `bot.js` - Trading bot with strategy logic
- `.env` - API credentials (not committed to git)
- `package.json` - Node.js dependencies
- `README.md` - This file

## Maintenance

Automated maintenance runs daily at 3 AM EST via cron job:
- Reviews `bot.js` for bugs
- Optimizes code performance
- Refines trading strategy based on results
- Commits improvements to GitHub

## Security

- Paper trading only (no real money)
- API keys stored in `.env` (gitignored)
- All trades logged for audit trail

## Support

Built by Walter 🎩 for Saqib
Questions? Check the bot logs or review recent trades in the dashboard.

---

**Live URL**: https://smalik24.github.io/SPY-0DTE-dashboard/
**Last Updated**: 2026-02-27
