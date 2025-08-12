const textToSpeech = require('@google-cloud/text-to-speech');
const { WaveFile } = require('wavefile');

function createTts() {
  const client = new textToSpeech.TextToSpeechClient();

  async function synthesizeToMulawBase64(text) {
    if (!text || text.trim().length === 0) return null;
    const [response] = await client.synthesizeSpeech({
      input: { text },
      // Choose your favorite voice here
      voice: {
        languageCode: process.env.GOOGLE_TTS_LANGUAGE_CODE || 'en-US',
        ssmlGender: process.env.GOOGLE_TTS_GENDER || 'NEUTRAL',
      },
      audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 16000 },
    });

    const wav = new WaveFile();
    wav.fromBuffer(response.audioContent);
    wav.toSampleRate(8000);
    wav.toMuLaw();
    return Buffer.from(wav.data.samples).toString('base64');
  }

  return { synthesizeToMulawBase64 };
}

module.exports = { createTts };


