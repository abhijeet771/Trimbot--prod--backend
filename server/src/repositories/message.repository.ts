import { Message, IMessage } from '../models/Message';

export class MessageRepository {
  async create(data: Partial<IMessage>): Promise<IMessage> {
    const message = new Message(data);
    return message.save();
  }

  async findByConversationId(conversationId: string): Promise<IMessage[]> {
    return Message.find({ conversationId }).sort({ createdAt: 1 });
  }

  async markAsSeen(conversationId: string): Promise<void> {
    await Message.updateMany(
      { conversationId, isSeen: false, sender: { $ne: 'user' } },
      { $set: { isSeen: true } }
    );
  }
}

export default MessageRepository;
