import { Schema, model, Document, Types } from 'mongoose';

export interface IPpricing extends Document {
  serviceId: Types.ObjectId;
  tier: 'standard' | 'premium' | 'student' | 'member';
  priceOverride?: number; // Surcharge or specific price override
  discountPercentage: number;
  taxPercentage: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPpricing>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    tier: {
      type: String,
      enum: ['standard', 'premium', 'student', 'member'],
      required: true,
      default: 'standard',
    },
    priceOverride: { type: Number, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    taxPercentage: { type: Number, default: 10, min: 0, max: 100 }, // 10% standard JPY tax
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

PricingSchema.index({ serviceId: 1, tier: 1 });

export const Pricing = model<IPpricing>('Pricing', PricingSchema);
export default Pricing;
