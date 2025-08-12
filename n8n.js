const axios = require('axios');

function createN8nOrchestrator() {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL; // e.g. https://your-n8n/WEBHOOK
  const apiKey = process.env.N8N_API_KEY; // optional if you secure with header
  const headers = {};
  if (apiKey) headers['x-api-key'] = apiKey;

  function onCallStarted({ callSid, streamSid }) {
    if (!baseUrl) return;
    axios.post(`${baseUrl}/call-started`, { callSid, streamSid }, { headers }).catch(() => {});
  }

  async function onUserTranscript(text, { isFinal }) {
    if (!baseUrl) return null;
    try {
      const resp = await axios.post(`${baseUrl}/user-transcript`, { text, isFinal }, { headers, timeout: 15000 });
      // Expect { reply: string }
      return resp.data && resp.data.reply ? String(resp.data.reply) : null;
    } catch (e) {
      return null;
    }
  }

  function onCallFinished() {
    if (!baseUrl) return;
    axios.post(`${baseUrl}/call-finished`, {}, { headers }).catch(() => {});
  }

  return { onCallStarted, onUserTranscript, onCallFinished };
}

module.exports = { createN8nOrchestrator };


