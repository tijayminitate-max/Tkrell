# Tkrell Quick Start Deployment Guide

## 📦 What's Included

This ZIP file contains the complete Tkrell application ready for deployment to:
- **Vercel** (Recommended for beginners)
- **Railway** (Recommended for full-stack)
- **Docker** (For self-hosted)

## 🚀 Quick Deploy to Vercel (5 minutes)

### Step 1: Prepare Your Code
```bash
# Extract the ZIP file
unzip Tkrell.zip
cd Tkrell

# Initialize Git
git init
git add .
git commit -m "Initial Tkrell deployment"
git remote add origin https://github.com/YOUR_USERNAME/tkrell.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL`: Your MySQL connection string
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)
   - `VITE_APP_TITLE`: Tkrell - AI-Powered Education Platform
5. Click "Deploy"
6. Your app will be live at `your-project.vercel.app`

### Step 3: Set Custom Domain
1. In Vercel dashboard, go to Settings → Domains
2. Add your domain (e.g., tkrell.com)
3. Update DNS records as instructed
4. SSL certificate is automatic!

---

## 🚂 Deploy to Railway (10 minutes)

### Step 1: Push to GitHub
```bash
# Same as Vercel steps above
```

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub"
5. Choose your Tkrell repository

### Step 3: Add Database
1. Click "Add Service"
2. Select "MySQL"
3. Railway will provision a database automatically
4. Copy the `DATABASE_URL` from the MySQL service

### Step 4: Configure Environment Variables
In Railway dashboard:
1. Go to Variables
2. Add:
   - `DATABASE_URL`: (from MySQL service)
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `VITE_APP_TITLE`: Tkrell - AI-Powered Education Platform
   - `NODE_ENV`: production

### Step 5: Deploy
- Railway automatically deploys when you push to GitHub
- Your app will be live at `your-project.up.railway.app`

### Step 6: Custom Domain
1. In Railway, go to Settings → Domains
2. Add your custom domain
3. Update DNS records

---

## 🐳 Deploy with Docker (15 minutes)

### Local Testing
```bash
# Install Docker and Docker Compose
# https://docs.docker.com/get-docker/

# Build and run
docker-compose up --build

# Access at http://localhost:3000
```

### Deploy to Server (AWS, DigitalOcean, etc.)

```bash
# 1. Build image
docker build -t tkrell:latest .

# 2. Push to Docker Hub
docker tag tkrell:latest yourusername/tkrell:latest
docker push yourusername/tkrell:latest

# 3. SSH into your server
ssh user@your-server.com

# 4. Pull and run
docker run -d \
  --name tkrell \
  -p 80:3000 \
  -e DATABASE_URL="mysql://user:pass@db:3306/tkrell" \
  -e JWT_SECRET="your-secret" \
  yourusername/tkrell:latest

# 5. Set up Nginx reverse proxy (see DEPLOYMENT.md)
```

---

## 📋 Environment Variables Needed

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | MySQL connection string |
| `JWT_SECRET` | ✅ | Session signing secret |
| `OPENAI_API_KEY` | ❌ | For AI features (optional) |
| `VITE_APP_TITLE` | ❌ | App title (default provided) |
| `VITE_APP_LOGO` | ❌ | Logo URL (optional) |

### Generate JWT_SECRET
```bash
openssl rand -base64 32
```

---

## 🗄️ Database Setup

### Option 1: Managed Database (Easiest)
- **Vercel**: Use PlanetScale or AWS RDS
- **Railway**: Railway provides managed MySQL automatically
- **Docker**: Use MySQL container in docker-compose.yml

### Option 2: Self-Hosted MySQL
```sql
CREATE DATABASE tkrell;
CREATE USER 'tkrell_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON tkrell.* TO 'tkrell_user'@'localhost';
FLUSH PRIVILEGES;
```

### Initialize Schema
```bash
# After deploying, run migrations
pnpm db:push
```

---

## 🌐 Custom Domain Setup

### DNS Configuration

For domain `tkrell.com`:

**Vercel:**
- Add CNAME: `tkrell.com` → `cname.vercel-dns.com`

**Railway:**
- Add CNAME: `tkrell.com` → `railway.app`

**Docker/Self-Hosted:**
- Add A record: `tkrell.com` → `your-server-ip`

---

## ✅ Verify Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.com/health

# API test
curl https://your-domain.com/api/trpc/auth.me

# Frontend
Open https://your-domain.com in browser
```

---

## 🆘 Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` format: `mysql://user:pass@host:port/db`
- Verify database is accessible from your deployment region
- For Railway, use the MySQL service URL directly

### Build Fails
- Ensure Node.js 22+ is used
- Check that all dependencies are in package.json
- Try: `pnpm install && pnpm run build`

### WebSocket Errors
- These are normal in development, not production
- Check Vite HMR configuration in vite.config.ts

### Out of Memory
- Increase memory allocation in deployment platform
- Optimize database queries
- Clear cache

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed deployment instructions.

---

## 🎯 Next Steps

1. ✅ Deploy to Vercel/Railway/Docker
2. ✅ Set up custom domain
3. ✅ Configure OpenAI API key (optional)
4. ✅ Test all features
5. ✅ Monitor logs and performance

---

**Questions?** Check DEPLOYMENT.md or README.md

**Last Updated**: November 7, 2025
