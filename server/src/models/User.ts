import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'customer' | 'barber' | 'admin';
  preferences: {
    preferredBarber?: Types.ObjectId;
    preferredServices: Types.ObjectId[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String }, // Optional (e.g. if using guest bookings or OAuth)
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['customer', 'barber', 'admin'],
      default: 'customer',
    },
    preferences: {
      preferredBarber: { type: Schema.Types.ObjectId, ref: 'Barber' },
      preferredServices: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
export default User;
