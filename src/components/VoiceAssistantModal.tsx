import { useState, useEffect, type FC } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const VoiceAssistantModal: FC<VoiceAssistantModalProps> = ({ isOpen, onClose, lang }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setReply('');
      setErrorMsg('');
      setIsListening(false);
    } else {
      setMessages([]);
      setReply('');
      setErrorMsg('');
      setTranscript('');
      window.speechSynthesis?.cancel();
    }
  }, [isOpen]);

  const resetConversation = () => {
    setMessages([]);
    setReply('');
    setErrorMsg('');
    setTranscript('');
    setIsListening(false);
    window.speechSynthesis?.cancel();
  };

  if (!isOpen) return null;

  const startSpeechRecognition = () => {
    // Check Web Speech API support
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition || (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Voice recognition not supported in this browser. Please type below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please try again.');
        } else {
          setErrorMsg('Voice listening error.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const buildLocalReply = (prompt: string) => {
    const normalized = prompt.toLowerCase();
    if (normalized.includes('ধান') || normalized.includes('rice')) {
      return 'For rice fields, consult a local extension officer and check drainage and airflow if brown spots appear.';
    }
    if (normalized.includes('পুকুর') || normalized.includes('pond') || normalized.includes('মাছ')) {
      return 'Check pond water quality and oxygen levels regularly. If fish float, inspect water condition and feed quantity.';
    }
    if (normalized.includes('গরু') || normalized.includes('ছাগল') || normalized.includes('livestock') || normalized.includes('পশু')) {
      return 'If livestock seem unwell, contact a veterinary officer promptly and confirm vaccination and water intake.';
    }
    return 'Write your question clearly and consult a local agriculture, livestock, or fisheries office for detailed advice.';
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = textToSend || transcript;
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setReply('');
    const sessionMessages = [...messages, { role: 'user', text: prompt } as { role: 'user' | 'assistant'; text: string }];
    setMessages(sessionMessages);
    setTranscript('');

    try {
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, lang, session: sessionMessages }),
      });

      const data = await res.json();
      let assistantText = '';

      if (res.ok && (data.reply || data.answer)) {
        assistantText = data.reply || data.answer;
      } else {
        assistantText = buildLocalReply(prompt);
        setErrorMsg(data.error || 'Live AI response unavailable, so a local guide is shown.');
      }

      setIsSpeaking(true);
      speakText(assistantText);
    } catch (err) {
      console.error(err);
      const fallbackReply = buildLocalReply(prompt);
      setReply(fallbackReply);
      setMessages((prev) => [...prev, { role: 'assistant', text: fallbackReply }]);
      setIsSpeaking(true);
      speakText(fallbackReply);
      setErrorMsg('A local guide is shown because the network is unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-400 text-emerald-950 font-bold">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base">AI Voice Agri Assistant</h3>
              <p className="text-xs text-emerald-200">Speak or type your question.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetConversation}
              className="px-3 py-1 rounded-full bg-emerald-700/10 text-emerald-100 text-xs font-semibold hover:bg-emerald-700/20 transition-colors"
            >
              New Chat
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Preset Prompts */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Quick Questions:</span>
            <div className="flex flex-wrap gap-2">
              {[
                'What should I do if brown spots appear on rice leaves?',
                'What is the emergency treatment if fish float in the pond?',
                'Which injection is needed if a cow shows signs of mastitis?',
                'What are the requirements for a 4% agri loan?',
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(sample);
                    handleSendPrompt(sample);
                  }}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition-colors text-left"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Speak clearly and listen to the response; this helps the assistant understand your farming question better.</span>
          </div>

          {/* Listening Indicator / Controls */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <button
              onClick={startSpeechRecognition}
              disabled={isListening || isLoading}
              className={`relative p-6 rounded-full transition-all transform active:scale-95 shadow-lg ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {isListening ? 'Listening... Speak now' : 'Tap mic and speak'}
            </p>
          </div>

          {/* Conversation History */}
          <div className="space-y-3 max-h-56 overflow-y-auto pb-1">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                Your conversation will appear here. Ask a question and hear the AI response.
              </div>
            ) : (
              messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl px-4 py-3 max-w-[90%] ${
                    message.role === 'user'
                      ? 'bg-emerald-50 text-slate-900 self-end ml-auto border border-emerald-200'
                      : 'bg-slate-900 text-white self-start border border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide mb-1">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
              ))
            )}
          </div>

          {/* User Input & Transcript */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Your Question:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={isLoading || !transcript.trim()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
