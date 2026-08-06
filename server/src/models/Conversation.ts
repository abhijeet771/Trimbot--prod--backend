import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  userId?: Types.ObjectId;
  sessionId: string; // Dynamic identifier (e.g. JWT id, Socket id, or client uuid)
  context: {
    preferredBarberId?: Types.ObjectId;
    preferredServices: Types.ObjectId[];
    lastAppointmentId?: Types.ObjectId;
    faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'diamond' | 'oblong';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, required: true, unique: true },
    context: {
      preferredBarberId: { type: Schema.Types.ObjectId, ref: 'Barber' },
      preferredServices: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
      lastAppointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
      faceShape: { type: String, enum: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'] },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Conversation = model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
