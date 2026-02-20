# Quick Deployment Guide - PnlForge

## Option 1: Vercel (Recommended - 5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"

### Step 3: Configure Environment Variables
1. Go to Project Settings → Environment Variables
2. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SOLANA_RPC_URL`
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - `DERIVERSE_PROGRAM_ID`

3. Click "Save & Redeploy"

✅ App is live! Get your URL from Vercel dashboard.

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

## Monitoring

### Error Tracking (Optional)
```bash
# In environment variables, add:
SENTRY_DSN=your_sentry_dns

# Then in Vercel/Docker, errors auto-report to Sentry
```

### View Logs

**Vercel**: 
- Project Settings → Logging

**Docker**:
```bash
docker logs <container-id>
```

**VPS**:
```bash
pm2 logs pnlforge
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

## Domain Configuration

### Vercel
1. Add domain in Settings → Domains
2. Update DNS at domain registrar to Vercel nameservers

### Docker/VPS
1. Update DNS A record to your server IP
2. Wait for propagation (15 min - 2 days)
3. Test with `curl https://your-domain.com`

---

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Wallet connection works
- [ ] Trades sync properly
- [ ] Dashboard displays data
- [ ] Filters work
- [ ] Export functions work
- [ ] AI assistant responds
- [ ] Mobile looks good
- [ ] Performance is acceptable
- [ ] Errors are logged (Sentry)

---

## Troubleshooting

**Build fails**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Can't connect to database**
- Verify Supabase credentials in env
- Check Supabase project is active
- Allow database connections from your IP

**JWT errors**
- Ensure JWT_SECRET is long (32+ chars)
- Check token isn't expired
- Verify refresh token cookie is set

**Slow performance**
- Enable Supabase query optimization
- Add caching headers
- Use CDN for static assets

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
