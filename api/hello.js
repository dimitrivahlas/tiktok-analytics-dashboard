// A simple health check endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'TikTok Analytics API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}