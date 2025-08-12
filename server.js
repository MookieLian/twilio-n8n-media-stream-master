require('dotenv').config();
const express = require('express');
const expressWs = require('express-ws');
const websocketStream = require('websocket-stream/stream');
const { handleMediaStream } = require('./src/mediaHandler');

const PORT = process.env.PORT || 8080;

const app = express();
expressWs(app, null, { perMessageDeflate: false });

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Twilio fetches TwiML here
app.post('/twiml', (req, res) => {
  const host = req.headers['x-original-host'] || req.hostname;
  const wsUrl = (process.env.WS_PUBLIC_URL || `wss://${host}/media`).replace(/\/$/, '');
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Start>\n    <Stream url="${wsUrl}" />\n  </Start>\n  <Pause length="3600"/>\n</Response>`);
});

// Twilio Media Streams WebSocket endpoint
app.ws('/media', (ws, req) => {
  const mediaStream = websocketStream(ws, { binary: false });
  handleMediaStream(mediaStream);
});

app.get('/healthz', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Voice agent listening on :${PORT}`);
});


