import { Schema, model, Document } from 'mongoose';

export interface IHairstyle extends Document {
  name: string;
  description: string;
  faceShapes: Array<'oval' | 'round' | 'square' | 'heart' | 'diamond' | 'oblong'>;
  hairLength: 'short' | 'medium' | 'long';
  hairTexture: 'straight' | 'wavy' | 'curly' | 'coily';
  hairDensity: 'thin' | 'medium' | 'thick';
  maintenanceLevel: 'low' | 'medium' | 'high';
  stylingProducts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HairstyleSchema = new Schema<IHairstyle>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    faceShapes: [
      {
        type: String,
        enum: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'],
      },
    ],
    hairLength: {
      type: String,
      enum: ['short', 'medium', 'long'],
      required: true,
    },
    hairTexture: {
      type: String,
      enum: ['straight', 'wavy', 'curly', 'coily'],
      required: true,
    },
    hairDensity: {
      type: String,
      enum: ['thin', 'medium', 'thick'],
      required: true,
    },
    maintenanceLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    stylingProducts: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const Hairstyle = model<IHairstyle>('Hairstyle', HairstyleSchema);
export default Hairstyle;
