import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://synapsocial-api.onrender.com';

const TABS = [
  { id: 'image', icon: '🖼️', label: 'Image Gen' },
  { id: 'video', icon: '🎬', label: 'Video Gen' },
  { id: 'tts', icon: '🔊', label: 'Text to Speech' },
  { id: 'asr', icon: '🎙️', label: 'Speech to Text' },
  { id: 'chat', icon: '💬', label: 'Content Chat' },
];

export default function Content() {
  const [activeTab, setActiveTab] = useState('image');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', color: '#fff', padding: isMobile ? '0.8rem' : '1.2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <h2 style={{ margin: '0 0 0.2rem', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 800, color: '#fff' }}>
          🎨 Content Creator
        </h2>
        <p style={{ margin: 0, color: '#555', fontSize: '0.82rem' }}>
          Generate images, videos, audio & AI-written content
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: isMobile ? '0.45rem 0.8rem' : '0.45rem 1rem',
              background: activeTab === tab.id ? '#7c3aed' : '#13131a',
              color: activeTab === tab.id ? '#fff' : '#666',
              border: `1px solid ${activeTab === tab.id ? '#7c3aed' : '#2a2a3a'}`,
              borderRadius: '10px', cursor: 'pointer',
              fontSize: isMobile ? '0.75rem' : '0.8rem',
              fontWeight: activeTab === tab.id ? 700 : 400,
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              transition: 'all 0.2s',
            }}>
            <span>{tab.icon}</span>
            {!isMobile && tab.label}
            {isMobile && tab.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'image' && <ImageGen userId={user.id} isMobile={isMobile} />}
        {activeTab === 'video' && <VideoGen userId={user.id} isMobile={isMobile} />}
        {activeTab === 'tts' && <TextToSpeech userId={user.id} isMobile={isMobile} />}
        {activeTab === 'asr' && <SpeechToText userId={user.id} isMobile={isMobile} />}
        {activeTab === 'chat' && <ContentChat userId={user.id} isMobile={isMobile} />}
      </div>
    </div>
  );
}

// ── Shared UI helpers ─────────────────────────────────────────
const inp = {
  width: '100%', padding: '0.8rem', background: '#1e1e2e',
  border: '1px solid #2a2a3a', borderRadius: '10px', color: '#fff',
  fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'sans-serif',
};
const btn = (color = '#7c3aed', disabled = false) => ({
  padding: '0.75rem 1.2rem', background: disabled ? '#2a2a3a' : color,
  color: disabled ? '#555' : '#fff', border: 'none', borderRadius: '10px',
  cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 700,
  fontSize: '0.88rem', transition: 'opacity 0.2s',
  opacity: disabled ? 0.6 : 1,
});
const card = {
  background: '#13131a', border: '1px solid #2a2a3a',
  borderRadius: '14px', padding: '1.2rem',
};

function StatusBadge({ text, type = 'info' }) {
  const colors = { info: '#7c3aed', success: '#00ff88', error: '#ff4444', loading: '#f59e0b' };
  const bgs = { info: '#7c3aed11', success: '#00ff8811', error: '#ff444411', loading: '#f59e0b11' };
  return (
    <div style={{ padding: '0.6rem 1rem', background: bgs[type], border: `1px solid ${colors[type]}33`, borderRadius: '8px', fontSize: '0.82rem', color: colors[type], marginTop: '0.8rem' }}>
      {text}
    </div>
  );
}

// ── 1. IMAGE GENERATION ───────────────────────────────────────
function ImageGen({ userId, isMobile }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const styles = ['photorealistic', 'digital art', 'anime', 'oil painting', 'watercolor', 'cinematic', '3D render', 'pixel art'];

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await axios.post(`${API_URL}/api/content/image`, { userId, prompt, style });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Image generation failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={card}>
        <p style={{ margin: '0 0 0.8rem', fontSize: '0.82rem', color: '#888' }}>
          🖼️ Describe the image you want to generate using your AgentX Image Agent
        </p>
        <textarea
          style={{ ...inp, minHeight: '90px', resize: 'vertical', marginBottom: '0.8rem' }}
          placeholder="e.g. A futuristic city skyline at sunset with neon lights reflecting on water..."
          value={prompt} onChange={e => setPrompt(e.target.value)}
        />
        <div style={{ marginBottom: '0.8rem' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Style</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {styles.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                style={{ padding: '0.3rem 0.7rem', background: style === s ? '#7c3aed22' : '#1e1e2e', color: style === s ? '#a855f7' : '#555', border: `1px solid ${style === s ? '#7c3aed66' : '#2a2a3a'}`, borderRadius: '20px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: style === s ? 700 : 400 }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading || !prompt.trim()} style={{ ...btn('#7c3aed', loading || !prompt.trim()), width: '100%' }}>
          {loading ? '⏳ Generating...' : '✨ Generate Image'}
        </button>
        {error && <StatusBadge text={`❌ ${error}`} type="error" />}
      </div>

      {result && (
        <div style={card}>
          <p style={{ margin: '0 0 0.8rem', fontSize: '0.82rem', color: '#00ff88', fontWeight: 600 }}>✅ Image Generated!</p>
          {result.imageUrl && (
            <img src={result.imageUrl} alt="Generated" style={{ width: '100%', borderRadius: '10px', marginBottom: '0.8rem', display: 'block' }} />
          )}
          {result.reply && (
            <div style={{ background: '#1e1e2e', borderRadius: '8px', padding: '0.8rem', fontSize: '0.85rem', color: '#ccc', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {result.reply}
            </div>
          )}
          {result.imageUrl && (
            <a href={result.imageUrl} download target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', marginTop: '0.8rem', padding: '0.5rem 1rem', background: '#7c3aed22', color: '#a855f7', border: '1px solid #7c3aed44', borderRadius: '8px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
              ⬇️ Download Image
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── 2. VIDEO GENERATION ───────────────────────────────────────
function VideoGen({ userId, isMobile }) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pollInterval, setPollInterval] = useState(null);

  useEffect(() => () => { if (pollInterval) clearInterval(pollInterval); }, [pollInterval]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await axios.post(`${API_URL}/api/content/video`, { userId, prompt, duration });
      if (data.status === 'pending' && data.jobId) {
        setResult({ status: 'pending', jobId: data.jobId, message: data.message });
        // Poll for completion
        const interval = setInterval(async () => {
          try {
            const { data: poll } = await axios.get(`${API_URL}/api/content/video/status/${data.jobId}`);
            if (poll.status === 'completed') {
              setResult(poll);
              setLoading(false);
              clearInterval(interval);
            } else if (poll.status === 'failed') {
              setError(poll.message || 'Video generation failed');
              setLoading(false);
              clearInterval(interval);
            }
          } catch { }
        }, 5000);
        setPollInterval(interval);
      } else {
        setResult(data);
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Video generation failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={card}>
        <div style={{ background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '0.8rem', fontSize: '0.75rem', color: '#f59e0b' }}>
          🎬 Powered by <strong>Magic Hour API</strong> — Free daily credits included
        </div>
        <textarea
          style={{ ...inp, minHeight: '90px', resize: 'vertical', marginBottom: '0.8rem' }}
          placeholder="e.g. A cinematic drone shot flying over a misty mountain valley at golden hour..."
          value={prompt} onChange={e => setPrompt(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <label style={{ fontSize: '0.8rem', color: '#888', flexShrink: 0 }}>Duration (sec):</label>
          {['3', '5', '8'].map(d => (
            <button key={d} onClick={() => setDuration(d)}
              style={{ padding: '0.3rem 0.7rem', background: duration === d ? '#f59e0b22' : '#1e1e2e', color: duration === d ? '#f59e0b' : '#555', border: `1px solid ${duration === d ? '#f59e0b66' : '#2a2a3a'}`, borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: duration === d ? 700 : 400 }}>
              {d}s
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading || !prompt.trim()} style={{ ...btn('#f59e0b', loading || !prompt.trim()), width: '100%' }}>
          {loading ? '⏳ Generating video...' : '🎬 Generate Video'}
        </button>
        {error && <StatusBadge text={`❌ ${error}`} type="error" />}
      </div>

      {result && (
        <div style={card}>
          {result.status === 'pending' && (
            <StatusBadge text="⏳ Video is being generated... This may take 1-2 minutes. Page will update automatically." type="loading" />
          )}
          {result.status === 'completed' && result.videoUrl && (
            <>
              <p style={{ margin: '0 0 0.8rem', fontSize: '0.82rem', color: '#00ff88', fontWeight: 600 }}>✅ Video Ready!</p>
              <video src={result.videoUrl} controls style={{ width: '100%', borderRadius: '10px', marginBottom: '0.8rem' }} />
              <a href={result.videoUrl} download target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: '8px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
                ⬇️ Download Video
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── 3. TEXT TO SPEECH ─────────────────────────────────────────
function TextToSpeech({ userId, isMobile }) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('en-US-Neural2-F');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState('');
  const audioRef = useRef();

  const voices = [
    { id: 'en-US-Neural2-F', label: '👩 Female (US)' },
    { id: 'en-US-Neural2-D', label: '👨 Male (US)' },
    { id: 'en-GB-Neural2-A', label: '👩 Female (UK)' },
    { id: 'en-GB-Neural2-B', label: '👨 Male (UK)' },
  ];

  const synthesize = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(''); setAudioUrl(null);
    try {
      const { data } = await axios.post(`${API_URL}/api/content/tts`, { userId, text, voice });
      if (data.audioBase64) {
        const blob = base64ToBlob(data.audioBase64, 'audio/mp3');
        setAudioUrl(URL.createObjectURL(blob));
      } else if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'TTS failed');
    }
    setLoading(false);
  };

  const base64ToBlob = (base64, mime) => {
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const charCount = text.length;
  const maxChars = 2000;

  return (
    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={card}>
        <p style={{ margin: '0 0 0.8rem', fontSize: '0.82rem', color: '#888' }}>
          🔊 Convert text to natural speech using AgentX Voice API
        </p>
        <div style={{ position: 'relative', marginBottom: '0.4rem' }}>
          <textarea
            style={{ ...inp, minHeight: '120px', resize: 'vertical', paddingBottom: '1.8rem' }}
            placeholder="Type or paste the text you want to convert to speech..."
            value={text}
            onChange={e => e.target.value.length <= maxChars && setText(e.target.value)}
          />
          <span style={{ position: 'absolute', bottom: '0.5rem', right: '0.8rem', fontSize: '0.68rem', color: charCount > maxChars * 0.9 ? '#f59e0b' : '#444' }}>
            {charCount}/{maxChars}
          </span>
        </div>

        <div style={{ marginBottom: '0.8rem' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Voice</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {voices.map(v => (
              <button key={v.id} onClick={() => setVoice(v.id)}
                style={{ padding: '0.35rem 0.8rem', background: voice === v.id ? '#7c3aed22' : '#1e1e2e', color: voice === v.id ? '#a855f7' : '#555', border: `1px solid ${voice === v.id ? '#7c3aed66' : '#2a2a3a'}`, borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: voice === v.id ? 700 : 400 }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={synthesize} disabled={loading || !text.trim()} style={{ ...btn('#7c3aed', loading || !text.trim()), width: '100%' }}>
          {loading ? '⏳ Synthesizing...' : '🔊 Convert to Speech'}
        </button>
        {error && <StatusBadge text={`❌ ${error}`} type="error" />}
      </div>

      {audioUrl && (
        <div style={card}>
          <p style={{ margin: '0 0 0.8rem', fontSize: '0.82rem', color: '#00ff88', fontWeight: 600 }}>✅ Audio Ready!</p>
          <audio ref={audioRef} src={audioUrl} controls style={{ width: '100%', marginBottom: '0.8rem' }} />
          <a href={audioUrl} download="synapsocial-tts.mp3"
            style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#7c3aed22', color: '#a855f7', border: '1px solid #7c3aed44', borderRadius: '8px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
            ⬇️ Download MP3
          </a>
        </div>
      )}
    </div>
  );
}

// ── 4. SPEECH TO TEXT ─────────────────────────────────────────
function SpeechToText({ userId, isMobile }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('');
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const languages = [
    { code: '', label: '🌐 Auto Detect' },
    { code: 'en', label: '🇺🇸 English' },
    { code: 'hi', label: '🇮🇳 Hindi' },
    { code: 'es', label: '🇪🇸 Spanish' },
    { code: 'fr', label: '🇫🇷 French' },
    { code: 'de', label: '🇩🇪 German' },
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      setRecording(true); setSeconds(0); setError(''); setTranscript('');
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      setError('Microphone access denied. Please allow mic permission.');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      await transcribeAudio(blob);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorderRef.current.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const transcribeAudio = async (blob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const { data } = await axios.post(`${API_URL}/api/content/asr`, { userId, audioBase64: base64, language });
        setTranscript(data.transcript || data.text || '');
        setLoading(false);
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Transcription failed');
      setLoading(false);
    }
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={card}>
        <p style={{ margin: '0 0 0.8rem', fontSize: '0.82rem', color: '#888' }}>
          🎙️ Record audio and transcribe it to text using AgentX ASR API
        </p>

        <div style={{ marginBottom: '0.8rem' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Language</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {languages.map(l => (
              <button key={l.code} onClick={() => setLanguage(l.code)}
                style={{ padding: '0.3rem 0.7rem', background: language === l.code ? '#7c3aed22' : '#1e1e2e', color: language === l.code ? '#a855f7' : '#555', border: `1px solid ${language === l.code ? '#7c3aed66' : '#2a2a3a'}`, borderRadius: '20px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: language === l.code ? 700 : 400 }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem 0' }}>
          {/* Mic button */}
          <div style={{ position: 'relative' }}>
            {recording && (
              <div style={{
                position: 'absolute', inset: '-8px',
                borderRadius: '50%', border: '2px solid #ef4444',
                animation: 'pulse 1.2s ease-in-out infinite',
              }} />
            )}
            <button onClick={recording ? stopRecording : startRecording}
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: recording ? '#ef4444' : '#7c3aed',
                border: 'none', cursor: 'pointer', fontSize: '2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: recording ? '0 0 20px #ef444466' : '0 0 20px #7c3aed44',
                transition: 'all 0.3s',
              }}>
              {recording ? '⏹️' : '🎙️'}
            </button>
          </div>

          {recording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
              <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{fmt(seconds)}</span>
            </div>
          )}

          <p style={{ color: '#555', fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>
            {recording ? 'Recording... Click ⏹️ to stop' : loading ? '⏳ Transcribing...' : 'Click 🎙️ to start recording'}
          </p>
        </div>

        {error && <StatusBadge text={`❌ ${error}`} type="error" />}
      </div>

      {loading && <StatusBadge text="⏳ Transcribing your audio..." type="loading" />}

      {transcript && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#00ff88', fontWeight: 600 }}>✅ Transcript</p>
            <button onClick={() => navigator.clipboard.writeText(transcript)}
              style={{ padding: '0.3rem 0.7rem', background: '#1e1e2e', color: '#888', border: '1px solid #2a2a3a', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem' }}>
              📋 Copy
            </button>
          </div>
          <div style={{ background: '#1e1e2e', borderRadius: '8px', padding: '1rem', fontSize: '0.88rem', color: '#ccc', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
            {transcript}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

// ── 5. CONTENT CHAT ───────────────────────────────────────────
function ContentChat({ userId, isMobile }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '✍️ Hey! I\'m your Content Writing AI. Ask me to write captions, scripts, blog posts, tweets, LinkedIn posts, YouTube descriptions, or any content you need!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [contentType, setContentType] = useState('caption');
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const contentTypes = [
    { id: 'caption', label: '📸 Caption' },
    { id: 'script', label: '🎬 Script' },
    { id: 'blog', label: '📝 Blog Post' },
    { id: 'linkedin', label: '💼 LinkedIn' },
    { id: 'tweet', label: '🐦 Tweet' },
    { id: 'youtube', label: '🎥 YT Description' },
  ];

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/content/chat`, {
        userId, message: userMsg, contentType, conversationId
      });
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages(prev => [...prev, { role: 'ai', text: data.reply, copyable: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ ' + (err.response?.data?.message || 'Error. Try again.') }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const quickPrompts = {
    caption: 'Write an engaging Instagram caption for a product launch post',
    script: 'Write a 60-second YouTube short script about productivity tips',
    blog: 'Write a 500-word blog post intro about AI in social media marketing',
    linkedin: 'Write a LinkedIn post about my recent achievement in tech',
    tweet: 'Write 5 tweet variations about the future of AI',
    youtube: 'Write a YouTube video description for a tutorial on React hooks',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Content type selector */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.8rem', flexShrink: 0 }}>
        {contentTypes.map(ct => (
          <button key={ct.id} onClick={() => setContentType(ct.id)}
            style={{ padding: '0.3rem 0.7rem', background: contentType === ct.id ? '#7c3aed33' : '#13131a', color: contentType === ct.id ? '#a855f7' : '#555', border: `1px solid ${contentType === ct.id ? '#7c3aed66' : '#2a2a3a'}`, borderRadius: '20px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: contentType === ct.id ? 700 : 400 }}>
            {ct.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.8rem' }}>
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'user' && (
              <div style={{ background: '#7c3aed22', border: '1px solid #7c3aed33', padding: '0.8rem 1rem', borderRadius: '12px', maxWidth: '80%', marginLeft: 'auto', fontSize: '0.88rem', color: '#ccc', lineHeight: 1.6 }}>
                {msg.text}
              </div>
            )}
            {msg.role === 'ai' && (
              <div style={{ background: '#13131a', border: '1px solid #2a2a3a', padding: '0.8rem 1rem', borderRadius: '12px', maxWidth: '85%' }}>
                <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>✍️ Content AI</span>
                <p style={{ margin: 0, color: '#ccc', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                {msg.copyable && (
                  <button onClick={() => navigator.clipboard.writeText(msg.text)}
                    style={{ marginTop: '0.6rem', padding: '0.25rem 0.7rem', background: '#1e1e2e', color: '#666', border: '1px solid #2a2a3a', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>
                    📋 Copy
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ background: '#13131a', border: '1px solid #2a2a3a', padding: '0.8rem 1rem', borderRadius: '12px', maxWidth: '72%' }}>
            <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>✍️ Content AI</span>
            <p style={{ margin: 0, color: '#555', fontSize: '0.88rem' }}>✍️ Writing...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompt */}
      <div style={{ marginBottom: '0.4rem', flexShrink: 0 }}>
        <button onClick={() => setInput(quickPrompts[contentType])}
          style={{ padding: '0.3rem 0.8rem', background: '#1e1e2e', color: '#555', border: '1px solid #2a2a3a', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem' }}>
          💡 Try: "{quickPrompts[contentType].slice(0, 40)}..."
        </button>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '0.5rem 0.8rem', flexShrink: 0 }}>
        <textarea
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none', resize: 'none', fontFamily: 'sans-serif', lineHeight: 1.5 }}
          rows={2}
          placeholder={`Ask AI to write a ${contentType}...`}
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ width: '36px', height: '36px', background: loading || !input.trim() ? '#2a2a3a' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
          ↑
        </button>
      </div>
    </div>
  );
}