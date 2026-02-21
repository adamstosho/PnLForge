# 🎯 PnlForge for Deriverse Traders Guide

A comprehensive guide to using PnlForge to analyze your Deriverse trading performance.

---

## 📚 Table of Contents

1. [Getting Started](#getting-started)
2. [Connecting Your Deriverse Wallet](#connecting-your-deriverse-wallet)
3. [Understanding Your Metrics](#understanding-your-metrics)
4. [Risk Management for Leveraged Trading](#risk-management-for-leveraged-trading)
5. [Scenario Simulator for Deriverse Strategies](#scenario-simulator-for-deriverse-strategies)
6. [Advanced Analytics](#advanced-analytics)
7. [FAQ](#faq)

---

## Getting Started

### Step 1: Visit PnlForge
Go to **[https://pnl-forge.vercel.app](https://pnl-forge.vercel.app)**

### Step 2: Connect Your Wallet
Click "Connect Wallet" and select your wallet provider:
- **Phantom** (recommended)
- **Solflare**
- Other Solana wallets

### Step 3: Authorize Access
You'll be asked to sign a message proving wallet ownership. This does NOT cost gas or require transaction fees.

### Step 4: View Your Trade Analytics
Your Deriverse trades will automatically load and populate the dashboard.

---

## Connecting Your Deriverse Wallet

### Important Notes

- ✅ **Non-Custodial** - PnlForge never accesses your private keys
- ✅ **Read-Only** - We only read on-chain trade data
- ✅ **Wallet Agnostic** - Works with any Solana wallet
- ✅ **Demo Mode** - Try with demo trades before connecting

### How It Works

1. You connect your wallet and sign a challenge message
2. PnlForge verifies your signature on-chain
3. We fetch your Deriverse trade history from Solana blockchain
4. All calculations are performed locally (no server processing)

### What Happens to My Data?

- 🔒 **Encrypted** - Trade notes are encrypted with AES-256-GCM
- 🔐 **Private** - Only you can decrypt and read your notes
- 📊 **Aggregated** - Benchmarking uses anonymous aggregated data
- 🚫 **Never Shared** - We never share personal trade details

---

## Understanding Your Metrics

### Basic Metrics

| Metric | What It Measures | Good Range | Formula |
|--------|------------------|------------|---------|
| **Total PnL** | Your profit/loss | Positive | Sum of all trade PnL |
| **Win Rate** | % of profitable trades | 50%+ | (Winning Trades / Total Trades) × 100 |
| **Profit Factor** | Gross profit vs gross loss | 1.5+ | Gross Profit / Gross Loss |
| **Max Drawdown** | Largest peak-to-trough decline | < 20% | (Peak - Trough) / Peak |
| **Avg Trade Duration** | Average time per trade | Strategy-dependent | Sum of durations / Trade count |

### Advanced Risk Metrics (For Serious Traders)

| Metric | What It Measures | Good Range | Why It Matters |
|--------|------------------|------------|----------------|
| **Sharpe Ratio** | Risk-adjusted returns | 1.0+ | Compares return vs volatility |
| **Sortino Ratio** | Downside-focused risk | 1.5+ | Penalizes only downside volatility |
| **Calmar Ratio** | Return vs max drawdown | 1.0+ | Measures recovery efficiency |
| **K-Ratio** | Consistency over time | 0.3+ | How stable your profits are |
| **Kelly Criterion** | Optimal position sizing | 0.1-0.3 | Mathematically optimal risk per trade |

### Deriverse-Specific Metrics

#### Leverage Impact Analysis
```
For Perpetual Futures trades:
- Track funded rates over holding period
- Measure margin requirement efficiency
- Monitor liquidation distance
- Calculate ROE (Return on Equity)
```

#### Spot vs Perpetual Performance
```
Compare your:
- Spot trading PnL vs Perpetual PnL
- Win rate across market types
- Average trade duration by market
- Fees incurred in each market
```

#### Funding Rate Effects
```
Perpetual trades show:
- Entry funding rate
- Exit funding rate
- Total funding paid/received
- Impact on overall PnL
```

---

## Risk Management for Leveraged Trading

### Monitor These Numbers Religiously

#### 1. Max Drawdown
**What it is:** The largest percentage drop from peak equity to trough

**Why it matters:** Predicts liquidation risk

**Action items:**
- Keep max drawdown < 20% if using leverage
- Use 10% as conservative target
- Review trades that caused spikes

```
Example:
Your peak equity: $10,000
Your lowest point: $8,200
Max Drawdown: 18%
```

#### 2. Liquidation Distance
**What it is:** How far price must move before you're liquidated

**Why it matters:** Prevents forced position closure

**Action items:**
- Never use full 10x leverage on volatile pairs
- Maintain 2x-5x for day trading
- Use 1.5x-3x for swing trades

```
Liquidation Distance Calculation:
Position: 5x leverage, $1,000 position
Entry Price: $50
Liquidation Price: $40 (20% below entry)
Safety Margin: 1.5x actual position size recommended
```

#### 3. Average Win vs Average Loss
**What it is:** Dollar value of average winning trade vs losing trade

**Why it matters:** Risk/reward ratio

**Good ratio:**
- Avg Win > 1.5× Avg Loss (at minimum)
- Avg Win > 2× Avg Loss (solid strategy)

```
Example:
Avg Win: $500
Avg Loss: $200
Ratio: 2.5 (Excellent!)
```

---

## Scenario Simulator for Deriverse Strategies

### Use Case 1: Testing Stop-Loss Strategies

**Scenario:** "What if I had used a 2% stop-loss?"

**How to test:**
1. Go to **Scenario Simulator**
2. Set "Stop Loss" slider to 2%
3. Click "Run Simulation"
4. Compare: Original PnL vs Simulated PnL

**Expected results:**
- Fewer losses (stop-losses trigger)
- Slightly lower max drawdown
- Fewer total trades
- Net impact usually positive

### Use Case 2: Testing Leverage Adjustments

**Scenario:** "What if I had used 3x leverage instead of 5x?"

**How to test:**
1. Go to **Scenario Simulator**
2. Set "Position Size Multiplier" to 0.6x (3/5 = 0.6)
3. Click "Run Simulation"

**Expected results:**
- Smaller PnL (up and down)
- Reduced max drawdown
- Better stress-relief (psychologically)

### Use Case 3: Removing Worst Trades

**Scenario:** "What if I had excluded my 3 worst trades?"

**How to test:**
1. Go to **Scenario Simulator**
2. Set "Exclude Worst Trades" to 3
3. Click "Run Simulation"

**Expected results:**
- Significantly higher PnL
- Dramatically lower max drawdown
- Reveals impact of outlier losses
- Helps identify pattern in bad trades

---

## Advanced Analytics

### Daily Performance Heatmap
**Understanding:** Green squares = profitable days, Red squares = losing days

**Use it to:**
- Identify which trading times work best
- Avoid trading at low-win-rate times
- Plan your trading schedule

### Fee Analysis
**Understanding:** See exact maker vs taker fees, realized on each trade

**Optimization tips:**
- Limit market orders (high taker fees)
- Use limit orders to capture rebates (maker fees negative = you earn!)
- Consider Deriverse maker rebate program for high-volume traders

### Equity Curve Analysis
**Understanding:** Your total balance over time

**What to look for:**
- Smooth upward slope = consistent strategy
- Steep dips = high-risk periods
- Flat sections = break-even/treading water
- Curve should recovery from dips (shows resilience)

---

## FAQ

### Q: Can PnlForge help me avoid liquidation?

**A:** Yes! By monitoring:
- Max drawdown (predicts liquidation risk)
- Liquidation distance (exact safety margin)
- Scenario simulations (test what-if)

But PnlForge is **monitoring**, not **preventing**. You must actively adjust leverage/positions.

### Q: Does PnlForge trade on my behalf?

**A:** No. PnlForge is analytics-only:
- ✅ Reads your trades
- ✅ Analyzes your performance
- ✅ Provides insights
- ❌ Never places orders
- ❌ Never moves funds

### Q: How often is my data updated?

**A:** 
- On-chain trades: Updated every 30 seconds
- Analytics: Real-time
- Benchmarks: Updated hourly (privacy-preserving)

### Q: Can I export my trade data?

**A:** Yes! On the **Trade History** page:
1. Click "Export Archive" button
2. Download CSV with all trades
3. Use in Excel, TradingView, or other tools

### Q: What if I'm using multiple wallets?

**A:** Currently, PnlForge tracks one wallet at a time. Multi-wallet support is coming soon! 

**Workaround:** Connect to each wallet separately and take screenshots.

### Q: Are my notes really encrypted?

**A:** Yes, with AES-256-GCM encryption:
- 🔐 Encrypted before transmission
- 🔐 Stored encrypted on server
- 🔐 Only you can decrypt
- 🔐 Even we can't read them

### Q: Does this work on mainnet or just devnet?

**A:** Currently optimized for **Devnet**. Mainnet support coming after Deriverse launches on mainnet.

### Q: What if I made a mistake on a trade entry?

**A:** Your trade notes can be edited, but the on-chain record is immutable. You can:
- Add a note explaining the mistake
- Use scenario simulator to test correction
- Track the impact separately

### Q: How do I interpret my Sharpe Ratio?

**A:**
- **< 0.5:** Very risky, inconsistent returns
- **0.5 - 1.0:** Acceptable risk/return
- **1.0 - 2.0:** Good risk-adjusted returns (gold standard)
- **> 2.0:** Exceptional (closely examine for data accuracy)

---

## Next Steps

1. **Connect Your Wallet** - Start tracking your Deriverse trades
2. **Review Your Metrics** - Understand your current performance
3. **Run Scenarios** - Test "what if" improvements
4. **Adjust Your Strategy** - Use insights to refine approach
5. **Track Progress** - Return weekly to see improvements

---

## Support & Feedback

- 📧 Have questions? Check the FAQ above
- 🐛 Found a bug? Report on [GitHub Issues](https://github.com/adamstosho/PnLForge/issues)
- 💡 Have suggestions? Open a [Discussion](https://github.com/adamstosho/PnLForge/discussions)
- 🤝 Want to contribute? See [CONTRIBUTING.md](#)

---

**Happy trading! 🚀**

*PnlForge: Forge your success through data.*
