# TikTok Analytics Dashboard

A modern, responsive analytics dashboard that allows users to track and visualize TikTok content performance. Built with React, TypeScript, and Express.

## Features

- User authentication with secure session management
- Connect and track multiple TikTok accounts
- View detailed performance analytics including views, likes, comments, and engagement rates
- Analyze top and bottom performing videos
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: React, TypeScript, TanStack Query, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, PostgreSQL (via Drizzle ORM)
- **Authentication**: Custom authentication with sessions
- **Data Visualization**: Recharts
- **API Integration**: TikTok data via RapidAPI

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/dimitrivahlas/tiktok-analytics-dashboard.git
   cd tiktok-analytics-dashboard
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the project root and add:
   ```
   DATABASE_URL=your_postgresql_connection_string
   TIKTOK_API_KEY=your_tiktok_api_key_from_rapidapi
   ```

4. Initialize the database
   ```
   npm run db:push
   ```

5. Start the development server
   ```
   npm run dev
   ```

## Deployment

This project is configured for deployment on Vercel. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

- `/client` - Frontend React application
- `/server` - Express API server
- `/shared` - Shared types and database schema
- `/api` - Serverless functions for Vercel deployment

## License

MIT