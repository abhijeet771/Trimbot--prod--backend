import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ChatService } from '../services/chat.service';
import logger from '../utils/logger';

export class SocketManager {
  private io: SocketServer;
  private chatService = new ChatService();

  constructor(server: HttpServer, clientUrl: string) {
    this.io = new SocketServer(server, {
      cors: {
        origin: clientUrl,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.initializeListeners();
  }

  private initializeListeners(): void {
    logger.info('Initializing Socket.io listeners...');

    this.io.on('connection', (socket: Socket) => {
      const sessionId = socket.handshake.query.sessionId as string;
      const userId = socket.handshake.query.userId as string;

      if (!sessionId) {
        logger.warn(`Connection rejected: Missing sessionId. Socket ID: ${socket.id}`);
        socket.disconnect();
        return;
      }

      logger.info(`Socket connected: ${socket.id} (Session: ${sessionId}, User: ${userId || 'guest'})`);
      
      // Join a room unique to the session
      socket.join(sessionId);

      // Typing event
      socket.on('typing', () => {
        socket.to(sessionId).emit('typing', { sender: 'user' });
      });

      // Stop typing event
      socket.on('stop_typing', () => {
        socket.to(sessionId).emit('stop_typing', { sender: 'user' });
      });

      // Real-time Chat message over sockets
      socket.on('chat_message', async (data: { messageText: string }) => {
        try {
          const { messageText } = data;
          logger.info(`Socket [${socket.id}] message: "${messageText}"`);

          // Emit typing indicator back to client
          socket.emit('typing', { sender: 'assistant' });

          // Call orchestration service
          const result = await this.chatService.handleChatMessage({
            sessionId,
            messageText,
            userId: userId || undefined,
          });

          // Stop typing indicator
          socket.emit('stop_typing', { sender: 'assistant' });

          // Send message payload
          socket.emit('assistant_message', {
            text: result.text,
            conversationId: result.conversationId,
          });
        } catch (error: any) {
          logger.error(`Socket chat_message error: ${error.message}`);
          socket.emit('error_message', {
            message: 'Failed to process message: ' + error.message,
          });
        }
      });

      // Listen for booking updates to notify room users
      socket.on('booking_updated', (data: { appointmentId: string }) => {
        this.io.to(sessionId).emit('booking_updated', data);
      });

      // Listen for appointment cancellations
      socket.on('appointment_cancelled', (data: { appointmentId: string }) => {
        this.io.to(sessionId).emit('appointment_cancelled', data);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id} (Session: ${sessionId})`);
      });
    });
  }

  // Helper method to emit events globally if needed
  public emitGlobal(event: string, data: any): void {
    this.io.emit(event, data);
  }
}

export default SocketManager;
