# Tkrell Deployment Checklist

## ✅ Completed
- [x] Code cleaned of Manus references
- [x] Pushed to GitHub
- [x] Vercel project created
- [x] VITE_API_URL set in Vercel

## 🔄 In Progress - Vercel Environment Variables

Add these in Vercel → Settings → Environment Variables:

1. **VITE_APP_TITLE**
   - Value: `Tkrell - AI-Powered Education Platform`

2. **VITE_APP_LOGO**
   - Value: `https://via.placeholder.com/150x50/00BFA6/FFFFFF?text=Tkrell`

After adding, Vercel will auto-redeploy (takes ~2 minutes)

## 📋 Backend Setup (Render)

Your backend should be at: `https://tkrell.onrender.com`

### Check if backend is running:
1. Visit: `https://tkrell.onrender.com/api/trpc`
2. Should see a response (not 404)

### Required Environment Variables on Render:
- `NODE_ENV` = `production`
- `JWT_SECRET` = `QwECiwf2RYcXshLpeQevoOqYIR98Sl8B2rHSs18FLpE=`
- `DATABASE_URL` = (your database connection string)
- `OPENAI_API_KEY` = (optional, for AI features)

## 🎯 Next Steps

1. Add the 2 environment variables in Vercel
2. Wait for Vercel to redeploy
3. Visit your Vercel URL
4. Check browser console for any errors
5. Test the app functionality

## 🐛 Troubleshooting

If you see errors:
- Check Vercel deployment logs
- Check Render backend logs
- Verify DATABASE_URL is correct
- Make sure backend is not sleeping (Render free tier sleeps after inactivity)

## 📝 URLs

- Frontend: Your Vercel URL (e.g., `https://tkrellapp-xxx.vercel.app`)
- Backend: `https://tkrell.onrender.com`
- GitHub: `https://github.com/tijayminitate-max/Tkrell`
