# SPY 0DTE Bot Setup Guide

## Step 1: Get Alpaca Paper Trading Keys (FREE)

1. Go to: **https://alpaca.markets**
2. Click "Get Started" → Sign up (use your email)
3. Select **"Paper Trading Only"** (no credit card needed)
4. Once logged in, go to: **Your Apps** → **Generate New Key**
5. Copy:
   - API Key ID
   - Secret Key
   - Paper Trading Base URL: `https://paper-api.alpaca.markets`

## Step 2: Get Market Data API Key (FREE)

**Option A: Alpha Vantage** (Easiest, 25 requests/day free)
1. Go to: **https://www.alphavantage.co/support/#api-key**
2. Enter your email
3. Get your free API key instantly

**Option B: Polygon.io** (Better data, 5 calls/min free)
1. Go to: **https://polygon.io**
2. Sign up for free tier
3. Get API key from dashboard

## Step 3: Save Your Keys

Once you have the keys, paste them here and I'll configure everything:

```
ALPACA_KEY_ID=your_key_here
ALPACA_SECRET=your_secret_here
ALPHA_VANTAGE_KEY=your_av_key_here
```

Then I'll build and deploy the complete bot + UI!
