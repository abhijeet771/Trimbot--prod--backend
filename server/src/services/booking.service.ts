import {
  AppointmentRepository,
  BarberRepository,
  ServiceRepository,
  UserRepository,
  PricingRepository,
} from '../repositories';
import { IAppointment } from '../models/Appointment';
import logger from '../utils/logger';

export class BookingService {
  private appointmentRepo = new AppointmentRepository();
  private barberRepo = new BarberRepository();
  private serviceRepo = new ServiceRepository();
  private userRepo = new UserRepository();
  private pricingRepo = new PricingRepository();

  /**
   * Verify if a slot is available
   */
  async checkAvailability(
    barberId: string,
    date: Date | string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    // 1. Fetch Barber & Check Shift Schedule
    const barber = await this.barberRepo.findById(barberId);
    if (!barber || barber.status !== 'active') {
      logger.warn(`Barber ${barberId} not found or inactive.`);
      return false;
    }

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysOfWeek[startDate.getDay()] as keyof typeof barber.schedule;
    const daySchedule = barber.schedule[dayName];

    if (!daySchedule.isWorking) {
      logger.info(`Barber ${barber.name} is not scheduled to work on ${dayName}.`);
      return false;
    }

    // Convert start/end hours to minutes from midnight
    const getMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
    const workStart = getMinutes(daySchedule.startTime);
    const workEnd = getMinutes(daySchedule.endTime);

    // Check if within shift
    if (startMinutes < workStart || endMinutes > workEnd) {
      logger.info(`Requested time ${startDate.toLocaleTimeString()} lies outside barber working hours (${daySchedule.startTime} - ${daySchedule.endTime}).`);
      return false;
    }

    // Check if within break
    for (const brk of daySchedule.breaks) {
      const breakStart = getMinutes(brk.startTime);
      const breakEnd = getMinutes(brk.endTime);
      // If requested time overlaps with break time
      if (startMinutes < breakEnd && endMinutes > breakStart) {
        logger.info(`Requested slot overlaps with barber break time (${brk.startTime} - ${brk.endTime}).`);
        return false;
      }
    }

    // 2. Query conflicting appointments
    const conflicts = await this.appointmentRepo.findConflicting(
      barberId,
      startDate,
      endDate,
      excludeAppointmentId
    );

    return conflicts.length === 0;
  }

  /**
   * Find all open, available slots for a barber on a specific date (YYYY-MM-DD)
   */
  async findAvailableSlots(barberId: string, dateStr: string): Promise<string[]> {
    const barber = await this.barberRepo.findById(barberId);
    if (!barber || barber.status !== 'active') {
      return [];
    }

    const targetDate = new Date(dateStr);
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysOfWeek[targetDate.getDay()] as keyof typeof barber.schedule;
    const daySchedule = barber.schedule[dayName];

    if (!daySchedule.isWorking) {
      return [];
    }

    // Parse working hours
    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);

    const startTime = new Date(targetDate);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(endH, endM, 0, 0);

    const slots: string[] = [];
    const stepMinutes = 30; // standard slot duration increments
    const defaultServiceDuration = 45; // default service check duration

    let currentSlotTime = new Date(startTime);

    // Fetch all active appointments for this barber on this day to minimize queries inside the loop
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayAppointments = await this.appointmentRepo.findConflicting(
      barberId,
      dayStart,
      dayEnd
    );

    // Loop through slots
    while (currentSlotTime.getTime() + defaultServiceDuration * 60000 <= endTime.getTime()) {
      const slotStart = new Date(currentSlotTime);
      const slotEnd = new Date(slotStart.getTime() + defaultServiceDuration * 60000);

      // Check shift break times
      const slotStartMinutes = slotStart.getHours() * 60 + slotStart.getMinutes();
      const slotEndMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes();
      let overlapsBreak = false;

      for (const brk of daySchedule.breaks) {
        const [bSH, bSM] = brk.startTime.split(':').map(Number);
        const [bEH, bEM] = brk.endTime.split(':').map(Number);
        const breakStartMin = bSH * 60 + bSM;
        const breakEndMin = bEH * 60 + bEM;

        if (slotStartMinutes < breakEndMin && slotEndMinutes > breakStartMin) {
          overlapsBreak = true;
          break;
        }
      }

      if (!overlapsBreak) {
        // Check database appointment overlaps
        const hasConflict = dayAppointments.some((appt) => {
          return appt.date.getTime() < slotEnd.getTime() && appt.endTime.getTime() > slotStart.getTime();
        });

        if (!hasConflict) {
          const hourStr = String(slotStart.getHours()).padStart(2, '0');
          const minStr = String(slotStart.getMinutes()).padStart(2, '0');
          slots.push(`${hourStr}:${minStr}`);
        }
      }

      currentSlotTime.setMinutes(currentSlotTime.getMinutes() + stepMinutes);
    }

    return slots;
  }

  /**
   * Book an appointment
   */
  async bookAppointment(params: {
    userId: string;
    barberId: string;
    serviceIds: string[];
    date: string;
    totalAmount: number;
    notes?: string;
  }): Promise<IAppointment> {
    const { userId, barberId, serviceIds, date, totalAmount, notes } = params;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found.');

    const barber = await this.barberRepo.findById(barberId);
    if (!barber) throw new Error('Barber not found.');

    const services = await this.serviceRepo.findManyByIds(serviceIds);
    if (services.length === 0) throw new Error('No valid services selected.');

    // Calculate total duration
    const totalDuration = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + totalDuration * 60000);

    // Double check availability
    const isAvailable = await this.checkAvailability(barberId, startDate, totalDuration);
    if (!isAvailable) {
      throw new Error(`Barber ${barber.name} is not available at the selected time slot.`);
    }

    const appt = await this.appointmentRepo.create({
      userId: user._id as any,
      barberId: barber._id as any,
      services: services.map(s => s._id) as any,
      date: startDate,
      endTime: endDate,
      totalAmount,
      status: 'confirmed',
      notes,
      paymentStatus: 'unpaid',
      source: 'chatbot',
    });

    logger.info(`Appointment successfully booked! ID: ${appt._id}`);
    return appt;
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string): Promise<IAppointment> {
    const appt = await this.appointmentRepo.findById(appointmentId);
    if (!appt) throw new Error('Appointment not found.');

    appt.status = 'cancelled';
    await appt.save();
    
    logger.info(`Appointment cancelled successfully. ID: ${appointmentId}`);
    return appt;
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(appointmentId: string, newDateStr: string): Promise<IAppointment> {
    const appt = await this.appointmentRepo.findById(appointmentId);
    if (!appt) throw new Error('Appointment not found.');

    // Calculate total duration of appointment services
    const totalDuration = appt.services.reduce((acc: number, s: any) => acc + s.durationMinutes, 0);
    const newStartDate = new Date(newDateStr);
    const newEndDate = new Date(newStartDate.getTime() + totalDuration * 60000);

    const isAvailable = await this.checkAvailability(
      appt.barberId._id.toString(),
      newStartDate,
      totalDuration,
      appointmentId
    );

    if (!isAvailable) {
      throw new Error('Barber is not available at the new requested slot.');
    }

    appt.date = newStartDate;
    appt.endTime = newEndDate;
    appt.status = 'confirmed';
    await appt.save();

    logger.info(`Appointment rescheduled successfully to ${newStartDate}. ID: ${appointmentId}`);
    return appt;
  }

  /**
   * Get all user bookings
   */
  async getUserBookings(userId: string): Promise<IAppointment[]> {
    return this.appointmentRepo.findByUserId(userId);
  }
}

export default BookingService;
