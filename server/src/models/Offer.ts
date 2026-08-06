import { Schema, model, Document } from 'mongoose';

export interface IOffer extends Document {
  code: string; // Coupon code (e.g. WELCOME10)
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  activeFrom: Date;
  activeTo: Date;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    activeFrom: { type: Date, required: true },
    activeTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Offer = model<IOffer>('Offer', OfferSchema);
export default Offer;
