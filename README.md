# DFO BYOC Sample App

A simple Express application that demonstrates OAuth client credentials flow and message handling for the DFO BYOC (Bring Your Own Channel) platform.

## Features

- OAuth 2.0 client credentials grant endpoint
- Message posting endpoint with bearer token authentication
- UUID generation for message responses
- Request logging

## Prerequisites

- Node.js (v14 or higher)
- Yarn or npm
- CXone account with appropriate permissions
- (Optional) NGROK for local development

## CXone Configuration

### 1. Create BYOC Integration

1. Navigate to the CXone Admin Portal
2. Create a new BYOC integration with the following details:
   - Name: (Choose a descriptive name)
   - Integration Box URL: `<<your base URL>>/integration/box`
   - Authorization URL: `<<your base URL>>/integration/box/1.0/token`
   - Client ID: `2f52ebe1-45d0-4f36-a9d0-a94c788f53c6`
   - Client Secret: `a2051bd7-462e-4817-a28e-bedfb570d739`
   - Color: (Choose a color for the channel selector)
   - Icon: (Choose an icon for the channel selector)
   - Leave "Use DFO 3.0 Outbound API for replies" disabled

Note: The following URLs are not implemented in this sample app but may be needed in a production implementation:
- Action URL: `/integration/action`
- Reconnect URL: `/integration/reconnect`
- Remove URL: `/integration/remove`

Save the configuration and note the Integration ID provided.

### 2. Generate CXone JWT

1. Create Access Key/Secret:
   - Follow the instructions at [Manage Access Keys](https://help.nice-incontact.com/content/admin/security/manageaccesskeys.htm)

2. Authorize using the endpoint:
   - Follow the authentication process described in [Getting Started](https://developer.niceincontact.com/Documentation/GettingStarted)

### 3. Create Channel

Create a channel in your integration using the API:
- [Channel Create API](https://developer.niceincontact.com/API/DigitalEngagementAPI#/Channel%20(Point%20of%20Contact)/create-update-Channel)

### 4. Optional: NGROK Setup for Local Development

1. Install NGROK and configure with your token
2. Start the application:
   ```bash
   yarn start
   # or
   npm start
   ```
3. In a separate terminal, run:
   ```bash
   ngrok http 3000
   ```
4. Update the BYOC integration configuration with the NGROK URL

### 5. Test Message Flow

1. Create a new inbound message using the API:
   - [Create Message API](https://developer.niceincontact.com/API/DigitalEngagementAPI#/Message/channels-channelId-createmessage)
   - Use the Channel ID from step 3

2. In the agent application (CXA or MAX):
   - Search for the conversation
   - Send a reply

### Expected Flow

1. Initial message attempt (401 Unauthorized)
2. Token request to `/integration/box/1.0/token`
3. Second message attempt with valid token
4. Webhook delivery

Monitor the application console and NGROK monitor for request/response details.

## Installation

1. Clone the repository
2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Copy the example environment file and configure it:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration values.

4. Start the server:
```bash
yarn start
# or
npm start
```

For development with auto-restart:
```bash
yarn dev
# or
npm run dev
```

## Environment Variables

The following environment variables are required:

- `PORT`: The port the server will listen on (default: 3000)
- `CLIENT_ID`: OAuth client ID
- `CLIENT_SECRET`: OAuth client secret
- `JWT_SECRET`: Secret key for JWT token signing (should be a secure random string)

## API Endpoints

### 1. Get OAuth Token
```
POST /integration/box/1.0/token
Content-Type: application/json

{
  "client_id": "2f52ebe1-45d0-4f36-a9d0-a94c788f53c6",
  "client_secret": "a2051bd7-462e-4817-a28e-bedfb570d739",
  "grant_type": "client_credentials"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

### 2. Post Message
```
POST /integration/box/1.0/posts/:id/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "your message here"
}
```

Response:
```json
{
  "idOnExternalPlatform": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Error Responses

### Invalid Grant Type
```json
{
  "error": "unsupported_grant_type"
}
```

### Invalid Client Credentials
```json
{
  "error": "invalid_client"
}
```

### Invalid Token
```json
{
  "error": "Invalid token"
}
```

## Notes

- Tokens expire after 24 hours
- All requests are logged to the console in the format:
  ```json
  {
    "postId": "post-id",
    "payload": { ... },
    "timestamp": "2024-04-24T04:29:00.000Z"
  }
  ```
- No payload validation is performed
- This is a sample application and should not be used in production without additional security measures 