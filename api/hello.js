// Simple standalone health check endpoint for Vercel that also tests database connection
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configure neon to use WebSockets
neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  try {
    // Test if we can connect to the database
    let dbStatus = 'Not connected';
    let dbError = null;
    
    if (process.env.DATABASE_URL) {
      try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        // Test the connection with a simple query
        await pool.query('SELECT 1');
        dbStatus = 'Connected';
      } catch (error) {
        dbStatus = 'Error connecting';
        dbError = error.message;
      }
    } else {
      dbStatus = 'No DATABASE_URL found';
    }
    
    // Return information about the environment
    res.status(200).json({
      message: 'TikTok Analytics API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV || 'not set',
        database_url_exists: !!process.env.DATABASE_URL,
        tiktok_api_key_exists: !!process.env.TIKTOK_API_KEY,
      },
      database: {
        status: dbStatus,
        error: dbError
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error in API endpoint',
      error: error.message
    });
  }
}