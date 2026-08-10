import { Schema, model, Document } from 'mongoose';

export interface IWorkingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ISalonSettings extends Document {
  name: string;
  address: string;
  locationMapUrl?: string;
  workingHours: IWorkingHours[];
  cancellationWindowHours: number; // e.g. 24 hours
  maxAdvanceBookingDays: number;   // e.g. 30 days
  parkingDetails?: string;
  contactPhone?: string;
  contactEmail?: string;
  refundPolicy?: string;
  membershipDetails?: string;
  giftCardDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkingHoursSchema = new Schema<IWorkingHours>({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  open: { type: String, default: '09:00' },
  close: { type: String, default: '19:00' },
  isClosed: { type: Boolean, default: false },
}, { _id: false });

const SalonSettingsSchema = new Schema<ISalonSettings>(
  {
    name: { type: String, required: true, default: 'Trim Tokyo' },
    address: { type: String, required: true, default: '1-2-3 Shibuya, Tokyo, Japan' },
    locationMapUrl: { type: String, default: 'https://maps.google.com/?q=Trim+Tokyo+Shibuya' },
    workingHours: [WorkingHoursSchema],
    cancellationWindowHours: { type: Number, default: 24 },
    maxAdvanceBookingDays: { type: Number, default: 30 },
    parkingDetails: { type: String, default: 'Standard parking is available in Shibuya Crossing parking lots. We validate parking for bookings over 10,000 Rupees.' },
    contactPhone: { type: String, default: '+81-3-1234-5678' },
    contactEmail: { type: String, default: 'info@trimtokyo.jp' },
    refundPolicy: { type: String, default: 'Cancellations within 24 hours receive a 100% refund. No-shows are non-refundable.' },
    membershipDetails: { type: String, default: 'VIP Membership offers 15% off all services, priority scheduling, and free grooming treatments for 5,000 Rupees/month.' },
    giftCardDetails: { type: String, default: 'Digital gift cards are available from 3,000 Rupees up to 50,000 Rupees. Non-expiry and redeemable for any cut/product.' },
  },
  { timestamps: true }
);

export const SalonSettings = model<ISalonSettings>('SalonSettings', SalonSettingsSchema);
export default SalonSettings;
