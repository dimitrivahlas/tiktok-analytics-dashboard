# TikTok Analytics Dashboard

A modern web application that provides visual insights into TikTok video performance with a clean, minimal UI inspired by Notion and Figma.

## Features

- **User Authentication**: Secure login and registration system
- **TikTok Account Management**: Add and track multiple TikTok accounts
- **Performance Analytics**: Track views, likes, comments, and shares
- **Top & Bottom Performers**: Easily identify your best and worst performing content
- **Engagement Metrics**: Calculate and visualize engagement rates
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React with TypeScript, Vite, TanStack Query
- **UI Components**: Tailwind CSS, Shadcn UI
- **Backend**: Express.js, PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Express Session
- **API Integration**: TikTok API (via RapidAPI)

## Setup

### Prerequisites

- Node.js v16+
- PostgreSQL (for production use)

### Installation

1. Clone the repository
```bash
git clone https://github.com/dimtrivahlas/tiktok-analytics-dashboard.git
cd tiktok-analytics-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgres://user:password@localhost:5432/tiktok_analytics
TIKTOK_API_KEY=your_rapidapi_key
```

4. Run the database migrations
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

## Usage

1. Register a new account or login with the demo account:
   - Username: demo
   - Password: password123

2. Add your TikTok account by entering your TikTok username

3. View analytics for your videos including:
   - Top performing videos
   - Lowest performing videos
   - Overall engagement metrics
   - Growth metrics

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend
- `/shared` - Shared types and schemas
- `/drizzle` - Database schema and migrations

## License

MIT

## Credits

Developed by @dimtrivahlas