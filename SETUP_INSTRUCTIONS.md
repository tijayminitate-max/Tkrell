# Tkrell Setup Instructions
## Complete Guide to Get Tkrell Running on Your Server

---

## WHAT YOU NEED

1. **A Database** (Choose one):
   - TiDB Cloud (Recommended for Kenya) - FREE
   - Supabase - FREE tier available
   - PlanetScale - FREE tier available
   - Self-hosted MySQL - FREE

2. **OAuth Provider** (Choose one):
   - Manus OAuth (Recommended) - FREE
   - Google OAuth - FREE

3. **Deployment Platform** (Choose one):
   - Vercel - FREE tier
   - Railway - $5/month
   - DigitalOcean - $5/month
   - Self-hosted VPS - $5-20/month

4. **Domain Name** (Optional but recommended):
   - Namecheap, GoDaddy, etc. - $1-3/year

---

## STEP 1: GET DATABASE CONNECTION STRING (5 minutes)

### Using TiDB Cloud (EASIEST & RECOMMENDED)

1. Go to https://tidbcloud.com/
2. Click "Sign Up" → Create account with email
3. Click "Create Cluster"
4. Fill in:
   - Cluster Name: `tkrell`
   - Cluster Type: `Serverless`
   - Region: `Singapore` (closest to Kenya)
5. Click "Create"
6. Wait 5 minutes for cluster to be ready
7. Click "Connect" button
8. Copy the connection string (looks like: `mysql://...`)
9. **SAVE THIS** - you'll need it in Step 3

---

## STEP 2: GET OAUTH CREDENTIALS (5 minutes)

### Using Manus OAuth (RECOMMENDED)

1. Go to https://api.manus.im/
2. Sign up with email
3. Create new application:
   - App Name: `Tkrell`
   - Redirect URI: `http://localhost:3000/api/oauth/callback` (for now)
4. Copy these values:
   - `VITE_APP_ID`
   - `OAUTH_SERVER_URL` (usually https://api.manus.im)
5. **SAVE THESE** - you'll need them in Step 3

---

## STEP 3: CONFIGURE ENVIRONMENT VARIABLES (5 minutes)

### On Your Computer (Local Testing)

1. Open the Tkrell folder in your code editor
2. Create a new file called `.env` in the root folder
3. Copy and paste this template:

```env
# Database (from Step 1)
DATABASE_URL=mysql://your_username:your_password@your_host:port/your_database

# OAuth (from Step 2)
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# JWT Secret (generate random string - use this command below)
JWT_SECRET=generate_this_with_command_below

# Owner Info (your details)
OWNER_OPEN_ID=your_oauth_id
OWNER_NAME=Your Name

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key_here

VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key_here

# App Settings
VITE_APP_TITLE=Tkrell - Learn Smart
NODE_ENV=production
```

4. **Generate JWT_SECRET:**

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (using Node.js):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as `JWT_SECRET` value.

5. Replace all `your_*` values with actual values from Steps 1 & 2

---

## STEP 4: TEST LOCALLY (10 minutes)

### Install Dependencies
```bash
# Open terminal/command prompt in Tkrell folder
pnpm install
```

### Start Development Server
```bash
pnpm dev
```

### Test the App
1. Open browser to http://localhost:3000
2. Click "Sign In"
3. Complete OAuth login
4. You should see the dashboard

If you see errors, check:
- DATABASE_URL is correct
- OAuth credentials are correct
- All required environment variables are set

---

## STEP 5: DEPLOY TO PRODUCTION (Choose One Option)

### OPTION A: Deploy to Vercel (EASIEST - 5 minutes)

**Prerequisites:**
- GitHub account (free at https://github.com/)
- Vercel account (free at https://vercel.com/)

**Steps:**

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial Tkrell deployment"
git remote add origin https://github.com/YOUR_USERNAME/tkrell.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com/
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Paste: `https://github.com/YOUR_USERNAME/tkrell.git`
   - Click "Import"

3. **Add Environment Variables**
   - In Vercel, go to "Settings" → "Environment Variables"
   - Add each variable from your `.env` file:
     - `DATABASE_URL`
     - `VITE_APP_ID`
     - `OAUTH_SERVER_URL`
     - `JWT_SECRET`
     - `OWNER_OPEN_ID`
     - `OWNER_NAME`
     - `BUILT_IN_FORGE_API_URL`
     - `BUILT_IN_FORGE_API_KEY`
     - `VITE_FRONTEND_FORGE_API_URL`
     - `VITE_FRONTEND_FORGE_API_KEY`
     - `VITE_APP_TITLE`
     - `NODE_ENV=production`

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live!

5. **Update OAuth Redirect URI**
   - Go back to Manus OAuth settings
   - Change Redirect URI to: `https://YOUR_VERCEL_URL/api/oauth/callback`
   - (Vercel URL shown after deployment)

6. **Redeploy**
   - In Vercel, click "Deployments" → Latest → "Redeploy"

**Your app is now live!** 🎉

---

### OPTION B: Deploy to Railway (10 minutes)

**Prerequisites:**
- GitHub account
- Railway account (free at https://railway.app/)

**Steps:**

1. **Push code to GitHub** (same as Option A, steps 1)

2. **Connect to Railway**
   - Go to https://railway.app/
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your tkrell repository
   - Click "Deploy"

3. **Add MySQL Database**
   - In Railway dashboard, click "Add Service"
   - Select "MySQL"
   - Click "Create"
   - Wait for database to be ready

4. **Configure Environment Variables**
   - Click on your app service (not MySQL)
   - Go to "Variables" tab
   - Add all variables from `.env` file
   - For `DATABASE_URL`, use the MySQL connection string from the MySQL service

5. **Deploy**
   - Railway auto-deploys
   - Your app is live at the URL shown

---

### OPTION C: Deploy to DigitalOcean (20 minutes)

**Prerequisites:**
- DigitalOcean account ($5/month)
- SSH knowledge

**Steps:**

1. **Create Droplet**
   - Go to https://cloud.digitalocean.com/
   - Click "Create" → "Droplets"
   - Choose: Ubuntu 22.04 LTS
   - Size: $5/month
   - Region: Singapore (closest to Kenya)
   - Click "Create Droplet"

2. **SSH into Server**
```bash
ssh root@YOUR_DROPLET_IP
```

3. **Install Software**
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

# Install PM2 (keeps app running)
npm install -g pm2
```

4. **Clone and Setup**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/tkrell.git
cd tkrell

# Create .env file
nano .env
# Paste your environment variables
# Press Ctrl+X, then Y, then Enter to save
```

5. **Install and Build**
```bash
pnpm install
pnpm build
```

6. **Start App**
```bash
pm2 start "pnpm start" --name "tkrell"
pm2 startup
pm2 save
```

7. **Setup Nginx (Web Server)**
```bash
apt install -y nginx

# Create config
nano /etc/nginx/sites-available/tkrell
```

Paste this:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com;

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

Save and enable:
```bash
ln -s /etc/nginx/sites-available/tkrell /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

8. **Setup Free SSL**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d YOUR_DOMAIN.com
```

**Your app is now live!** 🎉

---

## STEP 6: VERIFY DEPLOYMENT

1. Open your app URL in browser
2. Click "Sign In"
3. Complete OAuth login
4. Verify dashboard loads
5. Check that data is being saved

---

## STEP 7: NEXT STEPS

After deployment:

1. **Add Content**
   - Upload past papers
   - Add study notes
   - Create question banks

2. **Setup Payments** (Optional)
   - Configure M-Pesa for Kenyan users
   - Or use Stripe/PayPal

3. **Monitor Performance**
   - Check logs regularly
   - Monitor database usage
   - Track user growth

4. **Marketing**
   - Share with friends
   - Post on social media
   - Partner with schools

---

## TROUBLESHOOTING

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Verify database is running
- Check firewall allows connections

### "OAuth login fails"
- Check VITE_APP_ID is correct
- Verify Redirect URI matches deployed URL
- Check OAUTH_SERVER_URL is correct

### "App crashes after deployment"
- Check all environment variables are set
- Review logs in deployment platform
- Ensure database is accessible

### "Database out of memory"
- Increase droplet size (if self-hosted)
- Archive old data
- Optimize queries

---

## SUPPORT

If you get stuck:
1. Check the logs (each platform has different log viewers)
2. Verify all environment variables are set correctly
3. Test database connection manually
4. Review error messages carefully
5. Ask for help in developer communities

---

## CONGRATULATIONS! 🎉

Your Tkrell app is now live and ready to serve students across Kenya!

Start adding content and marketing to grow your user base.

Good luck! 🚀
