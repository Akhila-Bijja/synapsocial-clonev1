// server/routes/content.js
// Content Creator API — AgentX (image, chat, TTS, ASR) + Magic Hour (video)

const router = require('express').Router();
const axios = require('axios');

const AGENTX_BASE = 'https://api.agentx.so/api/v1';
const AGENTX_KEY = process.env.AGENTX_API_KEY;
const MAGIC_HOUR_KEY = process.env.MAGIC_HOUR_API_KEY;

const agentxHeaders = () => ({
  'Authorization': `Bearer ${AGENTX_KEY}`,
  'Content-Type': 'application/json',
});

// ── Helper: create or reuse an AgentX conversation ───────────────
const getOrCreateConversation = async (agentId, existingConvId) => {
  if (existingConvId) return existingConvId;
  const { data } = await axios.post(
    `${AGENTX_BASE}/access/agents/${agentId}/conversations/new`,
    {},
    { headers: agentxHeaders() }
  );
  return data.id || data.conversationId || data._id;
};

// ── Helper: send message to AgentX agent ─────────────────────────
const sendToAgent = async (conversationId, message) => {
  const { data } = await axios.post(
    `${AGENTX_BASE}/access/conversations/${conversationId}/message`,
    { message },
    { headers: agentxHeaders() }
  );
  // AgentX returns the AI reply text
  return data.reply || data.message || data.content || data.text || JSON.stringify(data);
};

// ── Extract image URL from AgentX reply ──────────────────────────
const extractImageUrl = (text) => {
  const match = text.match(/https?:\/\/[^\s"')]+(?:\.png|\.jpg|\.jpeg|\.webp|\.gif)/i)
    || text.match(/https?:\/\/[^\s"')]+/);
  return match ? match[0] : null;
};

// ──────────────────────────────────────────────────────────────────
// POST /api/content/image — Generate image via AgentX image agent
// ──────────────────────────────────────────────────────────────────
router.post('/image', async (req, res) => {
  try {
    const { prompt, style = 'photorealistic' } = req.body;
    if (!prompt) return res.status(400).json({ message: 'prompt is required' });

    const agentId = process.env.AGENTX_IMAGE_AGENT_ID;
    if (!agentId) return res.status(500).json({ message: 'AGENTX_IMAGE_AGENT_ID not set in .env' });

    const convId = await getOrCreateConversation(agentId, null);
    const fullPrompt = `Generate an image: ${prompt}. Style: ${style}. Please generate and show the image.`;
    const reply = await sendToAgent(convId, fullPrompt);
    const imageUrl = extractImageUrl(reply);

    res.json({ reply, imageUrl, conversationId: convId });
  } catch (err) {
    console.error('Image gen error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// POST /api/content/video — Generate video via Magic Hour API
// ──────────────────────────────────────────────────────────────────
router.post('/video', async (req, res) => {
  try {
    const { prompt, duration = 5 } = req.body;
    if (!prompt) return res.status(400).json({ message: 'prompt is required' });

    if (!MAGIC_HOUR_KEY) {
      return res.status(500).json({ message: 'MAGIC_HOUR_API_KEY not set in .env' });
    }

    // Magic Hour text-to-video endpoint
    const { data } = await axios.post(
      'https://api.magichour.ai/api/v1/text-to-video',
      {
        prompt,
        duration: Number(duration),
        aspect_ratio: '16:9',
      },
      {
        headers: {
          'Authorization': `Bearer ${MAGIC_HOUR_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // Magic Hour returns a job ID for async processing
    const jobId = data.id || data.job_id || data.jobId;
    res.json({
      status: 'pending',
      jobId,
      message: '🎬 Video generation started. Polling for completion...',
    });
  } catch (err) {
    console.error('Video gen error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// GET /api/content/video/status/:jobId — Poll Magic Hour job status
// ──────────────────────────────────────────────────────────────────
router.get('/video/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data } = await axios.get(
      `https://api.magichour.ai/api/v1/text-to-video/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${MAGIC_HOUR_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const status = data.status === 'complete' ? 'completed'
      : data.status === 'failed' ? 'failed'
      : 'pending';

    res.json({
      status,
      videoUrl: data.download_url || data.video_url || data.url || null,
      message: data.status,
    });
  } catch (err) {
    console.error('Video poll error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// POST /api/content/tts — Text to Speech via AgentX Voice API
// ──────────────────────────────────────────────────────────────────
router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'en-US-Neural2-F' } = req.body;
    if (!text) return res.status(400).json({ message: 'text is required' });
    if (text.length > 2000) return res.status(400).json({ message: 'Text too long (max 2000 chars)' });

    const { data } = await axios.post(
      `${AGENTX_BASE}/voiceApi/tts/synthesize`,
      { text, voice },
      { headers: agentxHeaders(), responseType: 'arraybuffer' }
    );

    // Return as base64 so frontend can play it directly
    const base64Audio = Buffer.from(data).toString('base64');
    res.json({ audioBase64: base64Audio, voice });
  } catch (err) {
    console.error('TTS error:', err.response?.data || err.message);
    // Try JSON error from arraybuffer response
    let msg = err.message;
    try {
      if (err.response?.data) {
        const text = Buffer.from(err.response.data).toString('utf8');
        msg = JSON.parse(text)?.message || msg;
      }
    } catch {}
    res.status(500).json({ message: msg });
  }
});

// ──────────────────────────────────────────────────────────────────
// POST /api/content/asr — Speech to Text via AgentX Voice API
// ──────────────────────────────────────────────────────────────────
router.post('/asr', async (req, res) => {
  try {
    const { audioBase64, language = '' } = req.body;
    if (!audioBase64) return res.status(400).json({ message: 'audioBase64 is required' });

    const body = { audio: audioBase64 };
    if (language) body.language = language;

    const { data } = await axios.post(
      `${AGENTX_BASE}/voiceApi/asr/recognize`,
      body,
      { headers: agentxHeaders() }
    );

    res.json({
      transcript: data.text || data.transcript || data.result || '',
      language: data.language || language,
    });
  } catch (err) {
    console.error('ASR error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// POST /api/content/chat — Content Writing via AgentX chat agent
// ──────────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message, contentType = 'caption', conversationId } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required' });

    const agentId = process.env.AGENTX_CHAT_AGENT_ID;
    if (!agentId) return res.status(500).json({ message: 'AGENTX_CHAT_AGENT_ID not set in .env' });

    const contextMap = {
      caption: 'Write an engaging social media caption.',
      script: 'Write a video script. Include intro, main content, and CTA.',
      blog: 'Write a well-structured blog post.',
      linkedin: 'Write a professional LinkedIn post with a hook and insights.',
      tweet: 'Write concise, punchy tweet(s) under 280 characters each.',
      youtube: 'Write a YouTube video description with SEO keywords and timestamps.',
    };

    const systemContext = contextMap[contentType] || '';
    const fullMessage = systemContext ? `${systemContext}\n\nRequest: ${message}` : message;

    const convId = await getOrCreateConversation(agentId, conversationId);
    const reply = await sendToAgent(convId, fullMessage);

    res.json({ reply, conversationId: convId });
  } catch (err) {
    console.error('Content chat error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
});

module.exports = router;