import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { HairstyleGenerator } from './HairstyleGenerator';
import { BookingsView } from './BookingsView';
import { 
  Send, RotateCcw, Sparkles, Calendar, Scissors, HelpCircle, 
  CornerDownLeft, Globe, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatWidget: React.FC = () => {
  const {
    messages,
    sendMessage,
    isTyping,
    isLoading,
    isConnected,
    resetSession,
    activeWidget,
    setActiveWidget,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested replies
  const suggestions = [
    { text: 'Book haircut tomorrow', icon: Calendar },
    { text: 'Best fade barber?', icon: Scissors },
    { text: 'Haircut price', icon: Sparkles },
    { text: 'Hairstyle recommendation', icon: Scissors },
    { text: 'What are opening hours?', icon: HelpCircle },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    await sendMessage(text);
  };

  const handleSuggestionClick = async (text: string) => {
    // If user clicked hairstyle recommendation, open the generator panel directly as a shortcut
    if (text === 'Hairstyle recommendation') {
      setActiveWidget('hairstyle_generator');
    }
    await sendMessage(text);
  };

  return (
    <div className="fixed bottom-24 right-6 w-[92vw] md:w-[450px] h-[78vh] max-h-[680px] flex gap-4 z-40 transition-all duration-300">
      
      {/* Sidebar Panel for Hairstyle Generator or Bookings View */}
      <AnimatePresence>
        {activeWidget !== 'none' && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden md:block w-[350px] h-full"
          >
            {activeWidget === 'hairstyle_generator' ? (
              <HairstyleGenerator />
            ) : (
              <BookingsView />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Assistant Frame */}
      <div className="flex-1 flex flex-col h-full bg-zinc-950/85 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-zinc-900/40 relative">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-extrabold text-sm shadow-md">
                TT
              </div>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-zinc-900 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
            <div>
              <h2 className="font-bold text-zinc-100 text-sm tracking-wide">Trim Tokyo Assistant</h2>
              <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                <Globe className="w-3 h-3 text-amber-500/80" />
                Salon Receptionist • Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Quick Link buttons for mobile */}
            <button
              onClick={() => setActiveWidget(activeWidget === 'bookings_view' ? 'none' : 'bookings_view')}
              className={`p-1.5 rounded-lg border transition-colors md:hidden ${activeWidget === 'bookings_view' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' : 'border-white/5 text-zinc-400 hover:text-zinc-200'}`}
              title="My Bookings"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveWidget(activeWidget === 'hairstyle_generator' ? 'none' : 'hairstyle_generator')}
              className={`p-1.5 rounded-lg border transition-colors md:hidden ${activeWidget === 'hairstyle_generator' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' : 'border-white/5 text-zinc-400 hover:text-zinc-200'}`}
              title="AI Hairstyle"
            >
              <Scissors className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveWidget(activeWidget === 'bookings_view' ? 'none' : 'bookings_view')}
              className="hidden md:block p-1.5 rounded-lg border border-white/5 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="My Bookings"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={resetSession}
              className="p-1.5 rounded-lg border border-white/5 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Clear Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-zinc-950/20 to-black/40">
          {messages.map((msg, index) => {
            const isBot = msg.sender === 'assistant';
            const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={index} className={`flex gap-2 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                {isBot && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] text-amber-400 font-extrabold flex-shrink-0 mt-1">
                    TT
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-sm ${
                    isBot 
                      ? 'bg-zinc-900/60 text-zinc-200 border border-white/5 rounded-tl-sm shadow-md' 
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-medium rounded-tr-sm shadow-lg'
                  }`}>
                    {isBot ? (
                      <MarkdownRenderer content={msg.text} />
                    ) : (
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-1.5 text-[9px] text-zinc-500 ${isBot ? 'justify-start' : 'justify-end'}`}>
                    <span>{formattedTime}</span>
                    {!isBot && (
                      <span className="flex items-center" title="Message Seen">
                        <Eye className="w-3 h-3 text-amber-500/60" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2 max-w-[80%] mr-auto">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] text-amber-400 font-extrabold flex-shrink-0 mt-1">
                TT
              </div>
              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-2xl rounded-tl-sm flex items-center gap-1">
                <span className="typing-dot w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <span className="typing-dot w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <span className="typing-dot w-1.5 h-1.5 bg-amber-500 rounded-full" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Replies */}
        {messages.length === 1 && !isLoading && (
          <div className="p-3 border-t border-white/5 bg-zinc-950">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2 block px-1">Suggested inquiries</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => {
                const IconComponent = sug.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug.text)}
                    className="text-xs text-zinc-400 hover:text-amber-400 bg-zinc-900/50 hover:bg-amber-500/5 border border-white/5 hover:border-amber-500/20 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-amber-500/70" />
                    {sug.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Footer / Input area */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-zinc-900/30 flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g. 'book Rahul Saturday at 2pm')..."
              className="w-full glass-input py-2.5 pl-3.5 pr-8 text-sm rounded-xl text-zinc-200"
              disabled={isLoading}
            />
            <kbd className="absolute right-2.5 top-2.5 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-500 bg-zinc-850 border border-white/5 flex items-center gap-0.5">
              <CornerDownLeft className="w-2.5 h-2.5" />
            </kbd>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/40 disabled:text-zinc-950/40 text-zinc-950 font-bold rounded-xl transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;
