## Twilio + n8n Voice Agent (Node.js)

Minimal voice agent using Twilio Programmable Voice Media Streams, Google Cloud STT/TTS, and n8n for orchestration with OpenRouter/OpenAI models.

### Features
- Real-time transcription via Google Speech-to-Text (mulaw/8k)
- Response generation via n8n workflow (uses OpenRouter/OpenAI inside n8n)
- TTS via Google Cloud Text-to-Speech converted to mulaw/8k and streamed back to Twilio
- Ready for Easypanel deploy (Dockerfile included)

### Endpoints
- POST `/twiml`: Returns `<Stream>` TwiML pointing to your `wss://.../media`
- WS `/media`: Twilio Media Streams WebSocket
- GET `/healthz`: health probe

### Quick start
1. Create a Google Cloud service account with Speech and Text-to-Speech permissions. Download JSON.
2. Create `.env` from `.env.example` and fill values. Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to the mounted JSON path in your container or host.
3. `npm install` then `npm run dev` locally. Use a TLS tunnel (e.g. `ngrok`) and set `WS_PUBLIC_URL` to your public `wss://<host>/media`.
4. Configure Twilio Voice webhook (TwiML App or Incoming Number) to POST to `https://<host>/twiml`.
5. Build and run container in Easypanel. Mount the service account file to `/app/creds/google-sa.json` and set envs accordingly.

### n8n contract
Set `N8N_WEBHOOK_BASE_URL` to your n8n webhook base. Create these handlers:
- POST `{base}/call-started` body: `{ callSid, streamSid }`
- POST `{base}/user-transcript` body: `{ text, isFinal }` → return JSON `{ reply: "..." }`
- POST `{base}/call-finished`

Inside n8n, connect to OpenRouter/OpenAI and implement your conversation logic. Return a concise `reply` string.