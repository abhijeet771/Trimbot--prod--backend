import React, { useState } from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import { ChatWidget } from './ChatWidget';
import { FloatingButton } from './FloatingButton';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export interface TrimTokyoChatbotProps {
  initialOpen?: boolean;
}

export const TrimTokyoChatbot: React.FC<TrimTokyoChatbotProps> = ({ initialOpen = false }) => {
  const [isChatOpen, setIsChatOpen] = useState(initialOpen);

  return (
    <ChatProvider>
      <div className="trimtokyo-chatbot-root">
        {/* Global Toaster Alerts for Chatbot */}
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: '#1c1c24',
              color: '#f3f4f6',
              border: '1px solid rgba(255,255,255,0.08)',
              zIndex: 99999,
            },
          }}
        />

        {/* Floating Chat Widget */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="z-50"
            >
              <ChatWidget />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Circular Action Trigger */}
        <FloatingButton isOpen={isChatOpen} onClick={() => setIsChatOpen(!isChatOpen)} />
      </div>
    </ChatProvider>
  );
};

export default TrimTokyoChatbot;
