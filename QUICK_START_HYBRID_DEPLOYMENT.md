# Tkrell - Quick Start Hybrid Deployment

## 🚀 5-Minute Setup Overview

This is a quick reference guide. For detailed instructions, see `HYBRID_DEPLOYMENT_GUIDE.md`.

## Architecture

```
GitHub → Vercel (Frontend) → Railway (Backend) → Supabase (Database)
                                    ↓
                        AWS S3 + Canva API
```

## Checklist

### 1. GitHub Setup (5 min)

```bash
cd /path/to/tkrell-refactored
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tkrell.git
git branch -M main
git push -u origin main
```

### 2. Supabase Setup (5 min)

1. Go to https://supabase.com → Create Project
2. Copy **Connection String** (PostgreSQL URI)
3. Run migrations:
   ```bash
   export DATABASE_URL="your_supabase_connection_string"
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

### 3. AWS S3 Setup (5 min)

1. Create S3 bucket: `tkrell-files-[username]`
2. Create IAM user with S3 access
3. Generate **Access Key ID** and **Secret Access Key**

### 4. Google OAuth Setup (5 min)

1. Go to https://console.cloud.google.com
2. Create OAuth credentials
3. Add redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`
   - `https://your-railway-backend.railway.app/auth/callback`
4. Copy **Client ID** and **Client Secret**

### 5. OpenAI Setup (2 min)

1. Go to https://platform.openai.com
2. Create API key
3. Copy **API Key**

### 6. Canva Setup (5 min)

1. Go to https://www.canva.com/developers
2. Create app
3. Copy **API Key** and **API Secret**

### 7. Railway Backend (10 min)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `tkrell` repository
4. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=your_supabase_url
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=generate_random_string
   OPENAI_API_KEY=your_openai_key
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_S3_BUCKET=tkrell-files-[username]
   AWS_REGION=us-east-1
   CANVA_API_KEY=your_canva_key
   ```
5. Deploy and copy your Railway domain

### 8. Vercel Frontend (10 min)

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend.railway.app
   ```
5. Deploy

### 9. Connect Frontend to Backend (2 min)

Update `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-railway-backend.railway.app/api/$1"
    }
  ]
}
```

### 10. Test Everything (5 min)

1. Visit your Vercel domain
2. Test grade selection
3. Test profile creation
4. Test authentication
5. Test file upload
6. Test chat assistant

## Environment Variables Summary

| Variable | Where to Get | Required |
| --- | --- | --- |
| `DATABASE_URL` | Supabase | ✅ Yes |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | ✅ Yes |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | ✅ Yes |
| `JWT_SECRET` | Generate random string | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI Platform | ✅ Yes |
| `AWS_ACCESS_KEY_ID` | AWS IAM | ✅ Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM | ✅ Yes |
| `AWS_S3_BUCKET` | AWS S3 | ✅ Yes |
| `AWS_REGION` | AWS | ✅ Yes |
| `CANVA_API_KEY` | Canva Developers | ❌ Optional |
| `MPESA_CONSUMER_KEY` | Safaricom Daraja | ❌ Optional |
| `MPESA_CONSUMER_SECRET` | Safaricom Daraja | ❌ Optional |
| `TWILIO_ACCOUNT_SID` | Twilio | ❌ Optional |
| `TWILIO_AUTH_TOKEN` | Twilio | ❌ Optional |

## Troubleshooting

### Build Fails
- Check Railway logs
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

### Frontend Won't Connect to Backend
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration in backend
- Ensure Railway domain is accessible

### Database Migrations Fail
- Verify Supabase connection string
- Check that PostgreSQL dialect is used
- Ensure migrations folder exists

### Canva Integration Not Working
- Verify API key is correct
- Check Canva API documentation
- Ensure API key has required permissions

## Next Steps

1. ✅ Deploy application
2. ✅ Test all features
3. ✅ Set up monitoring
4. ✅ Configure custom domain (optional)
5. ✅ Set up backups
6. ✅ Monitor performance

## Useful Links

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Supabase Docs:** https://supabase.com/docs
- **Canva API Docs:** https://www.canva.com/developers/docs
- **AWS S3 Docs:** https://docs.aws.amazon.com/s3

## Support

For detailed instructions, see:
- `HYBRID_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `CANVA_INTEGRATION_GUIDE.md` - Canva API integration
- `README_REFACTORED.md` - Project documentation

---

**Total Setup Time:** ~60 minutes
**Difficulty:** Intermediate
**Status:** Production Ready
