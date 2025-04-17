# Deploying to Vercel

This guide will help you deploy your TikTok Analytics Dashboard to Vercel.

## Prerequisites

1. A GitHub repository with your project code (which you've already pushed)
2. A Vercel account (you can sign up at https://vercel.com using your GitHub account)
3. A PostgreSQL database (like Neon or Supabase)

## Steps for Deployment

### 1. Set Up Your Database

If you don't have a database yet:
- Create a free PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com)
- Get your database connection string

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Find and select your GitHub repository
4. Configure the project:
   - Framework Preset: Select "Vite"
   - Root Directory: Keep as `.` (root)
   - Build Command: Vercel will automatically use the one in package.json
   - Output Directory: `dist`

### 3. Configure Environment Variables

In the Vercel deployment settings, add these environment variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `TIKTOK_API_KEY`: Your TikTok API key from RapidAPI

### 4. Deploy!

Click "Deploy" and wait for the build to complete.

### 5. Set Up Database Schema

After the first deployment, you'll need to set up your database schema:

1. Clone your repository locally
2. Add your environment variables to a `.env` file
3. Run `npm run db:push` to push the schema to your database

## Troubleshooting

If you encounter issues:

1. Check Vercel build logs for any errors
2. Ensure your database connection string is correct and the database is accessible
3. If API calls fail, verify your TikTok API key is correctly set

## Additional Notes

- Vercel automatically handles continuous deployment - any push to your main branch will trigger a new deployment
- You can configure custom domains in the Vercel project settings
- For more complex setup, you might need to adjust the `vercel.json` configuration file