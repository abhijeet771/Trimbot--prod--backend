import { BarberRepository } from '../repositories/barber.repository';
import { IBarber } from '../models/Barber';
import logger from '../utils/logger';

export class BarberService {
  private barberRepo = new BarberRepository();

  async findActiveBarbers(): Promise<IBarber[]> {
    return this.barberRepo.findAllActive();
  }

  async findBarberByName(name: string): Promise<IBarber | null> {
    return this.barberRepo.findByName(name);
  }

  async searchBarbers(specialty?: string, dateStr?: string): Promise<IBarber[]> {
    logger.info(`Searching barbers with specialty: ${specialty || 'any'}, date: ${dateStr || 'any'}`);
    
    // Fetch active barbers matching specialty
    let barbers = await this.barberRepo.searchBarbers(specialty);

    if (dateStr && barbers.length > 0) {
      const targetDate = new Date(dateStr);
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = daysOfWeek[targetDate.getDay()] as 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

      // Filter by working schedule
      barbers = barbers.filter((barber) => {
        const schedule = barber.schedule[dayName];
        return schedule && schedule.isWorking;
      });
    }

    return barbers;
  }
}

export default BarberService;
