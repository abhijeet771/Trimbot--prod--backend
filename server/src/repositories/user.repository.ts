import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).populate('preferences.preferredBarber preferences.preferredServices');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  async findOrCreateGuest(name: string, email: string, phone?: string): Promise<IUser> {
    const existing = await this.findByEmail(email);
    if (existing) {
      if (phone && !existing.phone) {
        existing.phone = phone;
        await existing.save();
      }
      return existing;
    }
    return this.create({
      name,
      email: email.toLowerCase(),
      phone,
      role: 'customer',
      preferences: { preferredServices: [] },
    });
  }
}

export default UserRepository;
