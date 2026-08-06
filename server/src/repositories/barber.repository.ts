import { Barber, IBarber } from '../models/Barber';

export class BarberRepository {
  async findById(id: string): Promise<IBarber | null> {
    return Barber.findById(id);
  }

  async findAllActive(): Promise<IBarber[]> {
    return Barber.find({ status: 'active' });
  }

  async findByName(name: string): Promise<IBarber | null> {
    // Case insensitive search
    return Barber.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      status: 'active',
    });
  }

  async searchBarbers(specialty?: string): Promise<IBarber[]> {
    const query: any = { status: 'active' };
    if (specialty) {
      query.specialties = { $regex: new RegExp(specialty.trim(), 'i') };
    }
    return Barber.find(query);
  }
}

export default BarberRepository;
