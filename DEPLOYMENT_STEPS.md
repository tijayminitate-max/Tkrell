# Quick Railway Deployment Steps

## 1. Login to Railway
```bash
railway login
```
This will open your browser to authenticate.

## 2. Create a new project
```bash
cd tkrell-refactored
railway init
```
Give it a name like "tkrell" when prompted.

## 3. Add MySQL database
```bash
railway add --database mysql
```

## 4. Set environment variables
```bash
railway variables set JWT_SECRET="QwECiwf2RYcXshLpeQevoOqYIR98Sl8B2rHSs18FLpE="
railway variables set OPENAI_API_KEY="your-openai-api-key-here"
railway variables set NODE_ENV="production"
railway variables set VITE_APP_TITLE="Tkrell - AI-Powered Education Platform"
```

## 5. Deploy
```bash
railway up
```

## 6. Get your app URL
```bash
railway domain
```

That's it! Your app will be live at the URL shown.

## Optional: View logs
```bash
railway logs
```

## Optional: Open in browser
```bash
railway open
```
