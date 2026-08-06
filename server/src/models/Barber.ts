import { Schema, model, Document } from 'mongoose';

export interface IScheduleDay {
  isWorking: boolean;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "18:00"
  breaks: Array<{
    startTime: string; // e.g. "13:00"
    endTime: string;   // e.g. "14:00"
  }>;
}

export interface IBarber extends Document {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  status: 'active' | 'inactive';
  schedule: {
    monday: IScheduleDay;
    tuesday: IScheduleDay;
    wednesday: IScheduleDay;
    thursday: IScheduleDay;
    friday: IScheduleDay;
    saturday: IScheduleDay;
    sunday: IScheduleDay;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleDaySchema = new Schema<IScheduleDay>({
  isWorking: { type: Boolean, default: true },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '18:00' },
  breaks: [
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
}, { _id: false });

const BarberSchema = new Schema<IBarber>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    bio: { type: String },
    specialties: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    schedule: {
      monday: { type: ScheduleDaySchema, default: () => ({ isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] }) },
      tuesday: { type: ScheduleDaySchema, default: () => ({ isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] }) },
      wednesday: { type: ScheduleDaySchema, default: () => ({ isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] }) },
      thursday: { type: ScheduleDaySchema, default: () => ({ isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] }) },
      friday: { type: ScheduleDaySchema, default: () => ({ isWorking: true, startTime: '09:00', endTime: '18:00', breaks: [{ startTime: '13:00', endTime: '14:00' }] }) },
      saturday: { type: ScheduleDaySchema, default: () => ({ isWorking: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '13:00', endTime: '13:30' }] }) },
      sunday: { type: ScheduleDaySchema, default: () => ({ isWorking: false, startTime: '09:00', endTime: '18:00', breaks: [] }) },
    },
  },
  { timestamps: true }
);

export const Barber = model<IBarber>('Barber', BarberSchema);
export default Barber;
