import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';
import logger from '../utils/logger';

export class ChatController {
  private chatService = new ChatService();

  public handleChat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sessionId, messageText, userId } = req.body;
      logger.info(`Received chat message for session ${sessionId}: "${messageText}"`);

      const result = await this.chatService.handleChatMessage({
        sessionId,
        messageText,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ChatController;
