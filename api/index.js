// Vercel serverless function entry point
// This file exports the Express app for Vercel's serverless environment

import('../dist/index.js').then((module) => {
  module.default || module;
}).catch((err) => {
  console.error('Failed to load server:', err);
});

// Export handler for Vercel
export default async function handler(req, res) {
  try {
    const app = await import('../dist/index.js');
    return app.default(req, res) || app(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
