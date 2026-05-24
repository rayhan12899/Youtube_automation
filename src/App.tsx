/**
 * Smart Voice Writer - Web App
 * AI-powered voice writer using Gemini API
 * Works without user registration — server key used when available
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic, MicOff, Copy, Check, Settings, X, Key,
  Trash2, Sparkles, Radio, Save, AlertCircle, Eye, EyeOff,
  ShieldAlert, RefreshCw, Volume2
} from 'lucide-react';

type Mode = 'live' | 'ai';
type RecordingState = 'idle' | 'listening' | 'processing' | 'result' | 'error';
type MicPermission = 'unknown' | 'checking' | 'granted' | 'denied' | 'unavailable';

interface TextResult {
  bangla: string;
  english: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isSecureContext = () =>
  window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const getMicErrorMessage = (err: any): string => {
  const name = err?.name || '';
  const msg = (err?.message || '').toLowerCase();
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || msg.includes('permission'))
    return 'Microphone permission denied. Click the 🔒 icon in the address bar and allow microphone access, then reload.';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError')
    return 'No microphone found. Please connect a microphone and try again.';
  if (name === 'NotReadableError' || name === 'TrackStartError')
    return 'Microphone is being used by another app. Close other apps using the mic and try again.';
  if (name === 'SecurityError' || !isSecureContext())
    return 'Microphone requires a secure connection (HTTPS). Please access the app via https:// or localhost.';
  if (name === 'AbortError')
    return 'Microphone access was interrupted. Please try again.';
  return 'Could not access microphone: ' + (err?.message || 'Unknown error');
};

// ─── Pulsing ring ─────────────────────────────────────────────────────────────
const PulseRing = ({ color, active }: { color: string; active: boolean }) => {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ border: `2px solid ${color}` }}
      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

// ─── Processing particle ──────────────────────────────────────────────────────
const Particle = ({ index }: { index: number }) => {
  const angle = (index / 8) * 360;
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full"
      style={{ background: '#00d4ff', top: '50%', left: '50%' }}
      animate={{
        x: [0, Math.cos((angle * Math.PI) / 180) * 80],
        y: [0, Math.sin((angle * Math.PI) / 180) * 80],
        opacity: [1, 0],
        scale: [1, 0.3],
      }}
      transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.15, ease: 'easeOut' }}
    />
  );
};

export default function App() {
  const [mode, setMode] = useState<Mode>('live');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [banglaText, setBanglaText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [liveInterim, setLiveInterim] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedBangla, setCopiedBangla] = useState(false);
  const [copiedEnglish, setCopiedEnglish] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [serverChecked, setServerChecked] = useState(false);
  const [micPermission, setMicPermission] = useState<MicPermission>('unknown');
  const [micError, setMicError] = useState('');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const banglaRef = useRef<HTMLTextAreaElement>(null);

  // ─── Boot: check server key + mic permission ───────────────────────────────
  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then((data: { hasServerKey: boolean }) => setHasServerKey(!!data.hasServerKey))
      .catch(() => setHasServerKey(false))
      .finally(() => setServerChecked(true));

    const saved = localStorage.getItem('SVW_GEMINI_API_KEY') || '';
    setApiKey(saved);
    setTempApiKey(saved);

    // Check mic permission state via Permissions API if available
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(status => {
          setMicPermission(status.state === 'granted' ? 'granted' :
            status.state === 'denied' ? 'denied' : 'unknown');
          status.onchange = () => {
            setMicPermission(status.state === 'granted' ? 'granted' :
              status.state === 'denied' ? 'denied' : 'unknown');
            if (status.state === 'granted') setMicError('');
          };
        })
        .catch(() => setMicPermission('unknown'));
    }

    if (!isSecureContext()) {
      setMicPermission('unavailable');
      setMicError('Microphone requires HTTPS. Please access this app via https:// or localhost.');
    }
  }, []);

  // Auto-scroll bangla textarea
  useEffect(() => {
    if (banglaRef.current) {
      banglaRef.current.scrollTop = banglaRef.current.scrollHeight;
    }
  }, [banglaText, liveInterim]);

  const canUseAI = hasServerKey || !!apiKey;

  // ─── Request mic permission explicitly ────────────────────────────────────
  const requestMicPermission = async () => {
    setMicPermission('checking');
    setMicError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicPermission('granted');
      toast.success('Microphone access granted!');
    } catch (err: any) {
      setMicPermission('denied');
      const msg = getMicErrorMessage(err);
      setMicError(msg);
      toast.error(msg);
    }
  };

  // ─── Live Mode ────────────────────────────────────────────────────────────
  const startLiveMode = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition requires Chrome or Edge browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setRecordingState('listening');
      setIsRecording(true);
      setMicPermission('granted');
      setMicError('');
      toast.success('লাইভ মোড চালু হয়েছে');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interimTranscript += t;
      }
      if (finalTranscript) setBanglaText(prev => prev + finalTranscript + ' ');
      setLiveInterim(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') return;

      let msg = '';
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          msg = 'Microphone permission denied. Allow microphone in browser settings and reload.';
          setMicPermission('denied');
          break;
        case 'audio-capture':
          msg = 'No microphone found. Please connect a microphone.';
          setMicPermission('unavailable');
          break;
        case 'no-speech':
          msg = 'No speech detected. Please speak closer to the microphone.';
          break;
        case 'network':
          msg = 'Network error during speech recognition. Check your connection.';
          break;
        default:
          msg = 'Speech recognition error: ' + event.error;
      }
      setMicError(msg);
      toast.error(msg);
      setRecordingState('error');
      setIsRecording(false);
      setLiveInterim('');
    };

    recognition.onend = () => {
      setLiveInterim('');
      setIsRecording(false);
      setRecordingState(prev => (prev === 'listening' ? 'idle' : prev));
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err: any) {
      toast.error('Could not start speech recognition: ' + err.message);
      setRecordingState('error');
    }
  }, []);

  const stopLiveMode = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
    setRecordingState('idle');
    setLiveInterim('');
  }, []);

  // ─── AI Mode ──────────────────────────────────────────────────────────────
  const startAIMode = useCallback(async () => {
    if (!canUseAI) {
      toast.error('Please add your Gemini API key in Settings.');
      setShowSettings(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      setMicError('');

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudio(audioBlob, mimeType);
      };

      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;
      setRecordingState('listening');
      setIsRecording(true);
      toast.success('AI মোড চালু — কথা বলুন');
    } catch (err: any) {
      const msg = getMicErrorMessage(err);
      setMicError(msg);
      setMicPermission(
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' ? 'denied' :
        err?.name === 'NotFoundError' ? 'unavailable' : 'denied'
      );
      toast.error(msg);
      setRecordingState('error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseAI]);

  const stopAIMode = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setRecordingState('processing');
    }
  }, []);

  // ─── Process audio ─────────────────────────────────────────────────────────
  const processAudio = async (audioBlob: Blob, mimeType: string) => {
    setRecordingState('processing');

    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode(...Array.from(uint8.subarray(i, i + chunkSize)));
    }
    const audioBase64 = btoa(binary);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          clientKey: hasServerKey ? undefined : apiKey,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await res.json() as TextResult;
      setBanglaText(data.bangla || '');
      setEnglishText(data.english || '');
      setRecordingState('result');
    } catch (serverErr: any) {
      if (apiKey) {
        await processWithGeminiDirect(audioBase64, mimeType);
      } else {
        toast.error('AI processing failed: ' + serverErr.message);
        setRecordingState('error');
      }
    }
  };

  const processWithGeminiDirect = async (audioBase64: string, mimeType: string) => {
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: audioBase64 } },
            { text: `Transcribe this audio. Return ONLY valid JSON:\n{"bangla": "<Bangla script>", "english": "<English translation>"}\nNo markdown, no extra text.` },
          ],
        }],
      });

      const raw = (response.text || '').trim();
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const match = cleaned.match(/\{[\s\S]*?"bangla"[\s\S]*?"english"[\s\S]*?\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as TextResult;
        setBanglaText(parsed.bangla || '');
        setEnglishText(parsed.english || '');
      } else {
        setBanglaText(raw);
        setEnglishText('');
      }
      setRecordingState('result');
    } catch (err: any) {
      toast.error('AI processing failed. Check your API key.');
      setRecordingState('error');
    }
  };

  // ─── Controls ──────────────────────────────────────────────────────────────
  const toggleRecording = () => {
    if (micPermission === 'denied' || micPermission === 'unavailable') {
      requestMicPermission();
      return;
    }
    if (isRecording) {
      mode === 'live' ? stopLiveMode() : stopAIMode();
    } else {
      setBanglaText('');
      setEnglishText('');
      setLiveInterim('');
      setMicError('');
      setRecordingState('idle');
      mode === 'live' ? startLiveMode() : startAIMode();
    }
  };

  const switchMode = (m: Mode) => {
    if (isRecording) mode === 'live' ? stopLiveMode() : stopAIMode();
    setMode(m);
    setBanglaText('');
    setEnglishText('');
    setLiveInterim('');
    setRecordingState('idle');
  };

  const clearAll = () => {
    if (isRecording) mode === 'live' ? stopLiveMode() : stopAIMode();
    setBanglaText('');
    setEnglishText('');
    setLiveInterim('');
    setMicError('');
    setRecordingState('idle');
  };

  const copyBangla = async () => {
    const full = (banglaText + liveInterim).trim();
    if (!full) return;
    await navigator.clipboard.writeText(full);
    setCopiedBangla(true);
    toast.success('Bangla text copied!');
    setTimeout(() => setCopiedBangla(false), 2000);
  };

  const copyEnglish = async () => {
    if (!englishText.trim()) return;
    await navigator.clipboard.writeText(englishText.trim());
    setCopiedEnglish(true);
    toast.success('English text copied!');
    setTimeout(() => setCopiedEnglish(false), 2000);
  };

  const saveSettings = () => {
    localStorage.setItem('SVW_GEMINI_API_KEY', tempApiKey.trim());
    setApiKey(tempApiKey.trim());
    setShowSettings(false);
    toast.success('Settings saved!');
  };

  // ─── Derived UI ────────────────────────────────────────────────────────────
  const micBlocked = micPermission === 'denied' || micPermission === 'unavailable';

  const micColor =
    micBlocked ? '#ff3d71' :
    recordingState === 'listening' ? '#ff3d71' :
    recordingState === 'processing' ? '#ffa500' :
    recordingState === 'result' ? '#00ff88' :
    recordingState === 'error' ? '#ff3d71' : '#00d4ff';

  const statusText =
    micPermission === 'checking' ? '🔍 Checking microphone…' :
    micPermission === 'denied' ? '🚫 Microphone blocked — tap to fix' :
    micPermission === 'unavailable' ? '🎙️ No microphone found' :
    recordingState === 'listening'
      ? (mode === 'live' ? '🎤 লাইভ শুনছে…' : '🎤 রেকর্ড হচ্ছে…')
      : recordingState === 'processing' ? '⚡ প্রসেস হচ্ছে…'
      : recordingState === 'result' ? '✅ সম্পন্ন'
      : recordingState === 'error' ? '❌ ত্রুটি — আবার চেষ্টা করুন'
      : (mode === 'live' ? 'কথা বলুন…' : 'AI দিয়ে রেকর্ড করুন');

  const hasText = !!(banglaText || englishText || liveInterim);
  const showSettingsBtn = serverChecked && !hasServerKey;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #080c18 0%, #0d1226 50%, #080c18 100%)' }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#111830', color: '#ffffff', border: '1px solid rgba(0,212,255,0.2)' },
        }}
      />

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'rgba(0,212,255,0.1)', background: 'rgba(13,18,38,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #00d4ff22, #7b2fff22)', border: '1px solid rgba(0,212,255,0.3)' }}
          >
            <Mic className="w-5 h-5" style={{ color: '#00d4ff' }} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none" style={{ color: '#ffffff', fontFamily: 'Noto Sans Bengali, Inter, sans-serif' }}>
              Smart Voice Writer
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#99c5d0e0' }}>Your AI-powered voice writer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mic status indicator */}
          {micPermission === 'granted' && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88' }}>
              <Volume2 className="w-3 h-3" />
              <span>Mic OK</span>
            </div>
          )}
          {micBlocked && (
            <button
              onClick={requestMicPermission}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
              style={{ background: 'rgba(255,61,113,0.1)', color: '#ff3d71', border: '1px solid rgba(255,61,113,0.3)' }}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Fix Mic</span>
            </button>
          )}

          {/* Settings — only when no server key */}
          {showSettingsBtn && (
            <button
              onClick={() => { setTempApiKey(apiKey); setShowSettings(true); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Settings className="w-4 h-4" style={{ color: '#99c5d0e0' }} />
            </button>
          )}

          {/* Server key badge */}
          {serverChecked && hasServerKey && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)', color: '#00ff88' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Ready
            </div>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 gap-6 max-w-2xl mx-auto w-full">

        {/* HTTPS warning */}
        {!isSecureContext() && (
          <div className="w-full flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(255,61,113,0.08)', border: '1px solid rgba(255,61,113,0.3)' }}>
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#ff3d71' }} />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#ff3d71' }}>HTTPS Required</p>
              <p className="text-xs" style={{ color: '#ff7090' }}>
                Microphone access requires HTTPS. Access this app via <strong>https://</strong> or <strong>localhost</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Mic blocked banner */}
        {micBlocked && isSecureContext() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,61,113,0.3)' }}
          >
            <div className="px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(255,61,113,0.08)' }}>
              <ShieldAlert className="w-5 h-5 shrink-0" style={{ color: '#ff3d71' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: '#ff3d71' }}>
                  {micPermission === 'unavailable' ? 'No Microphone Detected' : 'Microphone Access Blocked'}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#ff7090' }}>
                  {micError || 'Allow microphone access to use voice recording.'}
                </p>
              </div>
              {micPermission === 'denied' && (
                <button
                  onClick={requestMicPermission}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(255,61,113,0.2)', color: '#ff3d71', border: '1px solid rgba(255,61,113,0.4)' }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </button>
              )}
            </div>

            {/* Step-by-step fix */}
            {micPermission === 'denied' && (
              <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,61,113,0.15)', background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#99c5d0e0' }}>How to fix:</p>
                <ol className="text-xs space-y-1" style={{ color: '#556680' }}>
                  <li>1. Click the <strong style={{ color: '#99c5d0e0' }}>🔒 lock icon</strong> in your browser address bar</li>
                  <li>2. Find <strong style={{ color: '#99c5d0e0' }}>Microphone</strong> → set it to <strong style={{ color: '#00ff88' }}>Allow</strong></li>
                  <li>3. Click <strong style={{ color: '#99c5d0e0' }}>Reload</strong> the page</li>
                </ol>
              </div>
            )}
          </motion.div>
        )}

        {/* Mode Tabs */}
        <div className="flex w-full rounded-2xl p-1"
          style={{ background: 'rgba(17,24,48,0.8)', border: '1px solid rgba(0,212,255,0.15)' }}>
          {(['live', 'ai'] as Mode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={mode === m
                ? { background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,47,255,0.2))', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.4)' }
                : { color: '#556680', border: '1px solid transparent' }
              }
            >
              {m === 'live' ? <Radio className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {m === 'live' ? 'লাইভ মোড' : 'AI মোড'}
            </button>
          ))}
        </div>

        {/* Recording Button */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <motion.div className="absolute rounded-full"
              style={{ inset: 0, border: `1px solid ${micColor}22` }}
              animate={isRecording ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute" style={{ inset: 8 }}>
              <PulseRing color={micColor} active={isRecording} />
            </div>
            {recordingState === 'processing' &&
              Array.from({ length: 8 }).map((_, i) => <Particle key={i} index={i} />)}

            <motion.button
              onClick={toggleRecording}
              whileTap={{ scale: 0.93 }}
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${micColor}22 0%, ${micColor}11 70%)`,
                border: `2px solid ${micColor}`,
                boxShadow: isRecording
                  ? `0 0 30px ${micColor}66, 0 0 60px ${micColor}33`
                  : `0 0 20px ${micColor}33`,
              }}
            >
              {recordingState === 'processing' ? (
                <motion.div className="w-8 h-8 rounded-full border-2"
                  style={{ borderColor: micColor, borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : micBlocked ? (
                <ShieldAlert className="w-10 h-10" style={{ color: micColor }} />
              ) : isRecording ? (
                <MicOff className="w-10 h-10" style={{ color: micColor }} />
              ) : (
                <Mic className="w-10 h-10" style={{ color: micColor }} />
              )}
            </motion.button>
          </div>

          <motion.p key={statusText} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-center"
            style={{ color: micColor, fontFamily: 'Noto Sans Bengali, Inter, sans-serif' }}>
            {statusText}
          </motion.p>

          <p className="text-xs text-center px-6"
            style={{ color: '#556680', fontFamily: 'Noto Sans Bengali, Inter, sans-serif', lineHeight: '1.6' }}>
            {micBlocked
              ? 'Tap the button above to request microphone access'
              : mode === 'live'
                ? 'মাইক্রোফোন বাটনে চাপ দিন → বাংলায় কথা বলুন → আবার চাপ দিয়ে বন্ধ করুন'
                : 'বাটনে চাপ দিন → কথা বলুন → আবার চাপ দিন → AI প্রসেস করবে'}
          </p>
        </div>

        {/* Results */}
        <AnimatePresence>
          {(hasText || recordingState === 'processing') && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: '#99c5d0e0', fontFamily: 'Noto Sans Bengali, Inter, sans-serif' }}>ফলাফল</span>
                {hasText && (
                  <button onClick={clearAll} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs"
                    style={{ background: 'rgba(255,61,113,0.1)', color: '#ff3d71', border: '1px solid rgba(255,61,113,0.2)' }}>
                    <Trash2 className="w-3 h-3" />মুছুন
                  </button>
                )}
              </div>

              {/* Bangla */}
              <div className="rounded-2xl overflow-hidden" style={{ background: '#111830', border: '1px solid rgba(0,212,255,0.15)' }}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b"
                  style={{ borderColor: 'rgba(0,212,255,0.1)', background: 'rgba(0,212,255,0.05)' }}>
                  <span className="text-xs font-semibold" style={{ color: '#00d4ff', fontFamily: 'Noto Sans Bengali, Inter, sans-serif' }}>বাংলা</span>
                  <button onClick={copyBangla} disabled={!(banglaText || liveInterim).trim()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs disabled:opacity-30"
                    style={copiedBangla
                      ? { background: 'rgba(0,255,136,0.15)', color: '#00ff88' }
                      : { background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                    {copiedBangla ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedBangla ? '✅ কপি হয়েছে!' : 'কপি বাংলা'}
                  </button>
                </div>
                <textarea ref={banglaRef} readOnly rows={5}
                  value={recordingState === 'processing' && !banglaText ? '⚡ প্রসেস হচ্ছে…' : banglaText + liveInterim}
                  placeholder="বাংলা টেক্সট এখানে দেখাবে…"
                  className="w-full bg-transparent resize-none outline-none px-4 py-3 text-sm"
                  style={{ color: !banglaText && liveInterim ? '#99c5d0e0' : '#ffffff', fontFamily: 'Noto Sans Bengali, Inter, sans-serif', lineHeight: '1.8' }}
                />
              </div>

              {/* English */}
              {(mode === 'ai' || englishText) && (
                <div className="rounded-2xl overflow-hidden" style={{ background: '#111830', border: '1px solid rgba(123,47,255,0.2)' }}>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b"
                    style={{ borderColor: 'rgba(123,47,255,0.15)', background: 'rgba(123,47,255,0.05)' }}>
                    <span className="text-xs font-semibold" style={{ color: '#b69df8' }}>English</span>
                    <button onClick={copyEnglish} disabled={!englishText.trim()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs disabled:opacity-30"
                      style={copiedEnglish
                        ? { background: 'rgba(0,255,136,0.15)', color: '#00ff88' }
                        : { background: 'rgba(123,47,255,0.1)', color: '#b69df8' }}>
                      {copiedEnglish ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedEnglish ? '✅ Copied!' : 'Copy English'}
                    </button>
                  </div>
                  <textarea readOnly rows={4}
                    value={recordingState === 'processing' && !englishText ? 'Processing…' : englishText}
                    placeholder="English text will appear here…"
                    className="w-full bg-transparent resize-none outline-none px-4 py-3 text-sm"
                    style={{ color: '#ffffff', lineHeight: '1.7' }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No API key warning */}
        {mode === 'ai' && serverChecked && !canUseAI && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="w-full flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.25)' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#ffa500' }} />
            <p className="text-xs" style={{ color: '#ffa500', fontFamily: 'Noto Sans Bengali, Inter, sans-serif' }}>
              AI মোড ব্যবহার করতে Settings-এ Gemini API Key দিন।{' '}
              <button onClick={() => { setTempApiKey(apiKey); setShowSettings(true); }} className="underline">
                Settings খুলুন →
              </button>
            </p>
          </motion.div>
        )}

        <p className="text-xs text-center pb-4" style={{ color: '#1e2d45' }}>
          Smart Voice Writer v1.4 · Powered by Gemini AI
        </p>
      </main>

      {/* ── Settings Modal ── */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(8,12,24,0.85)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-10 max-w-lg mx-auto"
              style={{ background: '#0d1226', border: '1px solid rgba(0,212,255,0.2)', borderBottom: 'none' }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" style={{ color: '#00d4ff' }} />
                  <h2 className="font-bold text-base" style={{ color: '#ffffff' }}>Settings</h2>
                </div>
                <button onClick={() => setShowSettings(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X className="w-4 h-4" style={{ color: '#99c5d0e0' }} />
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: '#00d4ff' }}>
                <Key className="w-3.5 h-3.5" />Gemini API Key
              </label>
              <div className="relative mb-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy…"
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,212,255,0.25)', color: '#ffffff', fontFamily: 'monospace' }}
                />
                <button onClick={() => setShowApiKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#556680' }}>
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs mb-6" style={{ color: '#556680' }}>
                Stored in your browser only. Get a free key at{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }}>
                  aistudio.google.com
                </a>
              </p>

              <button onClick={saveSettings}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,47,255,0.2))', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
                <Save className="w-4 h-4" />Save Settings
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
