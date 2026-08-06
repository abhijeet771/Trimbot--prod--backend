import { Request, Response, NextFunction } from 'express';
import { BarberService } from '../services/barber.service';
import { PricingService } from '../services/pricing.service';
import { ServiceRepository } from '../repositories/service.repository';
import { OfferRepository } from '../repositories/offer.repository';
import { UserRepository } from '../repositories';
import { RecommendationService } from '../services/recommendation.service';
import logger from '../utils/logger';

export class SalonController {
  private barberService = new BarberService();
  private pricingService = new PricingService();
  private serviceRepo = new ServiceRepository();
  private offerRepo = new OfferRepository();
  private userRepo = new UserRepository();
  private recommendationService = new RecommendationService();

  public getBarbers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const specialty = req.query.specialty as string;
      const date = req.query.date as string;
      const barbers = await this.barberService.searchBarbers(specialty, date);
      res.status(200).json({
        success: true,
        data: barbers,
      });
    } catch (error) {
      next(error);
    }
  };

  public getPricing = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const serviceName = req.query.serviceName as string;
      const tier = (req.query.tier as any) || 'standard';
      const pricing = await this.pricingService.pricingLookup(serviceName, tier);
      res.status(200).json({
        success: true,
        data: pricing,
      });
    } catch (error) {
      next(error);
    }
  };

  public getServices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const services = await this.serviceRepo.findAllActive();
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  };

  public getOffers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const offers = await this.offerRepo.findAllActive();
      res.status(200).json({
        success: true,
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  };

  public getHealth = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Trim Tokyo AI Chatbot API is healthy and operational.',
      timestamp: new Date(),
    });
  };

  public lookupUserByEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const email = req.query.email as string;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email query parameter is required.' });
        return;
      }
      logger.info(`Looking up user by email: ${email}`);
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        res.status(404).json({ success: false, message: 'No account found with this email.' });
        return;
      }
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  public getHairstyleRecommendations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const faceShape = req.query.faceShape as string;
      const hairTexture = req.query.hairTexture as string;
      const hairLength = req.query.hairLength as string;

      logger.info(`Fetching hairstyle recommendations for faceShape: ${faceShape}, texture: ${hairTexture}, length: ${hairLength}`);
      const recommendations = await this.recommendationService.recommendHairstyle(
        faceShape,
        hairTexture,
        hairLength
      );
      res.status(200).json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  };

  public getFaq = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          address: 'B1F Palace Building, 1-2-3 Shibuya, Shibuya-ku, Tokyo',
          hours: {
            monday_to_thursday: '10:00 AM - 8:00 PM',
            friday: '10:00 AM - 9:00 PM',
            saturday: '9:00 AM - 8:00 PM',
            sunday: '9:00 AM - 6:00 PM (Ken Tanaka closed)'
          },
          parking: 'Validated parking is available at Shibuya Cross Tower Parking (2 hours free for bookings over 10,000 Yen)',
          cancellationPolicy: 'Full refund for cancellations made >24 hours before the appointment. Less than 24 hours results in a 100% cancellation charge.',
          walkIns: 'Walk-ins are accommodated if a barber is free, but booking is highly recommended.',
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default SalonController;
