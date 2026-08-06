import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  type: 'booking_confirmation' | 'booking_cancellation' | 'booking_reminder' | 'offer' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['booking_confirmation', 'booking_cancellation', 'booking_reminder', 'offer', 'system'],
      required: true,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
export default Notification;
