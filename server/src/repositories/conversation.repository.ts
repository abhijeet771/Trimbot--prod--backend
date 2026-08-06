import { Conversation, IConversation } from '../models/Conversation';

export class ConversationRepository {
  async findBySessionId(sessionId: string): Promise<IConversation | null> {
    return Conversation.findOne({ sessionId, isActive: true })
      .populate('context.preferredBarberId')
      .populate('context.preferredServices')
      .populate('context.lastAppointmentId');
  }

  async create(sessionId: string, userId?: string): Promise<IConversation> {
    const data: any = {
      sessionId,
      isActive: true,
      context: { preferredServices: [] },
    };
    if (userId) {
      data.userId = userId;
    }
    const conversation = new Conversation(data);
    return conversation.save();
  }

  async updateContext(sessionId: string, context: Partial<IConversation['context']>): Promise<IConversation | null> {
    // Find the conversation
    const conv = await Conversation.findOne({ sessionId, isActive: true });
    if (!conv) {
      return null;
    }

    // Merge context keys
    conv.context = {
      ...conv.context,
      ...context,
    };

    return conv.save();
  }

  async deactivate(sessionId: string): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { sessionId },
      { $set: { isActive: false } },
      { new: true }
    );
  }
}

export default ConversationRepository;
