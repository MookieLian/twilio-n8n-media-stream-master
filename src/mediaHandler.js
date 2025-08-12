const { createTranscriber } = require('./services/transcriber');
const { createTts } = require('./services/tts');
const { createN8nOrchestrator } = require('./services/n8n');

function handleMediaStream(mediaStream) {
  const transcriber = createTranscriber();
  const tts = createTts();
  const orchestrator = createN8nOrchestrator();

  let streamSid = null;

  mediaStream.on('data', async (chunk) => {
    const msg = JSON.parse(chunk.toString('utf8'));
    if (msg.event === 'start') {
      streamSid = msg.start.streamSid;
      orchestrator.onCallStarted({ callSid: msg.start.callSid, streamSid });
      return;
    }
    if (msg.event !== 'media') return;
    const base64Mulaw = msg.media.payload;
    transcriber.sendMulaw(base64Mulaw);
  });

  transcriber.on('transcript', async ({ text, isFinal }) => {
    if (!text) return;
    const reply = await orchestrator.onUserTranscript(text, { isFinal });
    if (!reply) return;
    const mulawB64 = await tts.synthesizeToMulawBase64(reply);
    if (!mulawB64 || !streamSid) return;
    const mediaMessage = JSON.stringify({
      event: 'media',
      streamSid,
      media: { payload: mulawB64 }
    });
    mediaStream.write(mediaMessage);
  });

  mediaStream.on('finish', () => {
    transcriber.finish();
    orchestrator.onCallFinished();
  });
}

module.exports = { handleMediaStream };


