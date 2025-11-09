# Tkrell Setup Guide - Explained Simply ✨

## Think of it Like This...

Imagine you're building a house:
- **The code** = The blueprints
- **GitHub** = Your filing cabinet where you keep the blueprints
- **Vercel** = The company that builds the front of your house (what people see)
- **Railway** = The company that builds the back of your house (the engine)
- **Supabase** = The company that stores all your stuff (furniture, decorations)

Let's build your house step by step!

---

## Step 1: Create Your Filing Cabinet (GitHub)

### What is GitHub?
It's like a cloud storage for your code. It keeps track of all your files and changes.

### How to do it:

1. Go to https://github.com
2. Click "Sign up" (create a new account if you don't have one)
3. Choose a username (this will be in your project URL)
4. Complete the signup process

**That's it!** You now have your filing cabinet. ✅

---

## Step 2: Upload Your Code to GitHub

### What we're doing:
We're putting all the Tkrell code into your filing cabinet so the builders can access it.

### How to do it:

1. Download the `tkrell-refactored` folder
2. Go to GitHub.com and click the "+" icon in the top right
3. Click "New repository"
4. Name it: `tkrell`
5. Choose "Public" (so the builders can see it)
6. Click "Create repository"
7. Follow the instructions to upload your code

**Don't worry about the technical steps** - just follow GitHub's instructions exactly.

---

## Step 3: Get Your Toolbox (API Keys)

### What is this?
These are like keys that let different services talk to each other.

### You need these keys:

#### A. Google (for login)
1. Go to https://console.cloud.google.com
2. Click "Create Project"
3. Name it: `Tkrell`
4. Go to "Credentials" on the left
5. Click "Create Credentials" → "OAuth Client ID"
6. Choose "Web application"
7. Add these URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`
   - `https://your-railway-backend.railway.app/auth/callback`
8. Copy the **Client ID** and **Client Secret** and save them somewhere safe

#### B. OpenAI (for AI features)
1. Go to https://platform.openai.com
2. Click "API keys" on the left
3. Click "Create new secret key"
4. Copy it and save it somewhere safe

#### C. AWS (for storing files)
1. Go to https://aws.amazon.com
2. Create an account
3. Go to S3 service
4. Click "Create bucket"
5. Name it: `tkrell-files-yourname`
6. Click "Create bucket"
7. Go to IAM service
8. Click "Users" → "Create user"
9. Name it: `tkrell-s3-user`
10. Give it S3 access
11. Create access keys and save them

#### D. Supabase (for database)
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in the details
4. Wait for it to be created
5. Go to "Settings" → "Database"
6. Copy the connection string

**You now have all your keys!** 🔑

---

## Step 4: Build the Front of Your House (Vercel)

### What is Vercel?
It's a company that hosts the part of your app that people see (the website).

### How to do it:

1. Go to https://vercel.com
2. Click "Sign up" (use your GitHub account)
3. Click "Import Project"
4. Select your `tkrell` repository from GitHub
5. Click "Import"
6. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-railway-backend.railway.app`
7. Click "Deploy"
8. Wait for it to finish (it will say "Ready")
9. Copy your Vercel domain (it looks like `tkrell-abc123.vercel.app`)

**Your front door is now built!** 🚪

---

## Step 5: Build the Engine (Railway)

### What is Railway?
It's a company that hosts the engine of your app (the part that does the thinking).

### How to do it:

1. Go to https://railway.app
2. Click "New Project"
3. Click "Deploy from GitHub repo"
4. Authorize Railway to access GitHub
5. Select your `tkrell` repository
6. Click "Deploy"
7. Wait for the first build (it might take 5-10 minutes)
8. Go to "Settings" and add these environment variables:

```
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=generate_a_random_long_string
OPENAI_API_KEY=your_openai_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=tkrell-files-yourname
AWS_REGION=us-east-1
```

9. Click "Deploy" again
10. Copy your Railway domain (it looks like `tkrell-backend.railway.app`)

**Your engine is now running!** ⚙️

---

## Step 6: Connect Everything Together

### Update Vercel with Railway URL

1. Go back to Vercel
2. Go to "Settings" → "Environment Variables"
3. Update `VITE_API_URL` to your Railway domain
4. Click "Save"
5. Click "Redeploy"

**Everything is now connected!** 🔗

---

## Step 7: Test Your House

### Make sure everything works:

1. Go to your Vercel domain (e.g., `https://tkrell-abc123.vercel.app`)
2. You should see the Tkrell homepage
3. Click "Sign In"
4. Try signing in with Google
5. Try selecting a grade
6. Try creating a profile

**If everything works, you're done!** 🎉

---

## Troubleshooting (When Things Go Wrong)

### "The website won't load"
- Wait 5 minutes and refresh
- Check that all environment variables are set correctly
- Check the Vercel logs (click "Deployments" → "View Logs")

### "Can't sign in with Google"
- Make sure Google OAuth credentials are correct
- Make sure redirect URLs are added correctly
- Check the Railway logs

### "Database connection error"
- Make sure Supabase connection string is correct
- Make sure DATABASE_URL is set in Railway
- Check that Supabase project is created

### "File upload doesn't work"
- Make sure AWS keys are correct
- Make sure S3 bucket name is correct
- Check AWS region

---

## What Happens Next?

### Your app is now live! 🚀

People can now:
1. Visit your website
2. Sign in with Google
3. Select their grade
4. View study notes
5. Take quizzes
6. Track their progress

### To make it even better:

1. **Add a custom domain** - Instead of `tkrell-abc123.vercel.app`, use `tkrell.com`
2. **Add more content** - Create more study notes and past papers
3. **Promote it** - Tell students about your app
4. **Collect feedback** - Ask students what they like and don't like
5. **Keep improving** - Add new features based on feedback

---

## Quick Reference

| What | Where | What to Copy |
| --- | --- | --- |
| Code Storage | GitHub | Repository URL |
| Front Website | Vercel | Domain (e.g., tkrell-abc123.vercel.app) |
| Engine | Railway | Domain (e.g., tkrell-backend.railway.app) |
| Database | Supabase | Connection String |
| Login | Google Cloud | Client ID & Secret |
| AI | OpenAI | API Key |
| Files | AWS S3 | Access Key & Secret |

---

## You Did It! 🎓

You've successfully deployed Tkrell! You're now a web developer. Congratulations! 🎉

If you get stuck, remember:
- Read error messages carefully
- Google the error message
- Check the logs
- Ask for help

Good luck! 🚀

---

**Need Help?**
- Vercel Support: https://vercel.com/support
- Railway Support: https://railway.app/support
- Supabase Support: https://supabase.com/support
- GitHub Help: https://docs.github.com
