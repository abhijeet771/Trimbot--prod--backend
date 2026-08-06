import { Schema, model, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  description?: string;
  durationMinutes: number; // in minutes
  price: number; // base price in Yen / dollars
  category: 'Haircut' | 'Beard' | 'Coloring' | 'Treatment' | 'Combo' | 'Other';
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    durationMinutes: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['Haircut', 'Beard', 'Coloring', 'Treatment', 'Combo', 'Other'],
      required: true,
    },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = model<IService>('Service', ServiceSchema);
export default Service;
