# Birthdae Agent Gateway

CloudBase container service that exposes a narrow HTTP tool API for a Birthdae agent.

## Endpoint

`POST /agent-tools`

The request must include a short-lived, HMAC-signed `actorToken`. The gateway currently supports `contact.search` and `contact.details` for the token's personal-contact scope.

## CloudBase deployment

Deploy this repository from CloudBase Cloud Run with port `8080` and set these environment variables in the deployment console:

```ini
CLOUDBASE_ENV_ID=your-complete-cloudbase-environment-id
AGENT_TOKEN_SECRET=the-same-secret-used-by-agentSession
```

Do not commit a `.env` file, actor token, API key, or contact data.
