// Vercel API route - main index handler
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configure neon to use WebSockets
neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  // CORS headers for API requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return basic API info
  return res.status(200).json({
    message: 'TikTok Analytics API - Root Endpoint',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    note: 'This is the root API endpoint. Please use specific endpoints like /api/hello for actual functionality.',
    endpoints: [
      '/api/hello - Health check and environment info',
      '/api/auth/me - Authentication status (always returns 401 for now)'
    ]
  });
}