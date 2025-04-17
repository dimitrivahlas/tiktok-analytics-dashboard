// This file serves as an entry point for Vercel serverless functions
// It forwards all API requests to the main Express server

import { createServer } from 'http';
import { app } from '../dist/index.js';

const server = createServer(app);
export default server;