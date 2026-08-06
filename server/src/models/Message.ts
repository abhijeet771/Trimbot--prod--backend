import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string; // JSON string of arguments
  }>;
  isSeen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    text: { type: String, required: true },
    toolCalls: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        arguments: { type: String, required: true },
      },
    ],
    isSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = model<IMessage>('Message', MessageSchema);
export default Message;
