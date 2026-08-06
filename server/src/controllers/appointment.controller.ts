import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import logger from '../utils/logger';

export class AppointmentController {
  private bookingService = new BookingService();

  public book = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('Received manual booking request via REST API.');
      const appointment = await this.bookingService.bookAppointment(req.body);
      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  public cancel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { appointmentId } = req.body;
      logger.info(`Received cancel request for appointment: ${appointmentId}`);
      const appointment = await this.bookingService.cancelAppointment(appointmentId);
      res.status(200).json({
        success: true,
        message: 'Appointment successfully cancelled.',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  public reschedule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { appointmentId, newDate } = req.body;
      logger.info(`Received reschedule request for appointment: ${appointmentId} to ${newDate}`);
      const appointment = await this.bookingService.rescheduleAppointment(appointmentId, newDate);
      res.status(200).json({
        success: true,
        message: 'Appointment successfully rescheduled.',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAppointments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ success: false, message: 'userId query parameter is required.' });
        return;
      }
      logger.info(`Fetching bookings for user: ${userId}`);
      const appointments = await this.bookingService.getUserBookings(userId);
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AppointmentController;
