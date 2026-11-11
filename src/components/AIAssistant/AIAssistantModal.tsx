import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  action?: {
    type: string;
    tab?: string;
    query?: string;
    modal?: string;
  };
}

interface AIAssistantModalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAddClientModal: () => void;
  onOpenSettingsModal: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  activeTab,
  setActiveTab,
  setSearchQuery,
  onOpenAddClientModal,
  onOpenSettingsModal,
}) => {
  const { clients, suppliers, freeProfiles } = useDataStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: '¡Hola! Soy StreamBot, tu Asistente de IA y Voz de StreamManager Pro. Puedes escribirme o usar el micrófono para preguntarme sobre tus suscripciones o pedirme que ejecute acciones por ti.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [isSpeechSynthesisEnabled, setIsSpeechSynthesisEnabled] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscriptPreview('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      setTranscriptPreview(text);

      if (final.trim().length > 0) {
        setIsListening(false);
        handleSendMessage(final.trim(), true);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event?.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Text to speech helper
  const speakText = (text: string) => {
    if (!isSpeechSynthesisEnabled || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      // Clean up text from special characters or action json
      const clean = text.replace(/[*#_`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!voiceSupported) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Puedes usar el campo de texto.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        // Stop any running speech synthesis
        window.speechSynthesis?.cancel();
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Execute UI Action
  const executeAction = (action?: ChatMessage['action']) => {
    if (!action) return;

    if (action.type === 'NAVIGATE' && action.tab) {
      setActiveTab(action.tab);
    } else if (action.type === 'SEARCH' && typeof action.query === 'string') {
      setSearchQuery(action.query);
      if (activeTab !== 'clients_active' && activeTab !== 'clients_inactive') {
        setActiveTab('clients_active');
      }
    } else if (action.type === 'CLEAR_SEARCH') {
      setSearchQuery('');
    } else if (action.type === 'OPEN_MODAL') {
      if (action.modal === 'new_client') {
        onOpenAddClientModal();
      } else if (action.modal === 'settings') {
        onOpenSettingsModal();
      }
    }
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string, isVoice = false) => {
    const text = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!text || isLoading) return;

    setInputValue('');
    setTranscriptPreview('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Build context
    const activeClientsCount = clients.filter((c) => c.status === 'active').length;
    const inactiveClientsCount = clients.filter((c) => c.status === 'inactive').length;
    const suppliersNames = suppliers.map((s) => s.name);

    const context = {
      activeTab,
      totalActiveClients: activeClientsCount,
      totalInactiveClients: inactiveClientsCount,
      totalSuppliers: suppliers.length,
      suppliers: suppliersNames,
      totalFreeProfiles: freeProfiles.length,
    };

    try {
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          context,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Disculpa, no pude entender ese comando.';
      const action = data.action;

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically execute action if present
      if (action) {
        executeAction(action);
      }

      // Speak response if speech is on
      speakText(replyText);
    } catch (err) {
      console.error('Error calling /api/gemini/chat:', err);
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: 'Ocurrió un error al conectar con el asistente de voz. Por favor intenta de nuevo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    window.speechSynthesis?.cancel();
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        text: 'Historial reiniciado. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleQuickCommand = (prompt: string) => {
    handleSendMessage(prompt, false);
  };

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 select-none">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative group p-3.5 sm:p-4 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
            isOpen
              ? 'bg-[#18181C] text-[#dada28] border-2 border-[#c9c918] scale-105 shadow-[#c9c918]/25'
              : 'bg-[#18181C] hover:bg-[#202026] text-white border-2 border-[#c9c918]/70 hover:border-[#c9c918] shadow-black/40 hover:scale-105 active:scale-95'
          }`}
          title="Asistente Inteligente y Comandos de Voz"
          aria-label="Asistente Inteligente y Comandos de Voz"
        >
          {/* Animated pulse halo */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-2xl bg-[#c9c918]/25 animate-ping pointer-events-none opacity-60" />
          )}

          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#dada28] transition-transform group-hover:scale-110" />
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#1A1A1A] border border-[#c9c918]">
              <Mic className="w-2.5 h-2.5 text-[#c9c918]" />
            </div>
          </div>

          {/* Quick Tooltip on Hover for desktop */}
          <span className="hidden lg:group-hover:inline-block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold whitespace-nowrap border border-white/10 shadow-lg animate-fade-in pointer-events-none">
            Asistente IA & Voz
          </span>
        </button>
      </div>

      {/* Floating Chat & Voice Assistant Drawer/Modal */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-20 sm:bottom-24 sm:right-6 sm:left-auto sm:w-[420px] max-h-[82vh] sm:max-h-[640px] h-[580px] z-50 flex flex-col rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#26262E] shadow-2xl overflow-hidden animate-slide-in-up">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-black/30 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-xl bg-[#c9c918]/20 border border-[#c9c918]/40">
                <Bot className="w-5 h-5 text-[#dada28]" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white leading-none">
                    StreamBot AI
                  </h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-[#c9c918] text-slate-950">
                    Voz
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mt-0.5">
                  {isListening ? '🎙️ Escuchando tu voz...' : 'Control por voz y chat multi-turno'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice playback toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !isSpeechSynthesisEnabled;
                  setIsSpeechSynthesisEnabled(next);
                  if (!next) window.speechSynthesis?.cancel();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isSpeechSynthesisEnabled
                    ? 'text-[#dada28] bg-white/10 hover:bg-white/20'
                    : 'text-white/40 hover:text-white/80'
                }`}
                title={isSpeechSynthesisEnabled ? 'Voz activada (silenciar)' : 'Voz silenciada (activar)'}
              >
                {isSpeechSynthesisEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Clear chat history */}
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Limpiar conversación"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close Drawer */}
              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  if (isListening) {
                    try {
                      recognitionRef.current?.stop();
                    } catch {
                      // ignore
                    }
                  }
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar asistente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-[#101014] border-b border-slate-200/80 dark:border-[#1F1F24] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 select-none">
            <button
              onClick={() => handleQuickCommand('Ir a Clientes Activos')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-[#1A1A1E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D2D33] hover:border-[#c9c918] hover:text-[#7a7a08] dark:hover:text-[#dada28] transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              👥 Clientes Activos
            </button>
            <button
              onClick={() => handleQuickCommand('Ver Proveedores')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-[#1A1A1E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D2D33] hover:border-[#c9c918] hover:text-[#7a7a08] dark:hover:text-[#dada28] transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              🚚 Proveedores
            </button>
            <button
              onClick={() => handleQuickCommand('Abrir nuevo cliente')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-[#1A1A1E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D2D33] hover:border-[#c9c918] hover:text-[#7a7a08] dark:hover:text-[#dada28] transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              ➕ Nuevo Cliente
            </button>
            <button
              onClick={() => handleQuickCommand('Ver Alertas de vencimiento')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-[#1A1A1E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D2D33] hover:border-[#c9c918] hover:text-[#7a7a08] dark:hover:text-[#dada28] transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              ⚠️ Alertas
            </button>
            <button
              onClick={() => handleQuickCommand('¿Cuántos clientes y cuentas tengo en total?')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-[#1A1A1E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D2D33] hover:border-[#c9c918] hover:text-[#7a7a08] dark:hover:text-[#dada28] transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              📊 Estado general
            </button>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white dark:bg-[#141418]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 px-1">
                    {isUser && msg.isVoice && (
                      <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Mic className="w-2.5 h-2.5" /> Voz
                      </span>
                    )}
                    <span>{isUser ? 'Tú' : 'StreamBot'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-slate-900 text-white dark:bg-[#1E1E26] dark:text-[#E4E4E7] border border-transparent dark:border-[#2D2D36] rounded-tr-xs'
                        : 'bg-slate-100 text-slate-900 dark:bg-[#1C1C22] dark:text-[#E4E4E7] border border-slate-200/80 dark:border-[#26262E] rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Action Execution Badge */}
                    {msg.action && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-[#2A2A34] flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {msg.action.type === 'NAVIGATE' && `Navegó a: ${msg.action.tab}`}
                            {msg.action.type === 'SEARCH' && `Buscó: "${msg.action.query}"`}
                            {msg.action.type === 'CLEAR_SEARCH' && 'Búsqueda limpiada'}
                            {msg.action.type === 'OPEN_MODAL' && `Abrió: ${msg.action.modal}`}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => executeAction(msg.action)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c9c918] text-slate-950 hover:bg-[#b5b514] transition-colors cursor-pointer"
                        >
                          Ejecutar de nuevo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-[#1C1C22] max-w-[70%] border border-slate-200/80 dark:border-[#26262E] text-slate-500 dark:text-slate-400 text-xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-[#c9c918] animate-spin" />
                <span>StreamBot está pensando...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Live Voice Transcript Banner (When listening) */}
          {isListening && (
            <div className="px-4 py-2.5 bg-emerald-500/10 dark:bg-emerald-950/20 border-t border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 animate-fade-in shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="truncate italic">
                  {transcriptPreview || 'Habla ahora: "Ir a proveedores", "Buscar cliente"...'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors shrink-0 cursor-pointer"
              >
                Detener
              </button>
            </div>
          )}

          {/* Bottom Input Area */}
          <div className="p-3 bg-slate-50 dark:bg-[#101014] border-t border-slate-200/80 dark:border-[#1F1F24] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Big Voice Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                    : 'bg-[#c9c918] hover:bg-[#b5b514] active:bg-[#a1a110] text-slate-950 shadow-md shadow-[#c9c918]/20'
                }`}
                title={isListening ? 'Detener micrófono' : 'Hablar con comando de voz'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder="Escribe o usa tu voz para ordenar una acción..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] focus:outline-none focus:border-[#c9c918] focus:ring-0 transition-colors"
                disabled={isLoading}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 disabled:opacity-40 hover:bg-black dark:hover:bg-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
