import React from 'react';
import { MessageSquare, X } from 'lucide-react';

interface IFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const FloatingButton: React.FC<IFloatingButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 focus:outline-none group"
      aria-label="Toggle AI Salon Assistant"
    >
      <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping group-hover:animate-none opacity-75" />
      {isOpen ? (
        <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
      ) : (
        <MessageSquare className="w-6 h-6 fill-zinc-950 transition-transform duration-300 group-hover:rotate-6" />
      )}
    </button>
  );
};

export default FloatingButton;
