import { SalonSettings, ISalonSettings } from '../models/SalonSettings';

export class SalonSettingsRepository {
  async getSettings(): Promise<ISalonSettings> {
    const settings = await SalonSettings.findOne({});
    if (settings) {
      return settings;
    }
    // Return a default fallback
    return SalonSettings.create({
      name: 'Trim Tokyo',
      address: 'B1F Palace Building, 1-2-3 Shibuya, Shibuya-ku, Tokyo, 150-0002',
      cancellationWindowHours: 24,
      maxAdvanceBookingDays: 30,
      workingHours: [
        { day: 'monday', open: '10:00', close: '20:00', isClosed: false },
        { day: 'tuesday', open: '10:00', close: '20:00', isClosed: false },
        { day: 'wednesday', open: '10:00', close: '20:00', isClosed: false },
        { day: 'thursday', open: '10:00', close: '20:00', isClosed: false },
        { day: 'friday', open: '10:00', close: '21:00', isClosed: false },
        { day: 'saturday', open: '09:00', close: '20:00', isClosed: false },
        { day: 'sunday', open: '09:00', close: '18:00', isClosed: false },
      ],
    });
  }

  async updateSettings(data: Partial<ISalonSettings>): Promise<ISalonSettings> {
    const settings = await this.getSettings();
    Object.assign(settings, data);
    return settings.save();
  }
}

export default SalonSettingsRepository;
