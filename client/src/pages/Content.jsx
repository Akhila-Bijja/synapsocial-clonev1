import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://synapsocial-api.onrender.com';

const ASPECT_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16'];

const TABS = [
  { id: 'video',  icon: '🎬', label: 'Video Gen'      },
  { id: 'image',  icon: '🖼️', label: 'Image Gen'      },
  { id: 'audio',  icon: '🔊', label: 'Text to Speech' },
  { id: 'asr',    icon: '🎙️', label: 'Speech to Text' },
  { id: 'chat',   icon: '✍️', label: 'Content Chat'   },
];

/* ── shared styles ── */
const S = {
  inp: {
    width: '100%', padding: '0.75rem 0.9rem',
    background: '#0d0d14', border: '1px solid #2a2a3a',
    borderRadius: '10px', color: '#fff', fontSize: '0.87rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    resize: 'vertical',
  },
  card: {
    background: '#13131a', border: '1px solid #2a2a3a',
    borderRadius: '14px', padding: '1.2rem',
    display: 'flex', flexDirection: 'column', gap: '0.8rem',
  },
  btn: (color = '#7c3aed', disabled = false) => ({
    padding: '0.7rem 1.2rem',
    background: disabled ? '#1e1e2e' : color,
    color: disabled ? '#444' : '#fff',
    border: `1px solid ${disabled ? '#2a2a3a' : color}`,
    borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 700, fontSize: '0.87rem',
    opacity: disabled ? 0.6 : 1, transition: 'all 0.2s',
    fontFamily: 'inherit',
  }),
};

/* ── Aspect Ratio Picker ── */
function RatioPicker({ value, onChange, color = '#7c3aed' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {ASPECT_RATIOS.map(r => {
        const active = value === r;
        return (
          <button key={r} onClick={() => onChange(r)}
            style={{
              padding: '0.3rem 0.75rem',
              background: active ? `${color}22` : '#0d0d14',
              color: active ? color : '#555',
              border: `1px solid ${active ? color : '#2a2a3a'}`,
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: active ? 700 : 400,
              transition: 'all 0.15s',
            }}>
            {r}
          </button>
        );
      })}
    </div>
  );
}

/* ── Status banner ── */
function Banner({ text, type = 'info' }) {
  const map = {
    info:    { bg: '#7c3aed11', border: '#7c3aed33', color: '#a855f7' },
    success: { bg: '#00ff8811', border: '#00ff8833', color: '#00ff88' },
    error:   { bg: '#ff444411', border: '#ff444433', color: '#ff8888' },
    loading: { bg: '#f59e0b11', border: '#f59e0b33', color: '#f59e0b' },
  };
  const c = map[type] || map.info;
  return (
    <div style={{ padding: '0.65rem 0.9rem', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '0.82rem', color: c.color }}>
      {text}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════ */
export default function Content() {
  const [tab, setTab] = useState('video');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', color: '#fff', padding: isMobile ? '0.8rem' : '1.2rem 1.5rem', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <h2 style={{ margin: '0 0 0.15rem', fontSize: isMobile ? '1.2rem' : '1.35rem', fontWeight: 800 }}>
          🎨 Content Creator
        </h2>
        <p style={{ margin: 0, color: '#555', fontSize: '0.78rem' }}>
          Generate videos, images, audio &amp; written content with AI
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: isMobile ? '0.4rem 0.75rem' : '0.42rem 0.9rem',
              background: tab === t.id ? '#7c3aed' : '#13131a',
              color: tab === t.id ? '#fff' : '#555',
              border: `1px solid ${tab === t.id ? '#7c3aed' : '#2a2a3a'}`,
              borderRadius: '10px', cursor: 'pointer',
              fontSize: isMobile ? '0.72rem' : '0.78rem',
              fontWeight: tab === t.id ? 700 : 400,
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}>
            <span style={{ fontSize: '0.9rem' }}>{t.icon}</span>
            {isMobile ? t.label.split(' ')[0] : t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tab === 'video' && <VideoGen userId={user.id} isMobile={isMobile} />}
        {tab === 'image' && <ImageGen userId={user.id} isMobile={isMobile} />}
        {tab === 'audio' && <TextToSpeech userId={user.id} isMobile={isMobile} />}
        {tab === 'asr'   && <SpeechToText userId={user.id} isMobile={isMobile} />}
        {tab === 'chat'  && <ContentChat userId={user.id} isMobile={isMobile} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VIDEO GEN
══════════════════════════════════════════════════════════════ */
function VideoGen({ userId, isMobile }) {
  const [prompt, setPrompt]           = useState('');
  const [ratio, setRatio]             = useState('16:9');
  const [status, setStatus]           = useState('idle'); // idle | submitting | pending | polling | done | error
  const [msg, setMsg]                 = useState('');
  const [videoUrl, setVideoUrl]       = useState('');
  const [pageUrl, setPageUrl]         = useState('');
  const [pollCount, setPollCount]     = useState(0);
  const pollRef                       = useRef(null);

  const clearPoll = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  // Poll every 60s after initial 4-min wait
  const startPolling = useCallback((pUrl) => {
    clearPoll();
    // First attempt after 4 min
    const firstTimeout = setTimeout(async () => {
      await attemptFetch(pUrl);
      // Then every 60s
      pollRef.current = setInterval(async () => {
        await attemptFetch(pUrl);
      }, 60000);
    }, 240000); // 4 minutes
    return firstTimeout;
  }, []);

  const attemptFetch = async (pUrl) => {
    try {
      setPollCount(c => c + 1);
      setMsg(`🔄 Checking video status...`);
      const { data } = await axios.post(`${API_URL}/api/content/video/result`, { pageUrl: pUrl });
      if (data.status === 'completed' && data.videoUrl) {
        clearPoll();
        setVideoUrl(data.videoUrl);
        setStatus('done');
        setMsg('');
      } else {
        setMsg('⏳ Still generating... checking again in 1 min.');
        setStatus('polling');
      }
    } catch {
      setMsg('⚠️ Could not check status. Retrying...');
    }
  };

  useEffect(() => () => clearPoll(), []);

  const generate = async () => {
    if (!prompt.trim()) return;
    clearPoll();
    setStatus('submitting'); setMsg(''); setVideoUrl(''); setPollCount(0);
    try {
      const { data } = await axios.post(`${API_URL}/api/content/video`, { userId, prompt, aspectRatio: ratio });
      setPageUrl(data.pageUrl);
      setStatus('pending');
      setMsg('🎬 Submitted to Qwen! Video will be ready in ~4 minutes. Page will auto-update.');
      startPolling(data.pageUrl);
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Submission failed. Try again.');
    }
  };

  const manualCheck = () => {
    if (pageUrl) attemptFetch(pageUrl);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={S.card}>
        {/* Info badge */}
        <div style={{ background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: '8px', padding: '0.5rem 0.8rem', fontSize: '0.75rem', color: '#f59e0b' }}>
          🤖 Powered by <strong>TinyFish + Qwen AI</strong> — real browser automation · ~4 min render time
        </div>

        <div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Video Prompt</p>
          <textarea style={{ ...S.inp, minHeight: '90px' }}
            placeholder="e.g. A cinematic drone shot over a misty mountain valley at golden hour, 4K quality..."
            value={prompt} onChange={e => setPrompt(e.target.value)} />
        </div>

        <div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Aspect Ratio</p>
          <RatioPicker value={ratio} onChange={setRatio} color="#f59e0b" />
        </div>

        <button onClick={generate}
          disabled={status === 'submitting' || status === 'pending' || status === 'polling' || !prompt.trim()}
          style={{ ...S.btn('#f59e0b', status === 'submitting' || status === 'pending' || status === 'polling' || !prompt.trim()), width: '100%' }}>
          {status === 'submitting' ? '⏳ Submitting to Qwen...' : status === 'pending' || status === 'polling' ? '⏳ Generating... (~4 min)' : '🎬 Generate Video'}
        </button>

        {/* Status messages */}
        {msg && <Banner text={msg} type={status === 'error' ? 'error' : status === 'done' ? 'success' : 'loading'} />}

        {/* Manual check button while polling */}
        {(status === 'pending' || status === 'polling') && pageUrl && (
          <button onClick={manualCheck}
            style={{ ...S.btn('#2a2a3a'), width: '100%', background: '#1e1e2e', color: '#888', border: '1px solid #2a2a3a', fontSize: '0.78rem' }}>
            🔄 Check Now (attempt {pollCount})
          </button>
        )}
      </div>

      {/* Result */}
      {status === 'done' && videoUrl && (
        <div style={S.card}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#00ff88', fontWeight: 700 }}>✅ Video Ready!</p>
          <video src={videoUrl} controls style={{ width: '100%', borderRadius: '10px', maxHeight: '400px' }} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a href={videoUrl} download target="_blank" rel="noreferrer"
              style={{ padding: '0.5rem 1rem', background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: '8px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
              ⬇️ Download Video
            </a>
            <button onClick={() => { setStatus('idle'); setVideoUrl(''); setPrompt(''); setMsg(''); }}
              style={{ padding: '0.5rem 1rem', background: '#1e1e2e', color: '#666', border: '1px solid #2a2a3a', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              ✨ Generate New
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   IMAGE GEN
══════════════════════════════════════════════════════════════ */
function ImageGen({ userId, isMobile }) {
  const [prompt, setPrompt]   = useState('');
  const [ratio, setRatio]     = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError]     = useState('');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(''); setImageUrl('');
    try {
      const { data } = await axios.post(`${API_URL}/api/content/image`, { userId, prompt, aspectRatio: ratio });
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Image generation failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={S.card}>
        <div style={{ background: '#a855f711', border: '1px solid #a855f733', borderRadius: '8px', padding: '0.5rem 0.8rem', fontSize: '0.75rem', color: '#a855f7' }}>
          🤖 Powered by <strong>TinyFish + Qwen AI</strong> — ~30 second generation time
        </div>

        <div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Image Prompt</p>
          <textarea style={{ ...S.inp, minHeight: '90px' }}
            placeholder="e.g. A hyper-realistic portrait of a futuristic samurai in neon-lit cyberpunk Tokyo..."
            value={prompt} onChange={e => setPrompt(e.target.value)} />
        </div>

        <div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Aspect Ratio</p>
          <RatioPicker value={ratio} onChange={setRatio} color="#a855f7" />
        </div>

        <button onClick={generate} disabled={loading || !prompt.trim()}
          style={{ ...S.btn('#a855f7', loading || !prompt.trim()), width: '100%' }}>
          {loading ? '⏳ Generating image...' : '🖼️ Generate Image'}
        </button>

        {error && <Banner text={`❌ ${error}`} type="error" />}
        {loading && <Banner text="⏳ TinyFish is automating Qwen... this takes ~30 seconds" type="loading" />}
      </div>

      {imageUrl && (
        <div style={S.card}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#00ff88', fontWeight: 700 }}>✅ Image Generated!</p>
          <img src={imageUrl} alt="Generated" style={{ width: '100%', borderRadius: '10px', display: 'block' }} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a href={imageUrl} download target="_blank" rel="noreferrer"
              style={{ padding: '0.5rem 1rem', background: '#a855f722', color: '#a855f7', border: '1px solid #a855f744', borderRadius: '8px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
              ⬇️ Download Image
            </a>
            <button onClick={() => { setImageUrl(''); setPrompt(''); }}
              style={{ padding: '0.5rem 1rem', background: '#1e1e2e', color: '#666', border: '1px solid #2a2a3a', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              ✨ Generate New
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEXT TO SPEECH  (browser Web Speech API — free, no backend needed)
══════════════════════════════════════════════════════════════ */
function TextToSpeech({ isMobile }) {
  const [text, setText]         = useState('');
  const [voice, setVoice]       = useState('female');
  const [rate, setRate]         = useState(1);
  const [pitch, setPitch]       = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices]     = useState([]);
  const [selVoice, setSelVoice] = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) { setVoices(v); if (v[0]) setSelVoice(v[0].name); }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const speak = () => {
    if (!text.trim()) return;
    if (!window.speechSynthesis) { setError('Speech not supported in this browser.'); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate; utt.pitch = pitch;
    const picked = voices.find(v => v.name === selVoice);
    if (picked) utt.voice = picked;
    utt.onstart  = () => setSpeaking(true);
    utt.onend    = () => setSpeaking(false);
    utt.onerror  = () => { setSpeaking(false); setError('Speech error.'); };
    window.speechSynthesis.speak(utt);
  };

  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  const charCount = text.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={S.card}>
        <div style={{ background: '#00bcd411', border: '1px solid #00bcd433', borderRadius: '8px', padding: '0.5rem 0.8rem', fontSize: '0.75rem', color: '#00bcd4' }}>
          🔊 Uses your browser's built-in Speech Synthesis — 100% free, works offline
        </div>

        <div style={{ position: 'relative' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Text to speak ({charCount}/2000)</p>
          <textarea style={{ ...S.inp, minHeight: '120px' }}
            placeholder="Type or paste the text you want to hear..."
            value={text}
            onChange={e => e.target.value.length <= 2000 && setText(e.target.value)} />
        </div>

        {/* Voice selector */}
        {voices.length > 0 && (
          <div>
            <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Voice</p>
            <select value={selVoice} onChange={e => setSelVoice(e.target.value)}
              style={{ ...S.inp, cursor: 'pointer', background: '#0d0d14' }}>
              {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>
          </div>
        )}

        {/* Rate & Pitch sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: '#888' }}>Speed: {rate}x</p>
            <input type="range" min="0.5" max="2" step="0.1" value={rate}
              onChange={e => setRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00bcd4' }} />
          </div>
          <div>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: '#888' }}>Pitch: {pitch}</p>
            <input type="range" min="0.5" max="2" step="0.1" value={pitch}
              onChange={e => setPitch(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00bcd4' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={speak} disabled={speaking || !text.trim()}
            style={{ ...S.btn('#00bcd4', speaking || !text.trim()), flex: 1 }}>
            {speaking ? '🔊 Speaking...' : '▶️ Speak'}
          </button>
          {speaking && (
            <button onClick={stop}
              style={{ ...S.btn('#ef4444'), padding: '0.7rem 1rem' }}>
              ⏹ Stop
            </button>
          )}
        </div>
        {error && <Banner text={`❌ ${error}`} type="error" />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SPEECH TO TEXT  (browser Web Speech API)
══════════════════════════════════════════════════════════════ */
function SpeechToText({ isMobile }) {
  const [recording, setRecording]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim]       = useState('');
  const [error, setError]           = useState('');
  const [seconds, setSeconds]       = useState(0);
  const [lang, setLang]             = useState('en-US');
  const recognitionRef              = useRef(null);
  const timerRef                    = useRef(null);

  const langs = [
    { code: 'en-US', label: '🇺🇸 English (US)' },
    { code: 'en-GB', label: '🇬🇧 English (UK)' },
    { code: 'hi-IN', label: '🇮🇳 Hindi' },
    { code: 'es-ES', label: '🇪🇸 Spanish' },
    { code: 'fr-FR', label: '🇫🇷 French' },
    { code: 'de-DE', label: '🇩🇪 German' },
    { code: 'zh-CN', label: '🇨🇳 Chinese' },
    { code: 'ja-JP', label: '🇯🇵 Japanese' },
  ];

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Speech Recognition not supported. Try Chrome.'); return; }
    const r = new SR();
    r.lang = lang; r.continuous = true; r.interimResults = true;
    r.onresult = (e) => {
      let final = '', inter = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else inter += e.results[i][0].transcript;
      }
      if (final) setTranscript(p => p + final + ' ');
      setInterim(inter);
    };
    r.onerror = (e) => { setError('Mic error: ' + e.error); stop(); };
    r.start();
    recognitionRef.current = r;
    setRecording(true); setError(''); setInterim(''); setSeconds(0);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false); setInterim('');
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={S.card}>
        <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: '8px', padding: '0.5rem 0.8rem', fontSize: '0.75rem', color: '#ef4444' }}>
          🎙️ Uses browser's built-in Speech Recognition — 100% free, works in Chrome/Edge
        </div>

        <div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#888' }}>Language</p>
          <select value={lang} onChange={e => setLang(e.target.value)}
            style={{ ...S.inp, cursor: 'pointer', background: '#0d0d14' }}>
            {langs.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        {/* Big mic button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', padding: '1rem 0' }}>
          <div style={{ position: 'relative' }}>
            {recording && (
              <>
                <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', border: '2px solid #ef4444', opacity: 0.4, animation: 'ripple 1.5s ease-out infinite' }} />
                <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: '2px solid #ef4444', opacity: 0.2, animation: 'ripple 1.5s ease-out 0.5s infinite' }} />
              </>
            )}
            <button onClick={recording ? stop : start}
              style={{ width: '80px', height: '80px', borderRadius: '50%', background: recording ? '#ef4444' : '#7c3aed', border: 'none', cursor: 'pointer', fontSize: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: recording ? '0 0 24px #ef444466' : '0 0 16px #7c3aed44', transition: 'all 0.3s' }}>
              {recording ? '⏹' : '🎙️'}
            </button>
          </div>
          {recording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'blink 1s infinite' }} />
              <span style={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem' }}>{fmt(seconds)}</span>
            </div>
          )}
          <p style={{ color: '#555', fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>
            {recording ? 'Recording... click ⏹ to stop' : 'Click 🎙️ to start'}
          </p>
        </div>

        {error && <Banner text={`❌ ${error}`} type="error" />}
      </div>

      {/* Live transcript */}
      {(transcript || interim) && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#00ff88', fontWeight: 600 }}>📝 Transcript</p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => navigator.clipboard.writeText(transcript)}
                style={{ padding: '0.25rem 0.6rem', background: '#1e1e2e', color: '#666', border: '1px solid #2a2a3a', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit' }}>
                📋 Copy
              </button>
              <button onClick={() => { setTranscript(''); setInterim(''); }}
                style={{ padding: '0.25rem 0.6rem', background: '#1e1e2e', color: '#666', border: '1px solid #2a2a3a', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit' }}>
                🗑 Clear
              </button>
            </div>
          </div>
          <div style={{ background: '#0d0d14', borderRadius: '8px', padding: '0.9rem', fontSize: '0.88rem', lineHeight: 1.7, maxHeight: '200px', overflowY: 'auto', wordBreak: 'break-word' }}>
            <span style={{ color: '#ccc' }}>{transcript}</span>
            {interim && <span style={{ color: '#555', fontStyle: 'italic' }}>{interim}</span>}
          </div>
        </div>
      )}

      <style>{`
        @keyframes ripple { 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(1.8);opacity:0} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONTENT CHAT
══════════════════════════════════════════════════════════════ */
function ContentChat({ userId, isMobile }) {
  const [msgs, setMsgs]       = useState([{ role: 'ai', text: "✍️ Hey! I'm your Content Writing AI. Ask me to write captions, scripts, blog posts, LinkedIn posts, tweets, or YouTube descriptions!" }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [cType, setCType]     = useState('caption');
  const [history, setHistory] = useState([]);
  const bottomRef             = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const types = [
    { id: 'caption',  label: '📸 Caption'  },
    { id: 'script',   label: '🎬 Script'   },
    { id: 'blog',     label: '📝 Blog'     },
    { id: 'linkedin', label: '💼 LinkedIn' },
    { id: 'tweet',    label: '🐦 Tweet'    },
    { id: 'youtube',  label: '🎥 YouTube'  },
  ];

  const quickPrompts = {
    caption:  'Write an engaging Instagram caption for a product launch with emojis and hashtags',
    script:   'Write a 60-second YouTube Shorts script about 3 productivity hacks',
    blog:     'Write a compelling intro paragraph for a blog post about AI in 2025',
    linkedin: 'Write a LinkedIn post about a recent career milestone with a storytelling hook',
    tweet:    'Write 5 viral tweet ideas about the future of remote work',
    youtube:  'Write a YouTube description for a React tutorial video with SEO keywords',
  };

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMsgs(p => [...p, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/content/chat`, {
        userId, message: userMsg, contentType: cType,
        conversationHistory: history,
      });
      setHistory(p => [...p, { role: 'user', content: userMsg }, { role: 'assistant', content: data.reply }]);
      setMsgs(p => [...p, { role: 'ai', text: data.reply, copyable: true }]);
    } catch (err) {
      setMsgs(p => [...p, { role: 'ai', text: '❌ ' + (err.response?.data?.message || 'Error. Try again.') }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.6rem' }}>
      {/* Content type pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', flexShrink: 0 }}>
        {types.map(t => (
          <button key={t.id} onClick={() => setCType(t.id)}
            style={{ padding: '0.3rem 0.75rem', background: cType === t.id ? '#7c3aed33' : '#13131a', color: cType === t.id ? '#a855f7' : '#444', border: `1px solid ${cType === t.id ? '#7c3aed66' : '#2a2a3a'}`, borderRadius: '20px', cursor: 'pointer', fontSize: '0.73rem', fontWeight: cType === t.id ? 700 : 400, fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {msgs.map((m, i) => (
          <div key={i}>
            {m.role === 'user' && (
              <div style={{ background: '#7c3aed1a', border: '1px solid #7c3aed33', padding: '0.75rem 0.9rem', borderRadius: '12px', maxWidth: '82%', marginLeft: 'auto', fontSize: '0.87rem', color: '#ccc', lineHeight: 1.6 }}>
                {m.text}
              </div>
            )}
            {m.role === 'ai' && (
              <div style={{ background: '#13131a', border: '1px solid #2a2a3a', padding: '0.75rem 0.9rem', borderRadius: '12px', maxWidth: '88%' }}>
                <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>✍️ Content AI</span>
                <p style={{ margin: 0, color: '#ccc', fontSize: '0.87rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                {m.copyable && (
                  <button onClick={() => navigator.clipboard.writeText(m.text)}
                    style={{ marginTop: '0.5rem', padding: '0.2rem 0.6rem', background: '#1e1e2e', color: '#555', border: '1px solid #2a2a3a', borderRadius: '6px', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'inherit' }}>
                    📋 Copy
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ background: '#13131a', border: '1px solid #2a2a3a', padding: '0.75rem 0.9rem', borderRadius: '12px', maxWidth: '72%' }}>
            <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>✍️ Content AI</span>
            <p style={{ margin: 0, color: '#444', fontSize: '0.87rem' }}>✍️ Writing...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompt */}
      <button onClick={() => setInput(quickPrompts[cType])}
        style={{ padding: '0.3rem 0.7rem', background: '#13131a', color: '#444', border: '1px solid #1e1e2e', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', textAlign: 'left', flexShrink: 0, fontFamily: 'inherit' }}>
        💡 {quickPrompts[cType].slice(0, 55)}...
      </button>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#13131a', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '0.5rem 0.75rem', flexShrink: 0 }}>
        <textarea
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.87rem', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
          rows={2}
          placeholder={`Ask AI to write a ${cType}...`}
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ width: '36px', height: '36px', background: loading || !input.trim() ? '#1e1e2e' : '#7c3aed', color: loading || !input.trim() ? '#444' : '#fff', border: 'none', borderRadius: '10px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
          ↑
        </button>
      </div>
    </div>
  );
}