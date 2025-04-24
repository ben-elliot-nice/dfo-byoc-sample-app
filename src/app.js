require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// OAuth client configuration from environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// Create router for /integration/box/ endpoints
const router = express.Router();

// OAuth token endpoint
router.post('/1.0/token', (req, res) => {
  const { client_id, client_secret, grant_type } = req.body;

  if (grant_type !== 'client_credentials') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }

  if (client_id !== CLIENT_ID || client_secret !== CLIENT_SECRET) {
    return res.status(401).json({ error: 'invalid_client' });
  }

  // Generate token with 24 hour expiration
  const token = jwt.sign({ client_id }, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 24 * 60 * 60
  });
});

// Message endpoint
router.post('/1.0/posts/:id/messages', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    jwt.verify(token, JWT_SECRET);
    
    // Log the payload
    console.log('Received message:', {
      postId: req.params.id,
      payload: req.body,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      idOnExternalPlatform: uuidv4()
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Mount the router at /integration/box
app.use('/integration/box', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 