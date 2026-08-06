import { Schema, model, Document, Types } from 'mongoose';

export interface IAppointment extends Document {
  userId: Types.ObjectId;
  barberId: Types.ObjectId;
  services: Types.ObjectId[];
  date: Date; // Start time
  endTime: Date; // End time (computed from sum of service durations)
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'paid';
  source: 'web' | 'chatbot';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    barberId: { type: Schema.Types.ObjectId, ref: 'Barber', required: true },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service', required: true }],
    date: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed', // Defaults to confirmed directly for conversational ease
    },
    notes: { type: String },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    source: {
      type: String,
      enum: ['web', 'chatbot'],
      default: 'chatbot',
    },
  },
  { timestamps: true }
);

// Indexes for scheduling lookups
AppointmentSchema.index({ barberId: 1, date: 1 });
AppointmentSchema.index({ userId: 1, status: 1 });

export const Appointment = model<IAppointment>('Appointment', AppointmentSchema);
export default Appointment;
