# Quick Deployment Guide - PnlForge

## 🚀 QUICK START (2 Min Summary)

Your app is ready to deploy RIGHT NOW! Here's the fastest path:

1. **Go to https://vercel.com** → Sign up with GitHub
2. **Click "Add New" → "Project"** → Select `PnLForge` repo → Click "Import"
3. **Set Root Directory:** `pnl-forge-dashboard-design` → Click "Deploy"
4. ⏳ **Wait 2-3 minutes** for build to complete
5. **Go to Settings → Environment Variables** → Add 7 vars from `.env.local`
6. **Click "Deployments" → Redeploy** the latest deployment
7. ✅ **Your app is LIVE** at `your-app.vercel.app`

**Total time: ~10 minutes**

---

## Detailed Step-by-Step Guide

## Option 1: Vercel (Recommended - 10 minutes)

### Step 1: Ensure Code is Pushed
```bash
cd /root/Deriverse
git status                    # Should be clean
git push origin main          # Push latest changes
```

### Step 2: Create Vercel Account
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. ✅ Account created

### Step 3: Import Project to Vercel
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Find and click **"PnLForge"** repository
4. Click **"Import"**

### Step 4: Configure Project Settings
On the "Configure Project" page:
- **Project Name**: `pnlforge` (or your preference)
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `pnl-forge-dashboard-design`
- **Node Version**: 20.x (default is fine)

Then click **"Deploy"**

*⏳ Vercel will build your app (2-3 minutes)*

### Step 5: Add Environment Variables
Once deployment completes, click **"Settings"** → **"Environment Variables"**

Add these 7 variables:

| Variable | Value | Where to Find | Public? |
|----------|-------|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tkwgcyfbelzomocmlrai.supabase.co` | `.env.local` line 2 | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (long string) | `.env.local` line 3 | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (different long string) | `.env.local` line 4 | ❌ No |
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` | `.env.local` line 7 | ✅ Yes |
| `HUGGINGFACE_API_KEY` | `hf_HrUXDm...` | `.env.local` line 17 | ❌ No |
| `DERIVERSE_PROGRAM_ID` | `CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2` | `.env.local` line 10 | ✅ Yes |
| `JWT_SECRET` | `a1402647cbbaf9...` | `.env.local` line 21 | ❌ No |

**For each variable:**
1. Paste the value
2. Select environment: **"Production and Preview"** (or just "Production" for secrets)
3. Click **"Save"**

✅ **Pro tip:** Variables starting with `NEXT_PUBLIC_` are visible in browser (safe to share). Others are kept on server (secure).

### Step 6: Redeploy with Environment Variables
1. Go back to **"Deployments"** tab
2. Click the three dots (⋯) on latest deployment
3. Click **"Redeploy"**
4. Confirm **"Redeploy"**

⏳ Wait 2-3 minutes for rebuild with env vars

### Step 7: Test Your Deployment
Once deployment completes:
1. Click the deployment preview URL
2. Wait for app to load
3. Test these features:
   - ✅ Homepage loads
   - ✅ Try Demo button works
   - ✅ Connect Wallet button appears
   - ✅ Dashboard loads with mock data

✅ Your app is now live! Share the URL from Vercel dashboard.

---

## Option 2: Docker (Self-Hosted)

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start
CMD ["npm", "start"]
```

### Step 2: Build & Run
```bash
docker build -t pnlforge .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  pnlforge
```

✅ App available at http://localhost:3000

---

## Option 3: Traditional VPS

### Step 1: SSH into Server
```bash
ssh user@your-vps.com
cd /var/www
```

### Step 2: Clone & Setup
```bash
git clone <your-repo> pnlforge
cd pnlforge
npm install
```

### Step 3: Create .env.production
```bash
cat > .env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
...
EOF
```

### Step 4: Build & Start
```bash
npm run build
npm start
```

### Step 5: Setup Reverse Proxy (nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 6: Use PM2 for Persistence
```bash
npm install -g pm2
pm2 start npm --name "pnlforge" -- start
pm2 startup
pm2 save
```

✅ App live at your-domain.com

---

## Database Setup

### One-Time Setup (All Options)

1. Go to https://supabase.com
2. Create new project
3. In SQL Editor, run:
```sql
-- Copy entire contents of lib/database.schema.sql and paste here
```
4. Wait for tables to creation
5. Copy project URL and keys to your environment

✅ Database ready!

---

## Testing Deployment

Once live, test these:

```bash
# 1. App loads
curl https://your-app.com

# 2. Health check
curl https://your-app.com/api/auth/challenge -X POST

# 3. Connect wallet in browser
# Open https://your-app.com
```

---

## Monitoring & Analytics

### Vercel Dashboard Features

**Real-time Logs**
- Go to **Deployments** → **Runtime Logs**
- See API errors and console output
- Filter by error/warning

**Performance Analytics** (Optional)
- Go to **Settings** → **Analytics**
- Enable Web Vitals tracking
- Monitor: LCP, FID, CLS, FCP, TTFB
- Identify performance bottlenecks

**Uptime Monitoring** (Optional)
- Go to **Integrations** marketplace
- Add status page or monitoring service
- Get alerts if app goes down

### View Recent Deployments

- **Deployments** tab shows all pushes
- Green checkmark = ✅ Successful
- Red X = ❌ Failed
- Click to see logs

### Automatic Deployments

Vercel deploys automatically when you:
```bash
git push origin main
# or merge PR to main branch
```

Speed: ~1-2 minutes from push to live!

## Updating Your App

### Quick Updates (Most Changes)
```bash
# Make changes locally
git add .
git commit -m "Your message"
git push origin main

# Vercel detects, builds, deploys automatically ✅
# Check Deployments tab to confirm
```

### Database Schema Updates
If you add new tables:
```bash
# 1. Run new SQL in Supabase SQL Editor
# 2. Update lib/types.ts with new types
# 3. git push origin main
# 4. Vercel redeploys with new types
```

### Environment Variable Updates
```bash
# 1. Go to Settings → Environment Variables
# 2. Add/update variable
# 3. Click "Save"
# 4. Go to Deployments → Redeploy production
# 5. Wait 2-3 minutes for rebuild
```

---

## SSL/HTTPS

**Vercel**: Automatic ✅

**Docker** (with nginx):
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get cert
sudo certbot certonly --standalone -d your-domain.com

# Configure nginx with cert paths
```

**VPS**: Use Let's Encrypt via Certbot (same as above)

---

## Custom Domain on Vercel (Optional)

### Option A: Vercel Nameservers (Easiest)
1. Go to **Settings** → **Domains**
2. Enter your domain: `example.com`
3. Click **"Add"**
4. Vercel shows nameservers to add at your registrar
5. Go to your domain registrar (Namecheap, GoDaddy, etc.)
6. Update nameservers to Vercel's
7. Wait 24-48 hours for propagation
8. ✅ `https://example.com` ready

### Option B: DNS Records (If you want to keep registrar)
1. **Settings** → **Domains**
2. Enter `example.com`
3. Select **"Use external nameservers"**
4. Add the A and CNAME records to your registrar's DNS settings
5. Vercel shows you exactly what to add
6. ⏳ Wait for DNS propagation
7. ✅ Domain ready

### HTTPS (SSL)
- ✅ Automatic with Vercel
- Certificate auto-renews
- No additional setup needed!

## Production Environment Switch (When Ready)

### Use Mainnet Instead of Devnet
When you're ready for production:

1. Update **Environment Variables** in Vercel:
   ```
   SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
   ```

2. Update wallet network in code:
   - File: `lib/wallet-context.tsx`
   - Change: `WalletAdapterNetwork.Devnet` → `WalletAdapterNetwork.Mainnet`
   - Push to GitHub
   - Vercel auto-redeploys

3. ✅ Now using real Solana network with real trades!

### Docker/VPS
1. Update DNS A record to your server IP
2. Wait for propagation (15 min - 2 days)
3. Test with `curl https://your-domain.com`

---

## Post-Deployment Checklist

- [ ] App loads without errors at your Vercel URL
- [ ] Wallet connection works (try with Phantom or Solflare)
- [ ] Dashboard displays mock data on first load
- [ ] Filters work (date range, side, symbol)
- [ ] Export trade data works
- [ ] AI assistant responds to queries
- [ ] Mobile responsiveness looks good
- [ ] No console errors (F12 → Console)
- [ ] Performance is acceptable (< 3s load time)
- [ ] Error tracking is logging issues

---

## Troubleshooting

### Common Vercel Issues

**1. Build Failed: "Cannot find module"**
```
Solution: Environment variables missing
- Go to Settings → Environment Variables
- Verify ALL env vars are set
- Click Redeploy from Deployments tab
```

**2. Blank Page / App Won't Load**
```
Solution: Frontend environment vars not set
- NEXT_PUBLIC_* vars must be set in Vercel
- These are visible in browser (not secrets)
- Redeploy after adding them
```

**3. 404 - Page Not Found**
```
Solution: Wrong root directory
- Settings → General
- Verify Root Directory: pnl-forge-dashboard-design
- Redeploy
```

**4. Can't Connect Wallet**
```
Possible causes:
- Wallet provider network mismatch (should be Devnet for testing)
- RPC URL unreachable
- Check browser console for errors (F12 → Console tab)
```

**5. API Routes Not Working**
```
Verify:
- SUPABASE_SERVICE_ROLE_KEY is set (server-only)
- JWT_SECRET is 32+ characters
- Database tables exist (run schema.sql in Supabase)
```

**6. Slow Performance**
```
Optimization:
- Enable Vercel Analytics (Settings → Analytics)
- Use Vercel Edge Functions for API routes
- Consider upgrading Supabase tier if database is bottleneck
```

### Debug Mode

View build logs:
1. Go to **Deployments** tab
2. Click failed deployment
3. Click **"Build Logs"** to see errors
4. Click **"Runtime Logs"** to see runtime errors

### Check Environment Variables

```bash
# Verify vars in Vercel (go to Settings → Environment Variables)
# Each variable should show: ✅ Production

# Common mistake: Setting Production only
# But also need Preview environment for PR deployments
# Solution: Set for All when adding variables
```

---

## Updates & Rollbacks

### Deploy New Version
```bash
git add .
git commit -m "New feature"
git push origin main

# Vercel: Auto-deploys
# VPS: Run: git pull && npm run build && pm2 restart pnlforge
```

### Rollback to Previous Version
```bash
git revert <commit-hash>
git push origin main
# Vercel/VPS auto-redeploys previous version
```

---

## Cost Estimation

| Service | Free Tier | Cost Notes |
|---------|-----------|-----------|
| Vercel | Generous | Pay for usage over limits |
| Supabase | 500MB DB | $25/mo for more |
| Solana RPC | Public | Or use private ($500+) |
| OpenAI API | N/A | $0.015/1K tokens |

**Minimum monthly cost**: ~$25-50 for moderate usage

---

**Deployed successfully?** Test with real wallet and enjoy! 🚀
