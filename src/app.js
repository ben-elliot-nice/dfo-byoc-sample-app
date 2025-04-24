// Load environment variables from .env file
require('dotenv').config();

// Import required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // HTTP request logger
app.use(bodyParser.json()); // Parse JSON request bodies

// Load OAuth configuration from environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// Create router for all /integration/box/ endpoints
const router = express.Router();

// Handle OAuth token requests
router.post('/1.0/token', (req, res) => {
  // Extract credentials from request body
  const { client_id, client_secret, grant_type } = req.body;

  // Validate grant type
  if (grant_type !== 'client_credentials') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }

  // Validate client credentials
  if (client_id !== CLIENT_ID || client_secret !== CLIENT_SECRET) {
    return res.status(401).json({ error: 'invalid_client' });
  }

  // Generate JWT token with 24 hour expiration
  const token = jwt.sign({ client_id }, JWT_SECRET, { expiresIn: '24h' });

  // Return token response
  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 24 * 60 * 60
  });
});

// Handle message posting requests
router.post('/1.0/posts/:id/messages', (req, res) => {
  // Extract and validate Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract token from Authorization header
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify JWT token
    jwt.verify(token, JWT_SECRET);
    
    // Log received message details
    console.log('Received message:', {
      postId: req.params.id,
      payload: req.body,
      timestamp: new Date().toISOString()
    });

    // Return success response with generated UUID
    res.status(200).json({
      idOnExternalPlatform: uuidv4()
    });
  } catch (error) {
    // Handle invalid token
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Mount router at /integration/box path
app.use('/integration/box', router);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 