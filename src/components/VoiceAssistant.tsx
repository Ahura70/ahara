import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Loader2, Play, Pause, Minus, Plus } from 'lucide-react';
import { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function VoiceAssistant({ recipe }: { recipe: Recipe }) {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);

  const startListening = async () => {
    try {
      setIsConnecting(true);
      
      const systemInstruction = `You are a helpful culinary assistant. You are currently helping the user cook the following recipe:
Title: ${recipe.title}
Prep Time: ${recipe.prepTime} minutes
Ingredients:
${recipe.ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`).join('\n')}
Instructions:
${recipe.instructions.join('\n')}

The user wants you to narrate the recipe. They may ask you to read it slower, faster, pause, or continue. 
When they ask to pause, you should stop talking. When they ask to continue, pick up where you left off.
Be concise and helpful.`;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction,
        },
        callbacks: {
          onopen: async () => {
            setIsConnecting(false);
            setIsListening(true);
            
            // Send initial message to kick off the conversation
            sessionPromise.then(session => {
               session.sendRealtimeInput({ text: "Hi! I'm ready to cook. Can you start reading the recipe?" });
            });

            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              mediaStreamRef.current = stream;
              
              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
              audioContextRef.current = new AudioContext({ sampleRate: 16000 });
              
              const source = audioContextRef.current.createMediaStreamSource(stream);
              const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert Float32Array to Int16Array
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  let s = Math.max(-1, Math.min(1, inputData[i]));
                  pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                
                // Convert to base64
                const buffer = new ArrayBuffer(pcm16.length * 2);
                const view = new DataView(buffer);
                for (let i = 0; i < pcm16.length; i++) {
                  view.setInt16(i * 2, pcm16[i], true); // little endian
                }
                
                let binary = '';
                const bytes = new Uint8Array(buffer);
                for (let i = 0; i < bytes.byteLength; i++) {
                  binary += String.fromCharCode(bytes[i]);
                }
                const base64Data = btoa(binary);
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                });
              };
              
              source.connect(processor);
              processor.connect(audioContextRef.current.destination);
            } catch (err) {
              console.error("Error accessing microphone:", err);
              stopListening();
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              playAudio(base64Audio);
            }
            if (message.serverContent?.interrupted) {
              // Stop playback
              if (playbackContextRef.current) {
                playbackContextRef.current.close();
                playbackContextRef.current = null;
                nextPlayTimeRef.current = 0;
              }
            }
          },
          onclose: () => {
            stopListening();
          },
          onerror: (err) => {
            console.error("Live API error:", err);
            stopListening();
          }
        }
      });
      
      sessionRef.current = sessionPromise;
      
    } catch (err) {
      console.error("Error starting Live API:", err);
      setIsConnecting(false);
    }
  };

  const playAudio = async (base64Audio: string) => {
    if (!playbackContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = playbackContextRef.current.currentTime;
    }
    
    const ctx = playbackContextRef.current;
    
    // Decode base64 PCM16 to Float32Array
    const binary = atob(base64Audio);
    const pcm16 = new Int16Array(binary.length / 2);
    for (let i = 0; i < pcm16.length; i++) {
      const lsb = binary.charCodeAt(i * 2);
      const msb = binary.charCodeAt(i * 2 + 1);
      pcm16[i] = (msb << 8) | lsb;
    }
    
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }
    
    const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    const startTime = Math.max(nextPlayTimeRef.current, ctx.currentTime);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;
  };

  const stopListening = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
      nextPlayTimeRef.current = 0;
    }
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }
    setIsListening(false);
    setIsConnecting(false);
  };

  const sendCommand = (command: string) => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => {
        session.sendRealtimeInput({ text: command });
      });
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isConnecting}
        className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-sm transition-colors shadow-sm ${
          isListening 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-primary text-white hover:bg-primary/90'
        } ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isConnecting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
        {isConnecting ? 'Connecting Voice...' : isListening ? 'Stop Voice Assistant' : 'Start Voice Assistant'}
      </button>

      {isListening && (
        <div className="flex items-center justify-between gap-2 bg-white/50 p-2 rounded-xl border border-white/60">
          <button 
            onClick={() => sendCommand("Speak slower")}
            className="flex-1 flex flex-col items-center justify-center py-2 rounded-lg hover:bg-white/60 text-text-main transition-colors"
          >
            <Minus className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Slower</span>
          </button>
          <button 
            onClick={() => sendCommand("Pause narration")}
            className="flex-1 flex flex-col items-center justify-center py-2 rounded-lg hover:bg-white/60 text-text-main transition-colors"
          >
            <Pause className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Pause</span>
          </button>
          <button 
            onClick={() => sendCommand("Continue narration")}
            className="flex-1 flex flex-col items-center justify-center py-2 rounded-lg hover:bg-white/60 text-text-main transition-colors"
          >
            <Play className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Resume</span>
          </button>
          <button 
            onClick={() => sendCommand("Speak faster")}
            className="flex-1 flex flex-col items-center justify-center py-2 rounded-lg hover:bg-white/60 text-text-main transition-colors"
          >
            <Plus className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Faster</span>
          </button>
        </div>
      )}
    </div>
  );
}
