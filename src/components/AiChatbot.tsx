import React, { useState } from 'react';
import { Bot, ChevronDown, Copy, Lightbulb, RotateCcw, Send, Sparkles } from 'lucide-react';
import { explainErrorWithAi } from '../services/api';
import type { RorrLog } from '../types/rorr';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface Props {
  currentLog?: RorrLog | null;
}

export const AiChatbot: React.FC<Props> = ({ currentLog }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const createInitialMessage = (): Message => ({
    id: 'welcome-msg',
    sender: 'ai',
    text: `👋 Hi! I am **Rorr AI Assistant**.  
I analyze app errors, stack traces, and system exceptions to explain root causes and recommend exact code fixes.

*Click a quick prompt below or type any question!*`,
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([createInitialMessage()]);

  const handleClose = () => {
    setIsOpen(false);
    // Clear chat session history when user leaves/closes chat
    setMessages([createInitialMessage()]);
    setInputQuestion('');
  };

  const handleClearChat = () => {
    setMessages([createInitialMessage()]);
    setInputQuestion('');
  };

  const handleSend = async (customPrompt?: string) => {
    const question = customPrompt || inputQuestion;
    if (!question.trim() || loading) return;

    const userMsgId = 'user-' + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: question.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputQuestion('');
    setLoading(true);

    try {
      const res = await explainErrorWithAi({
        errorName: currentLog?.errorName || currentLog?.errorCode || 'System Diagnostic Query',
        errorCode: currentLog?.errorCode || 'ERR_500',
        stackTrace: currentLog?.stackTrace || currentLog?.message || 'General developer query.',
        endpoint: currentLog?.endpoint || '/api/v1',
        userQuestion: question.trim(),
      });

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: res.explanation,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: '⚠️ **Diagnostic Engine Error:** Failed to connect to AI Diagnostic Service. Please verify network connectivity.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4.5 py-3 bg-[#121215] hover:bg-[#18181b] text-emerald-400 rounded-2xl shadow-xl border border-emerald-500/30 transition transform hover:scale-105 group cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-left">
            <p className="text-xs font-mono font-bold leading-none text-white">Rorr AI Assistant</p>
            <p className="text-[10px] font-mono text-emerald-400 mt-0.5">Gemini Diagnostics</p>
          </div>
        </button>
      )}

      {/* Floating AI Chatbot Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[560px] bg-[#09090b] border border-[#27272a] rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-[#121215] border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  Rorr AI Assistant
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-mono uppercase font-bold border border-emerald-500/30">
                    Gemini Live
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono">Real-time exception & stack trace solver</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear Chat Session"
                className="p-1.5 text-zinc-400 hover:text-emerald-400 rounded-lg hover:bg-[#18181b] transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleClose}
                title="Close Chat"
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#18181b] transition"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Context Banner if inspecting a log */}
          {currentLog && (
            <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
              <div className="flex items-center gap-2 truncate">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Context: <strong>{currentLog.errorName || currentLog.errorCode}</strong></span>
              </div>
              <button
                onClick={() => handleSend(`Explain the root cause of error ${currentLog.errorCode} at ${currentLog.endpoint}`)}
                className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md text-[10px] shrink-0 transition"
              >
                Analyze Log
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#09090b]/90 text-xs text-zinc-200 font-sans">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md relative group ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-br-none'
                      : 'bg-[#121215] border border-[#27272a] text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition"
                      title="Copy response"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {copiedId === msg.id && (
                    <span className="absolute top-2 right-8 text-[9px] text-emerald-400 font-bold font-mono">Copied!</span>
                  )}

                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>
                  <span className={`block text-[9px] font-mono mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-200' : 'text-zinc-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs py-2 px-3 bg-[#121215] rounded-xl border border-[#27272a] w-fit">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Rorr AI is inspecting stack trace...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="p-2.5 bg-[#121215] border-t border-[#27272a] flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => handleSend('Explain common causes of NullReferenceException in EF Core.')}
              className="px-3 py-1 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[10px] text-zinc-300 font-mono rounded-xl shrink-0 transition hover:text-emerald-400"
            >
              💡 NullReferenceException
            </button>
            <button
              onClick={() => handleSend('What causes HTTP 500 internal server errors in ASP.NET Core?')}
              className="px-3 py-1 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[10px] text-zinc-300 font-mono rounded-xl shrink-0 transition hover:text-emerald-400"
            >
              🚀 Fix HTTP 500 Errors
            </button>
            <button
              onClick={() => handleSend('How do I optimize database query timeouts in Dapper?')}
              className="px-3 py-1 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[10px] text-zinc-300 font-mono rounded-xl shrink-0 transition hover:text-emerald-400"
            >
              ⚡ Query Timeouts
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#121215] border-t border-[#27272a] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Rorr AI Assistant about an error or stack trace..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputQuestion.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl transition shrink-0 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};


