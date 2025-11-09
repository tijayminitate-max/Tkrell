# Tkrell - Hybrid Deployment Guide (Vercel + Railway + Supabase + Canva + GitHub)

## Overview

This guide walks you through deploying Tkrell using a modern, scalable architecture:

- **Frontend:** Vercel (React/Vite)
- **Backend:** Railway (Node.js/tRPC)
- **Database:** Supabase (PostgreSQL)
- **Design Integration:** Canva API
- **Version Control:** GitHub
- **File Storage:** AWS S3

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Users                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │     Vercel      │
                    │   (Frontend)    │
                    │  React + Vite   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────────────┐
                    │  Railway (Backend)      │
                    │  Node.js + Express      │
                    │  tRPC API               │
                    └────────┬────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐        ┌─────▼──────┐      ┌─────▼──────┐
   │ Supabase│        │  AWS S3    │      │ Canva API  │
   │(Database)        │ (Storage)  │      │(Design)    │
   └─────────┘        └────────────┘      └────────────┘
```

## Prerequisites

Before starting, ensure you have accounts and access to:

1. **GitHub** - https://github.com (for version control)
2. **Vercel** - https://vercel.com (for frontend hosting)
3. **Railway** - https://railway.app (for backend hosting)
4. **Supabase** - https://supabase.com (for PostgreSQL database)
5. **AWS** - https://aws.amazon.com (for S3 file storage)
6. **OpenAI** - https://openai.com (for AI features)
7. **Canva** - https://canva.com/developers (for design API)
8. **Google Cloud Console** - https://console.cloud.google.com (for OAuth)
9. **M-Pesa** (Optional) - https://developer.safaricom.co.ke (for payments)

## Step 1: GitHub Setup

### 1.1 Create a GitHub Repository

```bash
# Create a new repository on GitHub
# Name: tkrell
# Description: AI-Powered Education Platform for Kenyan Curriculum
# Visibility: Public or Private (your choice)
# Do NOT initialize with README (we have one)
```

### 1.2 Push Code to GitHub

```bash
cd /path/to/tkrell-refactored

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Tkrell refactored with Supabase and hybrid deployment"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/tkrell.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Supabase Setup (Database)

### 2.1 Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name:** tkrell
   - **Database Password:** Generate a strong password
   - **Region:** Choose closest to your users (e.g., us-east-1)
4. Click "Create new project" and wait for initialization

### 2.2 Get Connection String

1. In Supabase dashboard, go to **Settings → Database**
2. Copy the **Connection string** (URI format)
3. It should look like: `postgresql://user:password@host:5432/postgres`

### 2.3 Run Database Migrations

```bash
# Set your Supabase connection string
export DATABASE_URL="postgresql://user:password@host:5432/postgres"

# Generate migrations
pnpm drizzle-kit generate

# Run migrations
pnpm drizzle-kit migrate
```

## Step 3: AWS S3 Setup (File Storage)

### 3.1 Create S3 Bucket

1. Go to https://aws.amazon.com and sign in
2. Navigate to S3 service
3. Click "Create bucket"
4. **Bucket name:** tkrell-files-[your-username]
5. **Region:** us-east-1 (or your preferred region)
6. **Block Public Access:** Keep settings as default
7. Click "Create bucket"

### 3.2 Create IAM User for S3

1. Go to IAM service
2. Click "Users" → "Create user"
3. **User name:** tkrell-s3-user
4. Click "Next"
5. Click "Attach policies directly"
6. Search for and select: `AmazonS3FullAccess`
7. Click "Create user"

### 3.3 Generate Access Keys

1. Click on the created user
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Choose "Application running outside AWS"
5. Copy the **Access Key ID** and **Secret Access Key**

## Step 4: Google OAuth Setup

### 4.1 Create OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. Enable the "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-vercel-domain.vercel.app/auth/callback` (production)
   - `https://your-railway-backend.railway.app/auth/callback` (backend)
7. Copy **Client ID** and **Client Secret**

## Step 5: OpenAI API Setup

1. Go to https://platform.openai.com
2. Sign in or create account
3. Go to "API keys"
4. Click "Create new secret key"
5. Copy the API key

## Step 6: Canva API Setup

### 6.1 Register as Canva Developer

1. Go to https://www.canva.com/developers
2. Sign in with your Canva account
3. Go to "Your apps" → "Create an app"
4. Fill in app details:
   - **App name:** Tkrell
   - **App description:** Educational design integration
5. Accept terms and create app
6. Copy your **API key** and **API secret**

## Step 7: Railway Backend Deployment

### 7.1 Connect GitHub to Railway

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select your `tkrell` repository
6. Click "Deploy"

### 7.2 Configure Environment Variables in Railway

In the Railway dashboard, go to your project and add these variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/postgres
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=generate_a_long_random_string
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=tkrell-files-[your-username]
AWS_REGION=us-east-1
CANVA_API_KEY=your_canva_api_key
MPESA_CONSUMER_KEY=optional
MPESA_CONSUMER_SECRET=optional
TWILIO_ACCOUNT_SID=optional
TWILIO_AUTH_TOKEN=optional
```

### 7.3 Get Railway Backend URL

1. In Railway dashboard, go to "Settings"
2. Copy your **Railway domain** (e.g., `tkrell-backend.railway.app`)
3. Note this for Vercel configuration

## Step 8: Vercel Frontend Deployment

### 8.1 Connect GitHub to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `tkrell` repository
5. Click "Import"

### 8.2 Configure Build Settings

In Vercel project settings:

- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`

### 8.3 Add Environment Variables

In Vercel project settings, go to "Environment Variables" and add:

```
VITE_API_URL=https://your-railway-backend.railway.app
```

### 8.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your frontend will be live at `https://your-project.vercel.app`

## Step 9: Connect Frontend to Backend

### 9.1 Update Vercel API Rewrites

In your `vercel.json`, update the rewrite destination:

```json
{
  "source": "/api/(.*)",
  "destination": "https://your-railway-backend.railway.app/api/$1"
}
```

### 9.2 Update Backend CORS

In your backend code (`server/_core/index.ts`), ensure CORS is configured:

```typescript
app.use(cors({
  origin: "https://your-project.vercel.app",
  credentials: true
}));
```

## Step 10: Database Migrations on Railway

### 10.1 Run Migrations

```bash
# SSH into Railway instance (if available)
# Or run via Railway CLI

# Generate migrations
pnpm drizzle-kit generate

# Run migrations
pnpm drizzle-kit migrate
```

## Step 11: Testing

### 11.1 Test Frontend

1. Visit your Vercel domain: `https://your-project.vercel.app`
2. Test home page loads
3. Test grade selection
4. Test profile creation

### 11.2 Test Backend

1. Check Railway logs for errors
2. Test API endpoints: `https://your-railway-backend.railway.app/api/health`
3. Test database connection
4. Test authentication flow

### 11.3 Test Integrations

1. **Google OAuth:** Try signing in with Google
2. **OpenAI:** Test chat assistant
3. **AWS S3:** Try uploading a file
4. **Canva:** Test design features
5. **M-Pesa (if enabled):** Test payment flow

## Step 12: Custom Domain (Optional)

### 12.1 Add Custom Domain to Vercel

1. In Vercel project settings, go to "Domains"
2. Add your custom domain (e.g., `tkrell.com`)
3. Follow DNS configuration instructions
4. Update Google OAuth redirect URIs with new domain

## Monitoring and Maintenance

### Daily

- Check Railway logs for errors
- Monitor Vercel deployment status
- Check Supabase database health

### Weekly

- Review error logs
- Check performance metrics
- Monitor database size

### Monthly

- Update dependencies
- Review and optimize database queries
- Analyze user behavior

## Troubleshooting

### Frontend Build Fails

```bash
# Check build logs in Vercel
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
```

### Backend Won't Start

```bash
# Check Railway logs
# Common issues:
# - Missing DATABASE_URL
# - Incorrect API keys
# - Database connection failed
```

### Database Connection Error

```bash
# Verify Supabase connection string
# Format: postgresql://user:password@host:5432/postgres
# Test connection locally first
```

### Canva Integration Not Working

1. Verify Canva API key is correct
2. Check Canva API documentation
3. Ensure API key has required permissions

## Security Best Practices

1. **Environment Variables:** Never commit sensitive data
2. **HTTPS:** Always use HTTPS in production
3. **CORS:** Configure properly for your domain
4. **Database:** Use strong passwords, restrict access
5. **API Keys:** Rotate regularly, use minimal permissions
6. **Rate Limiting:** Implement to prevent abuse

## Performance Optimization

### Frontend (Vercel)

- Enable caching headers
- Optimize images
- Use code splitting
- Enable gzip compression

### Backend (Railway)

- Optimize database queries
- Add indexes to frequently queried columns
- Implement caching (Redis)
- Monitor memory usage

### Database (Supabase)

- Create indexes on foreign keys
- Analyze slow queries
- Enable connection pooling
- Regular backups

## Scaling

### When Traffic Increases

1. **Vercel:** Automatically scales (no action needed)
2. **Railway:** Increase instance size in settings
3. **Supabase:** Upgrade plan for more connections
4. **AWS S3:** No scaling needed (auto-scales)

## Backup and Disaster Recovery

### Database Backups

1. Supabase automatically backs up daily
2. Manual backups available in Supabase settings
3. Export data regularly for safety

### Code Backups

1. GitHub is your code backup
2. Keep multiple branches
3. Tag releases

## Support

For issues with specific platforms:

- **Vercel:** https://vercel.com/support
- **Railway:** https://railway.app/support
- **Supabase:** https://supabase.com/support
- **AWS:** https://aws.amazon.com/support
- **Canva:** https://support.canva.com

## Next Steps

1. ✅ Set up GitHub repository
2. ✅ Create Supabase project
3. ✅ Configure AWS S3
4. ✅ Set up Google OAuth
5. ✅ Deploy backend to Railway
6. ✅ Deploy frontend to Vercel
7. ✅ Run database migrations
8. ✅ Test all features
9. ✅ Set up monitoring
10. ✅ Configure custom domain (optional)

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Status:** Production Ready
