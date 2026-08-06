import React from 'react';
import TrimTokyoChatbot from './components/TrimTokyoChatbot';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 relative selection:bg-amber-500/30">
      {/* Background glow for preview environment */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Development Preview Info Box */}
      <div className="text-center space-y-4 max-w-md border border-white/5 bg-zinc-900/40 p-8 rounded-2xl backdrop-blur-md">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xl mx-auto shadow-xl">
          TT
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Trim Tokyo AI Chatbot Widget</h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Standalone AI Receptionist Widget Preview. Import <code className="text-amber-400 font-mono bg-black/40 px-1.5 py-0.5 rounded">&lt;TrimTokyoChatbot /&gt;</code> into any website to embed the floating receptionist widget.
        </p>
      </div>

      {/* The Self-Contained Floating Chatbot Component */}
      <TrimTokyoChatbot initialOpen={true} />
    </div>
  );
};

export default App;
