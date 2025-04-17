// Vercel API route for auth status
export default function handler(req, res) {
  // For now, just return not authenticated
  res.status(401).json({ message: 'Not authenticated' });
}