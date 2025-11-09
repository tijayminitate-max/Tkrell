# Tkrell - Complete Deployment Guide
## Deploy Tkrell to Any Server (Vercel, Railway, Heroku, Self-Hosted)

---

## TABLE OF CONTENTS
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Troubleshooting](#troubleshooting)

---

## PREREQUISITES

### Required Software
- **Node.js**: v18+ (download from https://nodejs.org/)
- **npm** or **pnpm**: Package manager (pnpm recommended)
- **Git**: Version control (download from https://git-scm.com/)
- **MySQL Database**: Cloud or self-hosted

### Accounts Needed
1. **OAuth Provider** (Manus or Google OAuth)
   - Get API credentials from https://api.manus.im or Google Cloud Console
2. **Database Provider** (choose one):
   - **TiDB Cloud** (recommended for Kenya, free tier available)
   - **Supabase** (PostgreSQL)
   - **PlanetScale** (MySQL)
   - **Self-hosted MySQL**
3. **Deployment Platform** (choose one):
   - **Vercel** (easiest, free tier)
   - **Railway** (simple, pay-as-you-go)
   - **Heroku** (legacy, paid)
   - **DigitalOcean** (VPS)
   - **AWS/GCP/Azure** (advanced)

---

## DATABASE SETUP

### Option 1: TiDB Cloud (Recommended for Kenya)
TiDB is optimized for East Africa and has free tier.

**Steps:**
1. Go to https://tidbcloud.com/
2. Sign up with email
3. Create new cluster:
   - Cluster Name: `tkrell`
   - Region: `Singapore` or `Asia Pacific`
   - Tier: `Free` (5GB storage, sufficient for 100K users)
4. Wait for cluster to be ready (5-10 minutes)
5. Click "Connect" and copy the connection string
6. Format: `mysql://username:password@host:port/database`
7. Save this as `DATABASE_URL` in your `.env` file

### Option 2: Supabase (PostgreSQL)
1. Go to https://supabase.com/
2. Sign up with GitHub
3. Create new project
4. Go to Settings → Database → Connection Pooling
5. Copy the connection string
6. Format: `postgresql://user:password@host:port/database`
7. Save as `DATABASE_URL`

### Option 3: PlanetScale (MySQL)
1. Go to https://planetscale.com/
2. Sign up with GitHub
3. Create new database
4. Click "Connect" → "Node.js"
5. Copy the connection string
6. Format: `mysql://username:password@host/database`
7. Save as `DATABASE_URL`

### Option 4: Self-Hosted MySQL
**Using Docker (Easiest):**
```bash
docker run -d \
  --name tkrell-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=tkrell \
  -p 3306:3306 \
  mysql:8.0
```

**Connection String:**
```
mysql://root:your_password@localhost:3306/tkrell
```

---

## ENVIRONMENT CONFIGURATION

### 1. Get OAuth Credentials

#### From Manus (Recommended)
1. Go to https://api.manus.im/
2. Create application
3. Get `VITE_APP_ID` and `OAUTH_SERVER_URL`
4. Set redirect URI to: `https://your-domain.com/api/oauth/callback`

#### From Google OAuth
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable OAuth 2.0
4. Create credentials (OAuth 2.0 Client ID)
5. Add authorized redirect URI: `https://your-domain.com/api/oauth/callback`
6. Get Client ID and Client Secret

### 2. Create `.env` File

**Create file: `.env` in project root**

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# OAuth (Manus)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# JWT Secret (generate random string)
JWT_SECRET=your_random_secret_key_here_min_32_chars

# Owner Information
OWNER_OPEN_ID=your_open_id
OWNER_NAME=Your Name

# Manus APIs (for LLM, Storage, etc.)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key

# Frontend APIs
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Configuration
VITE_APP_TITLE=Tkrell - Learn Smart
NODE_ENV=production
```

### 3. Generate JWT Secret
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (using Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## DEPLOYMENT OPTIONS

### Option A: Deploy to Vercel (Easiest, 5 minutes)

**Prerequisites:**
- GitHub account
- Vercel account (free)

**Steps:**

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/tkrell.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com/
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env` file:
     - `DATABASE_URL`
     - `VITE_APP_ID`
     - `OAUTH_SERVER_URL`
     - `JWT_SECRET`
     - `OWNER_OPEN_ID`
     - `OWNER_NAME`
     - etc.

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live at `https://your-project.vercel.app`

5. **Update OAuth Redirect URI**
   - Go to your OAuth provider settings
   - Update redirect URI to: `https://your-project.vercel.app/api/oauth/callback`

### Option B: Deploy to Railway (Simple, 10 minutes)

**Prerequisites:**
- GitHub account
- Railway account (free tier: $5/month credit)

**Steps:**

1. **Push code to GitHub** (same as Vercel)

2. **Connect to Railway**
   - Go to https://railway.app/
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Select your repository
   - Click "Deploy"

3. **Add Database**
   - In Railway dashboard, click "Add Service"
   - Select "MySQL"
   - Click "Create"
   - Copy connection string from MySQL service

4. **Configure Environment Variables**
   - Click on your app service
   - Go to "Variables"
   - Add all variables from `.env` file
   - Set `DATABASE_URL` to MySQL connection string

5. **Deploy**
   - Railway auto-deploys on push to main
   - Your app is live at `https://your-project.up.railway.app`

### Option C: Deploy to DigitalOcean (Self-Hosted, 20 minutes)

**Prerequisites:**
- DigitalOcean account ($5/month droplet)

**Steps:**

1. **Create Droplet**
   - Go to https://cloud.digitalocean.com/
   - Click "Create" → "Droplets"
   - Select: Ubuntu 22.04 LTS
   - Size: Basic ($5/month)
   - Region: Singapore or Bangalore (closest to Kenya)
   - Click "Create Droplet"

2. **SSH into Droplet**
```bash
ssh root@your_droplet_ip
```

3. **Install Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
apt install -y mysql-server

# Install Nginx (reverse proxy)
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

4. **Clone Repository**
```bash
cd /var/www
git clone https://github.com/your-username/tkrell.git
cd tkrell
```

5. **Setup Environment**
```bash
# Create .env file
nano .env
# Paste your environment variables
```

6. **Install Dependencies & Build**
```bash
pnpm install
pnpm build
```

7. **Start Application**
```bash
pm2 start "pnpm start" --name "tkrell"
pm2 startup
pm2 save
```

8. **Configure Nginx**
```bash
# Create Nginx config
nano /etc/nginx/sites-available/tkrell
```

**Paste this:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable and restart:**
```bash
ln -s /etc/nginx/sites-available/tkrell /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

9. **Setup SSL (Free)**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## POST-DEPLOYMENT SETUP

### 1. Initialize Database
```bash
# Run migrations
pnpm db:push
```

### 2. Create Admin User
```bash
# Access database and create admin
mysql -u user -p database_name
INSERT INTO users (openId, name, email, role) VALUES ('admin-id', 'Admin', 'admin@tkrell.com', 'admin');
```

### 3. Seed Initial Content
```bash
# Add sample questions and materials
pnpm seed
```

### 4. Test OAuth Flow
1. Go to your deployed app
2. Click "Sign In"
3. Complete OAuth flow
4. Verify you're logged in

### 5. Configure Domain
- Point your domain DNS to your deployment
- Update OAuth redirect URI in provider settings

---

## TROUBLESHOOTING

### Database Connection Error
**Error:** `ECONNREFUSED 127.0.0.1:3306`

**Solution:**
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host database_name
```

### OAuth Redirect URI Mismatch
**Error:** `redirect_uri_mismatch`

**Solution:**
1. Check your deployed domain
2. Update OAuth provider settings:
   - Redirect URI should be: `https://your-domain.com/api/oauth/callback`
3. Redeploy app

### Out of Memory
**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=2048 pnpm start
```

### Port Already in Use
**Error:** `EADDRINUSE :::3000`

**Solution:**
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

---

## MONITORING & MAINTENANCE

### View Logs
**Vercel:**
- Dashboard → Deployments → Click deployment → Logs

**Railway:**
- Dashboard → Click app → Logs tab

**DigitalOcean:**
```bash
pm2 logs tkrell
```

### Monitor Performance
```bash
# Check app status
pm2 status

# View memory usage
pm2 monit

# View error logs
pm2 logs tkrell --err
```

### Backup Database
```bash
# MySQL backup
mysqldump -u user -p database_name > backup.sql

# Restore from backup
mysql -u user -p database_name < backup.sql
```

---

## NEXT STEPS

1. **Add Content**: Upload past papers, notes, and materials
2. **Configure Payments**: Setup M-Pesa or card payments
3. **Enable Analytics**: Track user behavior
4. **Setup Email**: Configure transactional emails
5. **Monitor Performance**: Setup uptime monitoring
6. **Plan Marketing**: Launch referral program

---

## SUPPORT

For issues:
1. Check logs first
2. Review error messages
3. Test database connection
4. Verify environment variables
5. Check OAuth configuration

Good luck deploying Tkrell! 🚀
