# Tkrell Deployment Guide

This guide covers deploying Tkrell to Vercel, Railway, or Docker.

## Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL/TiDB database
- OpenAI API key (optional, for AI features)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-random-secret-key

# OpenAI (optional)
OPENAI_API_KEY=sk-your-openai-api-key

# App Configuration
VITE_APP_TITLE=Tkrell - AI-Powered Education Platform
VITE_APP_LOGO=https://your-logo-url.com/logo.png

# OAuth (if using Manus OAuth)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

## Deployment Options

### Option 1: Deploy to Vercel

Vercel is the easiest option for full-stack Next.js-like applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/tkrell.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Configure environment variables in the Vercel dashboard
   - Click "Deploy"

3. **Set Custom Domain**
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain (e.g., tkrell.com)
   - Update DNS records as instructed

#### Vercel Configuration

The `vercel.json` file is already configured. Key settings:

- **Build Command**: `pnpm run build`
- **Start Command**: `pnpm start`
- **Output Directory**: `dist/public`
- **Function Timeout**: 30 seconds

### Option 2: Deploy to Railway

Railway is a modern platform for deploying full-stack applications.

#### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your Tkrell repository

3. **Add Database**
   - Click "Add Service"
   - Select "MySQL"
   - Railway will automatically provision a database
   - Copy the `DATABASE_URL` from the MySQL service

4. **Configure Environment Variables**
   - In Railway dashboard, go to Variables
   - Add all required environment variables
   - Paste the `DATABASE_URL` from MySQL service

5. **Deploy**
   - Railway will automatically deploy when you push to GitHub
   - Monitor deployment in the "Deployments" tab

6. **Set Custom Domain**
   - In Railway dashboard, go to Settings → Domains
   - Add your custom domain
   - Update DNS records

#### Railway Configuration

The `railway.json` file is already configured. Key settings:

- **Build Command**: `pnpm install && pnpm run build`
- **Start Command**: `pnpm start`
- **Node Version**: 22 (auto-detected)

### Option 3: Docker Deployment

Deploy Tkrell using Docker on any server (AWS, DigitalOcean, etc.).

#### Local Testing with Docker Compose

```bash
# Build and run locally
docker-compose up --build

# Access the app at http://localhost:3000
```

#### Production Deployment

1. **Build Docker Image**
   ```bash
   docker build -t tkrell:latest .
   ```

2. **Push to Docker Registry**
   ```bash
   docker tag tkrell:latest yourusername/tkrell:latest
   docker push yourusername/tkrell:latest
   ```

3. **Deploy to Server**
   ```bash
   # SSH into your server
   ssh user@your-server.com

   # Pull the image
   docker pull yourusername/tkrell:latest

   # Run the container
   docker run -d \
     --name tkrell \
     -p 80:3000 \
     -e DATABASE_URL="mysql://user:pass@db:3306/tkrell" \
     -e JWT_SECRET="your-secret" \
     yourusername/tkrell:latest
   ```

4. **Set Up Reverse Proxy (Nginx)**
   ```nginx
   server {
     listen 80;
     server_name tkrell.com;

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

5. **Set Up SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d tkrell.com
   ```

## Database Setup

### Option 1: Managed Database (Recommended)

- **Vercel**: Use a managed MySQL service (AWS RDS, PlanetScale, etc.)
- **Railway**: Railway provides managed MySQL
- **Docker**: Use MySQL container in docker-compose.yml

### Option 2: Self-Hosted MySQL

```bash
# Install MySQL
sudo apt-get install mysql-server

# Create database
mysql -u root -p
CREATE DATABASE tkrell;
CREATE USER 'tkrell_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON tkrell.* TO 'tkrell_user'@'localhost';
FLUSH PRIVILEGES;
```

### Initialize Database Schema

```bash
# Push schema to database
pnpm db:push

# Seed initial data (optional)
pnpm db:seed
```

## Monitoring and Maintenance

### Health Checks

All deployment options include health checks:

```bash
curl https://your-domain.com/health
```

### Logs

- **Vercel**: View in Vercel dashboard → Deployments → Logs
- **Railway**: View in Railway dashboard → Logs
- **Docker**: `docker logs tkrell`

### Database Backups

- **Vercel/Railway**: Use provider's backup features
- **Docker**: Regular MySQL backups
  ```bash
  mysqldump -u user -p database > backup.sql
  ```

## Performance Optimization

### Caching

- Service Worker caches static assets
- AI responses cached in database
- CDN caches images and static files

### Database Optimization

- Indexes on frequently queried columns
- Connection pooling enabled
- Query optimization in db.ts

### Frontend Optimization

- Code splitting with Vite
- Lazy loading of routes
- Image optimization
- CSS minification

## Troubleshooting

### WebSocket Connection Issues

If you see "failed to connect to websocket" errors:

1. Check Vite HMR configuration in `vite.config.ts`
2. Ensure WebSocket is allowed in your firewall
3. For production, WebSocket is not needed

### Database Connection Errors

```bash
# Test database connection
mysql -h host -u user -p -e "SELECT 1"

# Check DATABASE_URL format
# Should be: mysql://user:password@host:port/database
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm run build
```

### Memory Issues

If deployment runs out of memory:

1. Increase memory allocation in deployment platform
2. Optimize database queries
3. Reduce cache size in service worker

## Custom Domain Setup

### DNS Configuration

For domain `tkrell.com`:

1. **Vercel**
   - Add CNAME record: `tkrell.com` → `cname.vercel-dns.com`

2. **Railway**
   - Add CNAME record: `tkrell.com` → `railway.app`

3. **Docker/Self-Hosted**
   - Add A record: `tkrell.com` → `your-server-ip`

### SSL Certificate

- **Vercel**: Automatic with Let's Encrypt
- **Railway**: Automatic with Let's Encrypt
- **Docker**: Use Certbot with Nginx

## Support

For issues or questions:

- **Documentation**: See README.md
- **GitHub Issues**: https://github.com/yourusername/tkrell/issues
- **Email**: support@tkrell.com

---

**Last Updated**: November 7, 2025
