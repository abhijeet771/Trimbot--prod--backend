import { Appointment, IAppointment } from '../models/Appointment';
import { Types } from 'mongoose';

export class AppointmentRepository {
  async findById(id: string): Promise<IAppointment | null> {
    return Appointment.findById(id)
      .populate('userId')
      .populate('barberId')
      .populate('services');
  }

  async findByUserId(userId: string): Promise<IAppointment[]> {
    return Appointment.find({ userId })
      .populate('barberId')
      .populate('services')
      .sort({ date: -1 });
  }

  async findUpcomingByUserId(userId: string): Promise<IAppointment[]> {
    return Appointment.find({
      userId,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('barberId')
      .populate('services')
      .sort({ date: 1 });
  }

  async findConflicting(
    barberId: string,
    startDate: Date,
    endDate: Date,
    excludeAppointmentId?: string
  ): Promise<IAppointment[]> {
    const query: any = {
      barberId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // New appointment starts during an existing appointment
        { date: { $lt: endDate }, endTime: { $gt: startDate } },
      ],
    };

    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }

    return Appointment.find(query);
  }

  async create(data: Partial<IAppointment>): Promise<IAppointment> {
    const appt = new Appointment(data);
    return appt.save();
  }

  async update(id: string, updateData: Partial<IAppointment>): Promise<IAppointment | null> {
    return Appointment.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('userId')
      .populate('barberId')
      .populate('services');
  }

  async cancel(id: string): Promise<IAppointment | null> {
    return Appointment.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
  }
}

export default AppointmentRepository;
