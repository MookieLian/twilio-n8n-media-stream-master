const EventEmitter = require('events');
const Speech = require('@google-cloud/speech');

function createTranscriber() {
  const emitter = new EventEmitter();
  const speechClient = new Speech.SpeechClient();
  let stream = null;
  let streamCreatedAt = 0;

  function ensureStream() {
    const now = Date.now();
    if (!stream || (now - streamCreatedAt) > 55 * 1000) {
      if (stream) stream.destroy();
      stream = speechClient
        .streamingRecognize({
          config: {
            encoding: 'MULAW',
            sampleRateHertz: 8000,
            languageCode: process.env.GOOGLE_LANGUAGE_CODE || 'en-US',
          },
          interimResults: true,
        })
        .on('error', (err) => emitter.emit('error', err))
        .on('data', (data) => {
          const result = data.results[0];
          if (!result || !result.alternatives[0]) return;
          emitter.emit('transcript', { text: result.alternatives[0].transcript, isFinal: result.isFinal });
        });
      streamCreatedAt = now;
    }
    return stream;
  }

  function sendMulaw(base64Mulaw) {
    const writable = ensureStream();
    const buffer = Buffer.from(base64Mulaw, 'base64');
    writable.write(buffer);
  }

  function finish() {
    if (stream) stream.destroy();
  }

  emitter.sendMulaw = sendMulaw;
  emitter.finish = finish;
  return emitter;
}

module.exports = { createTranscriber };


