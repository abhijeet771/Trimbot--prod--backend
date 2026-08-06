import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import config from '../config';
import { toast } from 'react-hot-toast';

export interface IMessage {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
  timestamp: Date;
}

export type WidgetType = 'none' | 'hairstyle_generator' | 'bookings_view';

interface IChatContext {
  messages: IMessage[];
  sessionId: string;
  isTyping: boolean;
  isLoading: boolean;
  isConnected: boolean;
  activeWidget: WidgetType;
  setActiveWidget: (widget: WidgetType) => void;
  sendMessage: (text: string) => Promise<void>;
  resetSession: () => void;
}

const ChatContext = createContext<IChatContext | undefined>(undefined);

const getOrGenerateSessionId = (): string => {
  let sid = localStorage.getItem('trimtokyo_session_id');
  if (!sid) {
    sid = 'tt_session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('trimtokyo_session_id', sid);
  }
  return sid;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>(getOrGenerateSessionId());
  const [messages, setMessages] = useState<IMessage[]>([
    {
      sender: 'assistant',
      text: "Welcome to **Trim Tokyo**! ✂️\n\nI am your AI receptionist. I can help you **book an appointment**, look up **barbers**, answer **FAQs**, explore **prices**, or find the perfect **hairstyle**.\n\nHow can I help you look your best today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeWidget, setActiveWidget] = useState<WidgetType>('none');
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Initialize Socket.io Connection
    const socket = io(config.socketUrl, {
      query: { sessionId },
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    socket.on('typing', (data) => {
      if (data.sender === 'assistant') {
        setIsTyping(true);
      }
    });

    socket.on('stop_typing', (data) => {
      if (data.sender === 'assistant') {
        setIsTyping(false);
      }
    });

    socket.on('assistant_message', (data: { text: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.text,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
      setIsTyping(false);
    });

    socket.on('error_message', (data: { message: string }) => {
      toast.error(data.message);
      setIsLoading(false);
      setIsTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: IMessage = {
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // If socket is connected, send message through socket
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing');
      socketRef.current.emit('chat_message', { messageText: text });
    } else {
      // Fallback to HTTP REST
      try {
        const response = await axios.post(`${config.apiUrl}/chat`, {
          sessionId,
          messageText: text,
        });

        const reply = response.data?.data?.text;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: reply || 'Sorry, I encountered an issue.',
            timestamp: new Date(),
          },
        ]);
      } catch (err: any) {
        const errMsg = err.response?.data?.message || err.message;
        toast.error(`REST Error: ${errMsg}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetSession = () => {
    localStorage.removeItem('trimtokyo_session_id');
    const newSid = getOrGenerateSessionId();
    setSessionId(newSid);
    setMessages([
      {
        sender: 'assistant',
        text: "Welcome back! Session restarted.\n\nHow can I help you book or query today?",
        timestamp: new Date(),
      },
    ]);
    setActiveWidget('none');
    toast.success('Conversation history reset.');
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sessionId,
        isTyping,
        isLoading,
        isConnected,
        activeWidget,
        setActiveWidget,
        sendMessage,
        resetSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
