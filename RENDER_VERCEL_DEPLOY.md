# Deploy to Render + Vercel

## Part 1: Deploy Backend to Render

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your repository OR upload the `tkrell-refactored` folder
4. Configure:
   - **Name**: tkrell-backend
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `QwECiwf2RYcXshLpeQevoOqYIR98Sl8B2rHSs18FLpE=`
   - `OPENAI_API_KEY` = your OpenAI key
   - `DATABASE_URL` = (will be auto-filled when you add database)

6. Add PostgreSQL Database:
   - Click "New +" → "PostgreSQL"
   - Name: tkrell-db
   - Plan: Free
   - Copy the "Internal Database URL" and paste it as `DATABASE_URL` in your web service

7. Click "Create Web Service"

8. Once deployed, copy your backend URL (e.g., `https://tkrell-backend.onrender.com`)

## Part 2: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up/login
2. Click "Add New" → "Project"
3. Import the `tkrell-refactored` folder
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `pnpm install`

5. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://tkrell-backend.onrender.com`)

6. Click "Deploy"

## Done!

Your app will be live at:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://tkrell-backend.onrender.com`

The frontend will automatically connect to the backend API.
