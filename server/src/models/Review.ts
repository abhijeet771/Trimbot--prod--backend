import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  userId: Types.ObjectId;
  barberId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    barberId: { type: Schema.Types.ObjectId, ref: 'Barber', required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ barberId: 1 });
ReviewSchema.index({ userId: 1 });

export const Review = model<IReview>('Review', ReviewSchema);
export default Review;
