# Tkrell - Kiro Deployment Guide

## Overview

Tkrell is an AI-powered education platform designed for the Kenyan curriculum. This guide provides step-by-step instructions for deploying Tkrell on the Kiro platform.

## Prerequisites

Before deploying to Kiro, ensure you have:

1. **Kiro Account** - Sign up at https://kiro.app
2. **Git Repository** - Push your code to GitHub or GitLab
3. **Environment Variables** - Collect all required credentials
4. **Database** - TiDB Cloud account (recommended) or MySQL database

## Environment Variables Required

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name
AWS_REGION=us-east-1

# M-Pesa (Optional)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Step 1: Prepare Your Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/tkrell.git
cd tkrell

# Install dependencies
pnpm install

# Build the project
pnpm build

# Commit changes
git add .
git commit -m "Prepare for Kiro deployment"
git push origin main
```

## Step 2: Create Kiro Project

1. Log in to your Kiro dashboard
2. Click "New Project"
3. Select "Node.js" as the runtime
4. Connect your GitHub repository
5. Select the main branch

## Step 3: Configure Environment Variables

In the Kiro dashboard:

1. Go to Project Settings → Environment Variables
2. Add all variables from the `.env.production` file
3. Ensure `NODE_ENV` is set to `production`

## Step 4: Configure Build Settings

In the Kiro dashboard:

1. Go to Build Settings
2. Set **Build Command**: `pnpm install && pnpm build`
3. Set **Start Command**: `pnpm start`
4. Set **Node Version**: 22.13.0

## Step 5: Configure Database

### Option A: TiDB Cloud (Recommended)

1. Create a TiDB Cluster at https://tidbcloud.com
2. Get your connection string
3. Add to environment variables as `DATABASE_URL`

### Option B: MySQL

1. Set up a MySQL database
2. Get your connection string: `mysql://user:password@host:port/database`
3. Add to environment variables as `DATABASE_URL`

## Step 6: Run Database Migrations

After deployment, run migrations:

```bash
# SSH into your Kiro instance
kiro ssh your-project-name

# Run migrations
pnpm db:push
```

## Step 7: Deploy

1. In the Kiro dashboard, click "Deploy"
2. Monitor the deployment progress
3. Once complete, your app will be live at: `https://your-project-name.kiro.app`

## Post-Deployment Checklist

- [ ] Verify the application is running
- [ ] Test user authentication (Google OAuth)
- [ ] Test grade selection functionality
- [ ] Verify database connections
- [ ] Test file uploads (if enabled)
- [ ] Check M-Pesa integration (if configured)
- [ ] Monitor error logs
- [ ] Set up monitoring and alerts

## Monitoring and Logs

View logs in the Kiro dashboard:

```bash
# Real-time logs
kiro logs your-project-name

# Specific log level
kiro logs your-project-name --level=error
```

## Scaling

To scale your application:

1. Go to Project Settings → Scaling
2. Adjust the number of instances
3. Configure auto-scaling rules
4. Set resource limits (CPU, Memory)

## Troubleshooting

### Build Fails

```bash
# Check build logs in Kiro dashboard
# Common issues:
# - Missing environment variables
# - Incorrect Node version
# - Missing dependencies
```

### Database Connection Error

```bash
# Verify DATABASE_URL format
# mysql://user:password@host:port/database

# Test connection
mysql -h host -u user -p database
```

### Application Crashes

```bash
# Check logs
kiro logs your-project-name

# Restart application
kiro restart your-project-name
```

## Security Best Practices

1. **Environment Variables** - Never commit `.env` files
2. **Database** - Use strong passwords and restrict access
3. **API Keys** - Rotate regularly
4. **HTTPS** - Enabled by default on Kiro
5. **Rate Limiting** - Implement in your application
6. **CORS** - Configure properly for your domain

## Performance Optimization

1. **Enable Caching** - Configure Redis for session storage
2. **Database Indexing** - Optimize database queries
3. **CDN** - Use Kiro's built-in CDN for static assets
4. **Compression** - Enable gzip compression
5. **Monitoring** - Set up performance monitoring

## Backup and Disaster Recovery

1. **Database Backups** - Enable automated backups
2. **Code Backups** - Keep Git history
3. **Environment Variables** - Store securely
4. **Disaster Recovery Plan** - Document procedures

## Support

For issues with Kiro deployment:

1. Check Kiro documentation: https://docs.kiro.app
2. Contact Kiro support: support@kiro.app
3. Check application logs for errors
4. Review environment variables

## Next Steps

After successful deployment:

1. Set up custom domain (optional)
2. Configure SSL certificate
3. Set up monitoring and alerts
4. Implement analytics
5. Plan scaling strategy
6. Set up backup procedures

---

**Last Updated**: November 2025
**Version**: 1.0.0
